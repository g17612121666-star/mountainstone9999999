import type { Site } from "./types";

const R = 6371;

export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export interface NearbyHit {
  site: Site;
  km: number;
}

export function nearestSites(
  origin: [number, number],
  all: Site[],
  radiusKm: number,
  limit = 8,
): NearbyHit[] {
  return all
    .map((site) => ({ site, km: haversineKm(origin, site.coordinates) }))
    .filter((h) => h.km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export function whyNearby(site: Site, locale: "zh" | "en"): string {
  const lf = site.landform_types[0];
  if (locale === "en") {
    if (site.types.includes("gssp")) return "A golden spike — compare the bed, not the scenery.";
    if (lf === "karst") return "Carbonate taken apart by water; check fizz and valley vs fenglin.";
    if (lf === "danxia") return "Red beds, joints, collapse — not a colourful hill.";
    if (lf === "zhangjiajie_sandstone") return "Quartz-sandstone pillars; acid does not fizz.";
    if (lf === "granite_peak") return "Coarse granite tors, not a volcanic cone.";
    if (lf === "volcano") return "Name the magma and the landform: cone, caldera, or dam.";
    if (lf === "loess") return "Aeolian silt and a river cutting its own archive.";
    if (lf === "fossil") return "A bed, not a souvenir. Look, don’t take.";
    if (lf === "coast") return "Waves or tides — ask whether the ground is rock or sand.";
    return "A catalog geosite worth checking against what is underfoot.";
  }
  if (site.types.includes("gssp")) return "金钉子。对照的是那一层，不是风景。";
  if (lf === "karst") return "碳酸盐岩被水拆掉；核对起泡，以及河谷还是峰林。";
  if (lf === "danxia") return "红层、节理、崩塌，不是彩丘。";
  if (lf === "zhangjiajie_sandstone") return "石英砂岩柱，滴酸不起泡。";
  if (lf === "granite_peak") return "粗粒花岗岩石蛋，不是火山锥。";
  if (lf === "volcano") return "先认岩浆，再认锥、破火山口还是堰塞。";
  if (lf === "loess") return "风积黄土，河在切自己的档案。";
  if (lf === "fossil") return "那是一层，不是纪念品。只看不挖。";
  if (lf === "coast") return "浪或潮——脚下是岩石还是沙。";
  return "名录上的地质点，拿来和脚下对照。";
}
