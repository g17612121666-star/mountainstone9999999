#!/usr/bin/env python3
"""Enrich theme-routes.json and write data/en.json (English field-guide overlay)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path("/workspace")
SITES = json.loads((ROOT / "data/sites.json").read_text())
UP = json.loads((ROOT / "data/upgrade.json").read_text())
GEO = json.loads((ROOT / "data/upgrade.json").read_text()).get("geosites") or {}
OLD = json.loads((ROOT / "data/theme-routes.json").read_text())

OLD_EN = {
    "danxia": {
        "name_en": "Danxia corridor",
        "thesis_en": "Red beds + vertical joints + collapse. Start at Danxiashan, the type locality, then watch the same process cut cliffs, alleyways and mesas.",
        "task": "在丹霞山任选一面赤壁：指出硬层出檐、软层凹进、垂直节理把墙切成块。再到张掖页对照——那里没有这套巷谷。",
        "task_en": "On any red cliff at Danxiashan, point to a hard ledge, a recessed soft bed, and a vertical joint. Then open Zhangye: that hill has colour, not this collapse sequence.",
        "site_roles_en": [
            "Type locality: red beds, joints and collapse in one lesson.",
            "Danxia meeting Daoist cliff tombs — isolated residuals along joints.",
            "Youthful Danxia: deep alleyways, process not yet at residual hills.",
            "Southern Anhui red beds; contrast the granite of Huangshan next door.",
            "Plateau-edge Danxia lifted to the Yellow River margin.",
            "A wet-climate red cliff in the China Danxia World Heritage serial site.",
            "Langshan completes slot canyons and natural bridges.",
        ],
    },
    "karst": {
        "name_en": "Karst kingdom",
        "thesis_en": "Carbonate rock taken apart by water. Shilin is surface pinnacles, Zhijin is an underground palace, Leye is tiankengs, Guilin is a fenglin plain. Fangshan’s Stone Flower Cave is the northern check.",
        "task": "滴稀盐酸：起泡才是碳酸盐岩。石林看垂直裂隙网格，织金看化学沉积，乐业看顶板塌陷。不要把张家界石英砂岩柱叫喀斯特。",
        "task_en": "A drop of dilute HCl: fizz means carbonate. Shilin is a joint grid; Zhijin is chemical sediment; Leye is roof collapse. Zhangjiajie’s quartz-sandstone pillars are not karst.",
        "site_roles_en": [
            "Sword-like stone forest: Permian limestone cut by vertical fissures and rain.",
            "Stone sea and tiankeng — collapse turning underground space inside-out.",
            "Textbook cave chemistry: calcium coming back out of water as stone.",
            "Tiankeng cluster: the end-member of underground-river roof collapse.",
            "Fenglin plain, the classic wet-tropical karst. IUGS geoheritage.",
            "Northern check: Wumishan dolostone, Stone Flower Cave. Karst is not only Guangxi.",
            "Wulong tiankengs and gorges, part of South China Karst World Heritage.",
        ],
    },
    "sandstone-peak": {
        "name_en": "Quartz-sandstone peaks and mesas",
        "thesis_en": "Zhangjiajie is not karst. Quartz sandstone was lifted to a planation surface, then jointed into mesas, walls, clusters and pillars. Zhangshiyan is an earlier stage of the same sequence.",
        "task": "在张家界看柱截面是不是近方形、滴酸起不起泡。到嶂石岩看还停在方山和长墙、峰林还没切碎。",
        "task_en": "At Zhangjiajie check square cross-sections and no acid fizz. At Zhangshiyan the sequence still sits at mesa and wall — the forest of pillars is not finished.",
        "site_roles_en": [
            "Type locality of quartz-sandstone peak forest. Planation → mesa → wall → cluster → pillar.",
            "Zhangshiyan landform: giant stepped cliffs; pillars not yet isolated.",
            "Quartz-sandstone canyon country — incision, not dissolution.",
        ],
    },
    "granite": {
        "name_en": "Granite mountains",
        "thesis_en": "Acid magma froze underground, then spheroidal weathering and joints took the pluton apart. Huangshan, Sanqingshan and Tianzhushan share the rock; the structure differs.",
        "task": "摸粗粒石英和钾长石。石蛋是球状风化，不是火山弹。垂直节理密的地方柱更瘦。",
        "task_en": "Feel coarse quartz and K-feldspar. Tors are spheroidal weathering, not volcanic bombs. Denser vertical joints make thinner pillars.",
        "site_roles_en": [
            "Type granite peaks and tors: vertical joints + spheroidal weathering.",
            "Thinner, denser granite pillars — joint spacing versus Huangshan.",
            "A granite pluton punching through ultrahigh-pressure metamorphic rock.",
            "A fault-block granite mountain: steepness is structure, not only weather.",
            "Granite versus metamorphic basement in south-central Shandong.",
        ],
    },
    "volcano": {
        "name_en": "Volcanoes of China",
        "thesis_en": "From Wudalianchi’s historic basalt, through Jingpohu’s lava dam and Changbaishan’s stratovolcano, to coastal basalt and Yandangshan’s Cretaceous rhyolite caldera. Sheshan is the urban check: a Cretaceous volcanic hill on the Shanghai plain — not a national geopark.",
        "task": "先认岩浆系列：五大连池钾玄岩渣锥，长白山粗面岩–碱流岩破火山口，雁荡山流纹质，佘山碱性凝灰。不要一律叫活火山。",
        "task_en": "Name the magma series: Wudalianchi potassic basalt cones, Changbaishan trachyte–pantellerite caldera, Yandangshan rhyolite, Sheshan alkaline tuff. Do not call every cone ‘active’.",
        "site_roles_en": [
            "One of China’s youngest volcanic fields: cones, lava and a dammed lake on one map.",
            "Basalt dammed the Mudanjiang: Jingpohu and the underground forest.",
            "A giant compound volcano; Tianchi is a collapsed magma-chamber roof.",
            "Coastal basalt columnar joints washed out by waves.",
            "A volcanic island: eruption from seafloor to sea surface.",
            "A Cretaceous rhyolite caldera — not the same magma as Wudalianchi.",
            "Urban check: Sheshan is volcanic rock, not granite, and not a national geopark.",
            "Tengchong volcano-geothermal system on the collision belt.",
            "Hainan side of Leiqiong: maars and basalt plateaus.",
        ],
    },
    "fossil": {
        "name_en": "Fossil localities (look, don’t take)",
        "thesis_en": "Fossils are a state archive. This trail is about what you see, how you recognise it, and why you must not dig. Chengjiang prints Cambrian soft bodies on shale; Zigong buries Jurassic dinosaurs in sandstone.",
        "task": "全程只看展陈和保护廊。认出‘这是一层’而不是‘这是可以拿回家的标本’。发现重要化石向管理部门报告。",
        "task_en": "Stay with displays and protected galleries. Recognise a bed, not a souvenir. Report important finds.",
        "site_roles_en": [
            "Early Cambrian exceptional preservation, including soft parts. World Heritage / IUGS.",
            "Middle Jurassic dinosaurs. Dashanpu is for exhibits, not excavation.",
            "Complete mammals, insects and plants in Miocene diatomite.",
            "Late Cretaceous dinosaurs on the Heilongjiang at Jiayin.",
            "Jehol Biota: feathered dinosaurs and early birds.",
            "Zhucheng: density of dinosaur burial.",
            "Linxia Cenozoic mammals in red beds. Look, don’t collect.",
            "Yunyang: Jurassic dinosaurs stacked with Three Gorges karst in one UNESCO park.",
        ],
    },
    "gssp": {
        "name_en": "GSSPs and stratotypes",
        "thesis_en": "A GSSP is a golden spike in the global time-scale. Changshan hosts China’s first; Meishan nails extinction and recovery; Jixian unrolls Mesoproterozoic time; Songshan stacks Archaean to Cenozoic.",
        "task": "在每颗钉子前画出‘这一层之上/之下是哪个阶’。煤山两颗钉子不在同一厘米。禁止取样。",
        "task_en": "At each spike, sketch what stage sits above and below. Meishan’s two spikes are not on the same centimetre. No sampling.",
        "site_roles_en": [
            "UNESCO Global Geopark built around GSSPs and Ordovician sections.",
            "China’s first GSSP: base of the Darriwilian (Ordovician).",
            "Two spikes on one section: Changhsingian and Permian–Triassic. IUGS geoheritage.",
            "Jixian Mesoproterozoic–Neoproterozoic stratotype, North China’s deep-time ruler.",
            "Three Precambrian angular unconformities — five generations on one mountain.",
            "Jiangshanian GSSP (Cambrian).",
        ],
    },
    "wind": {
        "name_en": "Wind and sand",
        "thesis_en": "Arid country hands the rock to the wind. Dunhuang is yardang, Alxa is a desert geopark, Hexigten mixes granite with wind. Zhangye’s colourful hills are often mis-sold as Danxia — they are not Danxiashan.",
        "task": "看垄槽是不是平行盛行风、岩性是不是软硬互层。打开丹霞山页对照：那里靠垂直节理崩塌，这里靠风。",
        "task_en": "Are the ridges parallel to the prevailing wind? Is the rock a hard–soft couplet? Open Danxiashan: that landscape collapses on joints; this one is wind.",
        "site_roles_en": [
            "Yardang: directional wind carving lacustrine sandstone and mudstone.",
            "Alxa Desert UNESCO Global Geopark: dunes and inselbergs.",
            "Granite forest meeting Bashang wind — two processes on one rock.",
            "Cretaceous colourful hills. Not Danxia. Colour is redox at deposition.",
            "IUGS: Bilutu dunes and lakes, among the world’s highest dunes.",
            "Silicified wood stripped by wind from Jurassic beds. Look, don’t pocket it.",
        ],
    },
    "ice": {
        "name_en": "Ice and extreme mountains",
        "thesis_en": "A glacier is moving sandpaper. Siguniang, Hailuogou and Kunlun put ice erosion, moraine and high-mountain structure on one trail.",
        "task": "认 U 谷、冰碛垄和擦痕。禁止走上未开放冰舌。把流水 V 谷从名单里划掉。",
        "task_en": "Name a U-shaped valley, a moraine ridge, striae. Stay off closed ice tongues. Cross V-shaped river valleys off the list.",
        "site_roles_en": [
            "Extreme mountains and modern ice; granodiorite of the Hengduan cut by glaciers.",
            "A low-elevation modern glacier: walk to the tongue, see moraine and melt.",
            "UNESCO Global Geopark on the Kunlun orogen — ice and structure together.",
            "Yulong Snow Mountain, among China’s southernmost temperate glaciers.",
            "Nyenbo Yurtse: granite forest meeting plateau ice.",
            "Anyemaqen ice cap on the eastern Kunlun.",
        ],
    },
    "coast": {
        "name_en": "Coasts and islands",
        "thesis_en": "Waves are another joint developer. Hong Kong washes Early Cretaceous acid-rock columns into the intertidal; Changshan Islands, Shenhu Bay and Chongming are a bedrock archipelago, a drowned forest tidal flat, and an estuary sand island.",
        "task": "先看潮汐表。香港柱状节理是酸性岩也能长。崇明是沙不是岩石，佘山才是基岩丘，而且佘山不是国家地质公园。",
        "task_en": "Read the tide table first. Hong Kong’s columns grew in acid rock. Chongming is sand, not bedrock; Sheshan is the rock hill — and not a national geopark.",
        "site_roles_en": [
            "UNESCO Global Geopark. Hexagonal columns are cooling joints, not a basalt franchise.",
            "Bedrock islands in the Bohai Strait, metamorphic coasts.",
            "Shenhu Bay: intertidal ancient forest and coastal dunes.",
            "Shanghai’s national geopark is Chongming, not Sheshan. The sand island is still growing.",
            "Dalian coast: old metamorphic rock cut by waves.",
            "Pingtan Island: granite tors and marine erosion.",
        ],
    },
}

NEW = [
    {
        "id": "loess-yellow-river",
        "name": "黄土与黄河",
        "name_en": "Loess and the Yellow River",
        "thesis": "风成黄土是黄河的沉积档案。隰县看黄土怎么堆，壶口看河怎么切自己的岩槛，永和与老牛湾看深切曲流，郑州与东营看泥沙被送到哪里。",
        "thesis_en": "Aeolian loess is the Yellow River’s sedimentary archive. Xixian shows how the dust piled up; Hukou how the river cuts its own sill; Yonghe and Laoniuwan how a meander incises in place; Zhengzhou and Dongying where the silt is delivered.",
        "site_ids": ["xixian-loess", "hukou", "yonghe", "laoniuwan", "zhengzhou-huanghe", "huanghe-delta"],
        "site_roles": [
            "黄土怎么落下来：风积、垂直节理、塬梁峁。不是红层丹霞。",
            "壶口：三叠系砂泥岩互层被切出的岩槛瀑布。十里龙槽是瀑布后退，不是溶洞。",
            "永和蛇曲：河先弯、地后抬，深切曲流把古河道几何保存下来。",
            "老牛湾：晋陕峡谷另一段深切，对照永和。",
            "郑州黄河：出山口后的宽谷与地上河，泥沙开始摊开。",
            "东营三角洲：黄土和上游侵蚀的终点，潮滩还在长。",
        ],
        "site_roles_en": [
            "How loess landed: aeolian silt, vertical joints, yuan–liang–mao. Not red-bed Danxia.",
            "Hukou: a knickpoint waterfall in Triassic sandstone–mudstone. The ten-li trough is retreat, not a cave.",
            "Yonghe: the bend came first, uplift later — an incised meander keeping its plan.",
            "Laoniuwan: another incised reach of the Jin–Shaan gorge, a check on Yonghe.",
            "Zhengzhou: the river leaves the mountains, the silt begins to spread, a perched channel.",
            "Dongying delta: the end of loess and upstream erosion. The tidal flat is still growing.",
        ],
        "task": "在壶口指出硬层岩槛和软层凹槽；在永和从高处数河弯。把‘黄河是从溶洞里喷出来的’划掉。",
        "task_en": "At Hukou point to the hard sill and the recessed soft bed. At Yonghe count the bends from above. Cross off ‘the Yellow River bursts from a cave’.",
    },
    {
        "id": "taihang",
        "name": "太行切开华北",
        "name_en": "Taihang cuts North China",
        "thesis": "太行山前把华北地台切成峡谷，不是普通山水景区。云台山近水平的寒武–奥陶灰岩和石英砂岩被切开；林虑山、壶关、邢台把同一套下切写到不同河段；野三坡和十渡是山前河谷喀斯特，不是桂林峰林。",
        "thesis_en": "The Taihang front carves the North China Platform into gorges — not generic scenery. Yuntaishan’s near-horizontal Cambrian–Ordovician carbonates and quartz sandstone are cut open; Linlü, Huguan and Xingtai write the same incision on different reaches; Yesanpo and Shidu are foothill valley karst, not Guilin fenglin.",
        "site_ids": ["yuntaishan", "linlushan", "huguan", "xingtai-canyon", "yesanpo", "shidu"],
        "site_roles": [
            "云台山：近水平层被切开的红崖与天瀑。不是丹霞，不是张家界。",
            "红旗渠–林虑山：人工渠贴在太行断崖上，先认岩石再认工程。",
            "壶关峡谷：太行南段石英砂岩/碳酸盐岩被切出的障谷。",
            "邢台峡谷群：石英砂岩下切，滴酸不起泡。",
            "野三坡：山前河谷，喀斯特与碎屑岩并置。",
            "十渡：拒马河把雾迷山组切成弯。北方河谷喀斯特，不是桂林。",
        ],
        "site_roles_en": [
            "Yuntaishan: near-horizontal beds cut into red cliffs and a hanging waterfall. Not Danxia, not Zhangjiajie.",
            "Red Flag Canal–Linlü: a canal plastered on a Taihang scarp. Read the rock before the engineering.",
            "Huguan: barrier gorges in the southern Taihang.",
            "Xingtai canyon cluster: quartz-sandstone incision, no acid fizz.",
            "Yesanpo: a foothill valley where karst and clastics sit together.",
            "Shidu: the Juma River bending through Wumishan carbonates. Northern valley karst, not Guilin.",
        ],
        "task": "在云台山分清石英砂岩（滴酸不起泡）和灰岩（起泡）。到十渡再核对北方河谷喀斯特的层理近水平。",
        "task_en": "At Yuntaishan separate quartz sandstone (no fizz) from limestone (fizz). At Shidu check that northern valley karst still has near-horizontal bedding.",
    },
    {
        "id": "ncc-archive",
        "name": "华北地台史书",
        "name_en": "North China Craton archive",
        "thesis": "华北克拉通的时间被几条剖面摊开：蓟县是中–新元古界的海，嵩山把太古宙到寒武系叠成不整合，泰山是新太古代基底被寒武纪海不整合盖住，五台是夷平面残片，房山把雾迷山组白云岩送到北京西山。",
        "thesis_en": "Time on the North China Craton is unrolled by a few sections: Jixian the Meso–Neoproterozoic sea, Songshan Archaean-to-Cambrian unconformities, Taishan an unconformity of Cambrian sea on Neoarchaean basement, Wutai a planation remnant, Fangshan Wumishan dolostone in the Western Hills of Beijing.",
        "site_ids": ["jixian", "songshan", "taishan", "wutaishan", "fangshan"],
        "site_roles": [
            "蓟县：燕辽沉降带的海相尺子。叠层石在雾迷山组。",
            "嵩山：三道前寒武角度不整合。峻极峰是石英岩，不是花岗岩。",
            "泰山：登的是太古宙 TTG，寒武系只在山麓。",
            "五台山：台顶是夷平面残片，不是推平的神迹。",
            "房山：北方河谷喀斯特钉在雾迷山组上，不是桂林峰林平原。",
        ],
        "site_roles_en": [
            "Jixian: a marine ruler of the Yanliao aulacogen. Stromatolites in the Wumishan.",
            "Songshan: three Precambrian angular unconformities. The high peak is quartzite, not granite.",
            "Taishan: you climb Neoarchaean TTG; Cambrian limestone is only in the foothills.",
            "Wutai: the flat tops are planation remnants, not a miracle.",
            "Fangshan: northern valley karst on Wumishan dolostone, not a Guilin fenglin plain.",
        ],
        "task": "在嵩山指出一道角度不整合：上下岩层产状不同。到泰山山麓找寒武系，主峰找片麻岩。",
        "task_en": "At Songshan point to an angular unconformity: beds above and below do not share a dip. In the Taishan foothills find Cambrian; on the summit find gneiss.",
    },
    {
        "id": "jehol-dinosaur",
        "name": "热河生物群与恐龙",
        "name_en": "Jehol Biota and dinosaurs",
        "thesis": "中生代陆地与湖泊档案的时空分布。旧线「化石产地」讲怎么看、为什么不能挖；本线讲热河生物群如何连到山东、河南、黑龙江和湖北的恐龙与恐龙蛋。全程只看不挖。",
        "thesis_en": "A time-space map of Mesozoic lakes and land. The older fossil trail is about how to look and why not to dig; this trail is how the Jehol Biota connects to dinosaurs and eggs in Shandong, Henan, Heilongjiang and Hubei. Look, don’t take.",
        "site_ids": ["chaoyang", "shanwang", "zhucheng", "laiyang", "ruyang", "jiayin", "yunxian"],
        "site_roles": [
            "朝阳：热河生物群。带羽毛恐龙与早期鸟类写在湖相页岩里。",
            "山旺：中新世硅藻土，对照热河——时代更年轻的湖。",
            "诸城：恐龙骨骼密集埋藏，看的是层位和展陈。",
            "莱阳：白垩纪陆相地层，山东恐龙故事的另一页。",
            "汝阳：河南恐龙，黄河南岸的中生代陆地。",
            "嘉荫：黑龙江晚白垩世恐龙，中国最北的一页。",
            "郧县：恐龙蛋层。蛋是层，不是可以挖的纪念品。",
        ],
        "site_roles_en": [
            "Chaoyang: Jehol Biota. Feathered dinosaurs and early birds in lacustrine shale.",
            "Shanwang: Miocene diatomite — a younger lake, a check on Jehol.",
            "Zhucheng: dense dinosaur bone beds. Read the horizon and the exhibits.",
            "Laiyang: Cretaceous continental beds, another page of Shandong dinosaurs.",
            "Ruyang: dinosaurs south of the Yellow River, Mesozoic land in Henan.",
            "Jiayin: Late Cretaceous dinosaurs on the Heilongjiang, the northern page.",
            "Yunxian: dinosaur-egg beds. An egg is a horizon, not a souvenir.",
        ],
        "task": "每到一站先问：这是湖还是河？热河是湖相页岩，诸城是陆地埋藏。全程不敲、不挖。",
        "task_en": "At each stop ask: lake or river? Jehol is lacustrine shale; Zhucheng is a land burial. No hammer, no digging.",
    },
    {
        "id": "yangtze",
        "name": "长江切开扬子",
        "name_en": "The Yangtze cuts the Yangtze Platform",
        "thesis": "扬子地台被河流与岩溶共同拆开。三峡是江切出来的剖面，恩施是峡谷与腾龙洞，神农架是抬升的基底与喀斯特，长阳清江把岩溶河谷再写一遍。不是三峡游轮介绍。",
        "thesis_en": "The Yangtze Platform taken apart by a river and by karst. The Three Gorges are a section the river cut; Enshi is a canyon plus Tenglong Cave; Shennongjia is an uplifted basement with karst; the Qingjiang at Changyang writes a karst valley again. Not a cruise brochure.",
        "site_ids": ["sanxia", "enshi", "shennongjia", "changyang"],
        "site_roles": [
            "三峡：江把扬子碳酸盐岩和碎屑岩切开。看的是剖面，不是游轮窗景。",
            "恩施大峡谷–腾龙洞：地表峡谷与地下河大厅是同一套溶蚀的两面。",
            "神农架：抬升的基底遇上喀斯特，海拔把溶蚀和剥蚀叠在一起。",
            "长阳清江：清江岩溶河谷，三峡过程在支流上的对照。",
        ],
        "site_roles_en": [
            "Three Gorges: the river cutting Yangtze carbonates and clastics. A section, not a cabin window.",
            "Enshi canyon–Tenglong Cave: the surface canyon and the underground hall are two faces of one dissolution.",
            "Shennongjia: uplifted basement meeting karst; altitude stacks dissolution on denudation.",
            "Changyang Qingjiang: a karst valley on a tributary, a check on the Three Gorges process.",
        ],
        "task": "在三峡或恩施指出：哪一面是层理，哪一面是溶沟。江切和溶蚀不要用同一个词。",
        "task_en": "At the Gorges or Enshi: which face is bedding, which is dissolution grooves? Do not use one word for river-cut and karst.",
    },
    {
        "id": "urban-stone",
        "name": "城市里的石头",
        "name_en": "Stone in the city",
        "thesis": "城市和近郊也能读地质。佘山是白垩纪碱性火山锥，城市地质点，不是国家地质公园；崇明岛才是上海的国家地质公园，而且还是沙。六合玄武岩盖在雨花石砾石层上，汤山方山一园两套，木兰山把变质岩送到武汉北郊。",
        "thesis_en": "Cities have geology. Sheshan is a Cretaceous alkaline volcanic hill — an urban geosite, not a national geopark. Chongming Island is Shanghai’s national geopark, and it is still sand. Luhe basalt caps rainstone gravels; Tangshan–Fangshan is two stories in one park; Mulan Mountain brings metamorphic rock to northern Wuhan.",
        "site_ids": ["sheshan", "chongming", "luhe", "tangshan-fangshan", "mulanshan"],
        "site_roles": [
            "佘山：上海平原上的白垩纪火山残丘。不是花岗岩，不是国家地质公园。",
            "崇明岛：全新世沙岛。上海的国家地质公园在这里。没有溶洞。",
            "六合：新生代玄武岩方山，山下雨花石砾石层只看不捡保护区的。",
            "江宁汤山方山：汤山是古生界灰岩溶洞，方山是新生代火山。不要用一套故事解释两座山。",
            "木兰山：武汉北郊的变质岩中山，城市对照的深部岩石。",
        ],
        "site_roles_en": [
            "Sheshan: a Cretaceous volcanic remnant on the Shanghai plain. Not granite. Not a national geopark.",
            "Chongming: a Holocene sand island. This is Shanghai’s national geopark. No caves.",
            "Luhe: a Neogene basalt mesa; rainstone gravels at the foot — look, don’t pocket protected pebbles.",
            "Tangshan–Fangshan, Jiangning: Tangshan is Palaeozoic limestone caves; Fangshan is a Cenozoic volcano. Two hills, two stories.",
            "Mulan Mountain: metamorphic mid-hills north of Wuhan, deep crust in the suburbs.",
        ],
        "task": "先问脚下是沙、火山岩还是灰岩。佘山滴酸不起泡；崇明没有石头可滴；汤山溶洞起泡，方山顶气孔熔岩不起泡。",
        "task_en": "Ask what is underfoot: sand, volcanic rock, or limestone. Sheshan does not fizz; Chongming has no rock to test; Tangshan caves fizz, Fangshan’s vesicular lava does not.",
    },
    {
        "id": "quartzite-planation",
        "name": "石英岩与夷平面",
        "name_en": "Quartzite and planation",
        "thesis": "硬石英岩被抬成夷平面后再切开。泰山主峰是太古宙基底，山麓和邻区石英岩记录更老的海；嵩山三皇寨的石英岩就是主峰；嶂石岩把中元古界石英砂岩停在方山–长墙阶段。严禁写成张家界那条砂岩峰林线的重复版。",
        "thesis_en": "Hard quartzite lifted to a planation surface, then cut. Taishan’s summit is Archaean basement; quartzite nearby records an older sea. Songshan’s Sanhuangzhai quartzite is the peak itself. Zhangshiyan parks Mesoproterozoic quartz sandstone at the mesa–wall stage. This is not a rerun of the Zhangjiajie pillar trail.",
        "site_ids": ["taishan", "songshan", "zhangshiyan"],
        "site_roles": [
            "泰山：先认主峰片麻岩，再在山麓找石英岩/寒武系。夷平面的故事在抬升，不在峰林。",
            "嵩山三皇寨：石英岩抗风化构成峻极峰。三道不整合是尺子。",
            "嶂石岩：同一类硬砂岩地貌的更老阶段，方山和长墙，峰林未完成。",
        ],
        "site_roles_en": [
            "Taishan: name the summit gneiss first, then quartzite/Cambrian in the foothills. Planation is about uplift, not pillars.",
            "Songshan Sanhuangzhai: weathering-resistant quartzite makes the high peak. Three unconformities are the ruler.",
            "Zhangshiyan: an older stage of the same hard-sandstone family — mesa and wall, pillars not finished.",
        ],
        "task": "把张家界的峰林照片收起来。本线只认：石英岩/石英砂岩是不是构成平顶？节理有没有把平顶切碎？",
        "task_en": "Put the Zhangjiajie pillar photos away. This trail only asks: does quartzite/quartz sandstone make a flat top? Have joints broken that top into pillars yet?",
    },
    {
        "id": "estuary",
        "name": "河口、潮滩与沙岛",
        "name_en": "Estuaries, tidal flats and sand islands",
        "thesis": "泥沙、潮坪、古森林与湖沼。和旧线「海岸与海岛」（基岩岛、柱状节理、海蚀）不是同一件事。崇明是还在长的沙，东营是黄河的终点，兴凯湖是构造湖与湿地，深沪湾潮间带把古森林露出来。",
        "thesis_en": "Mud, tidal flats, drowned forests and wetlands. Not the old coast trail (bedrock islands, columns, marine erosion). Chongming is still-growing sand; Dongying is the Yellow River’s end; Xingkai is a tectonic lake and marsh; Shenhu Bay bares a drowned forest on the tide.",
        "site_ids": ["chongming", "huanghe-delta", "xingkaihu", "shenhuwan"],
        "site_roles": [
            "崇明：潮沟、潮滩、沙岛迁移。先看潮汐再上滩。",
            "东营三角洲：河口泥沙与潮坪，黄土的终点。",
            "兴凯湖：构造湖盆与湿地，不是海蚀崖。",
            "深沪湾：潮间带古森林，海面变化写在树桩上。",
        ],
        "site_roles_en": [
            "Chongming: tidal creeks, flats, a migrating sand island. Read the tide before you step on.",
            "Dongying delta: estuary silt and tidal flats, the end of loess.",
            "Xingkai Lake: a tectonic basin and wetland, not a sea cliff.",
            "Shenhu Bay: an intertidal ancient forest. Sea-level change written on stumps.",
        ],
        "task": "这四个点都不要去找柱状节理。问的是泥沙和水面：潮沟怎么摆、三角洲怎么向前、古树桩现在为什么被潮水淹。",
        "task_en": "Do not hunt columnar joints here. Ask about sediment and water: how the creek swings, how the delta steps forward, why the stumps are under the tide now.",
    },
    {
        "id": "dabie-sulu",
        "name": "大别–苏鲁造山带",
        "name_en": "Dabie–Sulu orogen",
        "thesis": "碰撞造山与高压–超高压变质，不是又一条花岗岩名山。安徽大别山看造山带核部，天柱山的花岗岩是刺穿超高压岩的那一针，金刚台在北缘，五莲山把苏鲁带送到鲁东南。天柱山在旧花岗岩线上只写节理峰林；本线只写它在造山带里的角色。",
        "thesis_en": "Collision and high- to ultrahigh-pressure metamorphism — not another granite-peak tour. Dabie (Lu’an) is the orogen core; Tianzhushan’s granite is the needle through UHP rock; Jingangtai sits on the northern margin; Wulianshan brings the Sulu belt to southeast Shandong. On the granite trail Tianzhushan was about joints; here it is about the orogen.",
        "site_ids": ["dabieshan-luan", "tianzhushan", "jingangtai", "wulianshan"],
        "site_roles": [
            "安徽大别山（六安）：造山带核部变质岩，碰撞的深部。",
            "天柱山：花岗岩刺穿超高压变质岩。本线看围岩和接触，不看迎客松式的石蛋。",
            "信阳金刚台：大别北缘火山–侵入杂岩。",
            "五莲山–九仙山：苏鲁超高压带东缘的山。",
        ],
        "site_roles_en": [
            "Dabie (Lu’an): metamorphic core of the orogen, the deep part of the collision.",
            "Tianzhushan: granite punching UHP rock. Here you read the country rock and the contact, not the tors.",
            "Jingangtai, Xinyang: volcanic–intrusive complex on the northern Dabie margin.",
            "Wulian–Jiuxian: mountains on the eastern Sulu UHP belt.",
        ],
        "task": "在天柱山先找不是花岗岩的那套深色变质岩。能指出来，这条线才算走懂。",
        "task_en": "At Tianzhushan find the dark metamorphic rock that is not granite. If you can point to it, the trail has done its job.",
    },
    {
        "id": "north-karst",
        "name": "北方喀斯特",
        "name_en": "Northern karst",
        "thesis": "北方峡谷型、洞穴型喀斯特。旧线「喀斯特王国」以南方峰林、天坑、地下河为主；本线走房山石花洞与十渡、野三坡、本溪、宁武冰洞、临城。不要重复石林、织金、乐业、桂林、武隆的叙事。",
        "thesis_en": "Northern valley and cave karst. The old Karst kingdom trail is southern fenglin, tiankengs and underground rivers. This one walks Fangshan (Stone Flower Cave / Shidu), Yesanpo, Benxi, the Ningwu ice cave and Lincheng. Do not rerun Shilin, Zhijin, Leye, Guilin or Wulong.",
        "site_ids": ["fangshan", "yesanpo", "benxi", "ningwu", "lincheng"],
        "site_roles": [
            "房山：雾迷山组白云岩。石花洞溶得慢、花更密；十渡是拒马河谷。不是桂林峰林平原。",
            "野三坡：山前河谷喀斯特，和十渡同一条太行山前故事。",
            "本溪：辽东洞穴与水洞，北方地下喀斯特。",
            "宁武冰洞：灰岩洞里的季节性冰。冰是气候，洞是喀斯特，不是冰川挖的。",
            "临城：冀南洞穴喀斯特，对照房山。",
        ],
        "site_roles_en": [
            "Fangshan: Wumishan dolostone. Stone Flower Cave dissolves slowly, so the flowers are denser; Shidu is the Juma valley. Not a Guilin fenglin plain.",
            "Yesanpo: foothill valley karst, the same Taihang-front story as Shidu.",
            "Benxi: Liaodong caves and a water cave — northern underground karst.",
            "Ningwu ice cave: seasonal ice in a limestone cave. Ice is climate; the cave is karst, not glacial excavation.",
            "Lincheng: cave karst in southern Hebei, a check on Fangshan.",
        ],
        "task": "滴酸：白云岩反应弱于灰岩。北方洞小、石花多、峰林少。把桂林的峰林照片从本线拿开。",
        "task_en": "Acid: dolostone fizzes less than limestone. Northern caves are smaller, flowers denser, fenglin scarce. Take the Guilin peak photos off this trail.",
    },
]

LF_EN = {
    "karst": (
        "This park is built on marine carbonate — limestone or dolostone. "
        "Uplift brought the beds above base level; joints and bedding steered the water. "
        "Dissolution, underground rivers and collapse did the rest. "
        "It is not Danxia and not Zhangjiajie quartz-sandstone. A drop of dilute HCl should fizz on fresh carbonate. "
        "Stay on open trails. Speleothems are for looking, not touching."
    ),
    "danxia": (
        "Red continental sandstone and conglomerate, iron-stained at deposition. "
        "Vertical joints then let the cliffs peel and collapse: plateau → alleyway → mesa → pillar. "
        "The type locality is Danxiashan in Guangdong. Zhangye’s colourful hills are not this. "
        "Look for pebbles in the red beds and joints that rule the alleys."
    ),
    "zhangjiajie_sandstone": (
        "Thick, silica-cemented quartz sandstone. "
        "A planation surface was jointed and then collapsed into mesas, walls and pillars. "
        "Not karst — no acid fizz — and not Danxia. Square column sections and ledges on soft interbeds are the field test."
    ),
    "granite_peak": (
        "A Yanshanian granite pluton: coarse quartz and feldspar you can see. "
        "It froze kilometres down, not as a volcanic neck. Joints and spheroidal weathering made the peaks and tors. "
        "No sedimentary bedding. Tors are weathering rinds, not bombs."
    ),
    "volcano": (
        "Name the magma series before you name the landform: basalt, trachyte, rhyolite or a maar. "
        "Cones, lava and explosion pits are construction; streams and weather rewrite them. "
        "Not every cone is active, and a circular lake is not automatically a tiankeng or a crater."
    ),
    "yardang": (
        "Soft lacustrine sandstone and mudstone carved into ridges and troughs by a prevailing wind. "
        "Not a Danxia alley, not a film set. Check that the ridge trend matches the wind and that beds alternate hard and soft."
    ),
    "glacier": (
        "High rock — metamorphic or granite — sandpapered by ice into U-valleys, arêtes and moraines. "
        "Not a V-shaped river valley. Stay off closed ice tongues."
    ),
    "loess": (
        "Quaternary aeolian silt, later cut by running water into yuan, liang and mao. "
        "Vertical joints and calcareous nodules; steep loess walls collapse after rain. Not red-bed Danxia."
    ),
    "coast": (
        "Waves and tides along joints: cliffs, stacks, platforms. "
        "Hong Kong shows that acid rock can grow columnar joints too. Read the tide table before you step down."
    ),
    "fossil": (
        "A fossiliferous sedimentary bed lifted into view. "
        "You are here to see a horizon and a museum, not to collect. Fossils are in principle state property."
    ),
    "stratigraphy": (
        "A time section, not a scenic stone forest. "
        "Look for unconformities — beds that do not share a dip. Stratotypes are for looking, not sampling."
    ),
    "geo_hazard": (
        "A landslide, collapse or debris-flow deposit. The landform is still unstable. "
        "Stay on open trails; keep off steep walls after rain."
    ),
    "other": (
        "Read the rock first — grains, colour, bedding or foliation — then the landform name. "
        "Stay on open trails. No hammering, no collecting."
    ),
}

DEEP_EN = {
    "zhangjiajie": {
        "hook": "A Middle Devonian quartz beach, jointed into a forest of pillars.",
        "formation_short": "Zhangjiajie sits on the western Yangtze Platform. Middle Devonian shoreface quartz sand became the Yuntaiguan Formation: silica-cemented, thick-bedded, metres to hundreds of metres thick. Mesozoic–Cenozoic uplift lifted the beach above base level. Two near-vertical joint sets, NW and NE, diced the slab. Neighbouring Yellow Dragon Cave is limestone — it does not make the pillars karst. Water cut the joints first; gravity then thinned walls into pillars. You are looking at the pillar-to-remnant stage; Yuanjiajie and Tianzishan still show mesa tops. It is not karst (no fizz) and not Danxia (local rust is iron stain, not a red-bed colour). Field tests: sandy feel, square sections, soft beds recessed after rain.",
        "evolution_sequence": "Quartz beach → thick sandstone → uplift → joint grid → mesa → wall → pillar forest",
        "what_you_see_today": "Grey-white sandstone pillars with square sections. Mesa tops survive on Tianzishan and Yuanjiajie. Yellow Dragon Cave is the limestone check inside the park — a different rock.",
        "corrections": [
            "Zhangjiajie is a quartz-sandstone peak forest, not karst.",
            "Zhangjiajie is not Danxia. Local rust is iron stain, not a red-bed colour.",
        ],
        "observation_tips": [
            "No acid fizz on the pillars; cave walls do fizz.",
            "Square sections = two vertical joint sets.",
            "Soft interbeds make ledges after rain.",
        ],
    },
    "zhangye": {
        "hook": "Colourful hills from redox in lacustrine sandstone and mudstone — not Danxiashan-style Danxia.",
        "formation_short": "Zhangye sits on the north Qilian basin. Cretaceous lake and river mudstone, siltstone and sandstone were stripped by desert wind and cloudbursts into coloured hills. The rock is soft. Reds and yellows are ferric iron; grey-green is a reducing facies — colour locked in at deposition, not painted later. Neighbour Danxiashan has joint-controlled red cliffs and mesas; Kanbula is plateau Danxia; Dunhuang is yardang. None of those sequences live here. Stay with colour banding and grain size, not with a Danxia label sold on a ticket.",
        "evolution_sequence": "Cretaceous lake beds → Qilian uplift → wind and storm stripping → colourful badlands",
        "what_you_see_today": "Banded red, yellow and grey-green slopes. Soft rock, no joint-controlled alleyways of the Danxia type locality.",
        "corrections": [
            "Zhangye colourful hills are arid lacustrine badlands, not Danxiashan-style Danxia.",
            "The trade name ‘Rainbow Danxia’ is not a geomorphic classification.",
        ],
        "observation_tips": [
            "Colour follows beds, not joints.",
            "Soft mudstone recesses; sandstone stands a little proud.",
            "Open Danxiashan in another tab if you need the real Danxia sequence.",
        ],
    },
    "sheshan": {
        "hook": "A Cretaceous volcanic hill that pops out of the Shanghai plain — not dumped fill.",
        "formation_short": "Sheshan is a rock hill. Late Cretaceous alkaline volcanics — andesitic to trachytic and rhyolitic tuff and lava — belong to the coastal volcanic belt’s isolated hills at the Yangtze mouth. Not granite, not Wudalianchi basalt, not landfill. West Sheshan is Shanghai’s highest onshore point. Shanghai’s national geopark is Chongming Island, a Holocene sand island still being rewritten by tide. Sheshan is an urban geosite. Do not hammer. Do not upgrade it to a national geopark on a sign.",
        "evolution_sequence": "Late Cretaceous alkaline volcanism → isolated hills on a sinking delta → urban forest",
        "what_you_see_today": "Tuff and lava in a wooded hill. No granite crystals, no sand island, no ticket office of a national geopark.",
        "corrections": [
            "Sheshan is an urban geosite, not a national geopark. Shanghai’s national geopark is Chongming Island.",
            "The rock is alkaline volcanic, not granite.",
        ],
        "observation_tips": [
            "Look for tuff fragments and flow banding, not coarse quartz.",
            "Chongming is sand; Sheshan is rock.",
            "Stay on municipal and park paths.",
        ],
    },
    "chongming": {
        "hook": "A sand island still growing at the Yangtze mouth. This is Shanghai’s national geopark — not Sheshan.",
        "formation_short": "Chongming is sand, not yet stone. Holocene estuary sand and mud, tidal flats, creeks and wetlands still rewritten by river and tide. The tectonic setting is a sinking mouth; the agents are water and silt. No caves — no thick limestone. No glacial troughs. No craters. Sheshan, across the city, is the bedrock volcanic hill, and it is not a national geopark. Read the tide before you step on. Soft mud will take a shoe.",
        "evolution_sequence": "Mouth bar → sand island → tidal creeks and wetlands → dykes",
        "what_you_see_today": "Mud, sand, reeds, a moving shoreline. Not a mountain. Not a cave.",
        "corrections": [
            "Shanghai’s national geopark is Chongming Island, not Sheshan.",
            "No caves, glaciers or craters. It is a sand island.",
        ],
        "observation_tips": [
            "Tide table first.",
            "Creeks migrate; do not walk closed bird flats.",
            "Soft mud. No rock hammer needed — there is no rock.",
        ],
    },
    "meishan": {
        "hook": "Two golden spikes on one section. The Changhsingian begins here; the Permian ends here.",
        "formation_short": "Meishan is not a mountain. It is a protected marine section: Late Permian Changxing Formation limestone and marl passing up into Early Triassic Yinkang mudstone. A pale clay near the boundary is volcanic ash and environmental collapse at about 252 Ma. The setting was a stable Yangtze epeiric sea, continuous enough to hold a global ruler. Clarkina wangi pins the base of the Changhsingian; Hindeodus parvus pins the base of the Induan — two spikes, one gallery. ICS ratified the Permian–Triassic GSSP in 2001 and the Changhsingian in 2005. Meishan is an independent GSSP, not part of Changshan UNESCO Global Geopark; Huangnitang nails the Darriwilian, another period, another park. Look, do not sample.",
        "evolution_sequence": "Epeiric carbonate → clay and extinction → Early Triassic mud → uplift and a protected gallery",
        "what_you_see_today": "A roofed gallery of numbered beds. Dark limestone below, paler or greenish mudstone above, a clay in between. Two plaques, not one centimetre.",
        "corrections": [
            "Meishan is an independent GSSP section, not part of Changshan UNESCO Global Geopark.",
            "Two spikes: Changhsingian base and Permian–Triassic boundary are not the same centimetre.",
        ],
        "observation_tips": [
            "Sketch the two spikes before you reach the gallery: Changhsingian below, PTB above.",
            "Conodonts are millimetre-scale — the public reads the colour change and the signs.",
            "No scraping, hammering or pocketing.",
        ],
    },
    "huangshan": {
        "hook": "Early Cretaceous granite taken apart by vertical joints and spheroidal weathering. The Guest-Greeting Pine grows in a joint, not in a volcanic neck.",
        "formation_short": "Huangshan is a granite pluton on the Jiangnan orogen, zircon ages about 125–128 Ma, coarse porphyritic to medium grain. Emplaced kilometres down — not a neck. Front ranges have sparser joints (domes and tors); the back ranges have denser vertical joints (clusters and pillars). Neighbours Jiuhua, Sanqing and Tianzhu share that granite pulse. Unloading joints sit near-horizontal; tectonic joints stand up. Sequence: country rock stripped, joints make pillars, spheroidal weathering rounds edges, ice-margin and streams cut West Sea Canyon. Not sandstone peaks, not karst, not a volcano.",
        "evolution_sequence": "Pluton → uplift → joints → pillars and tors → canyon widening",
        "what_you_see_today": "Pines in joints, tors on summits, a joint-walled canyon at West Sea. Coarse quartz and feldspar, no bedding.",
        "corrections": [
            "Huangshan granite is not a volcanic neck.",
            "Not Zhangjiajie sandstone peaks, not karst.",
        ],
        "observation_tips": [
            "Coarse quartz + feldspar on a fresh face.",
            "Tors are weathering rinds.",
            "West Sea walls are nearly parallel — they follow joints.",
        ],
    },
    "wudalianchi": {
        "hook": "In 1719–1721 Laoheishan and Huoshaoshan dammed the Baihe. Five lakes are lava-dam products.",
        "formation_short": "Wudalianchi sits on a deep fault between the Lesser Hinggan and Songliao. Potassic basalt rose along the fault: fourteen cones, old and new. Dark, vesicular, olivine sometimes visible. New scoria is loose; ropey and pressure-ridge crusts record a cooled skin over a still-moving core. Old Pleistocene cones are wooded; the new ones erupted 1719–1721 and dammed five bead lakes. Not a meteor crater, not a Changbaishan caldera, not Jingpohu’s single basalt dam without fresh scoria cones.",
        "evolution_sequence": "Fissure basalt → scoria cones → lava dam → five lakes",
        "what_you_see_today": "Black new lava with little plant cover, wooded old cones, a chain of lakes behind a stone dam.",
        "corrections": [
            "The five lakes are lava-dammed, not craters.",
            "New period is 1719–1721 potassic basalt, not a Changbaishan-type caldera.",
        ],
        "observation_tips": [
            "Count scoria layers in Laoheishan’s inner wall.",
            "Ropey lava is perpendicular to flow.",
            "Stay off unstable dam rock.",
        ],
    },
    "shilin": {
        "hook": "A Lower Permian sea, stood on end as a forest of stone.",
        "formation_short": "Shilin is Maokou limestone on the southwestern Yangtze Platform: thick, fossiliferous, soluble. Late Permian Emeishan basalt once covered it; Cenozoic laterite buried it again. The stone forest was exhumed, not left naked since the Permian. A vertical joint grid diced the plateau. Xingwen, nearby, took the same beds into caves and tiankengs. Not Danxia, not Zhangjiajie. Fizz on fresh limestone; look for the grid in plan.",
        "evolution_sequence": "Permian limestone → basalt and laterite cover → exhumation → jointed pinnacles",
        "what_you_see_today": "Sword-like pinnacles in a joint grid. Soil and laterite still sit in pockets between them.",
        "corrections": [
            "Shilin is karst on Maokou limestone, not quartz sandstone and not Danxia.",
        ],
        "observation_tips": [
            "Acid fizz on limestone.",
            "Pinnacles follow a joint grid.",
            "This is surface karst; caves and tiankengs are the underground chapter at other parks.",
        ],
    },
    "danxiashan": {
        "hook": "The word Danxia grew here. Red beds, vertical joints, collapse.",
        "formation_short": "Danxiashan is the type locality, a Cretaceous–Palaeogene red basin south of the Nanling. Iron oxide is depositional, not paint. Conglomerate and coarse sandstone stand; muddy silt recesses. Uplift, then near-vertical joints through the red beds, then collapse: plateau → alley → mesa → pillar. Taining and Langshan share the process. Zhangye colourful hills do not. Colour is not enough — you need the joint-and-collapse sequence.",
        "evolution_sequence": "Red basin → uplift → vertical joints → mesa, alley, pillar",
        "what_you_see_today": "Scarlet cliffs, slot alleys, mesas. Pebbles visible in the red beds.",
        "corrections": [
            "This is the type Danxia. Zhangye is not this.",
            "Red colour alone does not make Danxia.",
        ],
        "observation_tips": [
            "Find pebbles in the red bed.",
            "Alleys follow vertical joints.",
            "Compare Zhangye in another tab: colour without this sequence.",
        ],
    },
    "songshan": {
        "hook": "Three Precambrian angular unconformities. The high peak is quartzite, not granite. Shaolin is culture.",
        "formation_short": "Songshan on the southern North China Craton stacks Archaean to Cenozoic. Dengfeng Group gneiss is basement; Songshan Group quartzite is the weathering-resistant peak (Junji, Sanhuangzhai) — not granite; Wufoshan clastics are weaker; Cambrian–Ordovician limestone sits higher and fizzes. Three Precambrian angular unconformities are the ruler. Shaolin is a human story on the same mountain, not a rock name.",
        "evolution_sequence": "Basement → quartzite sea → unconformities → limestone cover → incision",
        "what_you_see_today": "A pale quartzite summit, gneiss below, limestone with bedding and fizz on higher slopes.",
        "corrections": [
            "Junji Peak is quartzite, not granite.",
            "Shaolin is not a geologic unit.",
        ],
        "observation_tips": [
            "Unconformity: dips above and below do not match.",
            "Quartzite does not fizz; limestone does.",
            "No granite graphic texture on the high peak.",
        ],
    },
    "taishan": {
        "hook": "Neoarchaean TTG and greenstone, unconformably covered by a Cambrian sea. You climb basement; Cambrian lives in the foothills.",
        "formation_short": "Taishan on the western Shandong uplift. Neoarchaean Taishan Group: TTG gneiss, greenstone, later granite, about 2.5–2.7 Ga. Dark bands, mineral lineation, strong. Cambrian limestone and shale only in the foothills (Jingshi Valley): pale, bedded, fizz. The Taishan movement lifted basement; the contact with Cambrian is an angular unconformity. Not a granite-only famous mountain, not a young volcano.",
        "evolution_sequence": "Archaean crust → unconformity → Cambrian sea → fault-block mountain",
        "what_you_see_today": "Dark gneiss on the eighteen-bend climb; bedded limestone with inscriptions in the foothills.",
        "corrections": [
            "The summit is Archaean basement, not Cambrian limestone.",
        ],
        "observation_tips": [
            "Foothills: fizz and bedding.",
            "Summit: foliation, no limestone bedding.",
            "The unconformity is the lesson, not the sunrise.",
        ],
    },
    "fangshan": {
        "hook": "Four gates, one park: Stone Flower Cave, Zhoukoudian, Shidu, Baishi Mountain, pinned on Wumishan dolostone — not a Guilin fenglin plain.",
        "formation_short": "Fangshan UNESCO Global Geopark sits on North China carbonate, chiefly Mesoproterozoic Wumishan tidal dolostone (~1.4 Ga) with stromatolites. Dolostone fizzes less than limestone, dissolves slowly, so northern caves are smaller and stone flowers denser. Shidu is a valley cut by the Juma; Zhoukoudian caves are in younger carbonate. Yan Shan folding lifted the old beds. This is northern valley and cave karst, not tropical fenglin.",
        "evolution_sequence": "Tidal dolostone → Yanshan fold-and-thrust → valley karst and caves",
        "what_you_see_today": "Near-horizontal beds in a river bend at Shidu; stone flowers in a slow cave; a marble/dolostone ridge at Baishi.",
        "corrections": [
            "Fangshan is northern valley karst, not a Guilin fenglin plain.",
            "Baishi Mountain is marble/dolostone, not Zhangjiajie sandstone.",
        ],
        "observation_tips": [
            "Dolostone: weak fizz.",
            "Stromatolites on fresh faces look like sliced blankets.",
            "Do not treat Zhoukoudian as a souvenir bone shop.",
        ],
    },
    "hongkong": {
        "hook": "When the tide goes out, a hexagonal cooling-joint net appears. Acid rock grows columns too.",
        "formation_short": "Hong Kong UNESCO Global Geopark has two limbs: Sai Kung volcanic rock and northeast New Territories sedimentary rock, on the Early Cretaceous volcanic–sedimentary belt of the South China margin. The columns are rhyolitic lava and ignimbrite, not basalt: pale to dark, quartz and feldspar phenocrysts. Joints grew perpendicular to the cooling surface. Coordinates stay in WGS84 on the map — Hong Kong is not offset to GCJ-02. Read the tide.",
        "evolution_sequence": "Early Cretaceous acid volcanics → cooling joints → marine erosion of the columns",
        "what_you_see_today": "Hexagonal columns in the intertidal, a joint net when the tide is low.",
        "corrections": [
            "Columnar jointing is not a basalt franchise. Acid rock can do this.",
        ],
        "observation_tips": [
            "Tide table first.",
            "Pale phenocrysts — not black basalt.",
            "No GCJ-02 shift on this park.",
        ],
    },
    "changbaishan": {
        "hook": "A trachyte–pantellerite compound volcano. Tianchi is a water-filled caldera from the ~946 CE millennium eruption, not a meteor crater.",
        "formation_short": "Changbaishan UNESCO Global Geopark is an intraplate volcano on the China–Korea border, not an island arc, not a meteorite. Shield: basalt. Cone: trachyte. Caldera: pantellerite (alkaline rhyolite) and pumice that floats. The millennium eruption ~946 CE was Plinian. Jingpohu is a basalt dam on the Mudanjiang; Wudalianchi is potassic scoria — different magma. Tianchi is not a tiankeng and not an impact. Pumice is not granite.",
        "evolution_sequence": "Basalt shield → trachyte cone → Plinian eruption → caldera lake",
        "what_you_see_today": "A cold lake in a collapsed magma chamber. Grey-white pumice on the slopes is 946 CE, not snow.",
        "corrections": [
            "Tianchi is a caldera, not a meteor crater and not a karst tiankeng.",
            "The millennium eruption is about 946 CE, not a sixteenth-century myth.",
        ],
        "observation_tips": [
            "Rim rock has vesicles or flow banding, no sedimentary bedding.",
            "Pumice floats.",
            "The waterfall cuts a lava-and-tephra dam, not limestone.",
        ],
    },
    "leiqiong": {
        "hook": "One UNESCO Global Geopark, two shores, two styles. North shore maar; south shore scoria.",
        "formation_short": "Leiqiong is one park: Huguangyan maar on the Leizhou Peninsula, Haikou scoria cones (Ma’anling, Leihuling) on northern Hainan, Weizhou Island offshore. Not three unrelated parks. Not tiankengs. Hainan does have a UNESCO Global Geopark — it is this park’s southern unit. Magma met water to make the maar; fissure eruptions built the scoria. Haikou Volcano and Huguangyan are national parks counted as units, not extra UNESCO parks. The world count stays 51.",
        "evolution_sequence": "Rift basalt → maar explosion + scoria cones → lakes and lava tubes",
        "what_you_see_today": "A round lake inside a tephra ring at Huguangyan; black scoria at Haikou.",
        "corrections": [
            "Huguangyan is a maar, not a karst tiankeng.",
            "Haikou Shishan is a Leiqiong unit, not a separate UNESCO Global Geopark.",
        ],
        "observation_tips": [
            "Maar walls are volcaniclastic, no fizz.",
            "Haikou: scoria and ropey lava. Do not freelance lava tubes.",
        ],
    },
    "jixian": {
        "hook": "North China’s deep-time ruler. A Mesoproterozoic sea, bed by bed, on the hills of Jizhou.",
        "formation_short": "Jixian is a stratigraphic textbook, not a karst famous mountain. Meso–Neoproterozoic marine carbonate and clastics of the Yanliao aulacogen, roughly 1.8 to 0.8 Ga. Changcheng clastics, Jixian Wumishan tidal dolostone with stromatolites, Qingbaikou above. Cover photos of Panshan in the same county are a different hill — this page prefers a schematic column to a wrong mountain.",
        "evolution_sequence": "Rift clastics → tidal dolostone and stromatolites → later cover and incision",
        "what_you_see_today": "Bedded dolostone and clastics. Stromatolites like sliced cabbage on fresh faces.",
        "corrections": [
            "Jixian is a stratotype, not a karst scenic mountain.",
        ],
        "observation_tips": [
            "Stromatolites on Wumishan faces.",
            "Do not sample the section.",
        ],
    },
    "chengjiang": {
        "hook": "518 million years ago, soft bodies were printed on shale. Look, don’t dig.",
        "formation_short": "Chengjiang is an Early Cambrian sea, not a treasure pit. Yu’anshan Formation (Maotianshan shale) ~518 Ma, thin, dark, flat. Quiet, sometimes anoxic water on the Yangtze Platform preserved arthropods, lobopodians, sponges and chordates as soft-bodied films. World Heritage and IUGS geoheritage. Uplift and differential weathering brought the paper-shale to view. Fossils are state property.",
        "evolution_sequence": "Quiet sea → exceptional burial → uplift → protected outcrop and museum",
        "what_you_see_today": "Paper shale and museum slabs. The field is a horizon, not a quarry.",
        "corrections": [
            "Soft-bodied Cambrian fossils. Not a collecting locality.",
        ],
        "observation_tips": [
            "Read the museum first.",
            "The bed is millimetres. No splitting for souvenirs.",
        ],
    },
}


def short_en(site):
    n = site.get("name_en") or site["name"]
    for a in ("UNESCO Global Geopark", "National Geopark", "Geopark"):
        n = n.replace(a, "")
    return n.strip() or site["name"]


def essay_en(site, up):
    sid = site["id"]
    if sid in DEEP_EN:
        d = dict(DEEP_EN[sid])
        d.setdefault("formation_timeline", up.get("formation_timeline") or [])
        # translate timeline names roughly
        return d
    lf = (site.get("landform_types") or ["other"])[0]
    body = LF_EN.get(lf, LF_EN["other"])
    name = short_en(site)
    age = site.get("geologic_age_text") or ""
    hook = f"{name}: {age} {lf.replace('_', ' ')}."
    short = (
        f"{name} is in {site.get('province')} {site.get('city') or ''}. "
        f"Listed age: {age}. {body} "
        f"Match rock and age before you reuse a landform word from a neighbouring park. "
        f"Look, do not take. Tickets: check the official listing on the day."
    )
    tips = [
        "Read the rock before the scenery word.",
        "Stay on open trails. No hammering, no collecting.",
        "Tickets and hours change — official listing on the day.",
    ]
    return {
        "hook": hook[:180],
        "formation_short": short,
        "evolution_sequence": up.get("evolution_sequence") or "",
        "what_you_see_today": f"At {name}, confirm the rock listed for this park. {body.split('.')[0]}.",
        "observation_tips": tips,
        "corrections": up.get("corrections") or [],
        "legal_notes": (
            "Fossils are in principle state property. Look, photograph, note. Do not dig."
            if lf in ("fossil", "stratigraphy") or "gssp" in site.get("types", [])
            else "Geoheritage is protected. No chiselling, carving, or collecting. This guide does not sell tickets."
        ),
    }


def main():
    # theme routes
    out_tr = []
    for tr in OLD:
        extra = OLD_EN.get(tr["id"], {})
        item = dict(tr)
        item.update({k: extra[k] for k in extra})
        out_tr.append(item)
    have = {t["id"] for t in out_tr}
    for tr in NEW:
        if tr["id"] not in have:
            out_tr.append(tr)
    (ROOT / "data/theme-routes.json").write_text(json.dumps(out_tr, ensure_ascii=False, indent=2))
    print("theme routes", len(out_tr))

    # English overlay
    sites_en = {}
    geosites_en = {}
    up_sites = UP.get("sites") or {}
    up_geo = UP.get("geosites") or {}
    for site in SITES:
        sid = site["id"]
        card = essay_en(site, up_sites.get(sid) or {})
        # timeline
        tl = []
        for st in (up_sites.get(sid) or {}).get("formation_timeline") or []:
            tl.append({"name": st.get("name") or "", "age": st.get("age") or "", "what": st.get("what") or ""})
        if sid in DEEP_EN:
            # keep Chinese timeline structure; English what from deep if missing
            card["formation_timeline"] = tl
        else:
            card["formation_timeline"] = tl[:3]
        vis = []
        for v in (up_sites.get(sid) or {}).get("visible_rocks_minerals_fossils") or []:
            vis.append({
                "name": v.get("name") or "Rock",
                "how_to_recognize": "Field ID: texture and structure. Look, do not collect.",
                "collect_allowed": False,
            })
        card["visible_rocks_minerals_fossils"] = vis
        sites_en[sid] = card
        for g in up_geo.get(sid) or []:
            geosites_en[g["id"]] = {
                "name": g.get("name") or "",
                "look_here": f"Open viewpoint for {g.get('name')}. Match the rock to this park’s story. No sampling.",
            }

    (ROOT / "data/en.json").write_text(json.dumps({"sites": sites_en, "geosites": geosites_en}, ensure_ascii=False))
    print("en sites", len(sites_en), "geosites", len(geosites_en), "bytes", (ROOT / "data/en.json").stat().st_size)


if __name__ == "__main__":
    main()
