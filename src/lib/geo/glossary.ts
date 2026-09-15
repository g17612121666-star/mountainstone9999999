export interface GlossaryTerm {
  id: string;
  zh: string;
  en: string;
  def_zh: string;
  def_en: string;
  site_id: string;
}

/** High-frequency field words. One plain definition + one place that shows it. */
export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "danxia",
    zh: "丹霞",
    en: "Danxia",
    def_zh: "红层砂岩/砾岩被垂直节理切开、再崩成赤壁、巷谷和方山。模式产地在丹霞山。彩色丘陵若没有这套崩塌结构，不要叫丹霞。",
    def_en: "Red-bed sandstone or conglomerate cut by vertical joints, then collapsed into cliffs, alleyways and mesas. Type locality: Danxiashan. A colourful hill without that collapse sequence is not Danxia.",
    site_id: "danxiashan",
  },
  {
    id: "karst",
    zh: "喀斯特",
    en: "Karst",
    def_zh: "碳酸盐岩被水慢慢拆掉的地貌。滴稀盐酸起泡才是碳酸盐岩。张家界石英砂岩柱不是喀斯特。",
    def_en: "Landforms made by water taking carbonate rock apart. A drop of dilute HCl fizzes on carbonate. Zhangjiajie’s quartz-sandstone pillars are not karst.",
    site_id: "shilin",
  },
  {
    id: "fenglin",
    zh: "峰林",
    en: "Fenglin",
    def_zh: "孤立的喀斯特峰立在溶蚀平原上，峰与峰之间是平地。桂林是教科书。北方河谷喀斯特不要叫峰林平原。",
    def_en: "Isolated karst peaks standing on a dissolution plain, with flat ground between them. Guilin is the textbook. Northern valley karst is not a fenglin plain.",
    site_id: "guilin-karst",
  },
  {
    id: "fengcong",
    zh: "峰丛",
    en: "Fengcong",
    def_zh: "喀斯特峰共一个基座，谷地还没切到溶蚀平原。比峰林更“连着”。",
    def_en: "Karst peaks sharing a common base; valleys have not yet reached a dissolution plain. More connected than fenglin.",
    site_id: "wulong",
  },
  {
    id: "karren",
    zh: "石芽",
    en: "Karren",
    def_zh: "灰岩表面被雨水切出的沟槽和刃脊。石林是放大了的石芽网格。",
    def_en: "Grooves and blades cut into a limestone surface by rain. A stone forest is that grid, scaled up.",
    site_id: "shilin",
  },
  {
    id: "tiankeng",
    zh: "天坑",
    en: "Tiankeng",
    def_zh: "地下河顶板大规模塌出来的坑，围岩是碳酸盐岩。玛珥湖是爆炸坑，不要叫天坑。",
    def_en: "A pit from large-scale collapse of an underground-river roof, in carbonate rock. A maar is an explosion crater — not a tiankeng.",
    site_id: "leye-fengshan",
  },
  {
    id: "joint",
    zh: "节理",
    en: "Joint",
    def_zh: "岩石裂开但两盘没有明显错动的裂缝。垂直节理把丹霞和张家界切成墙和柱。",
    def_en: "A crack that opened without obvious slip. Vertical joints cut Danxia and Zhangjiajie into walls and pillars.",
    site_id: "zhangjiajie",
  },
  {
    id: "bedding",
    zh: "层理",
    en: "Bedding",
    def_zh: "沉积时一层一层叠上去的面。能指出一层的顶和底，才算看懂。",
    def_en: "The surfaces stacked as sediment was laid down. You have read it when you can point to the top and base of one bed.",
    site_id: "jixian",
  },
  {
    id: "unconformity",
    zh: "不整合",
    en: "Unconformity",
    def_zh: "上下两套岩层之间缺了一段时间，中间是剥蚀面。产状不同就是角度不整合。嵩山把好几道摊在一座山上。",
    def_en: "A gap in time between two rock packages, with an erosion surface in between. Different dips make an angular unconformity. Songshan stacks several on one mountain.",
    site_id: "songshan",
  },
  {
    id: "planation",
    zh: "夷平面",
    en: "Planation surface",
    def_zh: "被削平的古地面，后来抬升。张家界的方山顶、五台山的台顶，先是平的，再被切开。",
    def_en: "An old surface worn flat, then lifted. The mesa tops at Zhangjiajie and the flats of Wutai were level before they were cut.",
    site_id: "zhangjiajie",
  },
  {
    id: "spheroidal",
    zh: "球状风化",
    en: "Spheroidal weathering",
    def_zh: "花岗岩沿节理向里一层层剥，留下石蛋。不是火山弹。黄山、三清山常见。",
    def_en: "Granite peeling inward along joints, leaving tors. Not volcanic bombs. Common on Huangshan and Sanqingshan.",
    site_id: "huangshan",
  },
  {
    id: "columnar",
    zh: "柱状节理",
    en: "Columnar jointing",
    def_zh: "熔岩或熔结凝灰岩冷却收缩切出的多边形柱。香港酸性岩也能长，不一定是玄武岩。",
    def_en: "Polygonal columns from cooling contraction in lava or welded tuff. Hong Kong grew them in acid rock — not a basalt franchise.",
    site_id: "hongkong",
  },
  {
    id: "gssp",
    zh: "金钉子",
    en: "GSSP / Golden Spike",
    def_zh: "全球年代地层的标准点，钉在某一层的某一厘米。煤山一剖两钉，且是独立剖面，不属于常山世界地质公园。禁止取样。",
    def_en: "A golden spike in the global time-scale, a point on one centimetre of one bed. Meishan holds two spikes on one independent section — not part of Changshan UNESCO Global Geopark. No sampling.",
    site_id: "meishan",
  },
  {
    id: "stratotype",
    zh: "层型",
    en: "Stratotype",
    def_zh: "定义某一套地层该长什么样的标准剖面。金钉子是全球界线层型；蓟县是华北中–新元古界的尺子。",
    def_en: "The section that defines what a unit should look like. A GSSP is a global boundary stratotype; Jixian is North China’s Meso–Neoproterozoic ruler.",
    site_id: "jixian",
  },
  {
    id: "redbed",
    zh: "红层",
    en: "Red beds",
    def_zh: "氧化铁染红的陆相砂砾岩。丹霞的原料，但红层不等于丹霞——还要有垂直节理和崩塌。",
    def_en: "Continental sandstone and conglomerate stained by iron oxide. The raw material of Danxia, but red beds are not Danxia until vertical joints and collapse have done their work.",
    site_id: "danxiashan",
  },
  {
    id: "dolostone",
    zh: "白云岩",
    en: "Dolostone",
    def_zh: "钙镁碳酸盐岩。滴酸比灰岩弱。房山石花洞、十渡钉在雾迷山组白云岩上。",
    def_en: "Calcium–magnesium carbonate. Fizzes less than limestone. Fangshan’s Stone Flower Cave and Shidu sit on Wumishan dolostone.",
    site_id: "fangshan",
  },
  {
    id: "stromatolite",
    zh: "叠层石",
    en: "Stromatolite",
    def_zh: "微生物一层层堆出来的纹层石。凸起朝上指示顶。蓟县雾迷山组常见。禁止凿取。",
    def_en: "Laminated stone built by microbes. Convex-up marks the top. Common in the Wumishan at Jixian. Do not chisel.",
    site_id: "jixian",
  },
  {
    id: "maar",
    zh: "玛珥湖",
    en: "Maar",
    def_zh: "地下水遇上岩浆爆炸留下的圆坑，后来成湖。湖光岩是玛珥，不是喀斯特天坑。",
    def_en: "A round crater from groundwater meeting magma, later a lake. Huguangyan is a maar, not a karst tiankeng.",
    site_id: "huguangyan",
  },
  {
    id: "caldera",
    zh: "破火山口",
    en: "Caldera",
    def_zh: "岩浆房顶塌陷形成的大坑。长白山天池是破火山口湖，不是陨石坑，也不是堰塞湖。",
    def_en: "A large pit from collapse of a magma-chamber roof. Changbaishan’s Tianchi is a caldera lake — not a meteor crater and not a lava-dammed lake.",
    site_id: "changbaishan",
  },
  {
    id: "lookdonttake",
    zh: "只看不挖",
    en: "Look, don’t take",
    def_zh: "化石、矿物、标本：看、拍、记。不敲、不挖、不带走。中国古生物化石原则上属于国家。",
    def_en: "Fossils, minerals, specimens: look, photograph, note. Do not hammer, dig, or take them home. Under Chinese law, fossils are in principle state property.",
    site_id: "chengjiang",
  },
];

export function glossaryById(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.id === id);
}

export function termsForLocale(locale: "zh" | "en"): { id: string; word: string }[] {
  return GLOSSARY.map((t) => ({ id: t.id, word: locale === "en" ? t.en : t.zh })).sort(
    (a, b) => b.word.length - a.word.length,
  );
}
