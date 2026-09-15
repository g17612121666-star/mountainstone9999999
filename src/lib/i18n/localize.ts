import type { Area, Geosite, GsspExtra, Route, Site, ThemeRoute, VisitInfo } from "@/lib/geo/types";
import { LOOK_EN } from "@/lib/geo/look";
import enBundle from "../../../data/en.json";
import type { Locale } from "./locale";

const CJK = /[\u4e00-\u9fff]/;

type EnSite = Partial<
  Pick<
    Site,
    | "city"
    | "geologic_age_text"
    | "hook"
    | "formation_short"
    | "formation_timeline"
    | "evolution_sequence"
    | "what_you_see_today"
    | "observation_tips"
    | "corrections"
    | "visible_rocks_minerals_fossils"
    | "safety_notes"
    | "legal_notes"
    | "park_structure"
    | "gssp"
  >
>;

type EnBundle = {
  sites?: Record<string, EnSite>;
  geosites?: Record<string, { name?: string; look_here?: string }>;
  visits?: Record<string, Partial<VisitInfo>>;
  routes?: Record<string, Partial<Route>>;
  areas?: Record<string, { name?: string; summary?: string }>;
};

const en = enBundle as EnBundle;

const GENERIC_SOURCE_EN =
  "Compiled from NFGA UNESCO Global Geopark lists, circulated national geopark lists, ICS GSSP lists, and IUGS geoheritage lists. Cutoff 2026-04.";

function hasCjk(v: unknown): boolean {
  if (typeof v === "string") return CJK.test(v);
  if (Array.isArray(v)) return v.some(hasCjk);
  if (v && typeof v === "object") return Object.values(v as Record<string, unknown>).some(hasCjk);
  return false;
}

function cleanStr(s: string, fallback: string): string {
  const t = (s || "").trim();
  if (!t) return fallback;
  return hasCjk(t) ? fallback : t;
}

function cleanGssp(g: GsspExtra, overlay?: Partial<GsspExtra>): GsspExtra {
  const m = { ...g, ...overlay };
  return {
    stage_name: cleanStr(m.stage_name, overlay?.stage_name || "See the ICS stage name"),
    boundary_defined: cleanStr(
      m.boundary_defined,
      overlay?.boundary_defined || "The boundary is the bed marked on the protected section.",
    ),
    index_fossil: cleanStr(m.index_fossil, overlay?.index_fossil || "Index fossil as listed by ICS."),
    ratified_year: m.ratified_year,
    section_name: cleanStr(m.section_name, overlay?.section_name || "Protected section"),
    visit_possible: cleanStr(
      m.visit_possible,
      overlay?.visit_possible || "Visit along the official walkway. No sampling.",
    ),
    protection_rule: cleanStr(
      m.protection_rule,
      overlay?.protection_rule || "No sampling. Look, photograph, note.",
    ),
  };
}

export function localizeSite(site: Site, locale: Locale): Site {
  if (locale !== "en") return site;
  const o = en.sites?.[site.id];
  const merged: Site = o ? { ...site, ...o, id: site.id } : { ...site };
  merged.city = cleanStr(merged.city || "", o?.city || "");
  merged.geologic_age_text = cleanStr(merged.geologic_age_text || "", o?.geologic_age_text || "");
  merged.hook = cleanStr(merged.hook, site.name_en || site.id);
  merged.formation_short = cleanStr(
    merged.formation_short,
    `${site.name_en || site.id} is a geosite. Name the rock first. Look, don’t take.`,
  );
  merged.evolution_sequence = cleanStr(
    merged.evolution_sequence,
    "Rock → structure → surface process. Read the outcrop; do not collect.",
  );
  merged.what_you_see_today = cleanStr(
    merged.what_you_see_today,
    "Confirm the listed rock and the one process this stop is here to prove.",
  );
  merged.observation_tips = (merged.observation_tips || [])
    .map((t) => cleanStr(t, ""))
    .filter(Boolean);
  if (!merged.observation_tips.length) {
    merged.observation_tips = [
      "Name the rock before the view.",
      "One process per stop.",
      "Look, photograph, note. Do not collect.",
    ];
  }
  merged.safety_notes = (merged.safety_notes || [])
    .map((n) => cleanStr(n, ""))
    .filter(Boolean);
  if (!merged.safety_notes.length) {
    merged.safety_notes = ["Stay on open paths. Do not climb fences."];
  }
  merged.legal_notes = cleanStr(
    merged.legal_notes,
    "Protected geoheritage. Look, don’t take. This guide does not sell tickets.",
  );
  merged.formation_timeline = (merged.formation_timeline || [])
    .map((st) => ({
      name: cleanStr(st.name, ""),
      age: cleanStr(st.age, ""),
      what: cleanStr(st.what, ""),
    }))
    .filter((st) => st.name && st.what && !/^Stage \d+$/i.test(st.name));
  if (!merged.formation_timeline.length && o?.formation_timeline?.length) {
    merged.formation_timeline = o.formation_timeline
      .map((st) => ({
        name: cleanStr(st.name, ""),
        age: cleanStr(st.age, ""),
        what: cleanStr(st.what, ""),
      }))
      .filter((st) => st.name && st.what);
  }
  const overlayRocks = merged.visible_rocks_minerals_fossils || [];
  const rocksWeak =
    !overlayRocks.length || overlayRocks.every((r) => /^Outcrop rock/i.test(r.name));
  const rockSrc = rocksWeak ? site.visible_rocks_minerals_fossils || [] : overlayRocks;
  merged.visible_rocks_minerals_fossils = rockSrc.map((r, i) => ({
    name: (() => {
      const n = cleanStr(r.name, `Rock ${i + 1}`);
      return /^Outcrop rock$/i.test(n) ? `Rock ${i + 1}` : n;
    })(),
    how_to_recognize: cleanStr(
      r.how_to_recognize,
      "Field ID: texture and structure. Look, do not collect.",
    ),
    collect_allowed: false as const,
  }));
  if (merged.gssp) {
    merged.gssp = cleanGssp(merged.gssp, o?.gssp);
  }
  if (merged.corrections) {
    merged.corrections = merged.corrections.map((c) => cleanStr(c, "")).filter(Boolean);
  }
  if (merged.park_structure) {
    merged.park_structure = cleanStr(merged.park_structure, "");
    if (!merged.park_structure) delete merged.park_structure;
  }
  merged.sources = (merged.sources || [])
    .map((s) => cleanStr(s, ""))
    .filter(Boolean);
  if (!merged.sources.length) merged.sources = [GENERIC_SOURCE_EN];
  return merged;
}

