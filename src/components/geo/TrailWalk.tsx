import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { readTrail, toggleTrail } from "@/lib/geo/fieldnotes";
import type { Site } from "@/lib/geo/types";
import { displayName, useLocale, useT } from "@/lib/i18n";

export function TrailWalk({
  routeId,
  stops,
}: {
  routeId: string;
  stops: { site?: Site }[];
}) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const ids = stops.map((s) => s.site?.id).filter((id): id is string => !!id);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    setDone(readTrail(routeId));
  }, [routeId]);
  const next = ids.find((id) => !done.includes(id));
  const nextSite = stops.find((s) => s.site?.id === next)?.site;
  return (
    <section className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium">
        {done.length} / {ids.length}
      </p>
      <p className="mt-1 text-xs text-muted">{t("trailProgress")}</p>
      {nextSite ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`#stop-${nextSite.id}`} className="filter-chip">
            {t("nextStop")} · {displayName(nextSite, locale)}
          </a>
          <Link to="/" search={{ focus: nextSite.id, route: routeId }} className="filter-chip">
            {t("locate")}
          </Link>
        </div>
      ) : ids.length ? (
        <p className="mt-3 text-sm text-moss">{t("savedSite")}</p>
      ) : null}
    </section>
  );
}

export function TrailCheck({
  routeId,
  siteId,
}: {
  routeId: string;
  siteId: string;
}) {
  const t = useT();
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(readTrail(routeId).includes(siteId));
  }, [routeId, siteId]);
  return (
    <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="size-5 accent-[var(--color-moss)]"
        checked={on}
        onChange={() => setOn(toggleTrail(routeId, siteId).includes(siteId))}
      />
      {t("trailCheck")}
    </label>
  );
}
