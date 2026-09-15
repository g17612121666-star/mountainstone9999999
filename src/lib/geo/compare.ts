export interface CompareSide {
  site_id: string;
  title_zh: string;
  title_en: string;
  formed_zh: string;
  formed_en: string;
}

export interface CompareCard {
  id: string;
  title_zh: string;
  title_en: string;
  alike_zh: string;
  alike_en: string;
  split_zh: string;
  split_en: string;
  sides: CompareSide[];
}

export const COMPARE: CompareCard[] = [
  {
    id: "danxia-zhangye-zhangjiajie",
    title_zh: "丹霞山赤壁巷谷 ≠ 张掖彩丘 ≠ 张家界石英砂岩峰林",
    title_en: "Danxiashan cliffs ≠ Zhangye colourful hills ≠ Zhangjiajie quartz-sandstone pillars",
    alike_zh: "三处都是陡的、有颜色的柱或崖，照片里容易被写成「丹霞」。",
    alike_en: "All three are steep and coloured. Photographs get captioned “Danxia” for all of them.",
    split_zh:
      "丹霞山：红层 + 垂直节理 + 崩塌，滴酸通常不起泡。张掖：干旱区河湖相彩丘，风和间歇洪水切软层，没有丹霞那套巷谷。张家界：石英砂岩，夷平面被节理切成近方形柱，滴酸不起泡，不是喀斯特。",
    split_en:
      "Danxiashan: red beds + vertical joints + collapse; acid usually does not fizz. Zhangye: arid lacustrine colourful hills cut by wind and flash floods — no Danxia alleyways. Zhangjiajie: quartz sandstone, a planation surface jointed into near-square pillars; no fizz, not karst.",
    sides: [
      {
        site_id: "danxiashan",
        title_zh: "丹霞山",
        title_en: "Danxiashan",
        formed_zh: "白垩–古近纪红层被抬升，垂直节理把墙切开，硬层出檐、软层凹进，再崩成巷谷和方山。",
        formed_en: "Cretaceous–Palaeogene red beds lifted, vertical joints cutting walls, hard ledges and soft recesses, then collapse into alleyways and mesas.",
      },
      {
        site_id: "zhangye",
        title_zh: "张掖彩丘",
        title_en: "Zhangye hills",
        formed_zh: "干旱区河湖相砂泥岩的氧化还原色带。外力是风和间歇洪水，不是垂直节理崩塌。",
        formed_en: "Redox colour bands in arid lacustrine sandstone–mudstone. The agent is wind and flash floods, not joint-controlled collapse.",
      },
      {
        site_id: "zhangjiajie",
        title_zh: "张家界",
        title_en: "Zhangjiajie",
        formed_zh: "泥盆纪石英砂岩先被削成夷平面，再沿垂直节理崩成方山、石墙、峰林。不是灰岩，不是红层。",
        formed_en: "Devonian quartz sandstone planed flat, then collapsed along vertical joints into mesas, walls and pillars. Not limestone, not red beds.",
      },
    ],
  },
  {
    id: "south-north-karst",
    title_zh: "南方峰林喀斯特 ≠ 房山–十渡北方河谷喀斯特",
    title_en: "Southern fenglin karst ≠ Fangshan–Shidu northern valley karst",
    alike_zh: "都是碳酸盐岩被水拆掉，都有溶洞。远看都是「石头山」。",
    alike_en: "Both are carbonate taken apart by water, both have caves. From far away they are just “stone mountains”.",
    split_zh:
      "桂林：湿润区峰林平原，峰孤立在溶蚀平原上。房山–十渡：雾迷山组白云岩，层理近水平，拒马河把山切成弯谷，洞小、石花密、没有峰林平原。滴酸：白云岩弱于灰岩。",
    split_en:
      "Guilin: a wet-tropical fenglin plain, peaks standing on a dissolution flat. Fangshan–Shidu: Wumishan dolostone, near-horizontal beds, the Juma River bending through the hills; smaller caves, denser stone flowers, no fenglin plain. Acid: dolostone fizzes less than limestone.",
    sides: [
      {
        site_id: "guilin-karst",
        title_zh: "桂林峰林",
        title_en: "Guilin fenglin",
        formed_zh: "湿润气候下灰岩被溶成孤立峰，峰间是溶蚀平原。",
        formed_en: "Limestone dissolved in a wet climate into isolated peaks on a dissolution plain.",
      },
      {
        site_id: "fangshan",
        title_zh: "房山 / 十渡",
        title_en: "Fangshan / Shidu",
        formed_zh: "中元古代白云岩被抬升后，河流沿近水平层理下切。溶洞发育慢，石花更密。",
        formed_en: "Mesoproterozoic dolostone lifted, then a river incising near-horizontal beds. Caves grow slowly; stone flowers are denser.",
      },
    ],
  },
  {
    id: "caldera-dam",
    title_zh: "长白山天池（破火山口） ≠ 镜泊湖（熔岩堰塞）",
    title_en: "Changbaishan Tianchi (caldera) ≠ Jingpohu (lava-dammed lake)",
    alike_zh: "都是东北的大湖，岸边都有火山岩，都常被写成「火山口湖」。",
    alike_en: "Both are large lakes in the northeast, both sit with volcanic rock, both get captioned “crater lake”.",
    split_zh:
      "天池：复式火山岩浆房顶塌陷，湖在破火山口里，水面大致圆。镜泊湖：玄武岩流堵住牡丹江，湖是长条形的堰塞，地下森林是被熔岩覆住的树。一个是塌，一个是堵。",
    split_en:
      "Tianchi: a compound volcano whose magma-chamber roof collapsed; the lake sits in a caldera and is roughly round. Jingpohu: basalt dammed the Mudanjiang; the lake is an elongate lava dam, and the underground forest is trees buried by lava. One collapsed; one blocked.",
    sides: [
      {
        site_id: "changbaishan",
        title_zh: "长白山天池",
        title_en: "Changbaishan Tianchi",
        formed_zh: "粗面岩–碱流岩复式火山，喷发后岩浆房顶塌成破火山口，水填成湖。",
        formed_en: "A trachyte–pantellerite compound volcano. After eruption the chamber roof collapsed; water filled the caldera.",
      },
      {
        site_id: "jingpohu",
        title_zh: "镜泊湖",
        title_en: "Jingpohu",
        formed_zh: "玄武岩流堵住牡丹江。湖是堰塞，不是火口。",
        formed_en: "Basalt flows dammed the Mudanjiang. The lake is a dam, not a crater.",
      },
    ],
  },
  {
    id: "sheshan-chongming",
    title_zh: "佘山城市火山锥 ≠ 国家地质公园（崇明岛才是上海的国家地质公园）",
    title_en: "Sheshan urban volcanic hill ≠ a national geopark (Chongming Island is Shanghai’s)",
    alike_zh: "都在上海，都常被问「上海的地质公园在哪儿」。佘山有教堂和天文台，照片更像景区。",
    alike_en: "Both sit in Shanghai. Both get asked “where is the geopark?”. Sheshan’s church and observatory make tourist photographs.",
    split_zh:
      "佘山：白垩纪碱性火山岩残丘，流纹质–粗面质凝灰和熔岩，城市地质点，不是花岗岩，不是国家地质公园。崇明：全新世长江口沙岛，还在长，潮滩和潮沟，上海的国家地质公园在这里。脚下是沙还是火山岩，一问就分开。",
    split_en:
      "Sheshan: a Cretaceous alkaline volcanic remnant — rhyolitic to trachytic tuff and lava — an urban geosite, not granite, not a national geopark. Chongming: a Holocene Yangtze-mouth sand island, still growing, tidal flats and creeks. This is Shanghai’s national geopark. Ask what is underfoot: sand or volcanic rock.",
    sides: [
      {
        site_id: "sheshan",
        title_zh: "佘山",
        title_en: "Sheshan",
        formed_zh: "白垩纪沿海火山带的孤立残丘。凝灰和熔岩，不是花岗岩。",
        formed_en: "An isolated hill of the Cretaceous coastal volcanic belt. Tuff and lava, not granite.",
      },
      {
        site_id: "chongming",
        title_zh: "崇明岛",
        title_en: "Chongming Island",
        formed_zh: "长江把泥沙送到口门，潮汐再塑成沙岛。没有溶洞，没有火山口。",
        formed_en: "The Yangtze delivers silt to the mouth; tides reshape a sand island. No caves, no craters.",
      },
    ],
  },
  {
    id: "granite-danxia",
    title_zh: "花岗岩球状风化峰林 ≠ 丹霞方山",
    title_en: "Granite tors and peaks ≠ Danxia mesas",
    alike_zh: "都是陡的石峰，都有垂直裂隙，远看都像「石林」。",
    alike_en: "Both are steep stone peaks with vertical cracks. From far away both look like a “stone forest”.",
    split_zh:
      "黄山：粗粒石英+钾长石的花岗岩，节理加球状风化成石蛋和瘦柱。丹霞山：红层砂砾岩，硬层出檐、软层凹进，没有花岗斑晶。摸颗粒：粗晶是花岗岩，胶结砂砾是丹霞。",
    split_en:
      "Huangshan: coarse quartz + K-feldspar granite; joints plus spheroidal weathering make tors and thin pillars. Danxiashan: red-bed sandstone and conglomerate; hard ledges, soft recesses, no granite phenocrysts. Feel the grain: coarse crystals are granite; cemented sand and pebbles are Danxia.",
    sides: [
      {
        site_id: "huangshan",
        title_zh: "黄山花岗岩",
        title_en: "Huangshan granite",
        formed_zh: "燕山期花岗岩被抬升剥露，垂直节理和球状风化把岩体拆成峰和石蛋。",
        formed_en: "Yanshanian granite unroofed; vertical joints and spheroidal weathering take the pluton apart into peaks and tors.",
      },
      {
        site_id: "danxiashan",
        title_zh: "丹霞方山",
        title_en: "Danxia mesas",
        formed_zh: "红层被垂直节理切开再崩塌，留下平顶方山。原料是沉积岩，不是岩浆岩。",
        formed_en: "Red beds jointed and collapsed, leaving flat-topped mesas. The rock is sedimentary, not igneous.",
      },
    ],
  },
  {
    id: "tiankeng-maar",
    title_zh: "乐业–凤山天坑 ≠ 湖光岩玛珥湖",
    title_en: "Leye–Fengshan tiankeng ≠ Huguangyan maar",
    alike_zh: "都是圆坑、都有水，照片里都像「塌出来的湖」。",
    alike_en: "Both are round pits with water. Photographs get captioned as a collapsed lake.",
    split_zh:
      "天坑：地下河顶板在碳酸盐岩里大规模塌出来，围岩会滴酸起泡。玛珥：地下水遇上岩浆爆炸留下的圆坑，岸是火山碎屑，滴酸不起泡。一个是溶了再塌，一个是炸。",
    split_en:
      "A tiankeng is the roof of an underground river collapsing in carbonate — acid fizzes. A maar is a round crater from groundwater meeting magma; the rim is volcanic debris and does not fizz. One dissolved, then fell; one exploded.",
    sides: [
      {
        site_id: "leye-fengshan",
        title_zh: "乐业–凤山天坑",
        title_en: "Leye–Fengshan tiankeng",
        formed_zh: "灰岩被地下河掏空，顶板一次性塌出大坑。围岩是碳酸盐岩。",
        formed_en: "Limestone hollowed by an underground river; the roof collapsed in one go. The wall rock is carbonate.",
      },
      {
        site_id: "huguangyan",
        title_zh: "湖光岩玛珥",
        title_en: "Huguangyan maar",
        formed_zh: "雷琼裂谷里，地下水与岩浆相遇爆炸。圆湖，岸是碎屑，不是灰岩。",
        formed_en: "In the Leiqiong rift, groundwater met magma and exploded. A round lake whose rim is debris, not limestone.",
      },
    ],
  },
  {
    id: "yardang-danxia",
    title_zh: "敦煌雅丹 ≠ 丹霞山赤壁",
    title_en: "Dunhuang yardang ≠ Danxiashan cliffs",
    alike_zh: "都是被切开的陡壁和土柱，颜色都可以发红，远看都像「风切出来的城」。",
    alike_en: "Both are steep walls and pillars, often reddish. From far away both look like a city cut by wind.",
    split_zh:
      "雅丹：干旱区河湖相砂泥岩，主导外力是定向风蚀，脊线顺风向。丹霞：红层 + 垂直节理 + 崩塌，硬层出檐、软层凹进，有巷谷和方山。敦煌没有丹霞那套节理崩塌。",
    split_en:
      "Yardang: arid lacustrine sand–mudstone, carved by directional wind, ridges aligned with the wind. Danxia: red beds + vertical joints + collapse; hard ledges, soft recesses, alleyways and mesas. Dunhuang does not have that joint-collapse sequence.",
    sides: [
      {
        site_id: "dunhuang",
        title_zh: "敦煌雅丹",
        title_en: "Dunhuang yardang",
        formed_zh: "古湖相被定向风削成垄槽。先认风向，再认层理。",
        formed_en: "Old lake beds planed into ridges and troughs by directional wind. Read the wind first, then the bedding.",
      },
      {
        site_id: "danxiashan",
        title_zh: "丹霞山",
        title_en: "Danxiashan",
        formed_zh: "红层被垂直节理切开再崩塌。这是定义地，不是风城。",
        formed_en: "Red beds jointed and collapsed. This is the type locality, not a wind city.",
      },
    ],
  },
  {
    id: "acid-basalt-columns",
    title_zh: "香港酸性岩柱状节理 ≠ 五大连池玄武岩柱状节理",
    title_en: "Hong Kong acid-rock columns ≠ Wudalianchi basalt columns",
    alike_zh: "都是多边形石柱，照片里都写成「玄武岩柱状节理」。",
    alike_en: "Both are polygonal stone columns. Photographs get captioned “basalt columnar jointing” for both.",
    split_zh:
      "柱状节理是冷却收缩切出来的，酸性熔结凝灰岩和流纹岩也能长。香港西贡等地是酸性岩柱，浅色、斑晶可见。五大连池是玄武岩，暗色、气孔。颜色和斑晶先分开，再谈柱。",
    split_en:
      "Columnar joints are cooling-contraction cracks. Acid welded tuff and rhyolite can grow them too. Sai Kung in Hong Kong is acid rock — pale, with phenocrysts. Wudalianchi is basalt — dark, vesicular. Name colour and crystals before you name the columns.",
    sides: [
      {
        site_id: "hongkong",
        title_zh: "香港酸性岩柱",
        title_en: "Hong Kong acid columns",
        formed_zh: "白垩纪酸性火山岩冷却收缩。浅色柱，不是玄武岩专属。",
        formed_en: "Cretaceous acid volcanic rock cooling and contracting. Pale columns — not a basalt franchise.",
      },
      {
        site_id: "wudalianchi",
        title_zh: "五大连池玄武岩",
        title_en: "Wudalianchi basalt",
        formed_zh: "第四纪玄武岩流。暗色、气孔、渣锥。柱状节理只是冷却的一种。",
        formed_en: "Quaternary basalt flows. Dark, vesicular, scoria cones. Columns are just one way it cooled.",
      },
    ],
  },
];
