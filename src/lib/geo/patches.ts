import type { Geosite, Route, Site } from "./types";
import { FOSSIL_LAW_HK } from "./labels";

/** 金钉子所属园。null = 独立剖面。禁止用 related 第一项冒充。 */
export const HOST_PARK: Record<string, string | null> = {
  meishan: null,
  "gssp-huangnitang": "changshan",
  "gssp-jiangshan": null,
  "gssp-huanghuachang": null,
  "gssp-wangjiawan": null,
  "gssp-paibi": "xiangxi",
  "gssp-guzhang": "xiangxi",
  "gssp-penglaitan": null,
  "gssp-pengchong": null,
  "gssp-wuliu": null,
};

/** 世界级一园多地。子点不算进 51 处计数。 */
export const UNESCO_PARENT: Record<string, string> = {
  "haikou-volcano": "leiqiong",
  huguangyan: "leiqiong",
};

export const SITE_PUBLIC_ID: Record<string, string> = {
  animaging: "anyemaqen",
};

export const SITE_ALIASES: Record<string, string> = {
  anyemaqen: "animaging",
  weizhou: "weizhoudao",
  haikou: "haikou-volcano",
};

/** Short public URLs that 301 to the live slug. Do not include public-id aliases. */
export const SITE_REDIRECTS: Record<string, string> = {
  weizhou: "weizhoudao",
  haikou: "haikou-volcano",
};

const rock = (name: string, how: string) =>
  ({ name, how_to_recognize: how, collect_allowed: false as const });

function geo(
  id: string,
  site_id: string,
  name: string,
  lon: number,
  lat: number,
  phenomenon_type: Geosite["phenomenon_type"],
  look_here: string,
): Geosite {
  return {
    id,
    site_id,
    area_id: null,
    name,
    coordinates: [lon, lat],
    phenomenon_type,
    look_here,
    photo: "",
    do_not: [],
    public_precision: "area_only",
  };
}

function walk(
  id: string,
  site_id: string,
  name: string,
  duration: string,
  difficulty: string,
  stops: string[],
  how: string,
  notes: string,
  distance_km: number | null = null,
  elevation_m: number | null = null,
): Route {
  return {
    id,
    site_id,
    name,
    duration,
    difficulty,
    distance_km,
    elevation_m,
    accessible: "以园区步道为准。",
    stop_geosite_ids: stops,
    how_to_go: how,
    notes,
  };
}

