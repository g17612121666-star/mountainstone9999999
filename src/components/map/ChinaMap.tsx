import { useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LeafletMap, LayerGroup, Marker } from "leaflet";
import { coverFor, geosites, getSite, sites, themeRoutes } from "@/lib/geo/catalog";
import { mapPair } from "@/lib/geo/coords";
import { MARKER_COLOR } from "@/lib/geo/constants";
import { isGenericGeositeName, primaryType } from "@/lib/geo/labels";
import { processLine } from "@/lib/geo/process";
import { filterSites } from "@/lib/geo/search";
import { useMapStore } from "@/lib/geo/store";
import { addChinaBase, ASIA_NE, ASIA_SW, type BaseTilesHandle } from "@/lib/geo/tiles";
import type { Site, SiteType } from "@/lib/geo/types";
import { displayName as displayNameI18n, localizeGeosite, localizeSite, themeName, typeLabel, useLocale, useT } from "@/lib/i18n";

function colorFor(site: Site): string {
  const t = primaryType(site);
  return MARKER_COLOR[t] ?? MARKER_COLOR.national_geopark;
}

function clusterCellSize(zoom: number): number | null {
  if (zoom >= 9) return null;
  if (zoom <= 4) return 3.4;
  if (zoom <= 5) return 2.5;
  if (zoom <= 6) return 1.7;
  if (zoom <= 7) return 1.05;
  return 0.62;
}

function leanDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const saveData =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-data: reduce)").matches;
  return saveData || cores <= 4 || (typeof mem === "number" && mem > 0 && mem <= 3);
}

