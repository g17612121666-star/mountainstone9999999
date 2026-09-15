import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { getSite } from "@/lib/geo/catalog";
import { COMPARE } from "@/lib/geo/compare";
import { siteTo } from "@/lib/geo/href";
import { isOwnCover } from "@/lib/geo/safety";
import { displayName, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({
    meta: [
      { title: "容易认错的地貌 · 山石志" },
      { name: "description", content: "丹霞、彩丘、砂岩峰林、南北喀斯特、破火山口与堰塞湖——现场用一条就能分开。" },
    ],
    links: [{ rel: "canonical", href: "/compare" }],
  }),
});

function ComparePage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  const seenCover = new Set<string>();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("compareTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("compareLead")}</p>
        <ol className="mt-8 space-y-10">
          {COMPARE.map((card) => (
            <li key={card.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
              <h2 className="font-display text-xl font-semibold">{en ? card.title_en : card.title_zh}</h2>
              <p className="mt-3 text-sm leading-relaxed">
                <span className="font-medium">{t("looksLike")} · </span>
                {en ? card.alike_en : card.alike_zh}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-medium">{t("fieldSplit")} · </span>
                {en ? card.split_en : card.split_zh}
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {card.sides.map((side) => {
                  const site = getSite(side.site_id);
                  if (!site) return null;
                  const src = isOwnCover(site) ? site.cover_image : "";
                  const showImg = !!src && !seenCover.has(src);
                  if (showImg && src) seenCover.add(src);
                  return (
                    <li key={`${card.id}-${side.site_id}`} className="overflow-hidden rounded-lg border border-border">
                      {showImg ? (
                        <img src={src} alt="" className="h-32 w-full object-cover" />
                      ) : src ? null : (
                        <div className="flex h-24 items-center justify-center bg-surface-2 text-xs text-muted">
                          {t("sketch")}
                        </div>
                      )}
                      <div className="p-3">
                        <Link {...siteTo(site)} className="font-display text-lg font-semibold">
                          {en ? side.title_en : side.title_zh}
                        </Link>
                        <p className="mt-1 text-[11px] text-muted">{displayName(site, locale)}</p>
                        <p className="mt-2 text-sm leading-relaxed">
                          <span className="font-medium">{t("howFormed")} · </span>
                          {en ? side.formed_en : side.formed_zh}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
