import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { LandformCover } from "@/components/cover/LandformCover";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { getVisit } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isRealPhoto } from "@/lib/geo/safety";
import type { Site } from "@/lib/geo/types";
import { displayName, localizeSite, placeLine, useLocale, useT } from "@/lib/i18n";

export function SiteCard({
  site,
  onClose,
}: {
  site: Site;
  onClose?: () => void;
}) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const s = localizeSite(site, locale);
  const visit = getVisit(site.id);
  const ticket =
    visit?.is_ticketed === true
      ? t("ticketYes")
      : visit?.is_ticketed === false
        ? t("ticketNo")
        : t("ticketUnknown");
  const photo = isRealPhoto(site.cover_image) ? site.cover_image : undefined;
  return (
    <article className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <div className="relative h-28 overflow-hidden rounded-t-xl">
        <LandformCover
          type={site.landform_types[0] ?? "other"}
          label={displayName(site, locale)}
          photo={photo}
          credit={site.cover_credit}
        />
      </div>
      <div className="space-y-3 p-4">
        <SiteBadges site={site} />
        <div>
          <h2 className="font-display text-xl leading-snug font-semibold">{displayName(site, locale)}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" />
            {placeLine(site, locale)}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-ink">{s.hook}</p>
        <p className="text-xs text-muted">
          {ticket}
          {visit?.is_ticketed === true ? ` · ${t("ticketOfficial")}` : ""}
        </p>
        <div className="flex gap-2 pt-1">
          <Button asChild className="flex-1">
            <Link {...siteTo(site)}>{t("openGuide")}</Link>
          </Button>
          {onClose ? (
            <Button variant="outline" onClick={onClose}>
              {t("close")}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
