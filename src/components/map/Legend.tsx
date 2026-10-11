import { useEffect, useState } from "react";
import { TimescaleBar } from "@/components/geo/TimescaleBar";
import { themeRoutes } from "@/lib/geo/catalog";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { listPacks, registerFieldSw } from "@/lib/geo/offline";
import { useMapStore } from "@/lib/geo/store";
import { LANDFORM_LABEL, type LandformType, type SiteType } from "@/lib/geo/types";
import { landformLabel, themeName, useLocale, useT, type UiKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ITEMS: { type: SiteType; c: string; key: UiKey; shape: string }[] = [
  { type: "world_geopark", c: MARKER_COLOR.world_geopark, key: "world", shape: "hex" },
  { type: "national_geopark", c: MARKER_COLOR.national_geopark, key: "national", shape: "dot" },
  { type: "national_geopark_candidate", c: MARKER_COLOR.national_geopark_candidate, key: "candidate", shape: "ring" },
  { type: "gssp", c: MARKER_COLOR.gssp, key: "gssp", shape: "diamond" },
  { type: "urban_geosite", c: MARKER_COLOR.urban_geosite, key: "urban", shape: "square" },
];

const LANDS = (Object.keys(LANDFORM_LABEL) as LandformType[]).filter((k) => k !== "other");

function Swatch({ shape, color }: { shape: string; color: string }) {
  if (shape === "diamond") return <span className="legend-diamond shrink-0" style={{ background: color }} />;
  if (shape === "hex") return <span className="legend-hex shrink-0" style={{ background: color }} />;
  if (shape === "square") return <span className="legend-sq shrink-0" style={{ background: color }} />;
  if (shape === "ring") return <span className="legend-ring shrink-0" style={{ borderColor: color }} />;
  return <span className="size-3 shrink-0 rounded-full" style={{ background: color, boxShadow: "0 0 0 1px #f7f3eb" }} />;
}

export function MapLegend() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const types = useMapStore((s) => s.filters.types);
  const lands = useMapStore((s) => s.filters.landforms);
  const depth = useMapStore((s) => s.filters.depth);
  const toggleType = useMapStore((s) => s.toggleType);
  const toggleLandform = useMapStore((s) => s.toggleLandform);
  const setDepth = useMapStore((s) => s.setDepth);
  const showRoutes = useMapStore((s) => s.showRoutes);
  const toggleRoutes = useMapStore((s) => s.toggleRoutes);
  const activeRouteId = useMapStore((s) => s.activeRouteId);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const [packs, setPacks] = useState(0);

  useEffect(() => {
    void registerFieldSw().then(async () => {
      setPacks((await listPacks()).length);
    });
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-20 left-3 z-30 sm:bottom-8">
      <button
        type="button"
        className="pointer-events-auto mb-1 rounded-md bg-surface/92 px-2 py-1 text-[11px] text-muted shadow-[var(--shadow-border)] sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("legend")}
      >
        {open ? t("legendClose") : t("legend")}
      </button>
      <div
        className={
          open
            ? "pointer-events-auto max-h-[46dvh] overflow-y-auto rounded-lg bg-surface/92 px-3 py-2 shadow-[var(--shadow-border)]"
            : "pointer-events-none hidden rounded-lg bg-surface/92 px-3 py-2 shadow-[var(--shadow-border)] sm:pointer-events-auto sm:block sm:max-h-[62dvh] sm:overflow-y-auto"
        }
      >
        <p className="mb-1 hidden text-[10px] tracking-wide text-muted sm:block">{t("legend")}</p>
        <ul className="space-y-1">
          {ITEMS.map((i) => {
            const on = types.includes(i.type);
            const dim = types.length > 0 && !on;
            return (
              <li key={i.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleType(i.type)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-md px-1 text-left text-sm text-ink",
                    on && "bg-moss/15",
                    dim && "opacity-45",
                  )}
                >
                  <Swatch shape={i.shape} color={i.c} />
                  {t(i.key)}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1">
          {(
            [
              ["all", t("statusAny")],
              ["deep", t("deepPage")],
              ["standard", t("standardCard")],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="filter-chip !min-h-9 !px-2 !text-[11px]"
              data-active={depth === id}
              onClick={() => setDepth(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-ink">{t("landform")}</summary>
          <div className="mt-1 flex flex-wrap gap-1">
            {LANDS.map((l) => (
              <button
                key={l}
                type="button"
                className="filter-chip !min-h-9 !px-2 !text-[11px]"
                data-active={lands.includes(l)}
                onClick={() => toggleLandform(l)}
              >
                {landformLabel(l, locale)}
              </button>
            ))}
          </div>
        </details>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-ink">{t("timescale")}</summary>
          <div className="mt-1">
            <TimescaleBar compact />
          </div>
        </details>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-ink">{t("routeOnMap")}</summary>
          <button
            type="button"
            className="filter-chip mt-1 !min-h-9"
            data-active={showRoutes}
            onClick={() => toggleRoutes()}
          >
            {showRoutes ? t("hideRoutes") : t("showRoutes")}
          </button>
          <ul className="mt-1 max-h-36 space-y-0.5 overflow-y-auto">
            {themeRoutes.map((tr) => (
              <li key={tr.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-md px-1 py-1 text-left text-xs text-ink hover:bg-surface-2",
                    activeRouteId === tr.id && "bg-moss/15",
                  )}
                  onClick={() => setActiveRoute(activeRouteId === tr.id ? null : tr.id)}
                >
                  {themeName(tr, locale)}
                </button>
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-2 max-w-48 text-[11px] leading-snug text-muted">{t("geositeHint")}</p>
        <p className="mt-1 max-w-48 text-[11px] leading-snug text-muted">
          {packs > 0 ? `${t("cacheOnMap")} ${packs}。` : ""}
          {t("tileOfflineHint")}
        </p>
      </div>
    </div>
  );
}
