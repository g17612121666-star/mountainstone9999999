import type { Geosite, PhenomenonType } from "./types";

const HAND: Record<string, string> = {
  "jx-wumishan":
    "站在开放剖面或展板前看雾迷山组。找叠层石：纹层像切开的卷心菜，凸起朝上。看懂：能指出一层纹层的顶，而不是把白云岩当成可凿的观赏石。只看到园区/步道，禁止取样。",
  "jx-changcheng":
    "站在剖面下部。砂岩、页岩互层是长城系裂陷初期的海侵。看懂：能从下往上说出碎屑岩先于雾迷山组白云岩。公路边注意车辆。",
  "jx-overview":
    "把组名当目录走一遍：长城系 → 蓟县系 → 青白口系。看懂：这是华北中–新元古界的尺子，不是喀斯特名山，也不是盘山的那座花岗岩山。",
};

const PH: Record<PhenomenonType, string> = {
  bedding: "看懂的标志：能指出一层的顶和底，产状和上下是不是同一套。",
  joint: "看懂的标志：能用两只手比出两组节理的方向，并说出它们如何把岩体切成块。",
  fold: "看懂的标志：能指出岩层从平变弯的枢纽，而不是把弯曲的山脊都叫褶皱。",
  unconformity: "看懂的标志：上下两套岩层产状不同，中间是剥蚀面，不是一条普通层理。",
  peak: "看懂的标志：能说出柱/峰的边界是节理、溶沟还是崩塌面，而不是只拍一张轮廓。",
  cave_speleothem: "看懂的标志：认出石钟乳是水里的钙再长出来的。手不碰。溶洞听现场指挥。",
  lava: "看懂的标志：能把火山岩和沉积层理分开。玄武质熔岩才常见气孔、绳状或渣状；酸性凝灰岩、流纹岩要认浅色、斑晶或流纹。",
  fossil_layer: "看懂的标志：化石是一层，不是纪念品。只看展陈和保护廊。",
  collapse: "看懂的标志：能指出滑面或崩积块石的棱角，而不是把乱石堆当成熔岩。",
  pillar: "看懂的标志：柱的截面形状、软硬互层出檐，能和邻区另一种柱分开。",
  dike: "看懂的标志：脉切穿围岩，两壁大致平行，矿物粒度与围岩不同。",
  stromatolite: "看懂的标志：纹层凸向指示顶。叠层石是微生物纹层，禁止凿取。",
  other: "看懂的标志：先认岩石，再认这个点要证明的那一件事。",
};

export const LOOK_EN: Record<PhenomenonType, string> = {
  bedding:
    "Stand on the open path. Point to the top and base of one bed. You have read it when you can say whether the beds above and below belong to the same package.",
  joint:
    "Stand on the open path. Use both hands to show two joint sets and how they cut the rock into blocks.",
  fold: "Stand on the open path. Point to the hinge where beds bend — a curved ridge is not automatically a fold.",
  unconformity:
    "Stand at the marked section. Beds above and below do not share a dip; the surface between them is erosion, not an ordinary bedding plane. No sampling.",
  peak: "From an open viewpoint, name the pillar or peak boundary: joint, dissolution groove, or collapse face — not just a silhouette.",
  cave_speleothem:
    "In the cave, recognise a stalactite as calcium grown back out of water. Do not touch. Follow the on-site brief. No sampling.",
  lava: "On the open path, separate volcanic rock from sedimentary bedding. Vesicles, ropey or scoriaceous textures belong to basaltic lava; pale colour, phenocrysts or flow banding mark acidic tuff and rhyolite.",
  fossil_layer:
    "At the gallery or protected walkway: a fossil is a bed, not a souvenir. Look, photograph, note. Do not hammer or collect.",
  collapse: "Point to a slide surface or angular talus. A rubble pile is not lava. Stay on the open path.",
  pillar:
    "Read the pillar’s cross-section and any hard–soft ledges, and separate it from a neighbouring pillar of a different rock.",
  dike: "The sheet cuts the country rock; walls are roughly parallel; grain size differs.",
  stromatolite:
    "Laminae convex-up mark the top. Stromatolites are microbial mats, not ornamental stone. Do not chisel.",
  other:
    "First name the rock, then the one process this stop is here to prove.",
};

/** Strip template locate/ticket sentences so the page can print that note once. */
export function stripLocatePhrase(text: string): string {
  return (text || "")
    .replace(/站在开放步道或观景台看「[^」]+」。?/g, "")
    .replace(/定位只到园区或观景台，不提供可取样坐标。?/g, "")
    .replace(/定位到园区\s*\/\s*观景台，不提供可取样坐标。?/g, "")
    .replace(/Located to the park or viewpoint — no sampling coordinates\.?/gi, "")
    .replace(/Located to the park or viewpoint\.?/gi, "")
    .replace(/票价以官方当日为准，本站不售票。?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function expandLookHere(g: Geosite): string {
  if (HAND[g.id]) return HAND[g.id];
  const text = stripLocatePhrase(g.look_here || "");
  const extra = PH[g.phenomenon_type] ?? PH.other;
  if (g.site_id === "sheshan") return text || extra;
  if (/浅色|流纹|凝灰|碱性|斑晶/.test(text) && g.phenomenon_type === "lava") {
    return text;
  }
  if (text.length >= 80) return text;
  if (text.length >= 40) {
    return text.endsWith("。") ? `${text}${extra}` : `${text}。${extra}`;
  }
  if (text) {
    const lead = text.endsWith("。") ? text : `${text}。`;
    return `${lead}${extra}`;
  }
  return extra;
}

