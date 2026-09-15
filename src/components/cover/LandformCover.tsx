import type { LandformType } from "@/lib/geo/types";
import { photoCredit, useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const palette: Record<string, [string, string, string]> = {
  karst: ["#cfc6b6", "#8a9a90", "#5c6b62"],
  danxia: ["#c4a07a", "#a05a42", "#6b3b32"],
  zhangjiajie_sandstone: ["#d4c4a4", "#b08968", "#6b5344"],
  granite_peak: ["#d2cdc4", "#9a958c", "#5c574e"],
  volcano: ["#4a4540", "#6b5344", "#7a3b32"],
  yardang: ["#d8c49a", "#b08958", "#8a6a40"],
  glacier: ["#d7ddd8", "#8aa0a8", "#4a5c6a"],
  loess: ["#d9c48c", "#c4a05a", "#8a7040"],
  coast: ["#c8d0d4", "#6a8a92", "#3d5c52"],
  fossil: ["#cfc6b0", "#8a7a64", "#5c4a38"],
  stratigraphy: ["#d4cbb8", "#8a7a64", "#3d5c52"],
  geo_hazard: ["#c8c0b4", "#7a6e5c", "#5c4a38"],
  other: ["#d4cbb8", "#9a8b78", "#6b5344"],
};

export function LandformCover({
  type,
  className,
  label,
  photo,
  credit,
  decorative = false,
}: {
  type: LandformType;
  className?: string;
  label?: string;
  photo?: string;
  credit?: string;
  decorative?: boolean;
}) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const creditLine = photoCredit(credit || "", locale);
  const sketchKey =
    type === "stratigraphy" || type === "fossil" ? "sketch" : "sketchLandform";
  const caption = decorative ? "" : label ? `${label} · ${t(sketchKey)}` : t(sketchKey);
  if (photo) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <img src={photo} alt={decorative ? "" : creditLine} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
        {decorative ? null : (
          <p className="absolute right-3 bottom-2 left-3 text-[11px] leading-snug text-primary-fg/90">
            {creditLine}
          </p>
        )}
      </div>
    );
  }
  const [a, b, c] = palette[type] ?? palette.other;
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-2", className)}>
      <svg viewBox="0 0 400 180" className="h-full w-full" aria-hidden="true" focusable="false">
        <rect width="400" height="180" fill={a} />
        {type === "volcano" ? (
          <>
            <polygon points="70,118 140,38 210,118" fill={c} />
            <polygon points="180,118 250,52 320,118" fill={b} />
            <ellipse cx="250" cy="52" rx="18" ry="7" fill="#2c261c" opacity="0.45" />
            <rect x="0" y="118" width="400" height="62" fill={a} />
          </>
        ) : type === "karst" ? (
          <>
            <ellipse cx="90" cy="118" rx="40" ry="70" fill={c} />
            <ellipse cx="170" cy="118" rx="28" ry="86" fill={b} />
            <ellipse cx="240" cy="118" rx="36" ry="64" fill={c} />
            <ellipse cx="310" cy="118" rx="30" ry="78" fill={b} />
            <rect x="0" y="118" width="400" height="62" fill={a} />
          </>
        ) : type === "zhangjiajie_sandstone" || type === "granite_peak" || type === "danxia" ? (
          <>
            <rect x="48" y="36" width="28" height="82" fill={c} />
            <rect x="92" y="24" width="22" height="94" fill={b} />
            <rect x="128" y="48" width="34" height="70" fill={c} />
            <rect x="176" y="20" width="18" height="98" fill={b} />
            <rect x="210" y="40" width="40" height="78" fill={c} />
            <rect x="268" y="28" width="24" height="90" fill={b} />
            <rect x="310" y="52" width="36" height="66" fill={c} />
            <rect x="0" y="118" width="400" height="62" fill={b} opacity="0.85" />
          </>
        ) : type === "stratigraphy" || type === "fossil" ? (
          <>
            <rect x="0" y="118" width="400" height="22" fill={b} opacity="0.85" />
            <rect x="0" y="140" width="400" height="18" fill={c} opacity="0.9" />
            <rect x="0" y="158" width="400" height="22" fill="#2c261c" opacity="0.55" />
          </>
        ) : (
          <polyline
            points="20,110 70,80 120,96 180,58 240,88 300,46 380,92"
            fill="none"
            stroke={c}
            strokeWidth="8"
          />
        )}
      </svg>
      {decorative ? null : (
        <p className="absolute right-3 bottom-2 left-3 text-[11px] leading-snug text-ink/80">{caption}</p>
      )}
    </div>
  );
}
