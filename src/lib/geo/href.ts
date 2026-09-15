import { SITE_PUBLIC_ID } from "./patches";
import type { Site } from "./types";

const GSSP_PUBLIC: Record<string, string> = {
  "gssp-huangnitang": "changshan-huangnitang",
  meishan: "changxing-meishan",
  "gssp-jiangshan": "jiangshan",
  "gssp-huanghuachang": "huanghuachang",
  "gssp-wangjiawan": "wangjiawan",
  "gssp-paibi": "paibi",
  "gssp-guzhang": "guzhang",
  "gssp-penglaitan": "penglaitan",
  "gssp-pengchong": "pengchong",
  "gssp-wuliu": "wuliu",
};

export function publicGsspId(id: string): string {
  return GSSP_PUBLIC[id] ?? id.replace(/^gssp-/, "");
}

export function publicSiteId(id: string): string {
  return SITE_PUBLIC_ID[id] ?? id;
}

export function siteTo(site: Site): {
  to: "/gssp/$id" | "/sites/$id";
  params: { id: string };
} {
  if (site.types.includes("gssp")) {
    return { to: "/gssp/$id", params: { id: publicGsspId(site.id) } };
  }
  return { to: "/sites/$id", params: { id: publicSiteId(site.id) } };
}

export function pageUrl(site: Site): string {
  const { to, params } = siteTo(site);
  return to.replace("$id", params.id);
}
