import type { Geosite, Route, Site, VisitInfo } from "./types";
import { FOSSIL_LAW } from "./labels";

function g(
  id: string,
  site_id: string,
  name: string,
  lon: number,
  lat: number,
  phenomenon_type: Geosite["phenomenon_type"],
  look_here: string,
  public_precision: Geosite["public_precision"] = "exact",
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
    do_not: ["不攀无保护岩壁", "不敲、不刻", "不采集岩石、矿物或化石"],
    public_precision,
  };
}

const rock = (name: string, how: string) =>
  ({ name, how_to_recognize: how, collect_allowed: false as const });

export const deepOverlays: Record<string, Partial<Site>> = {
  zhangjiajie: {
    content_status: "complete",
    content_tier: "deep",
    hook: "3.8 亿年前的海滩，被切成三千多座石柱。",
    formation_short:
      "岩石：中泥盆世滨海石英砂岩，硅质胶结，抗风化。构造：抬升加上两组近垂直节理，把岩体切成棋盘。外力：流水沿节理下切，重力沿节理崩塌。不是溶蚀，所以不是喀斯特。",
    formation_timeline: [
      { name: "成滩", age: "中泥盆世，约 3.8 亿年", what: "滨岸堆积厚层石英砂，后来固结。" },
      { name: "胶结", age: "晚古生代", what: "硅质胶结让砂岩变硬，软硬互层日后变成台阶。" },
      { name: "抬升", age: "中生代末–新生代", what: "砂岩被顶到侵蚀基准面之上。" },
      { name: "下切与崩塌", age: "新近纪–至今", what: "水沿节理下切，岩柱侧壁失稳，峰林变瘦。" },
    ],
    evolution_sequence: "夷平面 → 方山 → 石墙 → 峰丛 → 峰林",
    what_you_see_today:
      "武陵源的石柱是砂岩，柱间是节理被掏空的巷谷，山顶还残留夷平面。黄龙洞是另一套石灰岩，不能拿它证明张家界是喀斯特。",
    observation_tips: [
      "石英砂岩偏灰白、黄白，有砂感，没有灰岩的溶沟溶痕。",
      "两组近直立节理把山切成方形截面。",
      "软层凹、硬层出檐，雨后更清楚。",
      "袁家界、天子山看的是还没切碎的方山和夷平面。",
      "常见误认：把石柱当成石灰岩峰林。",
    ],
    visible_rocks_minerals_fossils: [
      rock("石英砂岩", "浅色，颗粒均匀，硬。"),
      rock("铁质浸染", "部分层面锈黄或暗红，不是丹霞红层。"),
      rock("泥盆纪海相化石（偶见）", "层面印痕。只看。定位到园区即可。"),
    ],
    safety_notes: ["峰林区有落石，勿翻护栏。", "雨天砂岩滑。", "百龙电梯可看剖面，注意眩晕。"],
    legal_notes: "世界自然遗产。禁止凿石、刻画、采集。溶洞钟乳石同样禁止触摸。",
    corrections: [
      "张家界是石英砂岩峰林，不是喀斯特。",
      "方山是峰林演化序列中的一个阶段，不是所有平顶山都叫张家界地貌。",
    ],
    official_website: "https://www.zjj.gov.cn/",
    related_site_ids: ["zhangshiyan", "xingtai-canyon", "shilin"],
  },
  fangshan: {
    content_status: "complete",
    content_tier: "deep",
    hook: "一园四门：溶洞、北京人、峡谷、大理岩峰林，钉在华北老地层上。",
    formation_short:
      "岩石：中元古界雾迷山组碳酸盐岩为主。构造：华北西山的褶皱与断裂把老地层抬出。外力：拒马河下切成十渡，地下水溶蚀出石花洞，周口店洞穴堆积记下更新世。",
    formation_timeline: [
      { name: "雾迷山组", age: "约 14 亿年", what: "潮坪白云岩，叠层石生长，日后成为石花洞围岩。" },
      { name: "古生代海侵", age: "寒武–奥陶纪", what: "浅海碳酸盐岩再次覆盖。" },
      { name: "西山抬升", age: "中新生代至今", what: "断裂抬升，河谷与洞穴同时发育。" },
    ],
    evolution_sequence: "潮坪白云岩 → 抬升成山 → 地表峡谷 / 地下洞穴 / 洞穴堆积",
    what_you_see_today:
      "石花洞看化学沉积，十渡看河谷喀斯特，周口店看洞穴地层，白石山看大理岩峰林。同属房山世界地质公园，过程并不完全一样。",
    observation_tips: [
      "石花洞：石旗、石幔从滴水里长出来，不要摸。",
      "十渡：北方喀斯特是峡谷，不是桂林式峰林平原。",
      "周口店：看洞穴堆积层位，不是挖骨头。",
      "白石山在河北涞源，是跨省园区。",
    ],
    visible_rocks_minerals_fossils: [
      rock("雾迷山组白云岩", "浅灰，或见叠层石纹层。和灰岩的差别留在室内认，洞里不要滴酸。"),
      rock("方解石化学沉积", "石钟乳、石幔。只看。"),
      rock("叠层石", "纹层状，像被切开的毯子。"),
    ],
    safety_notes: ["溶洞潮湿。", "十渡注意落石与汛期。", "周口店勿入未开放洞段。"],
    legal_notes: "周口店是世界遗产。化石与遗址标本国家所有。钟乳石禁止破坏。",
  },
  danxiashan: {
    content_status: "complete",
    content_tier: "deep",
    hook: "丹霞两个字从这里长出来。红层、垂直节理、崩塌。",
    formation_short:
      "岩石：白垩纪–古近纪陆相红层，铁质染色。构造：抬升后垂直节理把红层切成块体。外力：流水下切、风化、重力崩塌，崖面后退，留下赤壁、巷谷、方山。",
    formation_timeline: [
      { name: "红盆堆积", age: "白垩纪–古近纪", what: "干旱盆地堆积砂砾，铁氧化物染色。" },
      { name: "抬升与节理", age: "新生代", what: "红层被抬出，垂直节理贯穿。" },
      { name: "崩塌塑形", age: "第四纪至今", what: "沿节理崩塌，形成丹霞赤壁。" },
    ],
    evolution_sequence: "红层高原 → 深切巷谷 → 方山赤壁 → 孤立残丘",
    what_you_see_today:
      "定义地。红来自沉积时的铁，直来自节理，陡来自崩塌。张掖彩色丘陵是另一套几何，不要混称。",
    observation_tips: [
      "认红层：砂岩与砾岩互层。",
      "一线天和巷谷是崩塌的预备缝。",
      "顶平是还没切碎的方山。",
      "没有垂直节理控制的崩塌赤壁，只是红层丘陵，不是丹霞。",
    ],
    visible_rocks_minerals_fossils: [rock("红色砂岩 / 砾岩", "层内颜色稳定偏红，砾石成层。")],
    safety_notes: ["赤壁落石，禁止崖下停留。", "雨天步道滑。"],
    legal_notes: "世界地质公园核心区禁止凿石取标本。",
    corrections: ["张掖彩色丘陵不等于丹霞山那种丹霞。"],
  },
  shilin: {
    content_status: "complete",
    content_tier: "deep",
    hook: "二叠纪的海，竖起来变成石头的森林。",
    formation_short:
      "岩石：中二叠世厚层纯灰岩。构造：抬升后垂直裂隙成网格。外力：雨水沿裂隙溶蚀，石芽长高，剑状石林出露。溶解是主外力，这是喀斯特。",
    formation_timeline: [
      { name: "浅海成灰岩", age: "中二叠世", what: "温暖浅海沉淀碳酸钙。" },
      { name: "抬升成陆", age: "晚二叠世以后", what: "灰岩露出，接受雨水。" },
      { name: "石芽与石林", age: "新生代", what: "沿裂隙溶蚀，地表石林定型。" },
    ],
    evolution_sequence: "灰岩台地 → 溶沟石芽 → 剑状石林 → 残柱",
    what_you_see_today: "大石林、小石林、乃古石林是同一过程的不同切割程度。溶沟是水的指纹。IUGS 遗产地。",
    observation_tips: [
      "柱体有刃脊和溶沟，不是砂岩的层理台阶。",
      "土上石林说明它曾被红土埋过，又被剥出来。",
      "不要和张家界砂岩柱用同一个名字。",
    ],
    visible_rocks_minerals_fossils: [
      rock("二叠纪灰岩", "深灰到浅灰，溶沟发育，或见生物碎屑。"),
    ],
    safety_notes: ["刃脊锋利，禁止翻越石柱。", "雨后溶沟很滑。"],
    legal_notes: "世界自然遗产、世界地质公园、IUGS 遗产地。禁止攀爬核心石柱、禁止凿石。",
  },
  wudalianchi: {
    content_status: "complete",
    content_tier: "deep",
    hook: "火山刚歇不久。熔岩、锥体、堰塞湖还在同一张图上。",
    formation_short:
      "岩石：钾质玄武岩。构造：深断裂把岩浆送上来。外力：喷发建造锥体和熔岩流，熔岩堵塞河道形成五个串珠湖。",
    formation_timeline: [
      { name: "老期火山", age: "更新世", what: "早期玄武岩台地和锥体。" },
      { name: "新期喷发", age: "1719–1721 年", what: "老黑山、火烧山喷发，堰塞白河。" },
      { name: "冷却", age: "喷发后至今", what: "表壳收缩成绳状、翻花状熔岩。" },
    ],
    evolution_sequence: "裂隙喷溢 → 熔岩流与渣锥 → 堰塞湖链 → 表壳风化",
    what_you_see_today: "老黑山火山口、熔岩台地、串珠湖。湖是被熔岩挡住的河，不是陨石坑。",
    observation_tips: [
      "新期熔岩颜色深、气孔多，植物还没盖满。",
      "绳状熔岩：表壳已冷、内部还在流。",
      "气孔是气体逃逸，不是爆炸坑。",
    ],
    visible_rocks_minerals_fossils: [
      rock("玄武岩", "深色、细粒、气孔，或见橄榄石斑晶。"),
      rock("火山渣 / 火山弹", "多孔、外形扭曲。不要装进口袋。"),
    ],
    safety_notes: ["熔岩台地面极不规则。", "勿翻火山口残墙。"],
    legal_notes: "世界地质公园。禁止凿取熔岩纪念品。",
  },
  hongkong: {
    content_status: "complete",
    content_tier: "deep",
    hook: "潮水退下去，六角形的冷却裂隙排成一张网。酸性岩也会长柱状节理。",
    formation_short:
      "岩石：早白垩世酸性火成岩（流纹质），不是玄武岩。构造：冷凝收缩，柱状节理垂直于冷却面。外力：海浪把节理网洗出来。IUGS 点在柱状节理。",
    formation_timeline: [
      { name: "酸性火山喷发", age: "早白垩世，约 1.4 亿年", what: "流纹质岩浆在地表附近冷却。" },
      { name: "柱状节理", age: "冷凝过程", what: "体积收缩形成近六边形柱体。" },
      { name: "海浪揭露", age: "第四纪海侵以来", what: "波浪沿节理掏空，柱体出露潮间带。" },
    ],
    evolution_sequence: "酸性火山体 → 冷凝柱状节理 → 海蚀台与海蚀柱",
    what_you_see_today: "西贡火山岩园区看柱状节理，新界东北看沉积岩海岸。公园分两个园区。",
    observation_tips: [
      "柱体截面近六边。几何来自冷却，岩石可以是酸性的。",
      "必须看潮汐。涨潮会断退路。",
      "常见误认：柱状节理等于玄武岩。",
    ],
    visible_rocks_minerals_fossils: [
      rock("流纹质火山岩", "浅灰到深灰，或见石英、长石斑晶，柱状节理发育。"),
    ],
    safety_notes: ["潮间带防滑。", "台风和大浪期间不要下岸。"],
    legal_notes: "香港世界地质公园与 IUGS 遗产点。禁止敲柱、采石。",
    official_website: "https://www.geopark.gov.hk/",
  },
  chengjiang: {
    content_status: "complete",
    content_tier: "deep",
    hook: "5.18 亿年前，柔软的身体也被印在页岩上。",
    formation_short:
      "岩石：寒武纪早期细粒沉积岩，缺氧、细腻，适合特异埋藏。构造：扬子地台浅海。外力：抬升和差异风化把含化石层暴露。能看的是层，不是可以挖的面。",
    formation_timeline: [
      { name: "生命爆发的海", age: "约 5.18 亿年", what: "澄江生物群被快速埋藏，软躯体保存。" },
      { name: "成岩与抬升", age: "古生代以后", what: "页岩固结，随云南高原出露。" },
    ],
    what_you_see_today: "博物馆、保护剖面和指定观景点。化石层不对公众提供可发掘坐标。",
    observation_tips: [
      "页岩沿层面裂开，化石印在层面上。",
      "软躯体保存是澄江的意义。",
      "野外以看层、看保护设施为主。",
    ],
    visible_rocks_minerals_fossils: [
      rock("澄江生物群化石（展品）", "叶足类、节肢动物、海绵等软躯体印痕。只在展柜里看。"),
    ],
    safety_notes: ["保护区内按指定路线。"],
    legal_notes: FOSSIL_LAW,
  },
  zigong: {
    content_status: "complete",
    content_tier: "deep",
    hook: "侏罗纪的河湖把恐龙埋进砂岩。去博物馆，不是去挖。",
    formation_short:
      "岩石：中侏罗世沙溪庙组砂岩、泥岩。构造：四川盆地河湖相连续堆积。外力：切割把含骨层暴露。大山铺是 IUGS 点，公众看发掘现场保护和馆藏。",
    formation_timeline: [
      { name: "河湖埋藏", age: "中侏罗世，约 1.68–1.63 亿年", what: "恐龙尸体在河道与湖滨被砂泥掩埋。" },
      { name: "保护", age: "20 世纪至今", what: "大山铺原地保护，标本进馆。" },
    ],
    what_you_see_today: "发掘现场大厅、装架和地层解说。骨头在岩石里的姿态，比单独骨架更能说明埋藏。",
    observation_tips: [
      "骨骼散落还是关联，判断水流有没有把尸体拆开。",
      "围岩是砂岩还是泥岩，告诉你当时的能量。",
    ],
    visible_rocks_minerals_fossils: [
      rock("恐龙骨骼（馆藏与遗址）", "深色骨质保存在浅色砂岩中。只看展陈。"),
    ],
    safety_notes: ["不要跨越护栏靠近骨层。"],
    legal_notes: FOSSIL_LAW,
  },
  changshan: {
    content_status: "complete",
    content_tier: "deep",
    hook: "园子为尺子而建。奥陶纪的海，在浙西留下可以全球对比的一层。",
    formation_short:
      "岩石：奥陶系泥质灰岩、钙质页岩。构造：华南稳定陆表海。外力：抬升把剖面送到黄泥塘。金钉子是独立的点，园是它的保护罩。",
    formation_timeline: [
      { name: "奥陶纪海", age: "约 4.85–4.44 亿年", what: "笔石相与壳相交替。" },
      { name: "钉下尺子", age: "1997 年", what: "黄泥塘成为达瑞威尔阶 GSSP，中国第一颗金钉子。" },
    ],
    what_you_see_today: "黄泥塘剖面栈道、标志牌和公园的地层展示。能看层，不能取样。",
    observation_tips: [
      "层型点看的是这一层为什么被选中。",
      "笔石印在深色层上，像压扁的锯条。不要抠。",
    ],
    visible_rocks_minerals_fossils: [rock("笔石印痕", "层面丝状、锯齿状印痕。只看。")],
    safety_notes: ["剖面栈道潮湿。"],
    legal_notes: "GSSP 禁止任何采样。",
    related_site_ids: ["gssp-huangnitang", "gssp-jiangshan", "meishan"],
  },
  "gssp-huangnitang": {
    content_status: "complete",
    content_tier: "deep",
    hook: "中国第一颗金钉子，全球奥陶系达瑞威尔阶的尺子。",
    formation_short:
      "岩石：奥陶系泥质碳酸盐岩与钙质泥岩。构造：稳定陆表海，连续沉积。钉子钉的是笔石 Undulograptus austrodentatus 的首现。",
    what_you_see_today: "保护剖面上的层型标志。全球达瑞威尔阶的底，从这里数起。",
    observation_tips: [
      "先读层号，再看岩石颜色变化。",
      "金钉子是定义，不是一块金色文物。",
    ],
    visible_rocks_minerals_fossils: [
      rock("Undulograptus austrodentatus（标志笔石）", "需专业鉴定。公众看层位标志即可。"),
    ],
    safety_notes: ["不要离开栈道贴近剖壁。"],
    legal_notes: "国际层型点。禁止敲打、取样。",
    related_site_ids: ["changshan", "gssp-jiangshan", "jixian"],
  },
  meishan: {
    content_status: "complete",
    content_tier: "deep",
    hook: "一剖两钉，不是同一年。下面是 2005 年的长兴阶底，上面是 2001 年的二叠–三叠系界线。",
    formation_short:
      "岩石：长兴组灰岩向上过渡到三叠系底部泥质岩。长兴阶底界（Clarkina wangi）2005 年钉在下部；二叠–三叠系界线（Hindeodus parvus）2001 年钉在上部。两颗不在同一层。IUGS 大灭绝遗产地。",
    formation_timeline: [
      { name: "长兴阶底界", age: "2005 年钉下，约 2.54 亿年前", what: "牙形石 Clarkina wangi 首现。在剖面上更靠下。" },
      { name: "二叠–三叠系界线", age: "2001 年钉下，约 2.52 亿年前", what: "牙形石 Hindeodus parvus 首现。在剖面上更靠上。大灭绝写在这附近。" },
    ],
    what_you_see_today: "煤山剖面保护廊和博物馆。能看到岩性从灰岩变成较暗的泥质层。",
    observation_tips: [
      "两颗钉子不在同一厘米：长兴阶底更靠下，PT 界线在上部。",
      "牙形石毫米级，在显微镜下。现场看的是界线。",
    ],
    visible_rocks_minerals_fossils: [
      rock("牙形石（展品 / 薄片）", "微体化石。看展柜。"),
      rock("长兴组灰岩", "深灰色薄–中层灰岩。"),
    ],
    safety_notes: ["保护廊内不要翻越。"],
    legal_notes: FOSSIL_LAW + " 此处同时是 GSSP 与 IUGS 遗产地。",
  },
  jixian: {
    content_status: "complete",
    content_tier: "deep",
    hook: "华北的深时间尺子。中元古界的海，一层一层摊在蓟州的山上。",
    formation_short:
      "岩石：中–新元古界海相碳酸盐岩与碎屑岩，叠层石繁盛。构造：燕辽沉降带连续沉积，后来整体抬升。外力：切割出连续剖面。",
    formation_timeline: [
      { name: "海侵开始", age: "约 18 亿年", what: "长城系碎屑岩覆盖基底。" },
      { name: "碳酸盐岩台地", age: "蓟县系，约 16–14 亿年", what: "雾迷山组白云岩，叠层石成层。" },
      { name: "抬升成剖面", age: "中新生代", what: "燕山运动把整套地层抬到蓟州。" },
    ],
    evolution_sequence: "裂陷碎屑岩 → 碳酸盐岩台地 → 整体抬升成标准剖面",
    what_you_see_today: "沿剖面依次走过不同组。叠层石像被切开的卷心菜。这是地层教科书，不是喀斯特名山。",
    observation_tips: [
      "叠层石纹层凸向可判断是否倒转。",
      "与嵩山对照：嵩山叠不整合，蓟县把元古宙内部展开。",
    ],
    visible_rocks_minerals_fossils: [
      rock("叠层石", "穹状或层状纹层。只看。"),
      rock("白云岩", "浅灰、粉晶。和灰岩的差别留在室内，露头上不要滴酸。"),
    ],
    safety_notes: ["部分剖面在公路旁，注意车辆。"],
    legal_notes: "禁止凿取叠层石标本。",
  },
  sheshan: {
    content_status: "complete",
    content_tier: "deep",
    hook: "上海平原上突然冒出来的白垩纪火山锥，不是「搬来的土堆」。",
    formation_short:
      "岩石：晚白垩世流纹岩、凝灰岩，不是花岗岩。构造：浙闽火山岩带在上海留下孤立丘。外力：第四纪三角洲把山脚填平。西佘山约 100 米，上海陆上最高点。",
    formation_timeline: [
      { name: "喷发", age: "晚白垩世", what: "酸性火山喷发，凝灰岩、流纹岩就地堆积。" },
      { name: "平原淹没山脚", age: "第四纪", what: "河口沉积把火山锥的根埋进软土。" },
    ],
    evolution_sequence: "白垩纪火山锥 → 长期剥蚀 → 三角洲淹没山脚 → 岛山",
    what_you_see_today:
      "东佘山、西佘山等松郡九峰。上海的国家地质公园是崇明岛，佘山不是国地公。",
    observation_tips: [
      "浅色、斑晶、或见流纹构造，不是黄山那种花岗岩。",
      "平原上突然隆起，周围没有连绵基岩山。",
      "常见误认：土堆，或花岗岩名山。",
    ],
    visible_rocks_minerals_fossils: [
      rock("流纹岩 / 凝灰岩", "浅灰到紫灰，凝灰岩有碎屑感。"),
    ],
    safety_notes: ["林间步道，暴雨后土阶滑。"],
    legal_notes: "禁止凿石。不要把佘山写成国家地质公园。",
    related_site_ids: ["chongming", "yandangshan", "hongkong"],
    corrections: [
      "佘山是火山岩（流纹岩/凝灰岩），不是花岗岩名山。",
      "上海的国家地质公园是崇明岛。",
    ],
  },
  "gssp-jiangshan": {
    content_status: "complete",
    content_tier: "deep",
    hook: "寒武系江山阶的全球尺子，钉在浙西石灰岩里。",
    formation_short:
      "岩石：寒武系芙蓉统灰岩。构造：扬子地台稳定浅海，连续沉积。钉子钉的是三叶虫 Agnostotes orientalis 的首现。外力：抬升把剖面送到江山碓边。",
    formation_timeline: [
      { name: "浅海碳酸盐岩", age: "晚寒武世", what: "球接子三叶虫生活在开阔陆表海。" },
      { name: "钉下江山阶", age: "2011 年", what: "碓边 B 剖面成为江山阶 GSSP。" },
    ],
    what_you_see_today: "保护剖面与层型标志。三叶虫在层面上，不在口袋里。",
    observation_tips: [
      "先读层号，再看灰岩颜色分带。",
      "球接子三叶虫很小，现场以解说牌为准，不要抠层面。",
    ],
    visible_rocks_minerals_fossils: [
      rock("寒武纪灰岩", "深灰薄层，层面或见三叶虫印痕。只看。"),
    ],
    safety_notes: ["剖壁勿攀。"],
    legal_notes: FOSSIL_LAW + " 国际层型点禁止取样。",
    related_site_ids: ["changshan", "gssp-huangnitang", "gssp-paibi"],
  },
  "gssp-huanghuachang": {
    content_status: "complete",
    content_tier: "deep",
    hook: "奥陶系大坪阶金钉子。中奥陶统的底，钉在宜昌黄花场。",
    formation_short:
      "岩石：奥陶系灰岩。构造：扬子地台北缘稳定浅海。钉子钉的是牙形石 Baltoniodus triangularis 最低出现。外力：抬升与切割把层型送到地表。",
    what_you_see_today: "黄花场保护剖面。牙形石要显微镜，现场看的是岩性转换和层位标志。",
    observation_tips: ["不要在灰岩上敲样。", "把大坪阶在国际地层表上的位置记下来。"],
    visible_rocks_minerals_fossils: [rock("奥陶纪灰岩", "浅灰到深灰，中薄层。")],
    safety_notes: ["公路边剖面注意车辆。"],
    legal_notes: "GSSP 禁止任何采样。",
    related_site_ids: ["gssp-wangjiawan", "gssp-huangnitang"],
  },
  "gssp-wangjiawan": {
    content_status: "complete",
    content_tier: "deep",
    hook: "赫南特阶金钉子：冰期、笔石和海平面写在同一层。",
    formation_short:
      "岩石：上奥陶统笔石页岩与灰岩。构造：扬子地台。钉子钉的是笔石 Normalograptus extraordinarius 首现，并伴随碳同位素正偏移与冰期海退。",
    what_you_see_today: "王家湾保护剖面。黑色页岩里写着奥陶纪末的冰期故事。",
    observation_tips: ["笔石像压扁的锯条，印在层面上。", "不要把页岩掰回家。"],
    visible_rocks_minerals_fossils: [rock("笔石印痕", "深色页岩层面丝状印痕。只看。")],
    safety_notes: ["页岩湿滑。"],
    legal_notes: FOSSIL_LAW + " 层型点禁止取样。",
    related_site_ids: ["gssp-huanghuachang", "gssp-huangnitang"],
  },
  "gssp-paibi": {
    content_status: "complete",
    content_tier: "deep",
    hook: "排碧阶金钉子。芙蓉统从湘西灰岩里开始。",
    formation_short:
      "岩石：寒武系花桥组灰岩。构造：江南斜坡相连续沉积。钉子钉的是球接子 Glyptagnostus reticulatus 首现，并与 SPICE 碳同位素正偏移吻合。外力：抬升把剖面送到花垣排碧。",
    what_you_see_today: "湘西世界地质公园范围内的保护剖面。能看层，不能取样。",
    observation_tips: ["SPICE 事件写在化学里，现场看的是层位。", "三叶虫不对公众提供可挖点。"],
    visible_rocks_minerals_fossils: [rock("寒武纪灰岩", "深灰，层理清楚。")],
    safety_notes: ["山区道路注意落石。"],
    legal_notes: FOSSIL_LAW,
    related_site_ids: ["xiangxi", "gssp-guzhang", "gssp-jiangshan"],
  },
  "gssp-guzhang": {
    content_status: "complete",
    content_tier: "deep",
    hook: "古丈阶金钉子。苗岭统的第七阶在罗依溪。",
    formation_short:
      "岩石：寒武系碳质页岩与灰岩。构造：江南斜坡。钉子钉的是三叶虫 Lejopyge laevigata 首现。外力：沅水水系把剖面切出来。",
    what_you_see_today: "罗依溪保护剖面，可与附近红石林对照：层型是时间，石林是喀斯特。",
    observation_tips: ["黑色碳质页岩不要敲。", "把古丈阶和排碧阶的上下关系画下来。"],
    visible_rocks_minerals_fossils: [rock("碳质页岩", "黑、薄、易裂。化石在层面。只看。")],
    safety_notes: ["江边剖面注意水位。"],
    legal_notes: FOSSIL_LAW,
    related_site_ids: ["gssp-paibi", "xiangxi", "gssp-wuliu"],
  },
  "gssp-penglaitan": {
    content_status: "complete",
    content_tier: "deep",
    hook: "吴家坪阶金钉子。乐平统从红水河边开始。",
    formation_short:
      "岩石：二叠系硅质岩与灰岩。构造：深水斜坡到台地转换。钉子钉在来宾灰岩第 6k 层之底，标志是牙形石 Clarkina postbitteri postbitteri 的首现。外力：红水河把剖面切出来。",
    what_you_see_today:
      "来宾蓬莱滩。ICS 网页上的点在红水河边。2023 年有论文说原河边剖面自 2020 年起被淹，并建议改到同地新开挖的剖面。新点位本站没有。不要按图钉下到河里。",
    observation_tips: ["牙形石毫米级。现场看岩性，不要凿样。", "河岸如果还能看见，先看水位，再决定下不下。"],
    visible_rocks_minerals_fossils: [rock("硅质岩 / 灰岩", "硅质岩更暗更硬。灰岩不要在剖面上滴酸认。")],
    safety_notes: ["不要按旧河岸坐标下到红水河里。能开放的范围听当地管理。"],
    legal_notes: "GSSP 禁止取样。",
    related_site_ids: ["meishan", "gssp-pengchong"],
  },
  "gssp-pengchong": {
    content_status: "complete",
    content_tier: "deep",
    hook: "维宪阶金钉子。石炭纪第一颗阶一级的全球尺子，在柳州碰冲。",
    formation_short:
      "岩石：下石炭统灰岩。构造：华南稳定台地。钉子钉的是有孔虫 Eoparastaffella simplex 首现。外力：柳江水系暴露剖面。",
    what_you_see_today: "柳州北岸乡碰冲村南的科研保护剖面。有孔虫要薄片，现场只观察灰岩层序。",
    observation_tips: ["勿擅自进入农地剖壁。", "先联系当地自然资源管理部门。"],
    visible_rocks_minerals_fossils: [rock("石炭纪灰岩", "浅灰，中层，或见生物碎屑。")],
    safety_notes: ["农地剖壁不稳定，不要靠近。"],
    legal_notes: "科研保护剖面。禁止取样。",
    related_site_ids: ["gssp-penglaitan", "guilin-karst"],
  },
  "gssp-wuliu": {
    content_status: "complete",
    content_tier: "deep",
    hook: "乌溜阶金钉子。寒武系苗岭统的底界在剑河。",
    formation_short:
      "岩石：寒武系凯里组页岩与灰岩。构造：江南斜坡。钉子钉的是三叶虫 Oryctocephalus indicus 首现，定义苗岭统与乌溜阶底界。外力：抬升把乌溜–曾家崖剖面送到苗岭。",
    what_you_see_today: "剑河苗岭国家地质公园相关园区内的保护剖面。凯里生物群的特异埋藏在附近，不是挖掘现场。",
    observation_tips: ["层型点和化石产地要分开看。", "三叶虫层不对公众提供可发掘精度。"],
    visible_rocks_minerals_fossils: [rock("凯里组页岩", "深色细粒。化石在展陈里看。")],
    safety_notes: ["山区步道雨后滑。"],
    legal_notes: FOSSIL_LAW,
    related_site_ids: ["gssp-guzhang", "gssp-paibi"],
  },
};

