import { sites } from "./catalog";
import { publicGsspId, publicSiteId } from "./href";
import { shortName } from "./labels";
import type { Site } from "./types";

export function publicPathFor(site: Site): { href: string; slug: string } {
  if (site.types.includes("gssp")) {
    const slug = publicGsspId(site.id);
    return { href: `/gssp/${slug}`, slug };
  }
  const slug = publicSiteId(site.id);
  return { href: `/sites/${slug}`, slug };
}

/** Rank catalogue sites against a mistyped slug or name fragment. */
export function suggestSitesBySlug(raw: string, limit = 6): Site[] {
  const q = (raw || "").trim().toLowerCase();
  if (!q) return [];
  const scored: { s: Site; n: number }[] = [];
  for (const s of sites) {
    const { slug } = publicPathFor(s);
    const name = shortName(s.name).toLowerCase();
    const en = (s.name_en || "").toLowerCase();
    let n = 0;
    if (slug === q || s.id === q) n = 100;
    else if (slug.startsWith(q) || s.id.startsWith(q) || name.startsWith(q)) n = 80;
    else if (slug.includes(q) || s.id.includes(q) || name.includes(q) || en.includes(q)) n = 50;
    if (n) scored.push({ s, n });
  }
  scored.sort((a, b) => b.n - a.n);
  return scored.slice(0, limit).map((x) => x.s);
}

export const TOOL_PATHS = new Set([
  "catalog",
  "about",
  "gssp",
  "routes",
  "card",
  "nearby",
  "compare",
  "glossary",
  "browse",
  "offline",
  "sites",
  "en",
]);
