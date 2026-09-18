import type { LandformType, Site } from "./types";

const GENERIC_BITS = [
  "溶洞、冰川、火山口按园区规定",
  "注意落石与陡崖，不要翻越护栏",
  "暴雨后溪谷和溶洞不要进入",
  "雨天岩面滑，勿翻护栏",
  "落石区沿步道走",
];

export function isGenericSafety(notes: string[]): boolean {
  if (!notes.length) return true;
  return notes.every((n) => GENERIC_BITS.some((g) => n.includes(g) || g.includes(n)));
}

const BY_LANDFORM: Record<LandformType, string[]> = {
  karst: [
    "溶洞听现场指挥，不要离队。",
    "暴雨后不进溪谷和未开发洞口。",
    "不敲、不摸钟乳石。",
  ],
  danxia: ["崖下有落石，沿步道走。", "不要攀无保护岩壁。", "雨天红层砂岩滑。"],
  zhangjiajie_sandstone: ["峰林区有落石，勿翻护栏。", "雨天砂岩滑。", "不要攀无保护岩柱。"],
  granite_peak: ["花岗岩节理面易落石。", "不要攀无保护岩壁。", "雨天岩面滑。"],
  volcano: ["火口墙和渣锥陡坡碎屑多，沿步道走。", "有地热、热泉的地方防烫伤。", "不要翻越火口护栏。"],
  yardang: ["风沙天能见度低，容易迷路。", "夏季地面烫，带水。", "不要走近陡立土柱根部。"],
  glacier: ["禁止走上未开放的冰舌。", "注意冰裂、冰崩和高原反应。", "强紫外，戴镜。"],
  loess: ["黄土陡坎会塌，不要靠近壁根。", "雨后泥泞，小心失足。"],
  coast: ["先看潮汐表再下岸。", "潮间带涨潮会断退路。", "风暴潮和台风天不要近水。"],
  fossil: ["保护廊内不翻越。", "不刮样、不采集。化石层不对公众提供可挖点。"],
  stratigraphy: ["剖壁勿攀、勿取样。", "公路边剖面注意车辆。", "栈道潮湿防滑。"],
  geo_hazard: ["滑坡、崩塌遗迹本身就不稳定，只走开放步道。", "雨后不要靠近陡壁。"],
  other: ["沿开放步道走，不要翻护栏。", "雨天地面滑。"],
};

const SAND_ISLAND = [
  "崇明是河口沙岛。看潮汐和天气，风暴潮天不要上滩。",
  "潮滩、芦苇荡和观鸟区按季节封闭，不要拦路走进湿地。",
  "软泥会陷脚。没有溶洞、冰川或火山口。",
];

const URBAN = [
  "市政步道和景区道路，注意车辆。",
  "不要进入未开放的工地、校园限制区或私人院落。",
  "林间土阶雨后滑。",
];

const COUNTRY_PARK_COAST = [
  "先看潮汐表再下岸。柱状节理多在潮间带，涨潮会断退路。",
  "浪切台湿滑，不要攀柱、不要下崖。",
  "只走郊野公园开放步道。不要敲挖带走标本。",
];

export function safetyFor(site: Site): string[] {
  if (site.id === "chongming") return SAND_ISLAND;
  if (site.id === "hongkong") return COUNTRY_PARK_COAST;
  if (site.types.includes("urban_geosite")) return URBAN;
  if (site.types.includes("gssp")) return BY_LANDFORM.stratigraphy;
  const primary = site.landform_types[0] ?? "other";
  const extra = site.landform_types.slice(1);
  const notes = [...(BY_LANDFORM[primary] ?? BY_LANDFORM.other)];
  if (extra.includes("fossil") && primary !== "fossil") {
    notes.push("化石只看不挖。");
  }
  return notes;
}

export function isRealPhoto(path: string | undefined): boolean {
  return !!path && /\.(jpe?g|png|webp)$/i.test(path);
}

const MISLEADING = [
  "地貌类型示意",
  "凤凰古城",
  "同县山地对照",
  "额尔齐斯河上游河谷",
  "终南山山林",
  "馆藏标本",
  "标本，非野外",
  "非野外露头",
  "Mount Pan",
  "盘山标本",
  "示意图",
  "范围示意图",
  "磁性地层",
  "地层对比",
  "地质图",
  "柱状图",
];

export function isOwnCover(site: {
  id: string;
  cover_image?: string;
  cover_credit?: string;
}): boolean {
  const src = site.cover_image || "";
  if (!isRealPhoto(src)) return false;
  if (!src.includes(`/covers/${site.id}.`)) return false;
  const credit = site.cover_credit || "";
  return !MISLEADING.some((bit) => credit.includes(bit));
}

export const GENERIC_DO_NOT = new Set([
  "不攀无保护岩壁",
  "不敲、不刻",
  "不采集岩石、矿物或化石",
]);
