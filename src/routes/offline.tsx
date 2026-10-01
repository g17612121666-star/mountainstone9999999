import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteLinkCard } from "@/components/site/SiteLinkCard";
import { Button } from "@/components/ui/button";
import { seoHead } from "@/lib/geo/canonical";
import { getSite } from "@/lib/geo/catalog";
import { deletePack, listPacks, registerFieldSw, swAvailable, type OfflinePackMeta } from "@/lib/geo/offline";
import { siteTo } from "@/lib/geo/href";
import { useLocale, useT } from "@/lib/i18n";

const EXAMPLE_IDS = ["danxiashan", "zhangjiajie", "meishan"];

export const Route = createFileRoute("/offline")({
  component: OfflinePage,
  head: () =>
    seoHead({
      title: "离线野外包",
      description: "缓存一条线路或一个点的正文。这是缓存，不是实时票价。",
      path: "/offline",
    }),
});

function OfflinePage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [packs, setPacks] = useState<OfflinePackMeta[]>([]);
  const [swOk, setSwOk] = useState<boolean | null>(null);
  async function reload() {
    setPacks(await listPacks());
    setSwOk(await swAvailable());
  }
  useEffect(() => {
    void registerFieldSw().then(async (ok) => {
      setSwOk(ok);
      setPacks(await listPacks());
    });
  }, []);
  const examples = EXAMPLE_IDS.map((id) => getSite(id)).filter((s): s is NonNullable<typeof s> => !!s);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("offline")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {swOk === false ? t("swDisabled") : t("offlineNote")}
        </p>
        {packs.length === 0 ? (
          <section className="mt-8">
            <p className="text-sm font-medium text-ink">{t("offlineEmpty")}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{t("cacheExamples")}</p>
            <ul className="mt-4 space-y-3">
              {examples.map((s) => (
                <li key={s.id}>
                  <SiteLinkCard
                    site={s}
                    note={
                      <Link {...siteTo(s)} className="text-moss underline">
                        {t("openGuide")}
                      </Link>
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <p className="mt-6 text-xs text-muted">
              {t("offlineList")}
              <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5">{packs.length}</span>
            </p>
            <ul className="mt-4 space-y-4">
              {packs.map((p) => {
                const packLocale = p.locale || "zh";
                const mismatch = packLocale !== locale;
                const body = packLocale === "en" ? p.body_en : p.body_zh;
                const title = packLocale === "en" ? p.title_en : p.title;
                return (
                  <li key={`${p.kind}-${p.id}-${packLocale}`} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                    <p className="font-display text-lg font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {packLocale === "en" ? t("packLangEn") : t("packLangZh")}
                    </p>
                    {mismatch ? (
                      <p className="mt-1 text-xs text-hematite">{t("packLangMismatch")}</p>
                    ) : null}
                    {p.cover ? (
                      <img src={p.cover} alt="" className="mt-3 h-28 w-full rounded-md object-cover" />
                    ) : null}
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {p.kind === "site" ? (
                        <Link to="/card/$id" params={{ id: p.id }} className="text-sm text-moss underline">
                          {t("fieldCard")}
                        </Link>
                      ) : (
                        <Link to="/routes/$id" params={{ id: p.id }} className="text-sm text-moss underline">
                          {t("themeTrails")}
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          void deletePack(p.kind, p.id, packLocale).then(reload);
                        }}
                      >
                        {t("uncache")}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