export function localizeGeosite(g: Geosite, locale: Locale): Geosite {
  if (locale !== "en") return g;
  const o = en.geosites?.[g.id];
  const name = o?.name || (hasCjk(g.name) ? "Field stop" : g.name);
  const look =
    o?.look_here ||
    (hasCjk(g.look_here) ? LOOK_EN[g.phenomenon_type] || LOOK_EN.other : g.look_here);
  const do_not = (g.do_not || []).map((d) => cleanStr(d, "")).filter(Boolean);
  return { ...g, name, look_here: look, do_not };
}

export function localizeVisit(visit: VisitInfo, locale: Locale): VisitInfo {
  if (locale !== "en") return visit;
  const o = en.visits?.[visit.site_id];
  const fallback = "Confirm on the official listing on the day.";
  const merged = o ? { ...visit, ...o, site_id: visit.site_id } : { ...visit };
  merged.price_note = cleanStr(merged.price_note, fallback);
  merged.opening_hours = cleanStr(merged.opening_hours, fallback);
  merged.peak_season = cleanStr(merged.peak_season, "School holidays and public holidays.");
  merged.closed_days = cleanStr(merged.closed_days, fallback);
  merged.free_policy = cleanStr(
    merged.free_policy,
    "Concessions follow the official listing — check again before you go.",
  );
  merged.transport = cleanStr(
    merged.transport,
    "Reach the park by local transit or road. Timetables follow local notices.",
  );
  merged.best_season = cleanStr(
    merged.best_season,
    "Low-angle light in spring and autumn makes bedding easier to read.",
  );
  merged.backup_ticket_urls = (merged.backup_ticket_urls || []).map((b) => ({
    ...b,
    label: cleanStr(b.label, "Official listing"),
  }));
  return merged;
}

export function localizeRoute(route: Route, locale: Locale): Route {
  if (locale !== "en") return route;
  const o = en.routes?.[route.id];
  const merged = o ? { ...route, ...o, id: route.id } : { ...route };
  merged.name = cleanStr(merged.name, "Field walk");
  merged.duration = cleanStr(merged.duration, "Half a day to a day");
  merged.difficulty = cleanStr(merged.difficulty, "Moderate; stay on park paths");
  merged.how_to_go = cleanStr(
    merged.how_to_go,
    "Collect the official map at the visitor centre. Stay on open trails.",
  );
  merged.notes = cleanStr(
    merged.notes,
    "This is a rock-reading walk, not a scenery checklist.",
  );
  merged.accessible = cleanStr(
    merged.accessible,
    "Viewpoints usually have paths; some sections need steps.",
  );
  return merged;
}

export function localizeArea(area: Area, locale: Locale): Area {
  if (locale !== "en") return area;
  const o = en.areas?.[area.id];
  return {
    ...area,
    name: cleanStr(o?.name || area.name, "Park unit"),
    summary: cleanStr(o?.summary || area.summary, "A unit of this park. Read the rock; do not collect."),
  };
}

export function themeName(tr: ThemeRoute, locale: Locale): string {
  return locale === "en" ? tr.name_en || tr.name : tr.name;
}

export function themeThesis(tr: ThemeRoute, locale: Locale): string {
  return locale === "en" ? tr.thesis_en || tr.thesis : tr.thesis;
}

export function themeRole(tr: ThemeRoute, i: number, locale: Locale): string {
  if (locale === "en" && tr.site_roles_en?.[i]) return tr.site_roles_en[i];
  return tr.site_roles[i] ?? "";
}

export function themeTask(tr: ThemeRoute, locale: Locale): string {
  return locale === "en" ? tr.task_en || tr.task || "" : tr.task || "";
}
