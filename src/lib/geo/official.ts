import type { Site, VisitInfo } from "./types";

export const ICS_GSSP_LIST = "https://stratigraphy.org/gssps/";
export const IUGS_LIST = "https://iugs-geoheritage.org/";

export interface OfficialLink {
  href: string;
  zh: string;
  en: string;
}

export function officialLinks(site: Site, visit?: VisitInfo): OfficialLink[] {
  const out: OfficialLink[] = [];
  if (site.official_website) {
    out.push({ href: site.official_website, zh: "园区官网", en: "Official website" });
  }
  if (visit?.official_ticket_url && visit.official_ticket_url !== site.official_website) {
    out.push({ href: visit.official_ticket_url, zh: "官方购票页", en: "Official ticket page" });
  }
  if (site.types.includes("gssp")) {
    out.push({ href: ICS_GSSP_LIST, zh: "ICS 金钉子名录", en: "ICS GSSP list" });
  }
  if (site.types.includes("iugs_geoheritage")) {
    out.push({ href: IUGS_LIST, zh: "IUGS 地质遗产", en: "IUGS Geoheritage" });
  }
  if (site.video?.bvid) {
    out.push({
      href: `https://www.bilibili.com/video/${site.video.bvid}`,
      zh: "过程视频（B 站）",
      en: "Process video (Bilibili)",
    });
  }
  return out;
}