export const deepGeosites: Record<string, Geosite[]> = {
  zhangjiajie: [
    g("zjj-jinbianxi", "zhangjiajie", "金鞭溪", 110.479, 29.327, "joint", "站在溪边步道，抬头看直立节理把砂岩切成墙。水走的是节理，不是溶沟。"),
    g("zjj-jinbianyan", "zhangjiajie", "金鞭岩", 110.486, 29.335, "pillar", "近乎四方的砂岩柱：截面是节理，高度是下切。"),
    g("zjj-yuanjiajie", "zhangjiajie", "袁家界", 110.448, 29.349, "peak", "从上方看峰林。平的远山是夷平面或方山残顶。"),
    g("zjj-tianzishan", "zhangjiajie", "天子山", 110.436, 29.389, "peak", "峰丛到峰林的过渡。看柱顶是否还连着平台。"),
    g("zjj-yangjiajie", "zhangjiajie", "杨家界", 110.409, 29.372, "peak", "更瘦的石柱，崩塌进行得更彻底。"),
    g("zjj-huangshizhai", "zhangjiajie", "黄石寨", 110.466, 29.365, "peak", "寨顶是平的。先认平台，再认被切出的边缘。"),
    g("zjj-shili", "zhangjiajie", "十里画廊", 110.501, 29.401, "pillar", "谷地看柱的侧面层理。软层凹、硬层出檐。"),
    g("zjj-bailong", "zhangjiajie", "百龙电梯剖面", 110.456, 29.341, "bedding", "垂直剖面：层理是平的，节理是立的。"),
    g("zjj-mihun", "zhangjiajie", "迷魂台", 110.443, 29.352, "peak", "俯视峰林密度，数巷谷走向。"),
    g("zjj-yubi", "zhangjiajie", "御笔峰", 110.434, 29.385, "pillar", "细柱。问：它为什么还没倒？"),
    g("zjj-diyiqiao", "zhangjiajie", "天下第一桥", 110.447, 29.348, "collapse", "天然石桥是崩塌残留的墙，不是溶蚀拱。"),
    g("zjj-heishazhai", "zhangjiajie", "鹞子寨", 110.495, 29.318, "peak", "相对安静的方山边缘，看节理组方向。"),
    g("zjj-shadaogou", "zhangjiajie", "砂刀沟", 110.47, 29.31, "joint", "巷谷内部。两侧壁几乎平行，节理控制。"),
    g("zjj-baofeng", "zhangjiajie", "宝峰湖", 110.512, 29.298, "other", "构造湖。对比砂岩区的水与石灰岩溶洞区的水。"),
    g("zjj-huanglongdong", "zhangjiajie", "黄龙洞（对照点）", 110.624, 29.362, "cave_speleothem", "石灰岩溶洞。用来对照：园内有喀斯特，峰林主体不是。", "area_only"),
    g("zjj-suoxi", "zhangjiajie", "索溪峪谷地", 110.527, 29.338, "other", "从谷地仰视峰林，理解下切深度。"),
  ],
  fangshan: [
    g("fs-shihua", "fangshan", "石花洞", 115.93, 39.8, "cave_speleothem", "看石旗、石花如何从滴水中生长。手不要碰。"),
    g("fs-shidu", "fangshan", "十渡拒马河谷", 115.6, 39.64, "other", "河谷切开的碳酸盐岩。北方喀斯特是峡谷。"),
    g("fs-zhoukoudian", "fangshan", "周口店猿人洞", 115.92, 39.69, "fossil_layer", "看洞穴堆积层位。化石只在展陈中出现。", "area_only"),
    g("fs-baishi", "fangshan", "白石山", 114.68, 39.25, "peak", "大理岩峰林。与石花洞白云岩互为对照。"),
    g("fs-yunshui", "fangshan", "云水洞", 115.82, 39.67, "cave_speleothem", "北方溶洞大厅。化学沉积形态对照。"),
    g("fs-museum", "fangshan", "周口店遗址博物馆", 115.925, 39.688, "other", "先把时间序列在馆里走一遍，再去洞口。"),
    g("fs-yesanpo", "fangshan", "野三坡对照", 115.25, 39.67, "other", "拒马河下游另一段碳酸盐岩峡谷。"),
    g("fs-shangfang", "fangshan", "上方山", 115.8, 39.65, "other", "碳酸盐岩与碎屑岩的接触。"),
  ],
  danxiashan: [
    g("dxs-zhanglao", "danxiashan", "长老峰", 113.741, 25.041, "peak", "定义地主峰。赤壁、层理、垂直节理一次看完。"),
    g("dxs-yangyuan", "danxiashan", "阳元石一带", 113.749, 25.033, "pillar", "崩塌残留的石柱。先看节理。"),
    g("dxs-xianglong", "danxiashan", "翔龙湖巷谷", 113.735, 25.048, "joint", "水沿节理切出的巷谷。"),
    g("dxs-jinjiang", "danxiashan", "锦江赤壁", 113.755, 25.055, "bedding", "从水上看红层水平层理。"),
    g("dxs-barzhai", "danxiashan", "巴寨", 113.72, 25.06, "peak", "方山。顶平、壁陡。"),
    g("dxs-shuangsha", "danxiashan", "石墙残脊", 113.738, 25.028, "joint", "残留的石墙，下一步会崩成柱。"),
    g("dxs-museum", "danxiashan", "丹霞山博物馆", 113.746, 25.05, "other", "先看定义，再上山。"),
  ],
  shilin: [
    g("sl-dashilin", "shilin", "大石林", 103.324, 24.781, "pillar", "剑状石林核心。沿溶沟看水如何扩宽裂隙。"),
    g("sl-xiaoshilin", "shilin", "小石林", 103.332, 24.789, "pillar", "稍矮、稍疏，同一过程不同切割程度。"),
    g("sl-naigu", "shilin", "乃古石林", 103.27, 24.812, "pillar", "更苍老的残柱。"),
    g("sl-zhiyun", "shilin", "芝云洞", 103.318, 24.77, "cave_speleothem", "地下对照：地表石林和溶洞是一套水。"),
    g("sl-changhu", "shilin", "长湖", 103.365, 24.74, "other", "岩溶湖。"),
    g("sl-wenbi", "shilin", "石芽带", 103.31, 24.795, "other", "还没长成高柱的石芽。"),
    g("sl-museum", "shilin", "石林地质博物馆", 103.328, 24.784, "other", "把二叠纪海和今天的石林接上。"),
  ],
  wudalianchi: [
    g("wdlc-laohei", "wudalianchi", "老黑山火山口", 126.122, 48.739, "lava", "新期渣锥。站在口沿上看内壁。"),
    g("wdlc-huoshao", "wudalianchi", "火烧山", 126.163, 48.753, "lava", "另一座新期火山。"),
    g("wdlc-shengli", "wudalianchi", "熔岩台地翻花石", 126.18, 48.72, "lava", "表壳破碎的熔岩。"),
    g("wdlc-rope", "wudalianchi", "绳状熔岩", 126.19, 48.71, "lava", "表冷内流留下的绳纹。方向=当时流向。"),
    g("wdlc-sanzuokou", "wudalianchi", "三池湖岸", 126.21, 48.7, "other", "堰塞湖岸。找对面的熔岩坝。"),
    g("wdlc-yaoquan", "wudalianchi", "药泉山", 126.18, 48.67, "other", "矿泉与火山机构的关系。"),
    g("wdlc-wenbo", "wudalianchi", "火山地质博物馆", 126.16, 48.66, "other", "先把 1719–1721 年谱看完。"),
    g("wdlc-weishan", "wudalianchi", "尾山远眺", 126.25, 48.78, "lava", "老期火山，对照新期锥体的植被。"),
  ],
  hongkong: [
    g("hk-highisland", "hongkong", "万宜水库东坝", 114.353, 22.357, "joint", "六角柱状节理最清楚的公共点之一。"),
    g("hk-pobian", "hongkong", "破边洲", 114.372, 22.342, "joint", "海蚀把柱状节理洗成海蚀柱。必须看潮汐。", "area_only"),
    g("hk-ungkong", "hongkong", "瓮缸群岛远眺", 114.38, 22.33, "joint", "远眺酸性岩柱状节理的规模。", "area_only"),
    g("hk-tungpingchau", "hongkong", "东平洲", 114.289, 22.541, "bedding", "沉积岩园区。层理、波痕与断层。"),
    g("hk-visitor", "hongkong", "西贡火山岩园区游客中心", 114.335, 22.382, "other", "先搞清两个园区再出发。"),
    g("hk-laichiwo", "hongkong", "荔枝窝一带海岸", 114.267, 22.527, "other", "沉积岩差异侵蚀。", "area_only"),
  ],
  chengjiang: [
    g("cj-museum", "chengjiang", "澄江化石地博物馆", 102.977, 24.669, "fossil_layer", "典型标本在柜子里。野外不提供可挖点。", "area_only"),
    g("cj-section", "chengjiang", "保护剖面观景", 102.99, 24.66, "bedding", "看页岩层面和保护棚。不要走近剖壁。", "area_only"),
    g("cj-fuxian", "chengjiang", "抚仙湖对照", 102.95, 24.5, "other", "湖是今天的水，化石层是寒武纪的海。", "area_only"),
  ],
  zigong: [
    g("zg-dashanpu", "zigong", "大山铺发掘现场大厅", 104.778, 29.339, "fossil_layer", "骨头还在砂岩里。看埋藏姿态。", "area_only"),
    g("zg-museum", "zigong", "恐龙博物馆装架厅", 104.776, 29.337, "other", "把现场的散骨在脑子里装配回去。", "area_only"),
    g("zg-shaximiao", "zigong", "沙溪庙组解说", 104.78, 29.34, "bedding", "河湖相砂岩–泥岩互层。", "area_only"),
  ],
  changshan: [
    g("cs-park", "changshan", "黄泥塘园区入口", 118.51, 28.9, "other", "先取导览，确认层型点开放情况。"),
    g("cs-section-view", "changshan", "奥陶系剖面远观", 118.5, 28.88, "bedding", "从栈道看层的颜色分带。", "area_only"),
    g("cs-gssp-link", "changshan", "通往金钉子栈道", 118.495, 28.87, "other", "金钉子是独立的点，从这里连过去。"),
  ],
  "gssp-huangnitang": [
    g("hnt-gssp", "gssp-huangnitang", "黄泥塘层型点", 118.49, 28.86, "bedding", "层型标志处。看层号和解说，不取样。", "area_only"),
    g("hnt-graptolite", "gssp-huangnitang", "笔石层观景", 118.491, 28.861, "fossil_layer", "深色层面上的笔石印痕。手背在身后。", "area_only"),
    g("hnt-board", "gssp-huangnitang", "金钉子解说牌", 118.492, 28.862, "other", "把达瑞威尔阶在国际地层表上的位置记下来。", "area_only"),
  ],
  meishan: [
    g("ms-section", "meishan", "煤山 D 剖面保护廊", 119.705, 31.079, "bedding", "一廊两钉。先找长兴阶底，再找 PT 界线。", "area_only"),
    g("ms-museum", "meishan", "煤山金钉子博物馆", 119.71, 31.08, "other", "牙形石照片和薄片。", "area_only"),
    g("ms-pt", "meishan", "二叠–三叠系界线标志", 119.705, 31.08, "bedding", "颜色和岩性转换。灭绝写在很薄的一层附近。", "area_only"),
  ],
  jixian: [
    g("jx-wumishan", "jixian", "雾迷山组叠层石", 117.41, 40.2, "stromatolite", "穹状纹层。凸起朝上。", "area_only"),
    g("jx-changcheng", "jixian", "长城系碎屑岩", 117.38, 40.18, "bedding", "剖面下部的砂岩与页岩。", "area_only"),
    g("jx-overview", "jixian", "中上元古界总剖面", 117.42, 40.21, "bedding", "把组名按从老到新走一遍。", "area_only"),
    g("jx-museum", "jixian", "蓟县地质博物馆", 117.4, 40.05, "other", "把十亿年压缩成展板，再去现场对层。"),
  ],
  sheshan: [
    g("ss-west", "sheshan", "西佘山", 121.187, 31.096, "lava", "上海陆上最高点附近。找浅色火山岩，不是土。"),
    g("ss-east", "sheshan", "东佘山露头", 121.204, 31.094, "lava", "另一座锥。确认九峰是一组火山丘。"),
    g("ss-observatory", "sheshan", "天文台一带基岩", 121.192, 31.099, "other", "建筑脚下的块状火山岩。填土不会是这样。"),
    g("ss-tianmashan", "sheshan", "天马山对照", 121.158, 31.082, "other", "松郡九峰的另一座。同一套白垩纪火山岩。"),
  ],
  "gssp-jiangshan": [
    g("js-board", "gssp-jiangshan", "江山阶解说牌", 118.6148, 28.8163, "other", "先把芙蓉统江山阶在国际地层表上的位置记下来。", "area_only"),
    g("js-section", "gssp-jiangshan", "碓边 B 剖面", 118.6148, 28.8163, "bedding", "层型标志处。看层号，不取样。", "area_only"),
    g("js-trilo", "gssp-jiangshan", "三叶虫层观景", 118.616, 28.817, "fossil_layer", "球接子三叶虫印在层面上。手背在身后。", "area_only"),
  ],
  "gssp-huanghuachang": [
    g("hhc-board", "gssp-huanghuachang", "大坪阶解说", 111.37, 30.86, "other", "中奥陶统的底从这里数起。", "area_only"),
    g("hhc-section", "gssp-huanghuachang", "黄花场层型点", 111.37, 30.86, "bedding", "看灰岩颜色转换。牙形石在显微镜里。", "area_only"),
    g("hhc-view", "gssp-huanghuachang", "剖面远观", 111.371, 30.861, "bedding", "从步道看层的连续性。", "area_only"),
  ],
  "gssp-wangjiawan": [
    g("wjw-board", "gssp-wangjiawan", "赫南特阶解说", 111.42, 30.98, "other", "冰期写在这一层附近。", "area_only"),
    g("wjw-section", "gssp-wangjiawan", "王家湾层型点", 111.42, 30.98, "bedding", "黑色笔石页岩。不要掰。", "area_only"),
    g("wjw-graptolite", "gssp-wangjiawan", "笔石层观景", 111.421, 30.981, "fossil_layer", "层面上的锯齿状印痕。只看。", "area_only"),
  ],
  "gssp-paibi": [
    g("pb-board", "gssp-paibi", "排碧阶解说", 109.5257, 28.3895, "other", "芙蓉统从这里开始。SPICE 写在化学里。", "area_only"),
    g("pb-section", "gssp-paibi", "排碧层型点", 109.5257, 28.3895, "bedding", "花桥组灰岩。看层，不取样。", "area_only"),
    g("pb-park", "gssp-paibi", "湘西地质公园对照", 109.53, 28.392, "other", "园是保护罩，钉子是尺子。", "area_only"),
  ],
  "gssp-guzhang": [
    g("gz-board", "gssp-guzhang", "古丈阶解说", 109.9647, 28.72, "other", "苗岭统第七阶。", "area_only"),
    g("gz-section", "gssp-guzhang", "罗依溪层型点", 109.9647, 28.72, "bedding", "碳质页岩与灰岩。不要敲。", "area_only"),
    g("gz-red", "gssp-guzhang", "红石林对照", 109.97, 28.722, "other", "层型是时间，石林是喀斯特。两套过程。", "area_only"),
  ],
  "gssp-penglaitan": [
    g("plt-board", "gssp-penglaitan", "吴家坪阶解说", 109.3211, 23.6953, "other", "乐平统的底。", "area_only"),
    g("plt-section", "gssp-penglaitan", "蓬莱滩层型点", 109.3211, 23.6953, "bedding", "硅质岩到灰岩的转换。这是 ICS 网页上的老坐标，不要据此下河。", "area_only"),
    g("plt-river", "gssp-penglaitan", "红水河远观", 109.322, 23.696, "other", "只在开放的高处看河。不要下到被淹的旧剖面。", "area_only"),
  ],
  "gssp-pengchong": [
    g("pc-board", "gssp-pengchong", "维宪阶解说", 109.45, 24.433, "other", "石炭纪阶一级的尺子。", "area_only"),
    g("pc-section", "gssp-pengchong", "碰冲层型点远观", 109.45, 24.433, "bedding", "灰岩层序。有孔虫要薄片。", "area_only"),
    g("pc-note", "gssp-pengchong", "保护说明", 109.451, 24.434, "other", "科研剖面。先问管理部门，勿入农地剖壁。", "area_only"),
  ],
  "gssp-wuliu": [
    g("wl-board", "gssp-wuliu", "乌溜阶解说", 108.4138, 26.7474, "other", "苗岭统的底界。", "area_only"),
    g("wl-section", "gssp-wuliu", "乌溜–曾家崖层型点", 108.4138, 26.7474, "bedding", "凯里组。看层，不挖。", "area_only"),
    g("wl-museum", "gssp-wuliu", "剑河地质展示", 108.42, 26.75, "fossil_layer", "凯里生物群在柜子里。", "area_only"),
  ],
};

