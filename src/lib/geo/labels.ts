import { LANDFORM_LABEL, type LandformType, type Site, type SiteType } from "./types";

export function shortName(name: string): string {
  return name
    .replaceAll("联合国教科文组织", "")
    .replaceAll("世界地质公园", "")
    .replaceAll("国家地质公园", "")
    .replaceAll("地质公园", "")
    .replace(/[（(].*?[）)]/g, "")
    .replaceAll("砂岩峰林", "")
    .trim();
}

export function displayName(site: Site): string {
  return shortName(site.name) || site.name;
}

export function primaryType(site: Site): SiteType {
  const order: SiteType[] = [
    "gssp",
    "world_geopark",
    "national_geopark",
    "national_geopark_candidate",
    "iugs_geoheritage",
    "stratotype",
    "urban_geosite",
    "landform_site",
  ];
  return order.find((t) => site.types.includes(t)) ?? site.types[0] ?? "landform_site";
}

export function typeBadge(site: Site): string {
  if (site.types.includes("gssp")) return "金钉子";
  if (site.types.includes("world_geopark")) return "世界级";
  if (
    site.types.includes("national_geopark_candidate") &&
    !site.types.includes("national_geopark")
  ) {
    return "资格";
  }
  if (site.types.includes("national_geopark")) return "国家级";
  if (site.types.includes("iugs_geoheritage")) return "IUGS";
  if (site.types.includes("urban_geosite")) return "城市地质";
  if (site.types.includes("stratotype")) return "标准剖面";
  return "地质点";
}

export function landformText(types: LandformType[]): string {
  return types.map((t) => LANDFORM_LABEL[t]).join(" · ");
}

const GENERIC_GEOSITES = new Set([
  "峰丛或溶洞观景台",
  "岩溶峡谷步道",
  "洞穴大厅入口",
  "主园区观景台",
  "典型露头",
  "游客中心展板",
  "火山锥观景台",
  "熔岩流露头",
]);

export function isGenericGeositeName(name: string): boolean {
  if (!name) return true;
  if (GENERIC_GEOSITES.has(name)) return true;
  if (name.includes("待补") || name === "半日地质步道") return true;
  if (name.includes("核心观景台") || name.includes("剖面步道") || name.includes("对照点")) return true;
  if (name.includes("火山口或堰塞湖岸") || name === "火山口或堰塞湖岸") return true;
  return false;
}

export function isFakeGeosite(g: { id?: string; name?: string }): boolean {
  const name = g.name || "";
  const id = g.id || "";
  if (isGenericGeositeName(name)) return true;
  if (/-auto\d+$/.test(id)) return true;
  return false;
}

export const MOTTO = "石头上写着地球的字。我们负责读出来，不负责撕走。";

export const FOSSIL_LAW =
  "根据《古生物化石保护条例》与《地质遗迹保护管理规定》，古生物化石原则上属于国家所有。禁止私自发掘、买卖来路不明的化石。正确做法：看、拍、记；发现重要化石向管理部门报告。不要敲、不要挖、不要带走。";

export const FOSSIL_LAW_HK =
  "香港是单独法域。内地《古生物化石保护条例》不在此直接适用。不要敲、挖、带走标本。遵守《郊野公园条例》与现场告示。";