function shapeSvg(kind: SiteType, color: string, size: number, selected: boolean): string {
  const sw = selected ? 3 : 2;
  const stroke = "#f7f3eb";
  if (kind === "gssp") {
    return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.2" y="6.2" width="11.6" height="11.6" transform="rotate(45 12 12)" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
  }
  if (kind === "world_geopark") {
    return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
  }
  if (kind === "urban_geosite") {
    return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
  }
  if (kind === "national_geopark_candidate") {
    return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.2" fill="#f7f3eb" stroke="${color}" stroke-width="2.2" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="2.3" fill="${color}"/></svg>`;
  }
  if (kind === "iugs_geoheritage") {
    return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,3 21.5,20 2.5,20" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
  }
  return `<svg class="marker-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
}

function dominantColor(members: Site[]): string {
  const counts = new Map<string, number>();
  for (const site of members) {
    const c = colorFor(site);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = "#6b5344";
  let n = 0;
  for (const [c, k] of counts) {
    if (k > n) {
      best = c;
      n = k;
    }
  }
  return best;
}

export function ChinaMap() {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const geoLayerRef = useRef<LayerGroup | null>(null);
  const routeLayerRef = useRef<LayerGroup | null>(null);
  const tilesRef = useRef<BaseTilesHandle | null>(null);
  const viewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const [ready, setReady] = useState(false);
  const filters = useMapStore((s) => s.filters);
  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const userAt = useMapStore((s) => s.userAt);
  const fly = useMapStore((s) => s.fly);
  const showRoutes = useMapStore((s) => s.showRoutes);
  const activeRouteId = useMapStore((s) => s.activeRouteId);
  const tileNonce = useMapStore((s) => s.tileNonce);
  const tiles = useMapStore((s) => s.tiles);
  const reloadTiles = useMapStore((s) => s.reloadTiles);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    let fails = 0;

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
        closePopupOnClick: false,
      });
      if (viewRef.current) {
        map.setView(viewRef.current.center, viewRef.current.zoom);
      } else {
        map.setView([36.2, 104.0], 5);
      }
      useMapStore.getState().setTiles("loading");
      tilesRef.current = addChinaBase(L, map, {
        locale,
        hooks: {
          onReady: () => {
            fails = 0;
            useMapStore.getState().setTiles("ready");
          },
          onFail: () => {
            fails += 1;
            if (fails >= 6 && useMapStore.getState().tiles !== "ready") {
              useMapStore.getState().setTiles("error");
            }
          },
        },
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      geoLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      requestAnimationFrame(() => map?.invalidateSize());
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (map) {
        const c = map.getCenter();
        viewRef.current = { center: [c.lat, c.lng], zoom: map.getZoom() };
        map.remove();
      }
      mapRef.current = null;
      layerRef.current = null;
      geoLayerRef.current = null;
      routeLayerRef.current = null;
      tilesRef.current = null;
      setReady(false);
    };
  }, [locale]);

  useEffect(() => {
    if (!ready || tileNonce === 0) return;
    tilesRef.current?.reload();
  }, [tileNonce, ready]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const group = layerRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !group || !routeGroup) return;
    let Lmod: typeof import("leaflet") | null = null;
    let timer = 0;

    const draw = async () => {
      if (!Lmod) Lmod = await import("leaflet");
      const L = Lmod as unknown as typeof import("leaflet");
      group.clearLayers();
      routeGroup.clearLayers();
      const zoom = map.getZoom();
      const matched = filterSites(sites, useMapStore.getState().filters);
      const selected = useMapStore.getState().selectedId;
      const lean = leanDevice();
      const bounds = map.getBounds().pad(0.15);
      const inView = matched.filter((site) => {
        if (site.id === selected) return false;
        const [lng, lat] = mapPair(site.coordinates, site.province, locale);
        return bounds.contains([lat, lng]);
      });
      let cell = clusterCellSize(zoom);
      if (!cell && (lean || inView.length > 160)) cell = lean ? 0.5 : 0.3;

      const buckets = new Map<string, Site[]>();
      for (const site of inView) {
        if (!cell) {
          buckets.set(`s:${site.id}`, [site]);
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
          addSiteMarker(L, group, members[0]!, false, select, locale);
        } else {
          const slng =
            members.reduce((a, s) => a + mapPair(s.coordinates, s.province, locale)[0], 0) /
            members.length;
          const slat =
            members.reduce((a, s) => a + mapPair(s.coordinates, s.province, locale)[1], 0) /
            members.length;
          const n = members.length;
          const size = Math.min(46, 26 + Math.round(n / 5));
          const color = dominantColor(members);
          const icon = L.divIcon({
            className: "cluster-wrap",
            html: `<span class="cluster-dot" style="width:${size}px;height:${size}px;background:${color}"><span>${n}</span></span>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          const marker = L.marker([slat, slng], {
            icon,
            keyboard: true,
            title: `${n} ${t("clusterSites")}`,
            zIndexOffset: 200,
          });
          marker.on("click", (e: LeafletMouseEvent) => {
            L.DomEvent.stop(e);
            const ids = [...members]
              .sort((a, b) => a.name.localeCompare(b.name, "zh"))
              .map((s) => s.id);
            useMapStore.getState().openPile({ kind: "cluster", ids, at: [slat, slng] });
            if (zoom < 8) map.setView([slat, slng], Math.min(zoom + 2, 9));
          });
          marker.bindTooltip(`${n} ${t("clusterSites")}`, { direction: "top", className: "marker-label" });
          marker.addTo(group);
        }
      }

      if (selected) {
        const sel = matched.find((s) => s.id === selected) ?? getSite(selected);
        if (sel) addSiteMarker(L, group, sel, true, select, locale);
      }

      const pin = useMapStore.getState().userAt;
      if (pin) {
        L.circleMarker([pin[1], pin[0]], {
          radius: 7,
          color: "#f7f3eb",
          weight: 2,
          fillColor: "#3d5c52",
          fillOpacity: 1,
        }).addTo(group);
      }

      const state = useMapStore.getState();
      if (state.showRoutes || state.activeRouteId) {
        for (const tr of themeRoutes) {
          if (!state.showRoutes && tr.id !== state.activeRouteId) continue;
          const latlngs: [number, number][] = [];
          for (const id of tr.site_ids) {
            const site = getSite(id);
            if (!site) continue;
            const [lng, lat] = mapPair(site.coordinates, site.province, locale);
            latlngs.push([lat, lng]);
          }
          if (latlngs.length < 2) continue;
          const active = tr.id === state.activeRouteId;
          const line = L.polyline(latlngs, {
            color: active ? "#3d5c52" : "#6b5344",
            weight: active ? 4 : 2.25,
            opacity: active ? 0.95 : 0.72,
            dashArray: active ? undefined : "7 8",
          });
          line.on("click", (e: LeafletMouseEvent) => {
            L.DomEvent.stop(e);
            useMapStore.getState().setActiveRoute(tr.id);
          });
          line.bindTooltip(themeName(tr, locale), { sticky: true, className: "marker-label" });
          line.addTo(routeGroup);
          if (!active) continue;
          tr.site_ids.forEach((id, i) => {
            const site = getSite(id);
            if (!site) return;
            const [lng, lat] = mapPair(site.coordinates, site.province, locale);
            const mk = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "cluster-wrap",
                html: `<span class="route-stop">${i + 1}</span>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              }),
              keyboard: true,
              title: displayNameI18n(site, locale),
              zIndexOffset: 500,
            });
            mk.on("click", (e: LeafletMouseEvent) => {
              L.DomEvent.stop(e);
              select(site.id);
            });
            mk.addTo(routeGroup);
          });
        }
      }

      const geoGroup = geoLayerRef.current;
      if (!geoGroup) return;
      geoGroup.clearLayers();
      if (zoom < 10) return;
      const siteBy = new Map(matched.map((s) => [s.id, s]));
      const center = map.getCenter();
      const cap = lean ? 60 : 140;
      const visible: { gs: (typeof geosites)[number]; lat: number; lng: number; d: number }[] = [];
      for (const gs of geosites) {
        const parent = siteBy.get(gs.site_id);
        if (!parent) continue;
        if (parent.content_status === "placeholder") continue;
        if (isGenericGeositeName(gs.name)) continue;
        const [lng, lat] = mapPair(gs.coordinates, parent.province, locale);
        if (!bounds.contains([lat, lng])) continue;
        const d = center.distanceTo([lat, lng]);
        visible.push({ gs, lat, lng, d });
      }
      visible.sort((a, b) => a.d - b.d);
      for (const item of visible.slice(0, cap)) {
        const m = L.circleMarker([item.lat, item.lng], {
          radius: 4,
          color: "#f7f3eb",
          weight: 1,
          fillColor: MARKER_COLOR.geosite,
          fillOpacity: 0.9,
        });
        const locG = localizeGeosite(item.gs, locale);
        m.bindTooltip(`${locG.name}${locale === "en" ? " · " : "："}${locG.look_here}`, {
          direction: "top",
          offset: [0, -6],
          className: "marker-label",
        });
        m.on("click", (e: LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          select(item.gs.site_id);
        });
        m.addTo(geoGroup);
      }
    };

    const schedule = (force = false) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!force && map.getContainer().querySelector(".leaflet-popup")) return;
        void draw();
      }, 40);
    };
    const onZoom = () => schedule(true);
    const onMove = () => schedule(false);
    const onPopupClose = () => schedule(false);
    schedule(true);
    map.on("zoomend", onZoom);
    map.on("moveend", onMove);
    map.on("popupclose", onPopupClose);
    return () => {
      window.clearTimeout(timer);
      map.off("zoomend", onZoom);
      map.off("moveend", onMove);
      map.off("popupclose", onPopupClose);
    };
  }, [filters, selectedId, select, ready, locale, t, userAt, showRoutes, activeRouteId]);

  useEffect(() => {
    if (!ready || !fly) return;
    mapRef.current?.flyTo([fly.lat, fly.lng], fly.zoom, { duration: 0.7 });
  }, [fly, ready]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const site = getSite(selectedId) ?? sites.find((s) => s.id === selectedId);
    if (!site) return;
    const [lng, lat] = mapPair(site.coordinates, site.province, locale);
    map.invalidateSize();
    const z = Math.max(map.getZoom(), 9);
    map.flyTo([lat, lng], z, { duration: 0.7 });
  }, [selectedId, ready, locale]);

  return (
    <>
      <div
        ref={elRef}
        id="map"
        role="application"
        aria-label={t("mapAria")}
        className="absolute inset-0 bg-bg-warm"
      />
      {tiles === "loading" || tiles === "boot" ? (
        <p className="pointer-events-none absolute bottom-36 left-1/2 z-20 -translate-x-1/2 rounded-full bg-surface/92 px-3 py-1 text-xs text-ink shadow-[var(--shadow-border)] sm:top-3 sm:right-3 sm:bottom-auto sm:left-auto sm:translate-x-0">
          {t("tileLoading")}
        </p>
      ) : null}
      {tiles === "error" ? (
        <button
          type="button"
          className="absolute bottom-36 left-1/2 z-20 -translate-x-1/2 rounded-full bg-surface px-3 py-1.5 text-xs text-hematite shadow-[var(--shadow-border)] sm:top-3 sm:right-3 sm:bottom-auto sm:left-auto sm:translate-x-0"
          onClick={() => reloadTiles()}
        >
          {t("tileRetry")}
        </button>
      ) : null}
    </>
  );
}

function addSiteMarker(
  L: typeof import("leaflet"),
  group: LayerGroup,
  site: Site,
  selected: boolean,
  select: (id: string) => void,
  locale: "zh" | "en",
) {
  const [lng, lat] = mapPair(site.coordinates, site.province, locale);
  const kind = primaryType(site);
  const size = selected ? 28 : 22;
  const name = displayNameI18n(site, locale);
  const label = `${name}，${typeLabel(kind, locale)}`;
  const marker: Marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: "cluster-wrap",
      html: shapeSvg(kind, colorFor(site), size, selected),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    }),
    keyboard: true,
    title: label,
    alt: label,
    zIndexOffset: selected ? 800 : 0,
  });
  marker.bindTooltip(name, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.95,
    className: "marker-label",
  });
  marker.bindPopup(popupNode(site, locale, select), {
    maxWidth: 260,
    minWidth: 188,
    className: "map-pop-wrap",
    autoPan: false,
    closeOnClick: false,
  });
  marker.addTo(group);
}

function popupNode(site: Site, locale: "zh" | "en", select: (id: string) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "map-pop";
  const shot = coverFor(site);
  if (shot) {
    const img = document.createElement("img");
    img.src = shot.src;
    img.alt = "";
    img.className = "map-pop-img";
    root.append(img);
  }
  const copy = localizeSite(site, locale);
  const proc = processLine(site, locale);
  if (proc) {
    const p = document.createElement("p");
    p.className = "map-pop-proc";
    p.textContent = proc;
    root.append(p);
    const note = document.createElement("p");
    note.className = "map-pop-note";
    note.textContent =
      locale === "en"
        ? "Typical of this landform — not a measured log of this park."
        : "这是这类地貌常见的过程，不是这一处的实测剖面。";
    root.append(note);
  }
  if (copy.hook) {
    const hook = document.createElement("p");
    hook.className = "map-pop-hook";
    hook.textContent = copy.hook.length > 72 ? `${copy.hook.slice(0, 72)}…` : copy.hook;
    root.append(hook);
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "map-pop-btn";
  btn.textContent = locale === "en" ? "Open this place" : "展开这一处";
  btn.addEventListener("click", () => select(site.id));
  root.append(btn);
  return root;
}
