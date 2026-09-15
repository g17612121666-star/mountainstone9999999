import { useEffect, useRef } from "react";
import { gcjPair } from "@/lib/geo/coords";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { primaryType } from "@/lib/geo/labels";
import { addBaseTiles } from "@/lib/geo/tiles";
import type { Site } from "@/lib/geo/types";
import { displayName, useLocale } from "@/lib/i18n";

export function ThemeMap({ sites }: { sites: Site[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale((s) => s.locale);
  useEffect(() => {
    const el = ref.current;
    if (!el || sites.length === 0) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;
    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet as unknown as typeof import("leaflet");
      if (cancelled || !el) return;
      map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 18,
        worldCopyJump: false,
      });
      addBaseTiles(L, map, { attribution: false });
      const latlngs: [number, number][] = [];
      for (const site of sites) {
        const [lng, lat] = gcjPair(site.coordinates, site.province);
        latlngs.push([lat, lng]);
        L.circleMarker([lat, lng], {
          radius: 7,
          color: "#f7f3eb",
          fillColor: MARKER_COLOR[primaryType(site)],
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(displayName(site, locale), { direction: "top" })
          .addTo(map);
      }
      if (latlngs.length > 1) {
        L.polyline(latlngs, { color: "#6b5344", weight: 2, opacity: 0.7, dashArray: "6 6" }).addTo(
          map,
        );
        map.fitBounds(latlngs, { padding: [28, 28] });
      } else {
        map.setView(latlngs[0], 6);
      }
      requestAnimationFrame(() => map?.invalidateSize());
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [sites, locale]);
  return <div ref={ref} className="h-56 w-full overflow-hidden rounded-xl bg-bg-warm sm:h-72" />;
}
