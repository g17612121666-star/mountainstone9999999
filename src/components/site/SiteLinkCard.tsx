import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LandformCover } from "@/components/cover/LandformCover";
import { SiteBadges } from "@/components/site/SiteBadges";
import { siteTo } from "@/lib/geo/href";
import { isOwnCover } from "@/lib/geo/safety";
import type { Site } from "@/lib/geo/types";
import { displayName, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Name is the only link text. Badges, place and notes sit outside the <a>. */
export function SiteLinkCard({
  site,
  note,
  meta,
  thumb = true,
}: {
  site: Site;
  note?: ReactNode;
  meta?: ReactNode;
  thumb?: boolean;
}) {
  const locale = useLocale((s) => s.locale);
  const own = isOwnCover(site);
  return (
    <article className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {thumb ? (
        <div className="h-24 w-28 shrink-0 overflow-hidden" aria-hidden>
          {own ? (
            <img src={site.cover_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <LandformCover type={site.landform_types[0] ?? "other"} decorative />
          )}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 p-4">
        <SiteBadges site={site} compact />
        <p className="font-display mt-2 text-xl font-semibold">
          <Link {...siteTo(site)} className="hover:underline">
            {displayName(site, locale)}
          </Link>
        </p>
        {meta ? <div className="mt-1 text-sm text-muted">{meta}</div> : null}
        {note ? <div className="mt-1 text-sm text-muted">{note}</div> : null}
      </div>
    </article>
  );
}

export function SiteRowLink({
  site,
  sub,
  end,
}: {
  site: Site;
  sub?: ReactNode;
  end?: ReactNode;
}) {
  const locale = useLocale((s) => s.locale);
  const own = isOwnCover(site);
  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
      <div className={cn("h-16 w-20 shrink-0 overflow-hidden rounded-md", own ? "" : "bg-surface-2")} aria-hidden>
        {own ? (
          <img src={site.cover_image} alt="" className="h-full w-full object-cover" />
        ) : (
          <LandformCover type={site.landform_types[0] ?? "other"} decorative />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          <Link {...siteTo(site)} className="hover:underline">
            {displayName(site, locale)}
          </Link>
        </p>
        {sub ? <div className="mt-0.5 text-xs text-muted">{sub}</div> : null}
      </div>
      {end ?? (
        <SiteBadges site={site} compact />
      )}
    </div>
  );
}
