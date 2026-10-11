/** ZH: Gaode GCJ-02. EN: Esri World Imagery + English place names (WGS84). Asia lock — no world wrap. */

const SAT =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
const LABELS_ZH =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}";
/** Chinese vector (city / range names in 中文). */
const VECTOR_ZH =
  "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}";
/** English streets on WGS84. Carto Voyager prints Latin toponyms (Urumqi, Lhasa, Xi'an). */
const CARTO_EN =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
/** English satellite: Esri imagery is WGS84; Gaode style=8 labels are Chinese-only. */
const ESRI_SAT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_PLACES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ESRI_STREETS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const ATTR_EN_STREETS_ESRI = "© Esri, OpenStreetMap, and the GIS user community";

export const ASIA_SW: [number, number] = [5.0, 70.0];
export const ASIA_NE: [number, number] = [55.5, 150.0];

const ATTR_ZH = "底图 © 高德地图 · 中国大陆 WGS84→GCJ-02；香港等地不偏移";
const ATTR_EN_SAT = "Imagery © Esri, Maxar, Earthstar Geographics · Place names © Esri";
const ATTR_EN_STREETS = "© OpenStreetMap contributors, © CARTO";

type Leaflet = typeof import("leaflet");
export type TileLocale = "zh" | "en";

export type TileHooks = {
  onReady?: () => void;
  onFail?: () => void;
};

function asiaBounds(L: Leaflet) {
  return L.latLngBounds(ASIA_SW, ASIA_NE);
}

function watchTiles(layer: import("leaflet").TileLayer, hooks?: TileHooks) {
  if (!hooks) return;
  layer.on("load", () => hooks.onReady?.());
  layer.on("tileerror", () => hooks.onFail?.());
}

function attachOsmFallback(
  L: Leaflet,
  map: import("leaflet").Map,
  layer: import("leaflet").TileLayer,
  hooks?: TileHooks,
) {
  let used = false;
  layer.on("tileerror", () => {
    if (used) return;
    used = true;
    const osm = L.tileLayer(OSM, {
      maxZoom: 19,
      noWrap: true,
      attribution: "© OpenStreetMap",
    });
    watchTiles(osm, hooks);
    osm.addTo(map);
  });
}

function attachEnStreetsFallback(
  L: Leaflet,
  map: import("leaflet").Map,
  layer: import("leaflet").TileLayer,
  hooks?: TileHooks,
) {
  let used = false;
  layer.on("tileerror", () => {
    if (used) return;
    used = true;
    const esri = L.tileLayer(ESRI_STREETS, {
      maxZoom: 19,
      noWrap: true,
      attribution: ATTR_EN_STREETS_ESRI,
    });
    watchTiles(esri, hooks);
    esri.addTo(map);
    attachOsmFallback(L, map, esri, hooks);
  });
}

export type BaseTilesHandle = {
  setLocale: (locale: TileLocale) => void;
  reload: () => void;
};

