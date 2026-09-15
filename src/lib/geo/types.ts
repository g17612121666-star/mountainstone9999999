export type SiteType =
  | "world_geopark"
  | "national_geopark"
  | "national_geopark_candidate"
  | "gssp"
  | "iugs_geoheritage"
  | "urban_geosite"
  | "stratotype"
  | "landform_site";

export type SiteStatus = "named" | "candidate" | "other";

export type LandformType =
  | "karst"
  | "danxia"
  | "zhangjiajie_sandstone"
  | "granite_peak"
  | "volcano"
  | "yardang"
  | "glacier"
  | "loess"
  | "coast"
  | "fossil"
  | "stratigraphy"
  | "geo_hazard"
  | "other";

export type ContentTier = "standard" | "deep";
export type ContentStatus = "complete" | "standard" | "placeholder";
export type Ticketed = true | false | "unknown";
export type PublicPrecision = "exact" | "area_only";

export type PhenomenonType =
  | "bedding"
  | "joint"
  | "fold"
  | "unconformity"
  | "peak"
  | "cave_speleothem"
  | "lava"
  | "fossil_layer"
  | "collapse"
  | "pillar"
  | "dike"
  | "stromatolite"
  | "other";

export interface FormationStage {
  name: string;
  age: string;
  what: string;
}

export interface PhotoAsset {
  src: string;
  credit: string;
  caption: string;
}

export interface VisibleItem {
  name: string;
  how_to_recognize: string;
  collect_allowed: false;
}

export interface GsspExtra {
  stage_name: string;
  boundary_defined: string;
  index_fossil: string;
  ratified_year: number;
  section_name: string;
  visit_possible: string;
  protection_rule: string;
}

export interface Site {
  id: string;
  name: string;
  name_en: string;
  name_traditional: string;
  name_official: string;
  types: SiteType[];
  status: SiteStatus;
  province: string;
  city: string;
  coordinates: [number, number];
  landform_types: LandformType[];
  geologic_age_text: string;
  geologic_age_start_ma: number | null;
  geologic_age_end_ma: number | null;
  hook: string;
  formation_short: string;
  formation_timeline: FormationStage[];
  evolution_sequence: string;
  what_you_see_today: string;
  observation_tips: string[];
  visible_rocks_minerals_fossils: VisibleItem[];
  safety_notes: string[];
  legal_notes: string;
  related_site_ids: string[];
  theme_route_ids: string[];
  cover_image: string;
  cover_credit?: string;
  gallery: PhotoAsset[];
  official_website: string;
  sources: string[];
  content_tier: ContentTier;
  content_status: ContentStatus;
  gssp?: GsspExtra;
  corrections?: string[];
  /** 金钉子所属园。空 = 独立剖面，不要用 related_site_ids[0] 冒充。 */
  host_park_id?: string | null;
  /** 世界级一园多地：海口石山、湖光岩挂雷琼。不计入世界级计数。 */
  unesco_parent_id?: string | null;
  /** 一园多地的结构说明。 */
  park_structure?: string;
  video?: VideoClip;
}

export interface Area {
  id: string;
  site_id: string;
  name: string;
  coordinates: [number, number];
  summary: string;
}

export interface Geosite {
  id: string;
  site_id: string;
  area_id: string | null;
  name: string;
  coordinates: [number, number];
  phenomenon_type: PhenomenonType;
  look_here: string;
  photo: string;
  do_not: string[];
  public_precision: PublicPrecision;
}

export interface Route {
  id: string;
  site_id: string;
  name: string;
  duration: string;
  difficulty: string;
  distance_km: number | null;
  elevation_m: number | null;
  accessible: string;
  stop_geosite_ids: string[];
  how_to_go: string;
  notes: string;
}

export interface VideoClip {
  bvid: string;
  title: string;
  note: string;
  title_en?: string;
  note_en?: string;
}

export interface ThemeRoute {
  id: string;
  name: string;
  name_en?: string;
  thesis: string;
  thesis_en?: string;
  site_ids: string[];
  site_roles: string[];
  site_roles_en?: string[];
  task?: string;
  task_en?: string;
  video?: VideoClip;
  article?: { url: string; title: string; title_en?: string };
}

export interface VisitInfo {
  site_id: string;
  is_ticketed: Ticketed;
  price_note: string;
  opening_hours: string;
  peak_season: string;
  closed_days: string;
  reservation_required: boolean | "unknown";
  free_policy: string;
  official_ticket_url: string;
  backup_ticket_urls: { label: string; url: string; third_party: true }[];
  transport: string;
  best_season: string;
  info_updated_on: string;
}

export interface CatalogBundle {
  generated_on: string;
  sources_cutoff: string;
  sites: Site[];
  areas: Area[];
  geosites: Geosite[];
  routes: Route[];
  theme_routes: ThemeRoute[];
  visits: VisitInfo[];
}

export const SITE_TYPE_LABEL: Record<SiteType, string> = {
  world_geopark: "世界级",
  national_geopark: "国家级",
  national_geopark_candidate: "资格",
  gssp: "金钉子",
  iugs_geoheritage: "IUGS遗产地",
  urban_geosite: "城市地质",
  stratotype: "标准剖面",
  landform_site: "地貌点",
};

export const LANDFORM_LABEL: Record<LandformType, string> = {
  karst: "喀斯特",
  danxia: "丹霞",
  zhangjiajie_sandstone: "砂岩峰林",
  granite_peak: "花岗岩峰林",
  volcano: "火山",
  yardang: "雅丹",
  glacier: "冰川",
  loess: "黄土",
  coast: "海岸岛屿",
  fossil: "化石产地",
  stratigraphy: "地层剖面",
  geo_hazard: "地质灾害遗迹",
  other: "其他",
};

export const PHENOMENON_LABEL: Record<PhenomenonType, string> = {
  bedding: "层理",
  joint: "节理",
  fold: "褶皱",
  unconformity: "不整合",
  peak: "峰丛峰林",
  cave_speleothem: "洞穴与化学沉积",
  lava: "熔岩",
  fossil_layer: "化石层",
  collapse: "崩塌",
  pillar: "石柱",
  dike: "岩脉",
  stromatolite: "叠层石",
  other: "其他",
};

export const PROVINCES = [
  "北京",
  "天津",
  "河北",
  "山西",
  "内蒙古",
  "辽宁",
  "吉林",
  "黑龙江",
  "上海",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "广西",
  "海南",
  "重庆",
  "四川",
  "贵州",
  "云南",
  "西藏",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "新疆",
  "香港",
] as const;

export type Province = (typeof PROVINCES)[number];
