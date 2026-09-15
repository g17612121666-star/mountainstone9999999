import { isGovPortal } from "./copy";
import type { Site, VisitInfo } from "./types";

export const ICS_GSSP_LIST = "https://stratigraphy.org/gssps/";
export const IUGS_LIST = "https://iugs-geoheritage.org/";

export interface OfficialLink {
  href: string;
  zh: string;
  en: string;
  kind: "park" | "gov" | "ticket" | "ics" | "iugs" | "video";
}

export function officialLinks(site: Site, visit?: VisitInfo): OfficialLink[] {
  const out: OfficialLink[] = [];
  if (site.official_website) {
    const gov = isGovPortal(site.official_website);
    out.push({
      href: site.official_website,
      zh: gov ? "地方政府站点，不是园区官网" : "园区 / 博物馆 / 预约页",
      en: gov ? "Local government site — not the park’s own page" : "Park, museum or booking page",
      kind: gov ? "gov" : "park",
    });
  }
  if (visit?.official_ticket_url && visit.official_ticket_url !== site.official_website) {
    out.push({
      href: visit.official_ticket_url,
      zh: "官方购票页",
      en: "Official ticket page",
      kind: "ticket",
    });
  }
  if (site.types.includes("gssp")) {
    out.push({ href: ICS_GSSP_LIST, zh: "ICS 金钉子名录", en: "ICS GSSP list", kind: "ics" });
  }
  if (site.types.includes("iugs_geoheritage")) {
    out.push({ href: IUGS_LIST, zh: "IUGS 地质遗产", en: "IUGS Geoheritage", kind: "iugs" });
  }
  if (site.video?.bvid) {
    out.push({
      href: `https://www.bilibili.com/video/${site.video.bvid}`,
      zh: "过程视频（B 站）",
      en: "Process video (Bilibili)",
      kind: "video",
    });
  }
  return out;
}