/** Last-write overlay after standard + deep. */
export const fieldPatches: Record<string, Partial<Site>> = {
  meishan: {
    host_park_id: null,
    related_site_ids: ["changshan", "gssp-penglaitan", "jixian"],
  },
  zigong: {
    geologic_age_text: "中侏罗世",
    types: ["world_geopark", "national_geopark"],
    corrections: ["自贡是世界地质公园，不在 IUGS 首批 100 处里。标签已去掉。"],
  },
  huangshan: { geologic_age_text: "早白垩世" },
  sanqingshan: { geologic_age_text: "早白垩世" },
  changbaishan: {
    geologic_age_text: "新生代",
    coordinates: [128.06, 42.04],
    corrections: ["原来的点落在天池南侧、朝鲜境内。现改到中国一侧北坡附近。景区大门坐标仍待核实。"],
  },
  taishan: { geologic_age_text: "太古宙–寒武纪" },
  chongming: {
    geologic_age_text: "全新世",
    safety_notes: [
      "崇明是河口沙岛。看潮汐和天气，风暴潮天不要上滩。",
      "潮滩、芦苇荡和观鸟区按季节封闭，不要拦路走进湿地。",
      "软泥会陷脚。没有溶洞、冰川或火山口。",
    ],
    cover_image: "/covers/chongming.jpg",
    cover_credit: "Gruschke, CC BY 3.0, Wikimedia Commons",
    gallery: [
      {
        src: "/covers/chongming.jpg",
        credit: "Gruschke, CC BY 3.0, Wikimedia Commons",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  "gssp-huangnitang": { host_park_id: "changshan" },
  leiqiong: {
    park_structure:
      "雷琼是一座世界地质公园、两岸两片。北岸在雷州半岛：湛江湖光岩玛珥湖是定义性地貌。南岸在琼北：海口石山火山群（马鞍岭、雷虎岭等渣锥）是同一裂谷火山的海南一侧。涠洲岛是海上的对照点。不是三个无关的园，也不要说「海南没有世界地质公园」。",
    related_site_ids: ["huguangyan", "haikou-volcano", "weizhoudao"],
    corrections: [
      "湖光岩是玛珥湖（水下–近水面爆炸坑），不是喀斯特天坑。",
      "海口石山是雷琼世界地质公园的琼北园区，不是一座单独的世界级公园。",
    ],
  },
  "haikou-volcano": {
    unesco_parent_id: "leiqiong",
    related_site_ids: ["leiqiong", "huguangyan", "weizhoudao", "wudalianchi"],
    park_structure:
      "本点是雷琼世界地质公园的琼北园区。世界级徽章挂在雷琼名下；海口石山同时是国家地质公园。",
    corrections: ["海南这一侧属于雷琼世界地质公园，不是「海南没有世界级」。"],
  },
  huguangyan: {
    unesco_parent_id: "leiqiong",
    content_status: "standard",
    content_tier: "standard",
    hook: "一圆湖。岸是炸开的火山灰，不是溶出来的坑。",
    formation_short:
      "岩石：第四纪玄武岩与玛珥爆发的火山碎屑。构造：雷琼裂谷北岸。外力：地下水与岩浆相遇爆炸，留下近圆形的湖光岩。与海口石山是同一世界地质公园的两岸。",
    what_you_see_today:
      "湖光岩玛珥湖。岸壁是碎屑，不是灰岩。雷琼世界地质公园的雷州半岛一侧从这里读起。",
    observation_tips: [
      "玛珥湖不是天坑：没有石灰岩溶蚀，是爆炸。",
      "岸壁分层是一次次碎屑降落。",
      "与海口石山的渣锥对照：同一火山区，两种喷发。",
    ],
    visible_rocks_minerals_fossils: [
      rock("玄武岩", "暗色，气孔。台地上常见。"),
      rock("火山碎屑", "湖岸陡壁里的灰、渣、角砾。只看。"),
    ],
    related_site_ids: ["leiqiong", "haikou-volcano", "weizhoudao"],
    park_structure: "湖光岩是雷琼世界地质公园雷州半岛一侧的核心点。",
    corrections: ["湖光岩是玛珥湖，不是喀斯特天坑。"],
    sources: ["联合国教科文组织世界地质公园名录（截至 2026-04）"],
  },
  yigong: {
    content_status: "standard",
    content_tier: "standard",
    hook: "2000 年的冰崩–滑坡把易贡藏布堵成湖。看的是一次还没走远的地质灾害。",
    formation_short:
      "岩石：喜马拉雅南坡的变质岩、花岗岩与第四纪冰碛。构造：青藏高原东构造结。外力：冰川、冰崩、高速滑坡堵江。易贡湖是堰塞，不是火山口湖。",
    what_you_see_today: "滑坡堆积、堰塞湖岸和上游的海洋性冰川。灾害点按开放情况参观。",
    observation_tips: [
      "堰塞湖会变。水位和是否开放以现场为准。",
      "滑坡体不是火山渣。",
      "与海螺沟对照：都是海洋性冰川，这里多了一次堵江。",
    ],
    visible_rocks_minerals_fossils: [
      rock("冰碛与滑坡堆积", "杂乱、棱角状块石。不是层状熔岩。"),
    ],
    related_site_ids: ["hailuogou", "cuihuashan", "siguniang"],
    sources: ["公开地质灾害与地质公园资料综合改写"],
  },
  zhada: {
    content_status: "standard",
    content_tier: "standard",
    hook: "札达土林是古湖相被风和流水切出的柱。高原上的河湖档案，不是丹霞。",
    formation_short:
      "岩石：新近纪河湖相砂、泥岩。构造：札达盆地沉积。外力：抬升后风与间歇洪水把软层切成土林。颜色来自沉积时的氧化还原，缺丹霞那种陡崖–平顶–垂直节理崩塌组合。",
    what_you_see_today: "土林、古湖相层理。海拔高，开放季节短。",
    observation_tips: [
      "先认水平层理，再认被切开的柱。",
      "不要叫丹霞。丹霞要有红层砂岩和崩塌崖。",
      "高原反应优先于拍照。",
    ],
    visible_rocks_minerals_fossils: [
      rock("河湖相砂泥岩", "水平层理，软硬互层。柱是被切开的层。"),
    ],
    related_site_ids: ["dunhuang", "zhangye", "alxa"],
    corrections: ["札达土林不是丹霞山那种丹霞。"],
    sources: ["公开地质公园与沉积学资料综合改写"],
  },
  xiangxi: {
    cover_image: "/covers/xiangxi.jpg",
    cover_credit: "Wikimedia Commons · File:Hongshilin.tianchi2.jpg · 红石林园区喀斯特峰林",
    gallery: [
      {
        src: "/covers/xiangxi.jpg",
        credit: "Wikimedia Commons · File:Hongshilin.tianchi2.jpg · 红石林园区喀斯特峰林",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  keketuohai: {
    cover_image: "/covers/keketuohai.jpg",
    cover_credit: "Yanxutong1215, 2021, Wikimedia Commons · 三号矿坑",
    gallery: [
      {
        src: "/covers/keketuohai.jpg",
        credit: "Yanxutong1215, 2021, Wikimedia Commons · 三号矿坑",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  sheshan: {
    cover_image: "/covers/sheshan.jpg",
    cover_credit: "上海道台, CC BY-SA 4.0, Wikimedia Commons · File:上海_松江_佘山_西佘山_远眺.jpg · 西佘山山体远眺 · 资料照片",
    gallery: [],
    geologic_age_text: "晚白垩世",
    content_status: "complete",
    content_tier: "deep",
    hook: "佘山是晚白垩世碱性火山岩残丘，安山质–粗面质到流纹质。城市地质点，不是上海的国家地质公园——那一座是崇明岛。",
    formation_short:
      "佘山是岩石山，不是填出来的土堆。出露的是晚白垩世碱性火山岩：安山质–粗面质到流纹质凝灰岩、熔岩和火山碎屑，浅灰到紫灰，或见斑晶、凝灰碎屑和流纹构造。它属于浙闽沿海火山岩带在长江口留下的孤立丘，不是花岗岩，也不是五大连池那种玄武岩渣锥，更不是人工堆土。西佘山海拔约 100 米，是上海陆上最高点；东佘山、天马山等松郡九峰是同一套火山丘。禁止凿石。佘山是城市地质点，不是国家地质公园。上海的国家地质公园是崇明岛。",
    what_you_see_today:
      "东佘山、西佘山等松郡九峰。西佘山附近是上海陆上最高点。沿开放步道认浅色块状火山岩：斑晶、凝灰碎屑或流纹构造。不要把教堂或天文台当岩石封面。对比的是崇明沙岛：那边是还没固结完的全新世沙，这里是七千万年前量级的碱性火山岩。",
    observation_tips: [
      "先摸浅色块状火山岩和凝灰碎屑。浅灰到紫灰，不是暗色细粒熔岩台。",
      "教堂和天文台是地面建筑，不是这套岩石的识别标志。",
      "上海的国家地质公园在崇明，不在佘山。",
    ],
    visible_rocks_minerals_fossils: [
      {
        name: "安山质–粗面质到流纹质凝灰岩 / 熔岩",
        how_to_recognize: "浅灰到紫灰。或见斑晶、凝灰碎屑、流纹构造。摸上去是块状基岩。",
        collect_allowed: false,
      },
    ],
    corrections: [
      "佘山不是五大连池那种玄武岩渣锥。识别靠浅色、斑晶、凝灰碎屑和流纹构造，不要套用暗色熔岩的野外标志。",
      "不要把佘山写成上海的国家地质公园。那一座是崇明岛。",
    ],
  },
  lincheng: { geologic_age_text: "寒武–奥陶纪" },
  wuan: {
    geologic_age_text: "寒武–奥陶纪",
    cover_credit: "H2v5o68z, CC0, Wikimedia Commons · 河北武安古武当山天柱峰，非湖北武当山",
  },
  "xingtai-canyon": {
    geologic_age_text: "中元古代",
    landform_types: ["zhangjiajie_sandstone"],
    hook: "太行山石英砂岩被切成峡谷群。先认层理和垂直节理。不是喀斯特，也不是丹霞红层。不要在崖上滴酸。",
  },
  huoshizhai: { geologic_age_text: "白垩纪" },
  hongkong: {
    geologic_age_text: "早白垩世",
    legal_notes: FOSSIL_LAW_HK,
    safety_notes: [
      "先看潮汐表再下岸。柱状节理多在潮间带，涨潮会断退路。",
      "浪切台湿滑，不要攀柱、不要下崖。",
      "只走郊野公园开放步道。不要敲挖带走标本。",
    ],
  },
  danxiashan: {
    cover_image: "/covers/danxiashan.jpg",
    cover_credit: "Mx. Granger, CC0, Wikimedia Commons",
    gallery: [
      {
        src: "/covers/danxiashan.jpg",
        credit: "Mx. Granger, CC0, Wikimedia Commons",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  yesanpo: {
    cover_image: "/covers/yesanpo.jpg",
    cover_credit: "Caitriana Nicholson, CC BY-SA 2.0, Wikimedia Commons · 百里峡河谷",
    gallery: [
      {
        src: "/covers/yesanpo.jpg",
        credit: "Caitriana Nicholson, CC BY-SA 2.0, Wikimedia Commons · 百里峡河谷",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  jixian: {
    cover_image: "/covers/jixian.jpg",
    cover_credit:
      "李怀坤等, 2014, 岩石学报 30(10) · 蓟县雾迷山组叠层石灰岩野外露头 · 资料照片",
    gallery: [
      {
        src: "/covers/jixian.jpg",
        credit: "李怀坤等, 2014, 岩石学报 30(10) · 蓟县雾迷山组叠层石灰岩野外露头 · 资料照片",
        caption: "蓟县雾迷山组白云岩叠层石野外露头。资料照片，非本站踏勘",
      },
      {
        src: "/covers/jixian-2.jpg",
        credit: "李怀坤等, 2014, 岩石学报 30(10) 图2 地质图/柱状图",
        caption: "示意图，不是现场照片",
      },
    ],
  },
  zhucheng: {
    cover_image: "/covers/zhucheng.jpg",
    cover_credit: "Glennsmart, CC BY-SA 3.0, Wikimedia Commons · 诸城恐龙化石隧道原位骨层 · 资料照片",
    gallery: [
      {
        src: "/covers/zhucheng.jpg",
        credit: "Glennsmart, CC BY-SA 3.0, Wikimedia Commons · 诸城恐龙化石隧道原位骨层",
        caption: "诸城恐龙化石带原位骨层。资料照片，非本站踏勘",
      },
    ],
  },
  hukou: {
    cover_image: "/covers/hukou.jpg",
    cover_credit: "H2v5o68z, CC0, Wikimedia Commons",
    gallery: [
      {
        src: "/covers/hukou.jpg",
        credit: "H2v5o68z, CC0, Wikimedia Commons",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  shihuadong: {
    geologic_age_text: "中元古界雾迷山组",
    cover_image: "/covers/shihuadong.jpg",
    cover_credit: "Yumeto, CC BY-SA 4.0, Wikimedia Commons",
    gallery: [
      {
        src: "/covers/shihuadong.jpg",
        credit: "Yumeto, CC BY-SA 4.0, Wikimedia Commons",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  yonghe: {
    cover_image: "/covers/yonghe.jpg",
    cover_credit: "归零者, CC BY-SA 3.0, Wikimedia Commons · 永和黄河蛇曲",
    gallery: [
      {
        src: "/covers/yonghe.jpg",
        credit: "归零者, CC BY-SA 3.0, Wikimedia Commons · 永和黄河蛇曲",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  laoniuwan: {
    cover_image: "/covers/laoniuwan.jpg",
    cover_credit: "黄河山曲, CC BY-SA 3.0, Wikimedia Commons · 老牛湾晋陕峡谷",
    hook: "晋陕峡谷里的深切曲流。老牛湾把河弯嵌进基岩。",
    formation_short:
      "岩石：寒武–奥陶系碳酸盐岩，上覆黄土。构造：晋陕峡谷。外力：先成曲流被抬升后原地深切。对照永和：同一条河，两段深切。崖上堡寨是人文遗迹，不是成因。",
    what_you_see_today: "从高处数河弯。崖是基岩，不是黄土堆出来的。不要靠近陡崖根部。",
    gallery: [
      {
        src: "/covers/laoniuwan.jpg",
        credit: "黄河山曲, CC BY-SA 3.0, Wikimedia Commons · 老牛湾晋陕峡谷",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  shidu: {
    cover_image: "/covers/shidu.jpg",
    cover_credit: "David290, Wikimedia Commons · 十渡拒马河谷",
    gallery: [
      {
        src: "/covers/shidu.jpg",
        credit: "David290, Wikimedia Commons · 十渡拒马河谷",
        caption: "十渡，资料照片，非本站踏勘",
      },
    ],
  },
  weizhoudao: {
    cover_image: "/covers/weizhoudao.jpg",
    cover_credit: "梵摩山人, CC BY-SA 3.0, Wikimedia Commons · 涠洲岛古火山口",
    gallery: [
      {
        src: "/covers/weizhoudao.jpg",
        credit: "梵摩山人, CC BY-SA 3.0, Wikimedia Commons · 涠洲岛古火山口",
        caption: "资料照片，非本站踏勘",
      },
    ],
  },
  "xixian-loess": {
    cover_image: "/covers/xixian-loess.jpg",
    cover_credit: "Esri World Imagery · 隰县黄土公园坐标卫星资料照片，非本站踏勘",
    gallery: [],
    hook: "黄土塬被切成梁和峁。风积粉砂，垂直节理，不是红层丹霞。",
    formation_short:
      "岩石：第四纪风成黄土，粉砂为主，垂直节理发育。构造：吕梁西侧黄土高原。外力：流水把塬切成梁、峁。易混：颜色发黄不是丹霞；丹霞是中生代红层砂岩加崩塌崖。",
    what_you_see_today: "先认粉砂和垂直节理。站在塬边看梁峁，不要靠近黄土陡坎根部。",
  },
  "zhengzhou-huanghe": {
    cover_image: "/covers/zhengzhou-huanghe.jpg",
    cover_credit: "vtpoly, by-nc-nd, Openverse · 郑州黄河地上河资料照片",
    gallery: [],
    hook: "黄河出山口后摊开。地上河，看的是泥沙怎么被送走。",
    formation_short:
      "岩石：第四纪黄河冲积粉砂与黏土。构造：华北平原。外力：出太行后比降骤减，泥沙落淤，河床高于两岸。不是晋陕峡谷那种基岩深切。",
    what_you_see_today: "先认宽谷和堤。泥是黄土和上游侵蚀送来的，不是本地基岩被切开。",
  },
  "huanghe-delta": {
    cover_image: "/covers/huanghe-delta.jpg",
    cover_credit: "资料照片 · 新华社记者 徐速绘 · 人民网图片频道转载 · 东营黄河三角洲湿地航拍",
    gallery: [],
    hook: "黄土和上游侵蚀的终点。东营潮滩还在往海里长。",
    formation_short:
      "岩石：全新世黄河三角洲粉砂、黏土，不是海岸基岩。构造：渤海南岸沉降。外力：径流输沙 + 潮汐改造。易混：不是香港那种火成岩海岸，也不是喀斯特。",
    what_you_see_today: "看潮滩和分流。先认泥沙，再认海。风暴潮天不要上滩。",
  },
  benxi: {
    cover_image: "/covers/benxi.jpg",
    cover_credit: "Yoshi Canopus, CC BY-SA 4.0, Wikimedia Commons · 本溪水洞乘船",
  },
  "chengde-danxia": {
    cover_image: "/covers/chengde-danxia.jpg",
    cover_credit: "H2v5o68z, CC0, Wikimedia Commons · 承德双塔山",
  },
  wutaishan: {
    cover_image: "/covers/wutaishan.jpg",
    cover_credit: "螺钉, CC BY-SA 4.0, Wikimedia Commons · 五台山北台远眺",
  },
  jiayin: {
    cover_image: "/covers/jiayin.jpg",
    cover_credit: "Huanokinhejo, CC BY-SA 4.0, Wikimedia Commons · 嘉荫恐龙化石产地资料照片",
  },
  baishishan: {
    cover_image: "/covers/baishishan.jpg",
    cover_credit: "Taken by Fanghong, CC BY 2.5, Wikimedia Commons · 涞源白石山",
  },
  ningwu: {
    cover_image: "/covers/ningwu.jpg",
    cover_credit: "Underbar dk, CC BY-SA 4.0, Wikimedia Commons · 宁武万年冰洞",
  },
  chaoyang: {
    cover_image: "/covers/chaoyang.jpg",
    cover_credit: "资料照片 · 朝阳鸟化石产地地貌远景",
  },
  xiqiaoshan: {
    geologic_age_text: "新近纪",
    what_you_see_today:
      "先认浅色粗面岩斑晶和板状节理。洞是采石留下的，壁上是凿痕，不是石钟乳，也不是绳状熔岩。西樵不是雷琼那种玄武岩渣锥，更不是活火山。",
    observation_tips: [
      "浅色粗面岩斑晶。洞壁是采石凿痕，不是石钟乳。",
      "不是灰岩溶洞，不是雷琼玛珥，不是绳状熔岩原位。",
      "沿开放步道。不敲、不挖、不带走。",
    ],
    corrections: [
      "西樵山是粗面岩穹丘上的古采石洞，不是灰岩溶洞，也不是绳状熔岩原位。",
      "不要把西樵写成夏威夷玄武岩叙事，也不要把它当成雷琼玛珥湖。",
    ],
    visible_rocks_minerals_fossils: [
      rock("新近纪粗面岩", "浅色，斑晶。节理面常见。不是气孔玄武岩，也不是绳状熔岩。"),
    ],
  },
  zhangye: {
    geologic_age_text: "白垩纪",
  },
  shilin: {
    geologic_age_text: "二叠纪",
  },
  luochuan: {
    geologic_age_text: "第四纪",
  },
  "gssp-paibi": {
    host_park_id: "xiangxi",
    coordinates: [109.5257, 28.3895],
    hook: "寒武系排碧阶的全球尺子。花垣排碧剖面，界线以三叶虫 Glyptagnostus reticulatus 的首现来定，不是牙形石。层型点禁止取样。",
    formation_short:
      "岩石：寒武系花桥组碳酸盐岩。排碧阶的底界，以三叶虫 Glyptagnostus reticulatus 的首现定义。这是层型，不是溶洞。禁止取样。",
    geologic_age_text: "寒武纪排碧阶",
    corrections: [
      "排碧是层型点，不是喀斯特景区的另一个溶洞。禁止取样。",
      "坐标按 ICS 页面印的 28°23.37′N、109°31.54′E 换算，不是本站实测大门。",
    ],
  },
  "gssp-guzhang": {
    host_park_id: "xiangxi",
    name: "古丈罗依溪金钉子",
    coordinates: [109.9647, 28.72],
    hook: "寒武系古丈阶的全球尺子，钉在古丈罗依溪。层型点禁止取样。",
    geologic_age_text: "寒武纪古丈阶",
    corrections: [
      "古丈阶是年代地层单位，不是一座丹霞山。禁止取样。",
      "坐标按层型论文印的公路切面 28°43.20′N、109°57.88′E 换算，不是本站复测。",
    ],
  },
  "gssp-wuliu": {
    name: "剑河乌溜－曾家崖金钉子",
    coordinates: [108.4138, 26.7474],
    hook: "寒武系乌溜阶（苗岭统底）的全球尺子，在剑河乌溜–曾家崖。层型点禁止取样。",
    geologic_age_text: "寒武纪乌溜阶",
    corrections: [
      "坐标按 2019 年层型论文印的 26°44.843′N、108°24.830′E 换算。维基百科上另有一个 26.08°N 的换算，那是把 44′ 算错了，不要用。",
    ],
  },
  "gssp-penglaitan": {
    coordinates: [109.3211, 23.6953],
    corrections: [
      "坐标按 ICS 页面：23°41′43″N，109°19′16″E。不是本站实测。",
      "界线在来宾灰岩第 6k 层之底。批准年本站记 2004，和国际年代地层表常见写法一致。另有 2023 年论文写成 2005，并说原河边剖面自 2020 年被淹、建议改钉同地新开挖的剖面。新点位本站没有，不要按这个图钉下到河里。",
    ],
  },
  mohe: {
    coordinates: [122.37, 53.48],
    corrections: ["原来的点落在黑龙江对岸。现改到北极村一带（约 122.37°E, 53.48°N）。景区大门的精确坐标仍待核实。"],
  },
  liping: {
    coordinates: [106.62, 32.72],
    corrections: ["原来的点落在四川南江。现改到汉中南郑黎坪一带。大门坐标仍待核实。"],
  },
  kongtongshan: {
    geologic_age_text: "白垩纪",
    geologic_age_start_ma: 145,
    geologic_age_end_ma: 66,
    corrections: ["原先年龄 120–250 Ma 上下颠倒，250 Ma 也不是白垩纪。现按白垩纪的纪范围填写，具体到组还待核实。"],
  },
  xiaonanhai: {
    geologic_age_text: "全新世",
    geologic_age_start_ma: 0.00017,
    geologic_age_end_ma: 0,
    corrections: ["小南海是 1856 年地震堵住的堰塞湖，不是 16 万年前。"],
  },
  zhoukoudian: {
    types: ["stratotype", "landform_site"],
    corrections: ["周口店是世界文化遗产。IUGS 首批 100 处地质遗产地里没有它，标签已去掉。"],
  },
  alxa: {
    types: ["world_geopark", "national_geopark"],
    corrections: ["IUGS 首批名录里相关的是巴丹吉林沙山湖泊，不是整个阿拉善沙漠公园。标签改挂在巴丹吉林那一条。"],
  },
  wuda: {
    types: ["landform_site"],
    corrections: ["乌达植物群不在 IUGS 首批 100 处里。标签已去掉，待以后若有新一批名录再核。"],
  },
  "guilin-karst": {
    types: ["landform_site"],
    corrections: ["IUGS 首批名录里的喀斯特是石林，不是桂林。桂林这条的 IUGS 标签已去掉。"],
  },
  "gssp-pengchong": {
    hook: "石炭系维宪阶的全球尺子，钉在柳州碰冲。层型点禁止取样。",
    geologic_age_text: "石炭纪维宪阶",
  },
  "gssp-huanghuachang": {
    hook: "奥陶系大坪阶的全球尺子。宜昌黄花场，中奥陶统的底。禁止取样。",
    geologic_age_text: "奥陶纪大坪阶",
  },
  "gssp-wangjiawan": {
    hook: "奥陶系赫南特阶的全球尺子：冰期、笔石和海平面写在同一层。宜昌王家湾。禁止取样。",
    geologic_age_text: "奥陶纪赫南特阶",
  },
  "gssp-jiangshan": {
    name: "江山碓边金钉子",
    coordinates: [118.6148, 28.8163],
    geologic_age_text: "寒武纪江山阶",
    hook: "寒武系江山阶的全球尺子，钉在浙西碓边石灰岩里。层型点禁止取样。",
    corrections: [
      "江山阶是年代地层单位，不是一座喀斯特景区。禁止取样。",
      "坐标按 ICS 页面印的碓边 B 剖面 28°48.977′N、118°36.887′E 换算，不是本站复测。",
    ],
  },
  qianan: {
    landform_types: ["stratigraphy"],
    hook: "迁安公开介绍讲的是太古宙的石头和不整合，不是黄山那种花岗岩名山。具体到哪一组，还有「已命名还是仍在资格名单」，都没对到部委原文。",
    formation_short:
      "原先的正文把迁安写成燕山期花岗岩、石蛋和钾长石。那是套话，和公开介绍里的太古宙变质岩、不整合不是一回事。组名和接触关系本站没对到论文，这里不另编一套。",
    formation_timeline: [],
    evolution_sequence: "",
    what_you_see_today: "到了不要先找花岗石蛋。这一页的花岗岩说法已经拿掉。现场认哪一块石头，等核对完再写。",
    observation_tips: [
      "不要按粗粒石英和钾长石去认。",
      "资格还是已命名，看园里的牌子。本站没有部委公告。",
    ],
    visible_rocks_minerals_fossils: [
      rock("岩性先空着", "原先写成燕山期花岗岩。公开介绍不是这个。具体矿物先不写。"),
    ],
    corrections: [
      "原先标成花岗岩地貌，和公开介绍不符，已改到地层这一类。组的名字待核实。",
      "2009 年的材料写的是第五批国家地质公园资格。另有汇编名录把它写成国家地质公园。正式命名公告没有对到，级别先不改。",
    ],
  },
  "baisha-crater": {
    hook: "名录上的名字是白沙陨石坑。坑是不是撞击留下的，本站没有对到原始论文，不要写成已经锤定。",
    corrections: ["汇编名录里有这一条。撞击证据没有在这里复核。"],
  },
};

export const geositePatches: Record<string, Geosite[]> = {
  huguangyan: [
    geo("hgy-lake", "huguangyan", "湖光岩玛珥湖", 110.286, 21.146, "other", "圆形湖盆。问：这是溶出来的还是炸出来的？岸壁是碎屑。"),
    geo("hgy-wall", "huguangyan", "玛珥碎屑岸壁", 110.29, 21.15, "bedding", "岸壁分层：一次次爆发的灰和角砾。不是灰岩层理。"),
    geo("hgy-basalt", "huguangyan", "玄武岩台地远观", 110.3, 21.16, "lava", "湖以外的台地。雷琼裂谷的熔岩面。"),
  ],
  yigong: [
    geo("yg-slide", "yigong", "易贡滑坡堆积（远观）", 94.9, 30.2, "collapse", "2000 年堵江的那一次。只走开放观景点。",),
    geo("yg-lake", "yigong", "易贡湖岸", 94.88, 30.18, "other", "堰塞湖。水位会变。"),
    geo("yg-glacier", "yigong", "上游冰川远眺", 94.92, 30.25, "other", "海洋性冰川。不要走上冰舌。"),
  ],
  zhada: [
    geo("zd-tulin", "zhada", "札达土林", 79.8, 31.48, "pillar", "河湖相被切开的柱。先认层理方向。"),
    geo("zd-bedding", "zhada", "古湖相层理", 79.82, 31.5, "bedding", "水平层是湖，柱是后来的风和洪水。"),
    geo("zd-basin", "zhada", "札达盆地远观", 79.78, 31.47, "other", "盆地尺度。土林只是被切开的一角。"),
  ],
  shihuadong: [
    geo(
      "shd-flowers",
      "shihuadong",
      "多层石花廊",
      115.934,
      39.802,
      "cave_speleothem",
      "雾迷山组白云岩洞壁上的石花、石旗是化学沉积。只看不摸。商业彩灯不是成因。北方溶洞慢、小，不要拿桂林峰林平原来套。",
    ),
    geo(
      "shd-wall",
      "shihuadong",
      "雾迷山组洞壁层理",
      115.927,
      39.803,
      "bedding",
      "洞口或开放廊道认中元古界白云岩层理。叠层石纹理朝上。和灰岩的差别留在室内，不要在洞壁上滴酸。",
    ),
    geo(
      "shd-gate",
      "shihuadong",
      "开放洞口层楼",
      115.932,
      39.796,
      "cave_speleothem",
      "多层厅堂沿节理发育。听现场指挥，不离队，不摸化学沉积。",
    ),
  ],
  shidu: [
    geo(
      "sd-wall",
      "shidu",
      "拒马河谷壁",
      115.604,
      39.642,
      "bedding",
      "雾迷山组近水平层理。北方河谷喀斯特，不是桂林峰林，也不是丹霞赤壁。碳酸盐岩鉴定留在室内。",
    ),
    geo(
      "sd-bend",
      "shidu",
      "十渡峡谷湾",
      115.597,
      39.643,
      "other",
      "河流侧蚀成湾。名字里的「十渡」不是十个地质渡口。谷壁先认岩性再认河湾。",
    ),
  ],
  xiqiaoshan: [
    geo(
      "xqs-quarry",
      "xiqiaoshan",
      "采石洞壁",
      112.974,
      22.932,
      "joint",
      "粗面岩人工采石留下的洞。壁上是凿痕，不是石钟乳，也不是绳状熔岩。不要把西樵写成溶洞或夏威夷玄武岩。",
    ),
    geo(
      "xqs-dome",
      "xiqiaoshan",
      "粗面岩穹丘远观",
      112.967,
      22.933,
      "other",
      "低丘是新生代粗面岩穹丘，不是玄武岩渣锥，不是活火山，也不是雷琼玛珥。",
    ),
    geo(
      "xqs-joint",
      "xiqiaoshan",
      "板状节理步道",
      112.972,
      22.926,
      "joint",
      "板状–柱状节理。浅色斑晶。先认岩石，再看采石如何把节理面打开。",
    ),
  ],
  luochuan: [
    geo(
      "lc-section",
      "luochuan",
      "黑木沟黄土–古土壤剖面",
      109.434,
      35.762,
      "bedding",
      "风积黄土夹古土壤条带。垂直节理、钙质结核。不是红层丹霞。雨后陡坎会塌，不要靠近壁根。",
    ),
    geo(
      "lc-yuan",
      "luochuan",
      "黄土塬面远观",
      109.427,
      35.763,
      "other",
      "塬、梁、峁是流水切开风积黄土的结果。先认粉砂，再认切割。",
    ),
    geo(
      "lc-gully",
      "luochuan",
      "冲沟陡坎",
      109.432,
      35.756,
      "collapse",
      "冲沟壁垂直节理控制。雨后泥泞失足。只看剖面，不挖黄土标本。",
    ),
  ],
  "xixian-loess": [
    geo(
      "xx-section",
      "xixian-loess",
      "隰县黄土剖面",
      110.934,
      36.702,
      "bedding",
      "第四纪风积黄土。垂直节理、钙质结核。不是红层丹霞。不要靠近陡坎壁根。",
    ),
    geo(
      "xx-yuan",
      "xixian-loess",
      "塬梁峁远观",
      110.927,
      36.703,
      "other",
      "风把粉砂堆成黄土，流水再切成塬、梁、峁。先认粉砂，再认切割。",
    ),
  ],
};

/** Last-write walking routes. Keys are site_id. */
export const routePatches: Record<string, Route[]> = {
  sheshan: [
    walk(
      "ss-loop",
      "sheshan",
      "东西佘山：平原上的火山锥",
      "半日",
      "低",
      ["ss-west", "ss-hills"],
      "地铁或公交到佘山。沿开放步道走。",
      "把浅色基岩拍下来。对照：流纹岩/凝灰岩，不是花岗岩。上海的国家地质公园在崇明。",
      6,
      100,
    ),
  ],
};
