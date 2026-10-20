import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { clipFor, coverFor } from "@/lib/geo/catalog";
import { processLine } from "@/lib/geo/process";
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
  const film = clipFor(site);
  return (
    <article className="sheet-in lift overflow-hidden rounded-2xl bg-surface/95 shadow-[var(--shadow-border)] backdrop-blur-md">
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
        {s.hook ? <p className="text-base leading-relaxed text-ink">{s.hook}</p> : null}
        {processLine(site, locale) ? (
          <p className="text-sm leading-relaxed text-muted">
            {processLine(site, locale)}
            {locale === "en"
              ? " Typical of this landform, not a measured log."
              : "。这是这类地貌常见的过程，不是这一处的实测剖面。"}
          </p>
        ) : null}
        {film ? <BiliEmbed video={film.video} poster={shot?.src} /> : null}
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
