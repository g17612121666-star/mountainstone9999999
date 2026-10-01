import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { ReactNode } from "react";
import { SiteBadges } from "@/components/site/SiteBadges";
import { clipFor, coverFor } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import type { Site } from "@/lib/geo/types";
import { displayName, useLocale, useT } from "@/lib/i18n";

function FilmLink({ site }: { site: Site }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const film = clipFor(site);
  if (!film) return null;
  const title = locale === "en" ? film.video.title_en || film.video.title : film.video.title;
  return (
    <a
      href={`https://www.bilibili.com/video/${film.video.bvid}`}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-moss"
    >
      <Play className="size-3.5" fill="currentColor" />
      <span>{film.related ? t("videoRelated") : t("video")}</span>
      <span className="sr-only">{title}</span>
    </a>
  );
}

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
        <FilmLink site={site} />
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
        <FilmLink site={site} />
      </div>
      {end ?? <SiteBadges site={site} compact />}
    </div>
  );
}