import { Badge } from "@/components/ui/badge";
import { getSite } from "@/lib/geo/catalog";
import type { Site } from "@/lib/geo/types";
import { landformLabel, typeBadge, typeLabel, useLocale, useT } from "@/lib/i18n";

export function SiteBadges({ site, compact = false }: { site: Site; compact?: boolean }) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const parent = site.unesco_parent_id ? getSite(site.unesco_parent_id) : undefined;
  const badge = typeBadge(site, locale);
  const tone =
    site.types.includes("gssp")
      ? "gssp"
      : site.types.includes("world_geopark") || parent
        ? "world"
        : site.types.includes("urban_geosite")
          ? "urban"
          : site.types.includes("national_geopark_candidate") &&
              !site.types.includes("national_geopark")
            ? "candidate"
            : "national";
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone={tone}>{badge}</Badge>
      {parent ? (
        <Badge tone="world">
          {parent.name.includes("雷琼") || parent.id === "leiqiong" ? t("worldParkUnit") : t("worldUnit")}
        </Badge>
      ) : null}
      {!compact
        ? site.types
            .filter((tp) => typeLabel(tp, locale) !== badge)
            .slice(0, 2)
            .map((tp) => (
              <Badge key={tp} tone="muted">
                {typeLabel(tp, locale)}
              </Badge>
            ))
        : null}
      {!compact ? (
        <Badge tone="muted">{landformLabel(site.landform_types[0] ?? "other", locale)}</Badge>
      ) : null}
      {site.content_status === "standard" ? <Badge tone="candidate">{t("standardCard")}</Badge> : null}
    </div>
  );
}
