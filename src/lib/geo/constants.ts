import type { LandformType, SiteType } from "./types";

export const APP_NAME = "山石志";
export const APP_TAGLINE = "随身地质向导";
export const DATA_CUTOFF = "2026-04";
export const INFO_UPDATED_ON = "2026-04-20";

export const MARKER_COLOR: Record<string, string> = {
  world_geopark: "#3d5c52",
  national_geopark: "#6b5344",
  national_geopark_candidate: "#9a8b78",
  gssp: "#7a3b32",
  iugs_geoheritage: "#4a5c6a",
  urban_geosite: "#4a6080",
  stratotype: "#5c4a38",
  landform_site: "#7a6e5c",
  geosite: "#8a7a64",
};

export const ROCK_GUESS: Record<LandformType, string> = {
  karst: "碳酸盐岩（灰岩、白云岩）",
  danxia: "陆相红层（砂岩、砾岩）",
  zhangjiajie_sandstone: "石英砂岩",
  granite_peak: "花岗岩及酸性侵入岩",
  volcano: "玄武岩、安山岩或流纹质火山岩",
  yardang: "河湖相砂泥岩",
  glacier: "变质岩或花岗岩基底上的冰蚀地貌",
  loess: "风积黄土",
  coast: "火山岩、花岗岩或沉积岩海岸",
  fossil: "含化石沉积岩",
  stratigraphy: "多时代沉积地层",
  geo_hazard: "崩塌、滑坡或地震扰动岩体",
  other: "区域代表性岩石",
};

export const FORCE_GUESS: Record<LandformType, string> = {
  karst: "流水溶蚀与崩塌",
  danxia: "垂直节理控制下的风化剥落与崩塌",
  zhangjiajie_sandstone: "流水下切、风化与重力崩塌",
  granite_peak: "球状风化与崩塌",
  volcano: "喷发、冷凝收缩与后期流水",
  yardang: "定向风蚀",
  glacier: "冰蚀与冻融",
  loess: "风力堆积与流水切割",
  coast: "波浪、潮汐与差异侵蚀",
  fossil: "差异风化把含化石层暴露出来",
  stratigraphy: "抬升与剥蚀把时间切面露出来",
  geo_hazard: "重力与地震",
  other: "风化剥蚀与流水",
};

export const LEVEL_FILTERS: { id: SiteType | "ticketed" | "free"; label: string }[] = [
  { id: "world_geopark", label: "世界级" },
  { id: "national_geopark", label: "国家级" },
  { id: "national_geopark_candidate", label: "资格" },
  { id: "gssp", label: "金钉子" },
  { id: "urban_geosite", label: "城市地质" },
  { id: "iugs_geoheritage", label: "IUGS" },
];
