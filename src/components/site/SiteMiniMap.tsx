import { useEffect, useRef } from "react";
import { mapPair } from "@/lib/geo/coords";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { primaryType } from "@/lib/geo/labels";
import { addBaseTiles } from "@/lib/geo/tiles";
import type { Geosite, Site } from "@/lib/geo/types";
import { useLocale } from "@/lib/i18n";

export function SiteMiniMap({ site, geosites }: { site: Site; geosites: Geosite[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale((s) => s.locale);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;
    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet as unknown as typeof import("leaflet");
      if (cancelled || !el) return;
      const [lng, lat] = mapPair(site.coordinates, site.province, locale);
      map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        minZoom: 4,
        maxZoom: 18,
        worldCopyJump: false,
      });
      addBaseTiles(L, map, { attribution: false, locale });
      map.setView([lat, lng], 11);
      L.circleMarker([lat, lng], {
        radius: 8,
        color: "#f7f3eb",
        fillColor: MARKER_COLOR[primaryType(site)],
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      const sep = locale === "en" ? " · " : "：";
      for (const g of geosites) {
        const [glng, glat] = mapPair(g.coordinates, site.province, locale);
        L.circleMarker([glat, glng], {
          radius: 4,
          color: "#f7f3eb",
          fillColor: MARKER_COLOR.geosite,
          fillOpacity: 0.9,
          weight: 1,
        })
          .bindTooltip(`${g.name}${sep}${g.look_here}`, { direction: "top", className: "marker-label" })
          .addTo(map);
      }
      requestAnimationFrame(() => map?.invalidateSize());
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [site, geosites, locale]);
  return <div ref={ref} className="h-52 w-full overflow-hidden rounded-lg bg-bg-warm sm:h-64" />;
}
