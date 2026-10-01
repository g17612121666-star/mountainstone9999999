import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChinaMap } from "@/components/map/ChinaMap";
import { FilterBar } from "@/components/map/FilterBar";
import { MapLegend } from "@/components/map/Legend";
import { MapDesk } from "@/components/map/MapDesk";
import { MapPile } from "@/components/map/MapPile";
import { SiteCard } from "@/components/site/SiteCard";
import { seoHead } from "@/lib/geo/canonical";
import { getSite } from "@/lib/geo/catalog";
import { useMapStore } from "@/lib/geo/store";
import { useT } from "@/lib/i18n";

type Search = { focus?: string };

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    focus: typeof raw.focus === "string" ? raw.focus : undefined,
  }),
  component: Home,
  head: () =>
    seoHead({
      title: "随身地质向导",
      description: "一张可缩放的中国地质点地图：成因、打卡点、怎么走、看什么、不挖什么、要不要买票。",
      path: "/",
    }),
});

function Home() {
  const { focus } = Route.useSearch();
  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);
  const site = selectedId ? getSite(selectedId) : undefined;
  const pile = useMapStore((s) => s.pile);
  const t = useT();

  useEffect(() => {
    if (!focus) return;
    const hit = getSite(focus);
    if (hit) select(hit.id);
  }, [focus, select]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <a
        href="#map"
        className="absolute top-2 left-2 z-50 -translate-y-16 rounded-md bg-surface px-3 py-2 text-sm shadow-[var(--shadow-border)] focus:translate-y-0"
      >
        {t("skipMap")}
      </a>
      <AppHeader dense />
      <main id="main" className="relative min-h-0 flex-1">
        <ChinaMap />
        <FilterBar />
        <MapLegend />
        {site ? (
          <div className="absolute inset-x-0 bottom-0 z-30 max-h-[70dvh] overflow-y-auto p-3 sm:inset-auto sm:top-16 sm:right-3 sm:bottom-auto sm:w-96">
            <SiteCard site={site} onClose={() => select(null)} />
          </div>
        ) : pile ? (
          <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:inset-auto sm:top-16 sm:right-3 sm:bottom-auto sm:w-96">
            <MapPile />
          </div>
        ) : (
          <div className="absolute right-16 bottom-20 left-3 z-20 sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-[34rem] sm:-translate-x-1/2">
            <MapDesk />
          </div>
        )}
      </main>
    </div>
  );
}
