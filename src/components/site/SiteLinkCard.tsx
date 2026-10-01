import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteBadges } from "@/components/site/SiteBadges";
import { coverFor } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import type { Site } from "@/lib/geo/types";
import { displayName, useLocale } from "@/lib/i18n";

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
  const shot = coverFor(site);
  return (
    <article className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {thumb && shot ? (
        <div className="h-24 w-28 shrink-0 overflow-hidden" aria-hidden>
          <img src={shot.src} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 p-4">
        <SiteBadges site={site} compact />
        <p className="font-display mt-2 text-xl font-semibold break-words">
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
  const shot = coverFor(site);
  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
      {shot ? (
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md" aria-hidden>
          <img src={shot.src} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          <Link {...siteTo(site)} className="hover:underline">
            {displayName(site, locale)}
          </Link>
        </p>
        {sub ? <div className="mt-0.5 text-xs text-muted">{sub}</div> : null}
      </div>
      {end ?? <SiteBadges site={site} compact />}
    </div>
  );
}