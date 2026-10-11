import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChinaMap } from "@/components/map/ChinaMap";
import { FilterBar } from "@/components/map/FilterBar";
import { MapLegend } from "@/components/map/Legend";
import { MapDesk } from "@/components/map/MapDesk";
import { MapPile } from "@/components/map/MapPile";
import { RoutePeek } from "@/components/map/RoutePeek";
import { SiteCard } from "@/components/site/SiteCard";
import { seoHead } from "@/lib/geo/canonical";
import { getSite, getTheme } from "@/lib/geo/catalog";
import { useMapStore, type DepthFilter } from "@/lib/geo/store";
import { LANDFORM_LABEL, type LandformType, type SiteType } from "@/lib/geo/types";
import { useT } from "@/lib/i18n";

const TYPES: SiteType[] = [
  "world_geopark",
  "national_geopark",
  "national_geopark_candidate",
  "gssp",
  "iugs_geoheritage",
  "urban_geosite",
  "stratotype",
  "landform_site",
];
const LANDS = new Set(Object.keys(LANDFORM_LABEL));

type Search = {
  focus?: string;
  view?: string;
  types?: string;
  lands?: string;
  province?: string;
  age?: string;
  route?: string;
  q?: string;
  depth?: string;
};

function str(raw: Record<string, unknown>, key: string): string | undefined {
  return typeof raw[key] === "string" ? raw[key] : undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    focus: str(raw, "focus"),
    view: str(raw, "view"),
    types: str(raw, "types"),
    lands: str(raw, "lands"),
    province: str(raw, "province"),
    age: str(raw, "age"),
    route: str(raw, "route"),
    q: str(raw, "q"),
    depth: str(raw, "depth"),
  }),
  component: Home,
  head: () =>
    seoHead({
      title: "山石志",
      description: "一张能点进去的中国石头地图。看岩石、看怎么裂开、看现场该站哪儿。只看不挖。",
      path: "/",
    }),
});

function Home() {
  const search = Route.useSearch();
  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);
  const site = selectedId ? getSite(selectedId) : undefined;
  const pile = useMapStore((s) => s.pile);
  const activeRouteId = useMapStore((s) => s.activeRouteId);
  const t = useT();

  useEffect(() => {
    if (search.focus) {
      const hit = getSite(search.focus);
      if (hit) select(hit.id);
    }
  }, [search.focus, select]);

  useEffect(() => {
    if (search.view === "1" || !search.route || !getTheme(search.route)) return;
    useMapStore.getState().setActiveRoute(search.route);
  }, [search.route, search.view]);

  useEffect(() => {
    if (search.view !== "1") return;
    const types = (search.types || "")
      .split(",")
      .map((x) => x.trim())
      .filter((x): x is SiteType => (TYPES as string[]).includes(x));
    const landforms = (search.lands || "")
      .split(",")
      .map((x) => x.trim())
      .filter((x): x is LandformType => LANDS.has(x));
    const ageMatch = (search.age || "").match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    const depth: DepthFilter =
      search.depth === "deep" || search.depth === "standard" ? search.depth : "all";
    useMapStore.setState((s) => ({
      filters: {
        ...s.filters,
        query: search.q || "",
        types,
        landforms,
        province: search.province || "",
        ageOn: Boolean(ageMatch),
        ageStart: ageMatch ? Number(ageMatch[1]) : s.filters.ageStart,
        ageEnd: ageMatch ? Number(ageMatch[2]) : s.filters.ageEnd,
        depth,
      },
      activeRouteId: search.route && getTheme(search.route) ? search.route : null,
      showRoutes: Boolean(search.route && getTheme(search.route)),
    }));
  }, [search.view, search.types, search.lands, search.province, search.age, search.route, search.q, search.depth]);

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
        <h1 className="sr-only">
          {t("appName")} · {t("tagline")}
        </h1>
        <ChinaMap />
        <FilterBar />
        <MapLegend />
        {site ? (
          <div className="absolute inset-x-0 bottom-16 z-30 max-h-[58dvh] overflow-y-auto p-3 sm:inset-auto sm:top-16 sm:right-3 sm:bottom-auto sm:max-h-[70dvh] sm:w-96">
            <SiteCard site={site} onClose={() => select(null)} />
          </div>
        ) : pile ? (
          <div className="absolute inset-x-0 bottom-16 z-30 p-3 sm:inset-auto sm:top-16 sm:right-3 sm:bottom-auto sm:w-96">
            <MapPile />
          </div>
        ) : activeRouteId ? (
          <div className="absolute inset-x-0 bottom-16 z-30 p-3 sm:inset-auto sm:top-16 sm:right-3 sm:bottom-auto sm:w-96">
            <RoutePeek />
          </div>
        ) : (
          <div className="absolute right-16 bottom-24 left-3 z-20 sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-[34rem] sm:-translate-x-1/2">
            <MapDesk />
          </div>
        )}
      </main>
    </div>
  );
}
