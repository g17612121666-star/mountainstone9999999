import { FORCE_GUESS } from "./constants";
import type { LandformType, Site } from "./types";

/** Generic process for a landform class. Not a measured section at one park. */
const FORCE_EN: Record<LandformType, string> = {
  karst: "Dissolution by water, then collapse",
  danxia: "Red beds + vertical joints + collapse",
  zhangjiajie_sandstone: "Quartz sandstone cut by water and gravity — not Danxia",
  granite_peak: "Joints, then spheroidal weathering",
  volcano: "Eruption, cooling, then later water",
  yardang: "Wind carving lake and river beds",
  glacier: "Ice erosion and freeze–thaw",
  loess: "Wind-blown dust, then streams cut it",
  coast: "Waves and uneven erosion",
  fossil: "Weathering exposes a fossil-bearing bed",
  stratigraphy: "Uplift and erosion open a time section",
  geo_hazard: "Gravity, and sometimes an earthquake",
  other: "Weathering and running water",
};

export function processLine(site: Site, locale: "zh" | "en"): string | null {
  const lf = site.landform_types.find((t) => t !== "other");
  if (!lf) return null;
  return locale === "en" ? FORCE_EN[lf] : FORCE_GUESS[lf];
}
