import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { coverFor } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
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
  const shot = coverFor(site);
  return (
    <article className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
      {shot ? (
        <ClickableImage
          src={shot.src}
          alt={displayName(site, locale)}
          imgClass="h-36 w-full object-cover"
          className="rounded-none shadow-none"
        />
      ) : null}
      <div className="space-y-3 p-4">
        <SiteBadges site={site} />
        <div>
          <h2 className="font-display text-2xl leading-snug font-semibold">{displayName(site, locale)}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" />
            {placeLine(site, locale)}
          </p>
        </div>
        {shot?.related ? <p className="text-xs leading-relaxed text-muted">{t("relatedPhoto")}</p> : null}
        <p className="text-base leading-relaxed text-ink">{s.hook}</p>
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
