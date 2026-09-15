import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sites } from "@/lib/geo/catalog";
import { nearestSites, whyNearby, type NearbyHit } from "@/lib/geo/distance";
import { siteTo } from "@/lib/geo/href";
import { suggestSites } from "@/lib/geo/search";
import { displayName, landformLabel, typeBadge, useLocale, useT } from "@/lib/i18n";

const RADII = [20, 50, 100] as const;

const CITIES: { zh: string; en: string; coords: [number, number] }[] = [
  { zh: "北京", en: "Beijing", coords: [116.407, 39.904] },
  { zh: "上海", en: "Shanghai", coords: [121.474, 31.23] },
  { zh: "广州", en: "Guangzhou", coords: [113.264, 23.129] },
  { zh: "成都", en: "Chengdu", coords: [104.066, 30.572] },
  { zh: "西安", en: "Xi’an", coords: [108.94, 34.342] },
  { zh: "桂林", en: "Guilin", coords: [110.29, 25.274] },
  { zh: "张家界", en: "Zhangjiajie", coords: [110.479, 29.117] },
  { zh: "香港", en: "Hong Kong", coords: [114.169, 22.319] },
  { zh: "杭州", en: "Hangzhou", coords: [120.155, 30.274] },
  { zh: "武汉", en: "Wuhan", coords: [114.305, 30.593] },
];

export function NearbyPanel({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [radius, setRadius] = useState<(typeof RADII)[number]>(50);
  const [hits, setHits] = useState<NearbyHit[] | null>(null);
  const [status, setStatus] = useState<"idle" | "need" | "empty" | "ok">("idle");
  const [place, setPlace] = useState("");

  function applyOrigin(origin: [number, number]) {
    const found = nearestSites(origin, sites, radius, 8);
    setHits(found);
    setStatus(found.length ? "ok" : "empty");
  }

  function locate() {
    if (!navigator.geolocation) {
      setStatus("need");
      setHits(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => applyOrigin([pos.coords.longitude, pos.coords.latitude]),
      () => {
        setHits(null);
        setStatus("need");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }

  const placeHits = useMemo(() => suggestSites(sites, place, 5), [place]);

  return (
    <section className={compact ? "" : "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"}>
      {!compact ? (
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
      ) : (
        <div className="flex gap-1">
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
      )}
      <Button type="button" size="sm" className="mt-3" onClick={locate}>
        {t("locateMe")}
      </Button>
      <p className="mt-4 text-xs font-medium text-muted">{t("nearbyCity")}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CITIES.map((c) => (
          <button
            key={c.zh}
            type="button"
            className="h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-ink"
            onClick={() => applyOrigin(c.coords)}
          >
            {locale === "en" ? c.en : c.zh}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-xs font-medium text-muted">
        {t("nearbyPlace")}
        <Input
          className="mt-1"
          placeholder={t("nearbyPlacePh")}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </label>
      {place.trim() && placeHits.length ? (
        <ul className="mt-2 overflow-hidden rounded-lg border border-border">
          {placeHits.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                onClick={() => {
                  applyOrigin(s.coordinates);
                  setPlace("");
                }}
              >
                <span className="font-medium">{displayName(s, locale)}</span>
                <span className="shrink-0 text-xs text-muted">{typeBadge(s, locale)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
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
