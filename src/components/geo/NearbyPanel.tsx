import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sites } from "@/lib/geo/catalog";
import { nearestSites, whyNearby, type NearbyHit } from "@/lib/geo/distance";
import { siteTo } from "@/lib/geo/href";
import { displayName, landformLabel, typeBadge, useLocale, useT } from "@/lib/i18n";

const RADII = [20, 50, 100] as const;

export function NearbyPanel({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [radius, setRadius] = useState<(typeof RADII)[number]>(50);
  const [hits, setHits] = useState<NearbyHit[] | null>(null);
  const [status, setStatus] = useState<"idle" | "need" | "empty" | "ok">("idle");

  function locate() {
    if (!navigator.geolocation) {
      setStatus("need");
      setHits(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const found = nearestSites(origin, sites, radius, 8);
        setHits(found);
        setStatus(found.length ? "ok" : "empty");
      },
      () => {
        setHits(null);
        setStatus("need");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }

  return (
    <section className={compact ? "" : "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-lg font-semibold">{t("nearbyTitle")}</h2>
        <div className="ml-auto flex gap-1">
          {RADII.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRadius(r);
                setHits(null);
                setStatus("idle");
              }}
              className={
                radius === r
                  ? "h-8 rounded-full bg-sand px-2.5 text-xs text-primary-fg"
                  : "h-8 rounded-full bg-surface-2 px-2.5 text-xs text-muted"
              }
            >
              {r} km
            </button>
          ))}
        </div>
      </div>
      <Button type="button" size="sm" className="mt-3" onClick={locate}>
        {t("locateMe")}
      </Button>
      {status === "need" ? <p className="mt-3 text-sm text-muted">{t("nearbyEmpty")}</p> : null}
      {status === "empty" ? <p className="mt-3 text-sm text-muted">{t("nearbyNone")}</p> : null}
      {hits && hits.length ? (
        <ul className="mt-3 space-y-2">
          {hits.map((h) => (
            <li key={h.site.id}>
              <Link
                {...siteTo(h.site)}
                className="block rounded-lg border border-border px-3 py-2 hover:bg-surface-2"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{displayName(h.site, locale)}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {h.km < 10 ? h.km.toFixed(1) : Math.round(h.km)} km
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {typeBadge(h.site, locale)} · {landformLabel(h.site.landform_types[0] ?? "other", locale)}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-subtle">
                  {whyNearby(h.site, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
