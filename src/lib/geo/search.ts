import { getVisit } from "./catalog";
import { displayName, landformText, shortName } from "./labels";
import type { MapFilters } from "./store";
import type { Site } from "./types";

export function haystack(site: Site): string {
  return [
    site.id,
    site.name,
    site.name_en,
    site.name_official,
    shortName(site.name),
    site.province,
    site.city,
    site.hook,
    site.geologic_age_text,
    landformText(site.landform_types),
    site.gssp?.stage_name ?? "",
    site.gssp?.index_fossil ?? "",
    site.gssp?.boundary_defined ?? "",
    ...site.visible_rocks_minerals_fossils.map((v) => v.name),
    ...site.landform_types,
    ...site.types,
    site.formation_short,
  ]
    .join(" ")
    .toLowerCase();
}

export function siteMatches(site: Site, f: MapFilters, opts?: { includeQuery?: boolean }): boolean {
  if (opts?.includeQuery !== false && f.query.trim()) {
    const q = f.query.trim().toLowerCase();
    if (!haystack(site).includes(q)) return false;
  }
  if (f.types.length && !f.types.some((t) => site.types.includes(t))) return false;
  if (f.landforms.length && !f.landforms.some((t) => site.landform_types.includes(t)))
    return false;
  if (f.province && site.province !== f.province) return false;
  if (f.ticket !== "all") {
    const v = getVisit(site.id);
    const paid = v?.is_ticketed === true;
    const free = v?.is_ticketed === false;
    if (f.ticket === "yes" && !paid) return false;
    if (f.ticket === "no" && !free) return false;
  }
  if (f.ageOn) {
    const a = site.geologic_age_start_ma;
    const b = site.geologic_age_end_ma;
    if (a == null || b == null) return false;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (hi < f.ageStart || lo > f.ageEnd) return false;
  }
  return true;
}

export function filterSites(all: Site[], f: MapFilters): Site[] {
  return all.filter((s) => siteMatches(s, f, { includeQuery: false }));
}

export function suggestSites(all: Site[], q: string, limit = 8): Site[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const scored: { s: Site; n: number }[] = [];
  for (const s of all) {
    const name = shortName(s.name).toLowerCase();
    const hay = haystack(s);
    if (!hay.includes(needle)) continue;
    let n = 0;
    if (name === needle || s.name.toLowerCase() === needle) n = 100;
    else if (name.startsWith(needle) || s.name.toLowerCase().startsWith(needle)) n = 80;
    else if (name.includes(needle) || s.name.toLowerCase().includes(needle)) {
      const ix = Math.min(
        ...[name, s.name.toLowerCase()]
          .map((x) => x.indexOf(needle))
          .filter((i) => i >= 0),
      );
      n = 70 - Math.min(ix, 25);
      if (s.types.includes("world_geopark")) n += 8;
      if (s.content_status !== "placeholder") n += 6;
    } else if ((s.gssp?.stage_name ?? "").toLowerCase().includes(needle)) n = 55;
    else n = 30;
    scored.push({ s, n });
  }
  scored.sort((a, b) => b.n - a.n);
  return scored.slice(0, limit).map((x) => x.s);
}

export { displayName };
