import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { SiteBadges } from "@/components/site/SiteBadges";
import { seoHead } from "@/lib/geo/canonical";
import { clipFor, coverFor, getSite } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { recommendPlaces } from "@/lib/geo/recommend";
import { displayName, placeLine, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/ask")({
  component: AskPage,
  head: () =>
    seoHead({
      title: "想去哪儿",
      description: "说说想看的石头或城市，山石志从名录里挑几处，并写到了看什么。",
      path: "/ask",
    }),
});

type Pick = { id: string; why: string; watch: string };

function AskPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [wish, setWish] = useState("");
  const [busy, setBusy] = useState(false);
  const [intro, setIntro] = useState("");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [err, setErr] = useState("");

  const chips = [t("askChip1"), t("askChip2"), t("askChip3"), t("askChip4")];

  async function run(text: string) {
    const q = text.trim();
    setWish(text);
    setErr("");
    if (q.length < 2) {
      setErr(t("askShort"));
      setPicks([]);
      return;
    }
    setBusy(true);
    try {
      const res = await recommendPlaces({ data: { wish: q, locale } });
      if (!res.ok) {
        setPicks([]);
        setIntro("");
        setErr(res.error === "short" ? t("askShort") : t("askFail"));
        return;
      }
      setIntro(res.intro);
      setPicks(res.picks);
      if (!res.picks.length) setErr(t("askNone"));
    } catch {
      setErr(t("askFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold tracking-wide text-moss">{t("appName")}</p>
        <h1 className="display-title mt-2">{t("askTitle")}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed">{t("askLead")}</p>

        <form
          className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) void run(wish);
          }}
        >
          <div className="border-l-4 border-moss px-4 py-4">
            <label className="block text-sm font-medium" htmlFor="wish">
              {t("askTitle")}
            </label>
            <textarea
              id="wish"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder={t("askPh")}
              rows={4}
              maxLength={400}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-bg px-3 py-3 text-base leading-relaxed text-ink outline-none focus:border-moss"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rounded-full bg-surface-2 px-3 py-2 text-sm text-ink hover:bg-sand/20"
                  onClick={() => setWish(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-4 h-11 rounded-md bg-moss px-5 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {busy ? t("askWait") : t("askGo")}
            </button>
          </div>
        </form>

        {err ? <p className="mt-4 text-sm text-hematite">{err}</p> : null}
        {intro ? <p className="mt-6 text-lg leading-relaxed">{intro}</p> : null}

        {picks.length ? (
          <ol className="mt-4 space-y-4">
            {picks.map((p) => {
              const site = getSite(p.id);
              if (!site) return null;
              const shot = coverFor(site);
              const film = clipFor(site);
              return (
                <li key={p.id} className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
                  <div className="sm:flex">
                    {shot ? (
                      <img src={shot.src} alt="" className="h-44 w-full object-cover sm:h-auto sm:w-48 sm:shrink-0" />
                    ) : null}
                    <div className="min-w-0 flex-1 p-4">
                      <SiteBadges site={site} compact />
                      <h2 className="font-display mt-2 text-2xl font-semibold">
                        <Link {...siteTo(site)} className="hover:underline">
                          {displayName(site, locale)}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm text-muted">{placeLine(site, locale)}</p>
                      <p className="mt-3 text-sm leading-relaxed">{p.why}</p>
                      {p.watch ? (
                        <p className="mt-2 text-sm leading-relaxed">
                          <span className="font-medium">{t("askWatch")} · </span>
                          {p.watch}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {film ? (
                    <div className="border-t border-border px-4 py-4">
                      <p className="mb-2 text-sm font-medium">{film.related ? t("videoRelated") : t("video")}</p>
                      <BiliEmbed video={film.video} poster={shot?.src} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : null}
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