/** Default: satellite + labels. ZH = Gaode 卫星/标准; EN = Esri Satellite / Carto Streets. */
export function addChinaBase(
  L: Leaflet,
  map: import("leaflet").Map,
  opts?: {
    layersControl?: boolean;
    attribution?: boolean;
    locale?: TileLocale;
    hooks?: TileHooks;
  },
): BaseTilesHandle {
  const showControl = opts?.layersControl !== false;
  const showAttr = opts?.attribution !== false;
  let locale: TileLocale = opts?.locale ?? "zh";
  let mode: "sat" | "vector" = "sat";
  let satGroup: import("leaflet").LayerGroup | undefined;
  let vectorLayer: import("leaflet").TileLayer | undefined;
  let control: import("leaflet").Control.Layers | undefined;
  let placesLayer: import("leaflet").TileLayer | undefined;

  function names(): Record<string, import("leaflet").Layer> {
    return locale === "en"
      ? { Satellite: satGroup!, Streets: vectorLayer! }
      : { 卫星: satGroup!, 标准: vectorLayer! };
  }

  function syncPlaces() {
    if (!placesLayer || !satGroup) return;
    const show = map.getZoom() >= 9 && mode === "sat";
    const has = satGroup.hasLayer(placesLayer);
    if (show && !has) satGroup.addLayer(placesLayer);
    if (!show && has) satGroup.removeLayer(placesLayer);
  }

  function rebuild(keepView: boolean) {
    const wasSat = mode === "sat";
    if (satGroup) {
      map.removeLayer(satGroup);
      satGroup = undefined;
    }
    if (vectorLayer) {
      map.removeLayer(vectorLayer);
      vectorLayer = undefined;
    }
    if (control) {
      map.removeControl(control);
      control = undefined;
    }
    placesLayer = undefined;
    const bounds = asiaBounds(L);
    if (locale === "en") {
      const sat = L.tileLayer(ESRI_SAT, {
        maxZoom: 19,
        noWrap: true,
        bounds,
        attribution: showAttr ? ATTR_EN_SAT : "",
      });
      watchTiles(sat, opts?.hooks);
      placesLayer = L.tileLayer(ESRI_PLACES, {
        maxZoom: 19,
        noWrap: true,
        bounds,
        attribution: "",
        pane: "overlayPane",
      });
      watchTiles(placesLayer, opts?.hooks);
      satGroup = L.layerGroup([sat]);
      vectorLayer = L.tileLayer(CARTO_EN, {
        subdomains: "abcd",
        maxZoom: 20,
        noWrap: true,
        bounds,
        attribution: showAttr ? ATTR_EN_STREETS : "",
        className: "tile-rich",
      });
      watchTiles(vectorLayer, opts?.hooks);
      attachEnStreetsFallback(L, map, vectorLayer, opts?.hooks);
    } else {
      const a = showAttr ? ATTR_ZH : "";
      const sat = L.tileLayer(SAT, {
        subdomains: "1234",
        maxZoom: 18,
        noWrap: true,
        bounds,
        attribution: a,
      });
      watchTiles(sat, opts?.hooks);
      attachOsmFallback(L, map, sat, opts?.hooks);
      placesLayer = L.tileLayer(LABELS_ZH, {
        subdomains: "1234",
        maxZoom: 18,
        noWrap: true,
        bounds,
        attribution: "",
      });
      watchTiles(placesLayer, opts?.hooks);
      satGroup = L.layerGroup([sat]);
      vectorLayer = L.tileLayer(VECTOR_ZH, {
        subdomains: "1234",
        maxZoom: 18,
        noWrap: true,
        bounds,
        attribution: a,
        className: "tile-rich",
      });
      watchTiles(vectorLayer, opts?.hooks);
    }
    const startSat = keepView ? wasSat : true;
    if (startSat) {
      satGroup.addTo(map);
      mode = "sat";
    } else {
      vectorLayer.addTo(map);
      mode = "vector";
    }
    syncPlaces();
    if (showControl) {
      control = L.control
        .layers(names(), {}, { position: "bottomright", collapsed: true })
        .addTo(map);
    }
  }

  map.off("zoomend", syncPlaces);
  map.on("zoomend", syncPlaces);
  map.on("baselayerchange", (e: { name?: string }) => {
    const n = e.name || "";
    mode = n === "Satellite" || n === "卫星" ? "sat" : "vector";
    syncPlaces();
  });

  rebuild(false);

  return {
    setLocale(next: TileLocale) {
      if (next === locale) return;
      locale = next;
      rebuild(true);
    },
    reload() {
      const redraw = (layer: import("leaflet").Layer | undefined) => {
        if (!layer) return;
        const tile = layer as import("leaflet").TileLayer;
        if (typeof tile.redraw === "function" && "getTileUrl" in layer) tile.redraw();
        const group = layer as import("leaflet").LayerGroup;
        if (typeof group.eachLayer === "function" && !("getTileUrl" in layer)) {
          group.eachLayer((child) => redraw(child));
        }
      };
      redraw(satGroup);
      redraw(vectorLayer);
      map.invalidateSize();
    },
  };
}

/** Mini maps: satellite only, no switcher. Follows UI locale for labels. */
export function addBaseTiles(
  L: Leaflet,
  map: import("leaflet").Map,
  opts?: { attribution?: boolean; locale?: TileLocale },
) {
  return addChinaBase(L, map, {
    layersControl: false,
    attribution: opts?.attribution,
    locale: opts?.locale,
  });
}
