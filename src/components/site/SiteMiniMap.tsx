import { useEffect, useRef } from "react";
import { gcjPair } from "@/lib/geo/coords";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { primaryType } from "@/lib/geo/labels";
import { addBaseTiles } from "@/lib/geo/tiles";
import type { Geosite, Site } from "@/lib/geo/types";

export function SiteMiniMap({ site, geosites }: { site: Site; geosites: Geosite[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;
    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet as unknown as typeof import("leaflet");
      if (cancelled || !el) return;
      const [lng, lat] = gcjPair(site.coordinates, site.province);
      map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        minZoom: 4,
        maxZoom: 18,
        worldCopyJump: false,
      });
      addBaseTiles(L, map, { attribution: false });
      map.setView([lat, lng], 11);
      L.circleMarker([lat, lng], {
        radius: 8,
        color: "#f7f3eb",
        fillColor: MARKER_COLOR[primaryType(site)],
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      for (const g of geosites) {
        const [glng, glat] = gcjPair(g.coordinates, site.province);
        L.circleMarker([glat, glng], {
          radius: 4,
          color: "#f7f3eb",
          fillColor: MARKER_COLOR.geosite,
          fillOpacity: 0.9,
          weight: 1,
        })
          .bindTooltip(`${g.name}：${g.look_here}`, { direction: "top", className: "marker-label" })
          .addTo(map);
      }
      requestAnimationFrame(() => map?.invalidateSize());
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [site, geosites]);
  return <div ref={ref} className="h-52 w-full overflow-hidden rounded-lg bg-bg-warm sm:h-64" />;
}
