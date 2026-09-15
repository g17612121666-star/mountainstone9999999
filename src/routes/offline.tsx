import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { deletePack, listPacks, registerFieldSw, swAvailable, type OfflinePackMeta } from "@/lib/geo/offline";
import { useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/offline")({
  component: OfflinePage,
  head: () => ({
    meta: [{ title: "离线野外包 · 山石志" }],
    links: [{ rel: "canonical", href: "/offline" }],
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
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("offline")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {swOk === false ? t("offlineSwFail") : t("offlineNote")}
        </p>
        <p className="mt-2 text-xs text-subtle">
          {t("offlineList")} · {packs.length}
        </p>
        {packs.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{t("offlineList")} — 0</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {packs.map((p) => (
              <li key={`${p.kind}-${p.id}`} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                <p className="font-display text-lg font-semibold">{locale === "en" ? p.title_en : p.title}</p>
                {p.cover ? (
                  <img src={p.cover} alt="" className="mt-3 h-28 w-full rounded-md object-cover" />
                ) : null}
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {locale === "en" ? p.body_en : p.body_zh}
                </p>
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
                      void deletePack(p.kind, p.id).then(reload);
                    }}
                  >
                    {t("uncache")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
