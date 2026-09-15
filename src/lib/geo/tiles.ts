/** Gaode tiles are GCJ-02. OSM is WGS84 fallback only. Asia lock — no world wrap. */

const SAT =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
const LABELS =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}";
const VECTOR =
  "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}";
const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const ASIA_SW: [number, number] = [5.0, 70.0];
export const ASIA_NE: [number, number] = [55.5, 150.0];

const ATTR = "底图 © 高德地图 · 中国大陆 WGS84→GCJ-02；香港等地不偏移";

type Leaflet = typeof import("leaflet");

function commonOpts(L: Leaflet, extra?: Record<string, unknown>) {
  return {
    subdomains: "1234",
    maxZoom: 18,
    noWrap: true,
    bounds: L.latLngBounds(ASIA_SW, ASIA_NE),
    ...extra,
  };
}

function attachOsmFallback(
  L: Leaflet,
  map: import("leaflet").Map,
  layer: import("leaflet").TileLayer,
) {
  let used = false;
  layer.on("tileerror", () => {
    if (used) return;
    used = true;
    L.tileLayer(OSM, {
      maxZoom: 19,
      noWrap: true,
      attribution: "© OpenStreetMap",
    }).addTo(map);
  });
}

/** Default: Gaode satellite + labels, with 卫星 / 标准 switch. */
export function addChinaBase(
  L: Leaflet,
  map: import("leaflet").Map,
  opts?: { layersControl?: boolean; attribution?: boolean },
) {
  const attribution = opts?.attribution === false ? "" : ATTR;
  const sat = L.tileLayer(SAT, commonOpts(L, { attribution }));
  const labels = L.tileLayer(LABELS, commonOpts(L, { attribution: "" }));
  const vector = L.tileLayer(
    VECTOR,
    commonOpts(L, { attribution, className: "tile-rich" }),
  );
  const satellite = L.layerGroup([sat, labels]);
  satellite.addTo(map);
  attachOsmFallback(L, map, sat);
  if (opts?.layersControl !== false) {
    L.control
      .layers({ 卫星: satellite, 标准: vector }, {}, { position: "bottomright", collapsed: true })
      .addTo(map);
  }
  return satellite;
}

/** Mini maps: satellite only, no switcher. */
export function addBaseTiles(
  L: Leaflet,
  map: import("leaflet").Map,
  opts?: { attribution?: boolean },
) {
  return addChinaBase(L, map, { layersControl: false, attribution: opts?.attribution });
}
