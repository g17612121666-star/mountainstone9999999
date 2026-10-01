import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { LandformCover } from "@/components/cover/LandformCover";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { mediaKindFor, mediaKindUiKey } from "@/lib/geo/photos";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { getVisit } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isRealPhoto } from "@/lib/geo/safety";
import type { Site } from "@/lib/geo/types";
import { displayName, localizeSite, photoCredit, placeLine, useLocale, useT } from "@/lib/i18n";

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
      <div className="relative h-28 overflow-hidden">
        {photo ? (
          <ClickableImage
            src={photo}
            alt={displayName(site, locale)}
            imgClass="h-28 w-full object-cover"
            className="rounded-none shadow-none"
            badge={t(mediaKindUiKey(mediaKindFor({ credit: site.cover_credit, role: "cover" })))}
          />
        ) : (
          <LandformCover
            type={site.landform_types[0] ?? "other"}
            label={displayName(site, locale)}
            decorative
          />
        )}
      </div>
      {photo ? (
        <p className="credit-bar py-1.5 text-[11px]">{photoCredit(site.cover_credit || "", locale)}</p>
      ) : null}
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
