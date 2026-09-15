import { useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LeafletMap, LayerGroup } from "leaflet";
import { geosites, getSite, sites } from "@/lib/geo/catalog";
import { gcjPair } from "@/lib/geo/coords";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { isGenericGeositeName, primaryType } from "@/lib/geo/labels";
import { filterSites } from "@/lib/geo/search";
import { useMapStore } from "@/lib/geo/store";
import { addChinaBase, ASIA_NE, ASIA_SW } from "@/lib/geo/tiles";
import type { Site } from "@/lib/geo/types";
import { displayName as displayNameI18n, localizeGeosite, useLocale, useT } from "@/lib/i18n";

function colorFor(site: Site): string {
  const t = primaryType(site);
  return MARKER_COLOR[t] ?? MARKER_COLOR.national_geopark;
}

function radiusFor(site: Site, zoom: number): number {
  const t = primaryType(site);
  if (t === "gssp") return zoom >= 6 ? 8 : 7;
  if (t === "world_geopark") return zoom >= 6 ? 8 : 6;
  if (t === "urban_geosite") return 6;
  return zoom >= 7 ? 6 : 5;
}

function clusterCellSize(zoom: number): number | null {
  if (zoom >= 7) return null;
  if (zoom <= 4) return 2.0;
  if (zoom <= 5) return 1.1;
  return 0.55;
}

export function ChinaMap() {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const geoLayerRef = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const filters = useMapStore((s) => s.filters);
  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);
  const locale = useLocale((s) => s.locale);
  const t = useT();

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let cancelled = false;
    let map: LeafletMap | undefined;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet as unknown as typeof import("leaflet");
      if (cancelled || !el) return;
      map = L.map(el, {
        zoomControl: false,
        minZoom: 4,
        maxZoom: 18,
        maxBounds: L.latLngBounds(ASIA_SW, ASIA_NE),
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
        attributionControl: true,
        preferCanvas: true,
      });
      map.setView([36.2, 104.0], 5);
      addChinaBase(L, map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      geoLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      requestAnimationFrame(() => map?.invalidateSize());
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      geoLayerRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    let Lmod: typeof import("leaflet") | null = null;

    const draw = async () => {
      if (!Lmod) Lmod = await import("leaflet");
      const L = Lmod as unknown as typeof import("leaflet");
      group.clearLayers();
      const zoom = map.getZoom();
      const matched = filterSites(sites, useMapStore.getState().filters);
      const selected = useMapStore.getState().selectedId;
      const cell = clusterCellSize(zoom);
      const buckets = new Map<string, Site[]>();

      for (const site of matched) {
        if (site.id === selected) continue;
        if (!cell) {
          const key = `s:${site.id}`;
          buckets.set(key, [site]);
          continue;
        }
        const [lng, lat] = site.coordinates;
        const key = `${Math.round(lat / cell)}_${Math.round(lng / cell)}`;
        const arr = buckets.get(key) ?? [];
        arr.push(site);
        buckets.set(key, arr);
      }

      for (const members of buckets.values()) {
        if (members.length === 1) {
          addSiteMarker(L, group, members[0]!, zoom, false, select, locale);
        } else {
          const slng =
            members.reduce((a, s) => a + gcjPair(s.coordinates, s.province)[0], 0) /
            members.length;
          const slat =
            members.reduce((a, s) => a + gcjPair(s.coordinates, s.province)[1], 0) /
            members.length;
          const n = members.length;
          const icon = L.divIcon({
            className: "cluster-dot",
            html: `<span>${n}</span>`,
            iconSize: [Math.min(44, 24 + n / 4), Math.min(44, 24 + n / 4)],
            iconAnchor: [16, 16],
          });
          const marker = L.marker([slat, slng], { icon, keyboard: true });
          marker.on("click", (e: LeafletMouseEvent) => {
            L.DomEvent.stop(e);
            map.setView([slat, slng], Math.min(zoom + 2, 12));
          });
          marker.bindTooltip(`${n} ${t("clusterSites")}`, { direction: "top", className: "marker-label" });
          marker.addTo(group);
        }
      }

      if (selected) {
        const sel = matched.find((s) => s.id === selected) ?? getSite(selected);
        if (sel) addSiteMarker(L, group, sel, zoom, true, select, locale);
      }

      const geoGroup = geoLayerRef.current;
      if (!geoGroup) return;
      geoGroup.clearLayers();
      if (zoom < 10) return;
      const bounds = map.getBounds();
      const siteBy = new Map(matched.map((s) => [s.id, s]));
      for (const gs of geosites) {
        const parent = siteBy.get(gs.site_id);
        if (!parent) continue;
        if (parent.content_status === "placeholder") continue;
        if (isGenericGeositeName(gs.name)) continue;
        const [lng, lat] = gcjPair(gs.coordinates, parent.province);
        if (!bounds.contains([lat, lng])) continue;
        const m = L.circleMarker([lat, lng], {
          radius: 4,
          color: "#f7f3eb",
          weight: 1,
          fillColor: MARKER_COLOR.geosite,
          fillOpacity: 0.9,
        });
        const locG = localizeGeosite(gs, locale);
        m.bindTooltip(`${locG.name}：${locG.look_here}`, {
          direction: "top",
          offset: [0, -6],
          className: "marker-label",
        });
        m.on("click", (e: LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          select(gs.site_id);
        });
        m.addTo(geoGroup);
      }
    };

    void draw();
    const onView = () => {
      void draw();
    };
    map.on("zoomend moveend", onView);
    return () => {
      map.off("zoomend moveend", onView);
    };
  }, [filters, selectedId, select, ready, locale, t]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const site = getSite(selectedId) ?? sites.find((s) => s.id === selectedId);
    if (!site) return;
    const [lng, lat] = gcjPair(site.coordinates, site.province);
    map.invalidateSize();
    const z = Math.max(map.getZoom(), 9);
    map.flyTo([lat, lng], z, { duration: 0.7 });
  }, [selectedId, ready]);

  return (
    <div
      ref={elRef}
      id="map"
      role="application"
      aria-label={t("mapAria")}
      className="absolute inset-0 bg-bg-warm"
    />
  );
}

function addSiteMarker(
  L: typeof import("leaflet"),
  group: LayerGroup,
  site: Site,
  zoom: number,
  selected: boolean,
  select: (id: string) => void,
  locale: "zh" | "en",
) {
  const [lng, lat] = gcjPair(site.coordinates, site.province);
  const marker = L.circleMarker([lat, lng], {
    radius: radiusFor(site, zoom) + (selected ? 2 : 0),
    color: "#f7f3eb",
    weight: selected ? 2.4 : 1.2,
    fillColor: colorFor(site),
    fillOpacity: 0.92,
  });
  marker.on("click", (e: LeafletMouseEvent) => {
    L.DomEvent.stop(e);
    select(site.id);
  });
  marker.bindTooltip(displayNameI18n(site, locale), {
    direction: "top",
    offset: [0, -8],
    opacity: 0.95,
    className: "marker-label",
  });
  marker.addTo(group);
}
