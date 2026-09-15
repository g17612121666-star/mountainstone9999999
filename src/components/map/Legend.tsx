import { useState } from "react";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { useT, type UiKey } from "@/lib/i18n";

const ITEMS: { c: string; key: UiKey }[] = [
  { c: MARKER_COLOR.world_geopark, key: "world" },
  { c: MARKER_COLOR.national_geopark, key: "national" },
  { c: MARKER_COLOR.national_geopark_candidate, key: "candidate" },
  { c: MARKER_COLOR.gssp, key: "gssp" },
  { c: MARKER_COLOR.urban_geosite, key: "urban" },
  { c: MARKER_COLOR.geosite, key: "legendGeosite" },
];

export function MapLegend() {
  const [open, setOpen] = useState(false);
  const t = useT();
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
        <p className="mb-1 hidden text-[10px] tracking-wide text-muted uppercase sm:block">{t("legend")}</p>
        <ul className="space-y-1">
          {ITEMS.map((i) => (
            <li key={i.key} className="flex items-center gap-2 text-[11px] text-ink">
              <span className="size-2.5 rounded-full border border-white" style={{ background: i.c }} />
              {t(i.key)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
