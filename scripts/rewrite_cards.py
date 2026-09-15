#!/usr/bin/env python3
"""Rewrite template field cards for every site that still uses fill-in prose."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/workspace")
raw_sites = json.loads((ROOT / "data/sites.json").read_text())
upgrade = json.loads((ROOT / "data/upgrade.json").read_text())
en_bundle = json.loads((ROOT / "data/en.json").read_text())
up_sites = upgrade.get("sites") or {}

TMPL = re.compile(
    r"写在.+[县市旗区]|到了先认.+再套地貌名词|先对岩石再套地貌名词|再套地貌名词|"
    r"本园出露的沉积|到了先认颜色、颗粒|先认岩石再认地貌"
)
WEAK = re.compile(r"到了先认颜色、颗粒|先认岩石，再套地貌名词|本园出露的沉积")
TICKET = re.compile(
    r"化石与标本只看不挖。?|化石、矿物、岩石标本只看不挖。?|"
    r"票价以官方当日为准，本站不售票。?|"
    r"不是用景区形容词堆出来的[，。]?|"
    r"[^。]{0,40}再套地貌名词。|"
    r"[^。]{0,40}先对岩石再套地貌名词。"
)


def short(name: str) -> str:
    for bit in ("联合国教科文组织", "世界地质公园", "国家地质公园", "地质公园"):
        name = name.replace(bit, "")
    name = re.sub(r"[（(].*?[）)]", "", name)
    return name.strip() or name


def is_tmpl(text: str) -> bool:
    t = text or ""
    return bool(TMPL.search(t) or WEAK.search(t))


TECT = {
    "北京": "华北克拉通北缘、燕山褶皱带",
    "天津": "华北克拉通东缘",
    "河北": "华北克拉通 / 太行–燕山",
    "山西": "华北克拉通、山西高原",
    "内蒙古": "兴蒙造山带 / 华北北缘",
    "辽宁": "华北克拉通东北缘 / 胶辽",
    "吉林": "兴蒙–吉黑褶皱带",
    "黑龙江": "吉黑褶皱带",
    "上海": "扬子东南缘、长江口",
    "江苏": "扬子与华北拼合带",
    "浙江": "华南褶皱带、江山–绍兴结合带",
    "安徽": "大别–扬子",
    "福建": "东南沿海火山岩带",
    "江西": "华南褶皱带",
    "山东": "华北克拉通东缘 / 苏鲁超高压带",
    "河南": "华北南缘 / 秦岭",
    "湖北": "扬子北缘 / 大别",
    "湖南": "扬子与华南褶皱",
    "广东": "华南褶皱带",
    "广西": "扬子西南缘、右江盆地",
    "海南": "雷琼裂谷",
    "重庆": "扬子地台、四川盆地东缘",
    "四川": "扬子西缘 / 松潘–甘孜",
    "贵州": "扬子西南、黔中隆起",
    "云南": "特提斯东缘 / 扬子西缘",
    "西藏": "青藏高原、喜马拉雅–冈底斯",
    "陕西": "鄂尔多斯南缘 / 秦岭",
    "甘肃": "祁连–秦岭结合带",
    "青海": "东昆仑 / 柴达木",
    "宁夏": "鄂尔多斯西缘",
    "新疆": "天山–准噶尔 / 塔里木",
    "香港": "东南沿海火山岩带",
}

LF = {
    "karst": {
        "proc": "含二氧化碳的水沿节理溶蚀碳酸盐岩",
        "mix": "不是丹霞，也不是张家界石英砂岩柱。滴稀盐酸：起泡才是碳酸盐岩。",
        "see": "先认溶沟、溶痕或洞穴化学沉积",
        "rock": "碳酸盐岩（灰岩或白云岩）",
        "seq": "碳酸盐岩台地 → 抬升裂隙 → 溶沟 / 峡谷 / 洞穴",
        "tips": ["滴酸：起泡才是碳酸盐。", "溶沟沿节理，不是崩塌巷谷。", "钟乳石只看不摸。"],
        "tl": [
            ("碳酸盐沉积", "海相或潮坪", "灰岩或白云岩成层。"),
            ("抬升开裂", "中生代–新生代", "节理把水体引进去。"),
            ("溶蚀成形", "至今", "溶沟、峡谷或洞穴还在长。"),
        ],
        "en_proc": "CO2-bearing water dissolving carbonate along joints",
        "en_mix": "Not Danxia, not Zhangjiajie quartz-sandstone pillars. A drop of dilute HCl should fizz.",
        "en_see": "First find grikes, solution notches or speleothems",
        "en_rock": "Carbonate (limestone or dolostone)",
        "en_seq": "Carbonate platform → uplift and joints → grikes / gorge / cave",
        "en_tips": ["Fizz means carbonate.", "Grikes follow joints, not collapse alleys.", "Do not touch speleothems."],
        "en_tl": [
            ("Carbonate deposited", "marine or tidal flat", "Limestone or dolostone in beds."),
            ("Uplift and joints", "Mesozoic–Cenozoic", "Joints let water in."),
            ("Dissolution", "to the present", "Grikes, gorges or caves still grow."),
        ],
    },
    "danxia": {
        "proc": "红层被抬升，垂直节理把墙切开，硬层出檐、软层凹进，再崩成巷谷和方山",
        "mix": "不是张掖那种干旱彩丘，不是喀斯特。定义地在广东丹霞山。",
        "see": "先认红层砂岩和垂直节理",
        "rock": "白垩纪–古近纪陆相红层砂砾岩",
        "seq": "红层沉积 → 抬升节理 → 赤壁 / 巷谷 / 方山",
        "tips": ["指出硬层出檐和软层凹进。", "垂直节理是墙的缝，不是溶沟。", "雨天红层滑。"],
        "tl": [
            ("红层沉积", "白垩纪–古近纪", "陆相砂砾岩被铁染红。"),
            ("抬升开裂", "新生代", "垂直节理把岩体切成块。"),
            ("崩塌成景", "至今", "巷谷和方山是崩出来的。"),
        ],
        "en_proc": "Red beds lifted, vertical joints cutting walls, hard ledges and soft recesses, then collapse",
        "en_mix": "Not Zhangye arid colourful hills, not karst. The type locality is Danxiashan, Guangdong.",
        "en_see": "Name the red-bed sandstone and the vertical joints first",
        "en_rock": "Cretaceous–Palaeogene terrestrial red-bed sandstone and conglomerate",
        "en_seq": "Red-bed deposition → joints → red cliffs / alleys / mesas",
        "en_tips": ["Point to a hard ledge and a recessed soft bed.", "A vertical joint is not a karst grike.", "Red beds are slick in rain."],
        "en_tl": [
            ("Red beds", "Cretaceous–Palaeogene", "Terrestrial sandstone stained by iron."),
            ("Uplift and joints", "Cenozoic", "Vertical joints cut the mass."),
            ("Collapse", "to the present", "Alleys and mesas are collapse forms."),
        ],
    },
    "zhangjiajie_sandstone": {
        "proc": "厚层石英砂岩沿近垂直节理崩成方山、石墙和峰林",
        "mix": "不是喀斯特。滴酸不起泡。也不是红层丹霞。",
        "see": "先认浅色砂岩和近方形截面",
        "rock": "泥盆纪滨海石英砂岩",
        "seq": "夷平面 → 方山 → 石墙 → 峰林",
        "tips": ["截面近方，是节理不是溶沟。", "软层凹、硬层出檐。", "黄龙洞是灰岩对照，峰林主体不是。"],
        "tl": [
            ("成滩", "泥盆纪", "滨岸石英砂固结。"),
            ("抬升", "中生代末–新生代", "岩体被送到侵蚀基准面之上。"),
            ("下切崩塌", "至今", "水沿节理走，柱变瘦。"),
        ],
        "en_proc": "Thick quartz sandstone collapsing along near-vertical joints into mesas, walls and pillars",
        "en_mix": "Not karst — acid does not fizz. Not red-bed Danxia.",
        "en_see": "Name pale sandstone and a near-square section first",
        "en_rock": "Devonian coastal quartz sandstone",
        "en_seq": "Planation surface → mesa → wall → peak forest",
        "en_tips": ["A square section is joints, not grikes.", "Soft beds recess, hard beds ledge.", "Huanglong Cave is limestone; the pillars are not."],
        "en_tl": [
            ("Beach sand", "Devonian", "Quartz sand lithified on a shore."),
            ("Uplift", "late Mesozoic–Cenozoic", "The mass rose above base level."),
            ("Incision and collapse", "to the present", "Water follows joints; pillars thin."),
        ],
    },
    "granite_peak": {
        "proc": "花岗岩岩基被抬升，沿节理球状风化成峰、石蛋或石柱",
        "mix": "不是火山颈。粗粒石英+长石，不是玄武岩渣锥。",
        "see": "先认斑晶和球状风化",
        "rock": "中生代花岗岩（石英、长石、云母）",
        "seq": "深成侵入 → 抬升剥露 → 球状风化峰林",
        "tips": ["能指出石英和长石斑晶。", "石蛋是球状风化，不是熔岩球。", "雨天岩面滑。"],
        "tl": [
            ("侵入", "中生代", "岩浆在地下缓慢结晶。"),
            ("抬升剥露", "新生代", "上覆岩石被拆掉。"),
            ("球状风化", "至今", "棱角先坏，剩下峰和石蛋。"),
        ],
        "en_proc": "A granite pluton lifted and spheroidally weathered into peaks, tors or pillars",
        "en_mix": "Not a volcanic neck. Coarse quartz + feldspar, not basaltic scoria.",
        "en_see": "Name phenocrysts and spheroidal weathering first",
        "en_rock": "Mesozoic granite (quartz, feldspar, mica)",
        "en_seq": "Intrusion → unroofing → spheroidal peaks",
        "en_tips": ["Point to quartz and feldspar.", "A tor is spheroidal weathering, not a lava bomb.", "Granite is slick in rain."],
        "en_tl": [
            ("Intrusion", "Mesozoic", "Magma crystallised slowly at depth."),
            ("Unroofing", "Cenozoic", "Cover rock was stripped."),
            ("Spheroidal weathering", "to the present", "Corners fail first; peaks and tors remain."),
        ],
    },
    "volcano": {
        "proc": "岩浆喷出或近地表爆炸，留下渣锥、熔岩台地、玛珥湖或破火山口",
        "mix": "玛珥湖不是喀斯特天坑。渣锥不是花岗岩。",
        "see": "先认气孔、绳状熔岩或火山碎屑",
        "rock": "玄武岩、安山岩或火山碎屑",
        "seq": "喷发 → 锥 / 湖 / 台地 → 风化与海蚀或流水改造",
        "tips": ["气孔和绳状构造能和沉积层理分开。", "玛珥是爆炸坑，岸壁是碎屑。", "火口墙沿步道走。"],
        "tl": [
            ("喷发", "新近纪–第四纪（各园不同）", "熔岩或碎屑落到地面。"),
            ("成形", "喷发后不久", "锥、湖或台地定型。"),
            ("改造", "至今", "水、风或海浪再切一刀。"),
        ],
        "en_proc": "Magma reaching the surface as scoria cones, lava plates, maars or a caldera",
        "en_mix": "A maar is not a karst tiankeng. A scoria cone is not granite.",
        "en_see": "Find vesicles, ropey lava or pyroclastics first",
        "en_rock": "Basalt, andesite or volcaniclastic rock",
        "en_seq": "Eruption → cone / lake / plate → later water, wind or waves",
        "en_tips": ["Vesicles and ropey texture are not bedding.", "A maar wall is debris, not limestone.", "Stay on the crater path."],
        "en_tl": [
            ("Eruption", "Neogene–Quaternary (park-specific)", "Lava or tephra reached the surface."),
            ("Landform locks in", "soon after", "Cone, lake or plate."),
            ("Reworking", "to the present", "Water, wind or waves cut again."),
        ],
    },
    "yardang": {
        "proc": "干旱区风和间歇洪水把河湖相软硬互层切成土台和廊",
        "mix": "不是丹霞崩塌崖，没有垂直节理巷谷。",
        "see": "先认水平层理被风切开",
        "rock": "河湖相砂泥岩",
        "seq": "河湖沉积 → 变干 → 风蚀雅丹",
        "tips": ["层是水平的，柱是后来切的。", "风沙天能见度低。", "不要走近陡立土柱根部。"],
        "tl": [
            ("河湖沉积", "新近纪–第四纪", "砂泥互层记下干湿。"),
            ("变干抬升", "第四纪", "水体退出。"),
            ("风蚀", "至今", "软层先走，留下土台。"),
        ],
        "en_proc": "Wind and flash floods cutting lacustrine soft–hard beds into yardangs",
        "en_mix": "Not Danxia collapse cliffs — no joint-controlled alleys.",
        "en_see": "Name horizontal bedding cut by wind first",
        "en_rock": "Lacustrine sandstone and mudstone",
        "en_seq": "Lake beds → drying → wind-cut yardangs",
        "en_tips": ["Beds are horizontal; the pillars were cut later.", "Sandstorms drop visibility.", "Stay off the foot of steep earth walls."],
        "en_tl": [
            ("Lake beds", "Neogene–Quaternary", "Sand–mud couplets record wet and dry."),
            ("Drying and uplift", "Quaternary", "Water left."),
            ("Wind cut", "to the present", "Soft beds go first."),
        ],
    },
    "glacier": {
        "proc": "冰是外力：刨蚀、搬运、堆积，留下槽谷、冰碛和冰舌",
        "mix": "堰塞湖不是火山口湖。不要走上未开放的冰舌。",
        "see": "先认冰碛和槽谷，不要只拍雪",
        "rock": "基岩加第四纪冰碛",
        "seq": "山地抬升 → 成冰 → 槽谷与冰碛",
        "tips": ["冰碛是杂乱棱角块石。", "禁止走上未开放冰舌。", "注意冰裂和高原反应。"],
        "tl": [
            ("山地抬升", "新生代", "把岩石送到成冰高度。"),
            ("成冰", "第四纪–至今", "冰开始刨。"),
            ("堆积", "至今", "冰碛和槽谷能走着看。"),
        ],
        "en_proc": "Ice as the agent: plucking, carrying, dumping — troughs, moraine, a tongue",
        "en_mix": "A landslide-dammed lake is not a crater lake. Do not walk an unopened tongue.",
        "en_see": "Name moraine and the trough first — not just snow",
        "en_rock": "Bedrock plus Quaternary till",
        "en_seq": "Uplift → ice → troughs and moraine",
        "en_tips": ["Till is angular rubble.", "Do not walk an unopened tongue.", "Watch crevasses and altitude."],
        "en_tl": [
            ("Uplift", "Cenozoic", "Rock reached the snowline."),
            ("Ice grows", "Quaternary–present", "Ice starts to pluck."),
            ("Dumping", "to the present", "Moraine and troughs are walkable."),
        ],
    },
    "loess": {
        "proc": "风把粉砂堆成黄土，流水再切成塬、梁、峁",
        "mix": "不是红层丹霞。粉砂、垂直节理，没有崩塌赤壁那一套。",
        "see": "先认粉砂和垂直节理",
        "rock": "第四纪风成黄土",
        "seq": "风积 → 垂直节理 → 塬梁峁",
        "tips": ["粉砂能捻开。", "黄土陡坎会塌，不要靠近壁根。", "雨后泥泞。"],
        "tl": [
            ("风积", "第四纪", "粉砂从西北落下来。"),
            ("节理", "堆积之后", "垂直裂隙把土切开。"),
            ("下切", "至今", "塬被切成梁和峁。"),
        ],
        "en_proc": "Wind-blown silt stacked as loess, later cut into yuan, liang and mao",
        "en_mix": "Not red-bed Danxia. Silt and vertical joints, no collapse red cliffs.",
        "en_see": "Name silt and vertical joints first",
        "en_rock": "Quaternary aeolian loess",
        "en_seq": "Aeolian silt → vertical joints → yuan–liang–mao",
        "en_tips": ["Silt rubs to powder.", "Loess scarps collapse; stay off the foot.", "Mud after rain."],
        "en_tl": [
            ("Wind stack", "Quaternary", "Silt arrived from the northwest."),
            ("Joints", "after stacking", "Vertical fissures cut the silt."),
            ("Incision", "to the present", "Yuan is cut into liang and mao."),
        ],
    },
    "coast": {
        "proc": "海浪把节理或堆积物显示出来：海蚀崖、柱状节理或沙岛",
        "mix": "沙岛不是基岩丘。柱状节理是冷却收缩，玄武岩和酸性岩都能长。",
        "see": "先看潮汐表，再认岩石还是沙",
        "rock": "基岩或第四纪沙泥",
        "seq": "岩石或来沙 → 海浪改造 → 崖、滩或沙岛",
        "tips": ["先看潮汐再下岸。", "涨潮会断退路。", "风暴潮天不要近水。"],
        "tl": [
            ("物质到位", "各园不同", "基岩或河流来沙。"),
            ("海浪加工", "全新世–至今", "崖、滩或沙岛成形。"),
            ("还在变", "今天", "潮汐每天改一刀。"),
        ],
        "en_proc": "Waves showing joints or stacking sand: cliffs, columns or a sand island",
        "en_mix": "A sand island is not a bedrock hill. Cooling columns grow in basalt and in acid rock.",
        "en_see": "Read the tide table, then name rock versus sand",
        "en_rock": "Bedrock or Quaternary sand and mud",
        "en_seq": "Rock or river sand → waves → cliff, beach or island",
        "en_tips": ["Read the tide table.", "A rising tide can cut the return.", "Stay off the water in storm surge."],
        "en_tl": [
            ("Material arrives", "park-specific", "Bedrock or river sand."),
            ("Waves work it", "Holocene–present", "Cliff, beach or island."),
            ("Still changing", "today", "Each tide recuts."),
        ],
    },
    "fossil": {
        "proc": "生物遗体或遗迹被埋进沉积层，变成国家所有的化石层",
        "mix": "化石是一层，不是能挖的药，也不是纪念品。",
        "see": "只看展陈和保护廊",
        "rock": "含化石的沉积岩",
        "seq": "生物埋藏 → 成岩 → 保护廊展示",
        "tips": ["化石只看不挖。", "发现重要化石向管理部门报告。", "保护廊内不翻越。"],
        "tl": [
            ("埋藏", "各地质时代", "生物落进沉积。"),
            ("成岩", "之后", "变成化石层。"),
            ("保护", "现在", "展陈和廊是你能看的全部。"),
        ],
        "en_proc": "Bodies or traces buried in sediment, now a protected fossil bed",
        "en_mix": "A fossil is a bed, not medicine and not a souvenir.",
        "en_see": "Look only at galleries and protected walkways",
        "en_rock": "Fossil-bearing sedimentary rock",
        "en_seq": "Burial → lithification → a protected walkway",
        "en_tips": ["Look, do not dig.", "Report an important find to the managers.", "Do not climb the barrier."],
        "en_tl": [
            ("Burial", "the listed age", "Organisms entered the sediment."),
            ("Lithification", "later", "A fossil bed."),
            ("Protection", "now", "The gallery is all you get to see."),
        ],
    },
    "stratigraphy": {
        "proc": "连续（或近连续）的岩层被抬升切开，成为能对比的尺子",
        "mix": "这是层序，不是名山外形。层型点禁止取样。",
        "see": "先认岩性和上下层序",
        "rock": "剖面所列的沉积或火山岩",
        "seq": "沉积或喷发 → 抬升 → 剖面出露",
        "tips": ["指出一层的顶和底。", "剖壁勿攀、勿取样。", "公路边注意车辆。"],
        "tl": [
            ("成层", "名录时代", "岩石按时间叠上去。"),
            ("抬升切开", "中新生代", "剖面被送到能走的高度。"),
            ("对比", "现在", "这是尺子，不是风景名词。"),
        ],
        "en_proc": "A (near-)continuous pile of beds lifted and cut so it can be correlated",
        "en_mix": "This is a section, not a scenic mountain. No sampling on a GSSP.",
        "en_see": "Name the lithology and the order of beds first",
        "en_rock": "The sedimentary or volcanic rocks listed for the section",
        "en_seq": "Deposition or eruption → uplift → a readable section",
        "en_tips": ["Point to the top and base of one bed.", "Do not climb or sample the face.", "Watch traffic beside roadcuts."],
        "en_tl": [
            ("Beds accumulate", "the listed age", "Rock stacked in time."),
            ("Uplift and cut", "Mesozoic–Cenozoic", "The section reached a path."),
            ("Correlation", "now", "A ruler, not a scenery word."),
        ],
    },
    "geo_hazard": {
        "proc": "滑坡、崩塌、堰塞或泥石流把山体重新堆过一次",
        "mix": "滑坡堆积不是熔岩。堰塞湖会变。",
        "see": "先认滑面或崩积块石的棱角",
        "rock": "基岩加灾害堆积",
        "seq": "失稳 → 堆积 / 堵江 → 还在调整",
        "tips": ["只走开放观景点。", "雨后不要靠近陡壁。", "水位会变。"],
        "tl": [
            ("失稳", "历史或全新世事件", "坡或冰先垮。"),
            ("堆积", "事件当时", "块石或堰塞湖。"),
            ("调整", "至今", "还没走稳。"),
        ],
        "en_proc": "A landslide, collapse, dam-burst or debris flow restacking the slope",
        "en_mix": "Landslide rubble is not lava. A dammed lake changes.",
        "en_see": "Name a slide surface or angular talus first",
        "en_rock": "Bedrock plus event deposits",
        "en_seq": "Failure → dump / dam → still adjusting",
        "en_tips": ["Open viewpoints only.", "Stay off steep faces after rain.", "Water level changes."],
        "en_tl": [
            ("Failure", "a dated or Holocene event", "A slope or ice let go."),
            ("Dumping", "the event", "Rubble or a dammed lake."),
            ("Adjustment", "to the present", "Not finished."),
        ],
    },
    "other": {
        "proc": "岩石先到位，构造给出方向，外力再切一刀",
        "mix": "外形相同，岩石可能完全不同。先认岩石。",
        "see": "先认颜色、颗粒、层理或斑晶",
        "rock": "现场能指认的岩石",
        "seq": "岩石 → 构造 → 外力",
        "tips": ["先认颜色、颗粒、层理或斑晶。", "沿开放步道走。", "只看不挖。"],
        "tl": [
            ("岩石到位", "名录时代", "先有这套岩石。"),
            ("构造", "之后", "节理、断层或层面给出方向。"),
            ("外力", "至今", "水、风、冰或海浪再切。"),
        ],
        "en_proc": "Rock first, structure next, a surface process last",
        "en_mix": "The silhouette can match a different rock. Name the rock.",
        "en_see": "Name colour, grain, bedding or phenocrysts first",
        "en_rock": "The rock you can point to on the path",
        "en_seq": "Rock → structure → surface process",
        "en_tips": ["Name the rock before the landform word.", "Stay on open paths.", "Look, do not take."],
        "en_tl": [
            ("Rock arrives", "the listed age", "This package first."),
            ("Structure", "later", "Joints, faults or bedding steer the cut."),
            ("Surface process", "to the present", "Water, wind, ice or waves."),
        ],
    },
}

HAND = {
    "yesanpo": {
        "hook": "拒马河把碳酸盐岩切成百里峡。北方河谷喀斯特，不是桂林峰林，也不是丹霞。",
        "today": "站在百里峡谷底看近直立的谷壁。滴酸验证碳酸盐。溶沟和河弯是同一套水。",
        "en_hook": "The Juma River cut carbonate into the Hundred-Mile Gorge. Northern valley karst — not Guilin towers, not Danxia.",
        "en_today": "From the gorge floor, look at the near-vertical walls. Dilute HCl should fizz. Grikes and meanders are the same water.",
    },
    "baishishan": {
        "hook": "涞源白石山是元古宙大理岩被抬成的峰林。看起来像张家界，岩石完全不是石英砂岩。",
        "today": "先认大理岩的糖粒状断面。滴酸弱于灰岩。峰林是构造+溶蚀，不是泥盆纪砂岩柱。",
        "en_hook": "Laiyuan Baishi Shan is a Proterozoic marble peak forest. It looks like Zhangjiajie; the rock is not quartz sandstone.",
        "en_today": "Name the sugary marble break. Acid is weaker than on limestone. Structure plus dissolution — not Devonian sandstone pillars.",
    },
    "zhangshiyan": {
        "hook": "嶂石岩是中元古界石英砂岩。张家界那套序列更靠前：方山和长墙为主，峰林还没切碎。",
        "today": "先认厚层浅色砂岩和近水平层理。不是丹霞红层，滴酸不起泡。",
        "en_hook": "Zhangshiyan is Mesoproterozoic quartz sandstone. Earlier in the Zhangjiajie sequence: mesas and long walls, not a fully cut peak forest.",
        "en_today": "Name thick pale sandstone and near-horizontal bedding. Not red-bed Danxia. Acid does not fizz.",
    },
    "benxi": {
        "hook": "本溪水洞是北方碳酸盐岩里的暗河。溶得慢、洞更平，不是桂林峰林平原。",
        "today": "乘船只走开放河段。先认围岩是灰岩。钟乳石只看。",
        "en_hook": "Benxi Water Cave is a northern carbonate river cave. Dissolution is slower; the passage is flatter than Guilin tower karst.",
        "en_today": "Boat only the open reach. Name limestone as the wall rock. Do not touch speleothems.",
    },
    "ningwu": {
        "hook": "宁武冰洞把喀斯特和多年冰放在同一个洞里。冰是洞内小气候，不是冰川槽谷。",
        "today": "先认碳酸盐岩围岩，再认洞冰。不要把冰洞写成现代冰川槽谷。",
        "en_hook": "Ningwu Ice Cave puts karst and perennial ice in one cave. The ice is a microclimate, not a glacial trough.",
        "en_today": "Name the carbonate wall first, then the cave ice. This is not a modern glacial trough.",
    },
    "wutaishan": {
        "hook": "五台山是华北克拉通的老基底被削成台。台顶平，不是年轻火山锥。",
        "today": "先认变质岩和花岗岩。台是夷平面残留。寺庙是人文，不是成因。",
        "en_hook": "Wutai Shan is old North China Craton basement bevelled into platforms. Flat tops, not young volcanic cones.",
        "en_today": "Name metamorphic rock and granite. The platform is a planation remnant. Temples are culture, not the process.",
    },
    "luhe": {
        "hook": "六合看的是新生代玄武岩柱状节理。冷却收缩的六角柱，不是沉积层理。",
        "today": "桂子山一类石柱：先认柱体垂直、气孔。不是花岗岩石蛋。",
        "en_hook": "Luhe is Cenozoic basalt columnar jointing. Cooling columns, not sedimentary bedding.",
        "en_today": "At Guizishan-type columns: vertical prisms and vesicles first. Not granite tors.",
    },
    "chengde-danxia": {
        "hook": "承德丹霞是北方红层。同一套节理崩塌，气候比粤北干，崖更秃。",
        "today": "先认红层和垂直节理。不要用承德的庙当封面，看崖。",
        "en_hook": "Chengde Danxia is northern red beds. The same joint-and-collapse process, drier than Yuebei, so the cliffs are barer.",
        "en_today": "Name the red beds and vertical joints. Look at the cliff, not a temple.",
    },
    "chaoyang": {
        "hook": "朝阳鸟化石是热河生物群的一层。化石是国家所有，展陈里看，不是能挖的点。",
        "today": "到博物馆或保护廊。羽毛和鱼类是层，不是纪念品。",
        "en_hook": "Chaoyang bird fossils are a Jehol Biota bed. State property — galleries only, not a dig site.",
        "en_today": "Museum or protected walkway. Feathers and fish are a bed, not souvenirs.",
    },
    "jiayin": {
        "hook": "嘉荫是黑龙江边的恐龙化石层。看的是白垩纪河湖相，不是火山。",
        "today": "只看展陈和保护剖面。骨骼是层。",
        "en_hook": "Jiayin is a dinosaur-bearing bed on the Heilongjiang. Cretaceous river–lake deposits, not a volcano.",
        "en_today": "Galleries and protected sections only. Bones are a bed.",
    },
    "huangsongyu": {
        "hook": "平谷黄松峪是中生代盆地边的碎屑岩和火山岩窗口，不是喀斯特名洞。",
        "today": "先认颜色和层理。中生界，不是雾迷山组白云岩。",
        "en_hook": "Huangsongyu in Pinggu is a Mesozoic basin-margin window of clastics and volcanics, not a famous karst cave.",
        "en_today": "Name colour and bedding. Mesozoic — not the Wumishan dolostone.",
    },
    "qiyunshan": {
        "hook": "齐云山是皖南红层丹霞。邻山黄山是花岗岩，岩石完全不是一套。",
        "today": "先认红层砂砾岩。不要把道观当成因，看赤壁和垂直节理。",
        "en_hook": "Qiyunshan is southern Anhui red-bed Danxia. Neighbouring Huangshan is granite — a different rock.",
        "en_today": "Name red-bed sandstone and conglomerate. Daoist temples are not the process; look at the red cliff and vertical joints.",
    },
    "laoniuwan": {
        "hook": "老牛湾是晋陕黄河把黄土高原切出的深切曲流。看的是河弯和谷壁，不是花园。",
        "today": "先认粉砂黄土和基岩谷底。河在底下切，谷壁是黄土加基岩。",
        "en_hook": "Laoniuwan is a deeply incised Yellow River meander cutting the Loess Plateau. The bend and the walls — not a garden.",
        "en_today": "Name aeolian silt and the bedrock floor. The river incises; walls are loess over bedrock.",
    },
    "weizhoudao": {
        "hook": "涠洲岛是北部湾的火山岛。看的是火口、熔岩台地和海蚀，不是沙滩度假照。",
        "today": "先认玄武质熔岩和火山碎屑。海浪把火口墙切开。玛珥或破火山口不是喀斯特天坑。",
        "en_hook": "Weizhou is a Beibu Gulf volcanic island. Crater, lava plate and wave-cut coast — not a beach postcard.",
        "en_today": "Name basaltic lava and pyroclastics. Waves cut the crater wall. A maar is not a karst tiankeng.",
    },
    "yonghe": {
        "hook": "永和看的是黄河蛇曲深切入黄土。河弯是证据，不是壶口瀑布。",
        "today": "先认粉砂和近直立谷壁。能画出一个河弯再走。壶口不在本园。",
        "en_hook": "Yonghe is a Yellow River incised meander in loess. The bend is the evidence — not Hukou Falls.",
        "en_today": "Name silt and near-vertical walls. Sketch one meander before you leave. Hukou is not this park.",
    },
    "zhucheng": {
        "hook": "诸城是白垩纪恐龙化石产地。能看的是馆藏骨骼和保护层，不是能挖的点。",
        "today": "到博物馆。骨骼是层。图注必须写馆藏标本、非野外露头。",
        "en_hook": "Zhucheng is a Cretaceous dinosaur locality. Museum skeletons and protected beds — not a dig.",
        "en_today": "Go to the museum. Bones are a bed. Any photo must say museum specimen, not a field outcrop.",
    },
    "chongming": {
        "hook": "崇明是长江口沙岛，上海的国家地质公园。沙和潮汐每天改一刀，不是基岩丘，也不是佘山火山锥。",
        "today": "先看潮汐表再上滩。认的是潮滩、沙岛和河口，不是政区地图。",
        "en_hook": "Chongming is a Changjiang mouth sand island — Shanghai’s national geopark. Sand and tides recut daily. Not a bedrock hill, not the Sheshan cone.",
        "en_today": "Read the tide table. Name tidal flat, sand island and estuary — not a political map.",
    },
    "shihuadong": {
        "hook": "石花洞是房山的雾迷山组白云岩洞穴。石花、石旗是化学沉积，不是彩灯溶洞表演。",
        "today": "先认围岩是白云岩。石花只看不摸。商业彩灯不是成因。",
        "en_hook": "Shihuadong is a Wumishan Formation dolostone cave in Fangshan. Cave flowers and flags are chemical deposits, not a coloured-light show.",
        "en_today": "Name dolostone as the wall. Do not touch speleothems. Commercial lights are not the process.",
    },
    "changshan-islands": {
        "hook": "长山列岛是胶东沿海的基岩岛。先认变质岩或火山岩海岸，不是沙岛崇明。",
        "today": "先看潮汐表再下岸。认的是基岩海蚀，不是沙滩度假照。",
        "en_hook": "Changshan Islands are bedrock islands off Jiaodong. Name metamorphic or volcanic rock first — not Chongming sand.",
        "en_today": "Read the tide table. Name wave-cut bedrock, not a beach postcard.",
    },
    "sheshan": {
        "hook": "佘山是上海西南的新生代火山锥残丘。不是国家地质公园。教堂和天文台是后来盖上去的。",
        "today": "先认火山碎屑和玄武质岩石。不要把教堂当封面。对比的是崇明沙岛。",
        "en_hook": "Sheshan is a Cenozoic volcanic cone remnant in southwest Shanghai. Not a national geopark. The church and observatory were built later.",
        "en_today": "Name pyroclastics and basaltic rock. Do not use the church as the cover. The contrast site is Chongming sand island.",
    },
}


def rock_of(s, lf):
    age = (s.get("geologic_age_text") or "").strip()
    if age and "的" not in age and len(age) < 24:
        return f"{age}的{lf['rock']}"
    return lf["rock"]


def clean_form(text: str) -> str:
    t = text or ""
    t = TICKET.sub("", t)
    t = re.sub(r"再套地貌名词", "再认过程", t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"。+", "。", t).strip()
    return t


def build_zh(s, raw):
    lf_key = (raw.get("landform_types") or ["other"])[0]
    lf = LF.get(lf_key, LF["other"])
    name = short(s.get("name") or raw.get("name") or raw["id"])
    age = (raw.get("geologic_age_text") or s.get("geologic_age_text") or "").strip() or "名录所列时代"
    tect = TECT.get(raw.get("province") or "", "区域构造抬升带")
    city = raw.get("city") or raw.get("province") or ""
    hand = HAND.get(raw["id"], {})
    existing_hook = clean_form(s.get("hook") or raw.get("hook") or "")
    hook = hand.get("hook") or existing_hook
    if is_tmpl(hook) or len(hook) < 24:
        hook = f"{name}看的是{lf['proc']}。时代：{age}。{lf['see']}。{lf['mix']}"
    form = clean_form(s.get("formation_short") or raw.get("formation_short") or "")
    if is_tmpl(form) or len(form) < 40 or "写在" in form:
        form = (
            f"岩石：{rock_of(s, lf)}。构造：{tect}。外力：{lf['proc']}。"
            f"{lf['mix']}到了{city}先认岩石，再认这个过程。只看不挖。"
        )
    today = hand.get("today") or clean_form(s.get("what_you_see_today") or "")
    if is_tmpl(today) or len(today) < 20:
        today = f"到{name}：{lf['see']}。{lf['mix']}"
    tips = [t for t in (s.get("observation_tips") or lf["tips"]) if t and "再套地貌名词" not in t]
    if len(tips) < 2:
        tips = lf["tips"]
    rocks = [
        {
            "name": lf["rock"],
            "how_to_recognize": f"{lf['see']}。只看不挖。",
            "collect_allowed": False,
        }
    ]
    if s.get("visible_rocks_minerals_fossils"):
        keep = []
        for r in s["visible_rocks_minerals_fossils"]:
            how = r.get("how_to_recognize") or ""
            if "再套地貌名词" in how or "本园出露" in how:
                continue
            if (r.get("name") or "") and len(how) >= 8:
                keep.append({**r, "collect_allowed": False})
        if keep:
            rocks = keep[:4]
    timeline = s.get("formation_timeline") or []
    if not timeline or any(is_tmpl(x.get("what") or "") or (x.get("name") or "") in ("区域构造史",) for x in timeline):
        timeline = [{"name": a, "age": b, "what": c} for a, b, c in lf["tl"]]
    corrections = [
        c
        for c in (s.get("corrections") or [])
        if c and "再套地貌名词" not in c and "写在" not in c and "打卡点仍在逐园核实" not in c
    ]
    return {
        "hook": hook,
        "formation_short": form,
        "what_you_see_today": today,
        "observation_tips": tips[:5],
        "evolution_sequence": s.get("evolution_sequence") if s.get("evolution_sequence") and not is_tmpl(s.get("evolution_sequence") or "") else lf["seq"],
        "formation_timeline": timeline,
        "visible_rocks_minerals_fossils": rocks,
        "content_status": "standard",
        "content_tier": "standard",
        "corrections": corrections,
    }


def build_en(raw, zh):
    lf_key = (raw.get("landform_types") or ["other"])[0]
    lf = LF.get(lf_key, LF["other"])
    name = raw.get("name_en") or raw["id"]
    age = raw.get("geologic_age_text") or "the listed age"
    # geologic_age_text may be CJK; drop it if so
    if re.search(r"[\u4e00-\u9fff]", age):
        age = "the age written on the Chinese park page"
        # better: landform default
        age = lf_key.replace("_", " ")
        age = {
            "karst": "Palaeozoic carbonate, later uplifted",
            "danxia": "Cretaceous–Palaeogene red beds",
            "zhangjiajie_sandstone": "Devonian quartz sandstone",
            "granite_peak": "Mesozoic granite",
            "volcano": "Neogene–Quaternary volcanic rock",
            "yardang": "Neogene–Quaternary lake beds",
            "glacier": "bedrock plus Quaternary ice",
            "loess": "Quaternary aeolian silt",
            "coast": "bedrock or Holocene sand",
            "fossil": "the fossil-bearing beds of this park",
            "stratigraphy": "the section’s listed interval",
            "geo_hazard": "a dated failure deposit",
            "other": "the rock listed for this park",
        }.get(lf_key, "the listed rock")
    city = raw.get("city") or raw.get("province") or ""
    if re.search(r"[\u4e00-\u9fff]", city):
        city = name
    hand = HAND.get(raw["id"], {})
    return {
        "city": en_bundle.get("sites", {}).get(raw["id"], {}).get("city") or "",
        "geologic_age_text": age if not re.search(r"[\u4e00-\u9fff]", str(age)) else lf["en_rock"],
        "hook": hand.get("en_hook") or f"{name}: {lf['en_proc']}. {lf['en_see']}. {lf['en_mix']}",
        "formation_short": (
            f"{name}. Rock: {lf['en_rock']}. Process: {lf['en_proc']}. {lf['en_mix']} "
            "Look, do not take."
        ),
        "evolution_sequence": lf["en_seq"],
        "what_you_see_today": hand.get("en_today")
        or f"At {name}, {lf['en_see'].lower()}. {lf['en_mix']}",
        "observation_tips": lf["en_tips"],
        "formation_timeline": [{"name": a, "age": b, "what": c} for a, b, c in lf["en_tl"]],
        "visible_rocks_minerals_fossils": [
            {
                "name": lf["en_rock"],
                "how_to_recognize": f"{lf['en_see']}. Look, do not collect.",
                "collect_allowed": False,
            }
        ],
        "safety_notes": [
            "Stay on open paths. Do not climb fences.",
            "Ground is slick in rain.",
        ],
        "legal_notes": (
            "Protected geoheritage. Look, photograph, note. Do not hammer, dig, or take rock, "
            "mineral or fossil. Prices and hours follow the official listing on the day. "
            "This guide does not sell tickets."
        ),
    }


SKIP_REWRITE = {"huguangyan","yigong","zhada","laoniuwan","xixian-loess","zhengzhou-huanghe","huanghe-delta"}

def main():
    out = {}
    en_sites = en_bundle.setdefault("sites", {})
    n = 0
    for raw in raw_sites:
        sid = raw["id"]
        s = up_sites.get(sid, {})
        hook = s.get("hook") or raw.get("hook") or ""
        form = s.get("formation_short") or raw.get("formation_short") or ""
        today = s.get("what_you_see_today") or ""
        need = is_tmpl(hook) or is_tmpl(form) or is_tmpl(today) or sid in HAND
        if not need:
            # still rewrite EN if leftover template English
            e = en_sites.get(sid) or {}
            eh = e.get("hook") or ""
            if "geosite geosite" in eh or "See listed age" in eh or "built on geosite" in eh or "write on" in eh.lower():
                en_sites[sid] = {**e, **build_en(raw, s)}
                n += 1
            continue
        zh = build_zh(s or raw, raw)
        out[sid] = zh
        e = en_sites.get(sid) or {}
        en_sites[sid] = {**e, **build_en(raw, zh)}
        n += 1
    (ROOT / "data/rewrite.json").write_text(json.dumps({"sites": out}, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "data/en.json").write_text(json.dumps(en_bundle, ensure_ascii=False, indent=2) + "\n")
    print("rewrote", len(out), "zh cards; en touched", n)


if __name__ == "__main__":
    main()