function route(
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

export const deepRoutes: Record<string, Route[]> = {
  zhangjiajie: [
    route("zjj-half", "zhangjiajie", "金鞭溪–袁家界：从巷谷走到方山", "一日", "中，台阶多", ["zjj-jinbianxi", "zjj-jinbianyan", "zjj-bailong", "zjj-yuanjiajie", "zjj-mihun", "zjj-diyiqiao"], "武陵源门票站入。先走在节理里，再站到夷平面上。", "这一天把演化序列走完一半。", 12, 600),
    route("zjj-contrast", "zhangjiajie", "黄龙洞对照半日", "半日", "低", ["zjj-huanglongdong"], "索溪峪方向。溶洞单独售票，以官方为准。", "只为对照：溶洞是灰岩，峰林是砂岩。"),
  ],
  changshan: [
    route("cs-park-walk", "changshan", "常山园：从入口走到金钉子栈道", "半日", "低至中", ["cs-park", "cs-section-view", "cs-gssp-link"], "衢州常山县城至黄泥塘。", "园是保护罩。金钉子是独立的点，从栈道连过去。"),
  ],
  sheshan: [
    route("ss-loop", "sheshan", "东西佘山：平原上的火山锥", "半日", "低", ["ss-west", "ss-hills"], "地铁或公交到佘山。沿开放步道走。", "把浅色基岩拍下来。对照：流纹岩/凝灰岩，不是花岗岩。", 6, 100),
  ],
  meishan: [
    route("ms-gssp", "meishan", "煤山：一剖两钉", "3 小时", "低", ["ms-museum", "ms-section", "ms-pt"], "长兴县城出发。先馆后廊。", "把长兴阶底和 PT 界线的上下关系画在笔记本上。"),
  ],
  "gssp-huangnitang": [
    route("hnt-walk", "gssp-huangnitang", "黄泥塘层型栈道", "2–3 小时", "低至中", ["hnt-board", "hnt-gssp", "hnt-graptolite"], "常山县城至黄泥塘。门票以官方为准。", "带一张国际地层表的截图，把达瑞威尔阶指给自己看。"),
  ],
  fangshan: [
    route("fs-cave-day", "fangshan", "石花洞 + 周口店", "一日", "低", ["fs-shihua", "fs-museum", "fs-zhoukoudian"], "北京西南，可一日串。", "上午看水如何长成石头，下午看人如何走进洞穴地层。"),
  ],
  shilin: [
    route("sl-core", "shilin", "大小石林：溶蚀几何", "半日到一日", "低至中", ["sl-museum", "sl-dashilin", "sl-xiaoshilin", "sl-wenbi"], "石林景区大门。建议早入，侧光让溶沟更清楚。", "每根柱子问一次：水从哪条裂缝进来？"),
  ],
  wudalianchi: [
    route("wdlc-new", "wudalianchi", "新期火山：口沿与熔岩流", "一日", "中", ["wdlc-wenbo", "wdlc-laohei", "wdlc-huoshao", "wdlc-rope", "wdlc-shengli"], "五大连池风景区。先博物馆后上山。", "把 1721 年的熔岩流在地图上画出来，湖是被它挡住的。"),
  ],
  hongkong: [
    route("hk-column", "hongkong", "西贡柱状节理（观潮）", "半日到一日", "中，取决于是否下岸", ["hk-visitor", "hk-highisland", "hk-pobian"], "西贡出发。东坝可公共交通。海上部分以官方导赏为准。", "出发前查潮汐。"),
  ],
  chengjiang: [
    route("cj-museum-day", "chengjiang", "澄江：馆与保护剖面", "半日", "低", ["cj-museum", "cj-section"], "昆明出发至澄江。只走开放点。", "不要问哪里可以挖。"),
  ],
  zigong: [
    route("zg-museum-day", "zigong", "大山铺遗址与博物馆", "半日到一日", "低", ["zg-dashanpu", "zg-museum", "zg-shaximiao"], "自贡市区到东北郊博物馆。", "在遗址大厅停够二十分钟。"),
  ],
  jixian: [
    route("jx-section", "jixian", "蓟县剖面半日", "半日到一日", "中，沿路步行", ["jx-museum", "jx-changcheng", "jx-wumishan", "jx-overview"], "天津蓟州区。建议先博物馆后剖面。", "按从老到新走。叠层石只看纹层方向。"),
  ],
  danxiashan: [
    route("dxs-define", "danxiashan", "定义地：长老峰与巷谷", "一日", "中", ["dxs-museum", "dxs-zhanglao", "dxs-xianglong", "dxs-jinjiang"], "韶关仁化，丹霞山景区大门。", "把红层、节理、崩塌各拍一张。"),
  ],
  "gssp-jiangshan": [
    route("js-walk", "gssp-jiangshan", "碓边层型", "2 小时", "低", ["js-board", "js-section", "js-trilo"], "江山市区出发。确认开放后再进。", "带一张寒武系地层表。"),
  ],
  "gssp-huanghuachang": [
    route("hhc-walk", "gssp-huanghuachang", "黄花场层型", "2 小时", "低", ["hhc-board", "hhc-section", "hhc-view"], "宜昌黄花场。可与王家湾连走。", "牙形石在显微镜里，现场看层。"),
  ],
  "gssp-wangjiawan": [
    route("wjw-walk", "gssp-wangjiawan", "王家湾赫南特阶", "2 小时", "低", ["wjw-board", "wjw-section", "wjw-graptolite"], "宜昌王家湾。建议先黄花场后这里。", "冰期写在黑色页岩里。"),
  ],
  "gssp-paibi": [
    route("pb-walk", "gssp-paibi", "排碧层型", "半日", "低至中", ["pb-board", "pb-section", "pb-park"], "花垣排碧，湘西世界地质公园范围内。", "层型是尺子，园是保护罩。"),
  ],
  "gssp-guzhang": [
    route("gz-walk", "gssp-guzhang", "罗依溪层型", "半日", "低", ["gz-board", "gz-section", "gz-red"], "古丈罗依溪。可与排碧连看。", "不要把红石林和金钉子当成同一件事。"),
  ],
  "gssp-penglaitan": [
    route("plt-walk", "gssp-penglaitan", "蓬莱滩层型", "2–3 小时", "低", ["plt-board", "plt-section", "plt-river"], "来宾。先问当地还开不开河边。", "不要按老坐标下到红水河里。"),
  ],
  "gssp-pengchong": [
    route("pc-walk", "gssp-pengchong", "碰冲层型（需许可）", "2 小时", "低", ["pc-board", "pc-section", "pc-note"], "柳州北岸乡。先问管理部门。", "不要把科研剖面当成农地景点。"),
  ],
  "gssp-wuliu": [
    route("wl-walk", "gssp-wuliu", "乌溜层型", "半日", "低至中", ["wl-board", "wl-section", "wl-museum"], "剑河苗岭相关园区。只走开放点。", "化石在柜子里。"),
  ],
};

function visit(partial: Partial<VisitInfo> & { site_id: string }): VisitInfo {
  return {
    is_ticketed: "unknown",
    price_note: "以官方当日为准。本站不售票。",
    opening_hours: "以园区当日公告为准",
    peak_season: "暑期与节假日",
    closed_days: "以官方公告为准",
    reservation_required: "unknown",
    free_policy: "优惠仅摘官方公开信息，出行前再查一次。",
    official_ticket_url: "",
    backup_ticket_urls: [],
    transport: "",
    best_season: "春秋侧光好，层理清楚。",
    info_updated_on: "2026-04-20",
    ...partial,
  };
}

export const deepVisits: Record<string, Partial<VisitInfo>> = {
  zhangjiajie: visit({
    site_id: "zhangjiajie",
    is_ticketed: true,
    price_note: "武陵源核心景区需购票，黄龙洞等另计。价格以官方当日为准。",
    official_ticket_url: "https://www.zjj.gov.cn/",
    transport: "张家界荷花机场或高铁站转武陵源。百龙电梯、环保车以园区当日为准。",
    best_season: "春秋侧光看层理；雨后节理更清楚。盛夏防暴雨落石。",
    reservation_required: true,
  }),
  fangshan: visit({
    site_id: "fangshan",
    is_ticketed: true,
    price_note: "石花洞、周口店、十渡、白石山分别售票，不是一张通票。以各园区官方当日为准。",
    official_ticket_url: "https://www.fangshangeopark.com/",
    transport: "北京西南。石花洞、周口店可公交或自驾；白石山在河北涞源。",
  }),
  danxiashan: visit({
    site_id: "danxiashan",
    is_ticketed: true,
    price_note: "丹霞山景区收费。以官方当日为准。",
    official_ticket_url: "https://www.danxiashan.org.cn/",
    transport: "韶关仁化。高铁韶关站转车。",
  }),
  shilin: visit({
    site_id: "shilin",
    is_ticketed: true,
    price_note: "石林风景区收费。以官方当日为准。",
    official_ticket_url: "https://www.chinashilin.com/",
    transport: "昆明市区至石林，有旅游专线。建议早入，侧光让溶沟更清楚。",
  }),
  wudalianchi: visit({
    site_id: "wudalianchi",
    is_ticketed: true,
    price_note: "风景区收费，部分火山口另计。以官方当日为准。",
    transport: "黑河五大连池。夏季可进入，冬季路面结冰。",
    best_season: "夏秋看新期熔岩与植被对照。",
  }),
  hongkong: visit({
    site_id: "hongkong",
    is_ticketed: false,
    price_note: "免费开放。万宜水库东坝等公共点无需门票；海上导赏另行报名。以官方当日为准。",
    official_ticket_url: "https://www.geopark.gov.hk/",
    transport: "西贡出发。东坝可公共交通。出发前查潮汐。",
    best_season: "秋冬潮位与能见度较好。台风季不要下岸。",
  }),
  chengjiang: visit({
    site_id: "chengjiang",
    is_ticketed: true,
    price_note: "博物馆收费。野外保护剖面按指定路线。以官方当日为准。",
    transport: "昆明至澄江。只走开放点。",
  }),
  zigong: visit({
    site_id: "zigong",
    is_ticketed: true,
    price_note: "恐龙博物馆收费。以官方当日为准。",
    official_ticket_url: "http://www.zdm.cn/",
    transport: "自贡市区到东北郊大山铺。",
  }),
  changshan: visit({
    site_id: "changshan",
    is_ticketed: true,
    price_note: "常山地质公园收费。金钉子剖面是否开放以官方当日为准。",
    transport: "衢州常山。县城至黄泥塘。",
  }),
  "gssp-huangnitang": visit({
    site_id: "gssp-huangnitang",
    is_ticketed: true,
    price_note: "通常随常山地质公园参观。以官方当日为准。",
    transport: "常山县城至黄泥塘。",
  }),
  meishan: visit({
    site_id: "meishan",
    is_ticketed: true,
    price_note: "煤山金钉子公园 / 博物馆收费。以官方当日为准。",
    transport: "湖州长兴县城出发。",
  }),
  jixian: visit({
    site_id: "jixian",
    is_ticketed: "unknown",
    price_note: "部分剖面沿公路可看；博物馆是否收费以官方当日为准。免费路段不代表可以凿石。",
    transport: "天津蓟州区。建议先博物馆后剖面。",
  }),
  sheshan: visit({
    site_id: "sheshan",
    is_ticketed: true,
    price_note:
      "西佘山国家森林公园核心景区通常收费；山体露头在步道上即可观察。佘山不是国家地质公园。以官方当日为准。",
    transport: "地铁 9 号线佘山站。先西后东。",
    best_season: "冬春落叶后基岩更清楚。",
  }),
  chongming: visit({
    site_id: "chongming",
    is_ticketed: false,
    price_note: "崇明岛国家地质公园主体区域免费开放。若遇临时管制，以现场为准。",
    transport: "上海至崇明，长江隧桥或轮渡。",
  }),
};

