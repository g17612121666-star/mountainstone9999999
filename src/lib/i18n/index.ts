import type { LandformType, PhenomenonType, Site, SiteType } from "@/lib/geo/types";
import { LANDFORM_LABEL, PHENOMENON_LABEL, SITE_TYPE_LABEL } from "@/lib/geo/types";
import { FOSSIL_LAW, FOSSIL_LAW_HK, MOTTO, shortName, typeBadge as typeBadgeZh } from "@/lib/geo/labels";
import { currentLocale, useLocale, type Locale } from "./locale";
import { FOSSIL_LAW_EN, FOSSIL_LAW_HK_EN, LANDFORM_EN, MOTTO_EN, PHENOMENON_EN, TYPE_EN, UI, type UiKey } from "./ui";
import { localizeSite } from "./localize";
import { provinceLabel } from "./provinces";

export { useLocale } from "./locale";
export type { Locale } from "./locale";
export { UI } from "./ui";
export type { UiKey } from "./ui";
export {
  localizeSite,
  localizeGeosite,
  localizeVisit,
  localizeRoute,
  localizeArea,
  themeName,
  themeThesis,
  themeRole,
  themeTask,
  hasQualifiedEn,
} from "./localize";
export { provinceLabel } from "./provinces";

const CJK = /[\u4e00-\u9fff]/;

export function t(key: UiKey, locale?: Locale): string {
  return UI[key][locale ?? currentLocale()];
}

export function useT() {
  const locale = useLocale((s) => s.locale);
  return (key: UiKey) => UI[key][locale];
}

export function motto(locale?: Locale): string {
  return (locale ?? currentLocale()) === "en" ? MOTTO_EN : MOTTO;
}

export function fossilLaw(locale?: Locale): string {
  return (locale ?? currentLocale()) === "en" ? FOSSIL_LAW_EN : FOSSIL_LAW;
}

export function fossilLawFor(province: string, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  if (province === "香港") return loc === "en" ? FOSSIL_LAW_HK_EN : FOSSIL_LAW_HK;
  return fossilLaw(loc);
}

export function landformLabel(type: LandformType, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  return loc === "en" ? (LANDFORM_EN[type] ?? type) : LANDFORM_LABEL[type];
}

export function typeLabel(type: SiteType, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  return loc === "en" ? (TYPE_EN[type] ?? type) : SITE_TYPE_LABEL[type];
}

export function phenomenonLabel(type: PhenomenonType, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  return loc === "en" ? (PHENOMENON_EN[type] ?? type) : PHENOMENON_LABEL[type];
}

export function displayName(site: Site, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  if (loc === "en") {
    const en = (site.name_en || "")
      .replace(/UNESCO Global Geopark/gi, "")
      .replace(/National Geopark/gi, "")
      .trim();
    if (en && !CJK.test(en)) return en;
    const short = shortName(site.name);
    if (short && !CJK.test(short)) return short;
    return site.id;
  }
  return shortName(site.name) || site.name;
}

export function typeBadge(site: Site, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  if (loc !== "en") return typeBadgeZh(site);
  if (site.types.includes("gssp")) return "GSSP";
  if (site.types.includes("world_geopark")) return "UNESCO Global";
  if (site.types.includes("national_geopark_candidate") && !site.types.includes("national_geopark")) {
    return "Qualifying";
  }
  if (site.types.includes("national_geopark")) return "National";
  if (site.types.includes("iugs_geoheritage")) return "IUGS";
  if (site.types.includes("urban_geosite")) return "Urban geosite";
  if (site.types.includes("stratotype")) return "Stratotype";
  return "Geosite";
}

export function useDisplayName() {
  const locale = useLocale((s) => s.locale);
  return (site: Site) => displayName(site, locale);
}

const EXTRA_CJK = /照片|标本|踏勘|露头|馆藏|公开资料|条目配图|缩略图/;

function creditAuthor(credit: string, loc: Locale): string {
  if (!credit) return "";
  if (loc !== "en") return credit;
  const parts = credit.split(/\s*[·/,|]\s*/);
  const kept = parts.filter((p) => {
    const t = p.trim();
    if (!t) return false;
    if (EXTRA_CJK.test(t)) return false;
    const cjk = t.match(/[\u4e00-\u9fff]/g);
    if (!cjk) return true;
    const only = t.replace(/[\s,;.:：、]/g, "");
    return /^[\u4e00-\u9fff]{2,4}$/.test(only);
  });
  return kept.join(", ");
}

export function photoCredit(credit: string, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  const who = creditAuthor(credit, loc);
  if (loc === "en") {
    return who
      ? `Reference photo · ${who} · not surveyed by this site`
      : "Reference photo · not surveyed by this site";
  }
  return credit ? `资料照片 · ${credit} · 非本站踏勘` : "资料照片，非本站踏勘";
}

export function placeLine(site: Site, locale?: Locale): string {
  const loc = locale ?? currentLocale();
  const p = provinceLabel(site.province, loc);
  if (loc === "en") {
    const localized = localizeSite(site, "en");
    const city = localized.city && !CJK.test(localized.city) ? localized.city : "";
    return city ? `${p} · ${city}` : p;
  }
  return site.city ? `${p} · ${site.city}` : p;
}
