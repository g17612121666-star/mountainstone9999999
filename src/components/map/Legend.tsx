import { useState } from "react";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { useMapStore } from "@/lib/geo/store";
import type { SiteType } from "@/lib/geo/types";
import { useT, type UiKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ITEMS: { type: SiteType; c: string; key: UiKey }[] = [
  { type: "world_geopark", c: MARKER_COLOR.world_geopark, key: "world" },
  { type: "national_geopark", c: MARKER_COLOR.national_geopark, key: "national" },
  { type: "national_geopark_candidate", c: MARKER_COLOR.national_geopark_candidate, key: "candidate" },
  { type: "gssp", c: MARKER_COLOR.gssp, key: "gssp" },
  { type: "urban_geosite", c: MARKER_COLOR.urban_geosite, key: "urban" },
];

export function MapLegend() {
  const [open, setOpen] = useState(false);
  const t = useT();
  const types = useMapStore((s) => s.filters.types);
  const toggleType = useMapStore((s) => s.toggleType);
  return (
    <div className="pointer-events-none absolute bottom-8 left-3 z-30">
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
            ? "pointer-events-auto rounded-lg bg-surface/92 px-3 py-2 shadow-[var(--shadow-border)]"
            : "pointer-events-none hidden rounded-lg bg-surface/92 px-3 py-2 shadow-[var(--shadow-border)] sm:pointer-events-auto sm:block"
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
                  {i.type === "gssp" ? (
                    <span className="legend-diamond shrink-0" style={{ background: i.c }} />
                  ) : (
                    <span className="size-3 shrink-0 rounded-full" style={{ background: i.c, boxShadow: "0 0 0 1px #f7f3eb" }} />
                  )}
                  {t(i.key)}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 max-w-44 text-[11px] leading-snug text-muted">{t("geositeHint")}</p>
      </div>
    </div>
  );
}