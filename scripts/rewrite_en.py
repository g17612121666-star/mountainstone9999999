#!/usr/bin/env python3
"""Rewrite data/en.json so EN mode has no leftover CJK in user-visible fields."""
from __future__ import annotations

import json
import re
from pathlib import Path

from pypinyin import Style, lazy_pinyin

ROOT = Path("/workspace")
CJK = re.compile(r"[\u4e00-\u9fff]")

SITES = json.loads((ROOT / "data/sites.json").read_text())
GEO = json.loads((ROOT / "data/geosites.json").read_text())
VISITS = json.loads((ROOT / "data/visits.json").read_text())
ROUTES = json.loads((ROOT / "data/routes.json").read_text())
AREAS = json.loads((ROOT / "data/areas.json").read_text())
STD = json.loads((ROOT / "data/standard.json").read_text())
UP = json.loads((ROOT / "data/upgrade.json").read_text())
OLD_EN = json.loads((ROOT / "data/en.json").read_text())

PROVINCE_EN = {
    "北京": "Beijing", "天津": "Tianjin", "河北": "Hebei", "山西": "Shanxi",
    "内蒙古": "Inner Mongolia", "辽宁": "Liaoning", "吉林": "Jilin",
    "黑龙江": "Heilongjiang", "上海": "Shanghai", "江苏": "Jiangsu",
    "浙江": "Zhejiang", "安徽": "Anhui", "福建": "Fujian", "江西": "Jiangxi",
    "山东": "Shandong", "河南": "Henan", "湖北": "Hubei", "湖南": "Hunan",
    "广东": "Guangdong", "广西": "Guangxi", "海南": "Hainan", "重庆": "Chongqing",
    "四川": "Sichuan", "贵州": "Guizhou", "云南": "Yunnan", "西藏": "Tibet",
    "陕西": "Shaanxi", "甘肃": "Gansu", "青海": "Qinghai", "宁夏": "Ningxia",
    "新疆": "Xinjiang", "香港": "Hong Kong",
}

CITY_SPECIAL = {
    "西贡区": "Sai Kung District",
    "延边州": "Yanbian",
    "湘西州": "Xiangxi",
    "神农架林区": "Shennongjia",
    "房山区": "Fangshan District",
    "长兴县": "Changxing County",
    "常山县": "Changshan County",
    "蓟州区": "Jizhou District",
    "松江区": "Songjiang District",
    "崇明区": "Chongming District",
    "武陵源区": "Wulingyuan District",
    "仁化县": "Renhua County",
    "石林彝族自治县": "Shilin Yi Autonomous County",
    "五大连池市": "Wudalianchi",
    "自贡市": "Zigong",
    "澄江市": "Chengjiang",
}

SUFFIX = [
    ("自治旗", " Autonomous Banner"),
    ("自治县", " Autonomous County"),
    ("林区", " Forestry District"),
    ("新区", " New Area"),
    ("地区", " Prefecture"),
    ("盟", " League"),
    ("旗", " Banner"),
    ("州", " Prefecture"),
    ("区", " District"),
    ("县", " County"),
    ("市", " "),
]

TOKENS: list[tuple[str, str]] = [
    ("中元古界雾迷山组潮坪白云岩", "Mesoproterozoic Wumishan tidal dolostone"),
    ("中元古界雾迷山组", "Mesoproterozoic Wumishan Formation"),
    ("雾迷山组白云岩", "Wumishan Formation dolostone"),
    ("雾迷山组叠层石白云岩", "Wumishan stromatolitic dolostone"),
    ("雾迷山组潮坪", "Wumishan tidal flat"),
    ("雾迷山组", "Wumishan Formation"),
    ("海相碳酸盐岩（灰岩或白云岩）", "marine carbonate (limestone or dolostone)"),
    ("碱性火山岩（安山质–粗面质到流纹质凝灰岩）", "alkaline volcanic rock (andesitic–trachytic to rhyolitic tuff)"),
    ("红色砂岩 / 砾岩", "red sandstone / conglomerate"),
    ("成岩 / 成景岩石", "Source rock of the landform"),
    ("成景岩石", "Source rock of the landform"),
    ("构造定位", "Structural setting"),
    ("外力雕塑", "Surface processes"),
    ("今天能看见什么", "What you see today"),
    ("古生代海侵", "Palaeozoic transgression"),
    ("看懂的标志", "You have read it when"),
    ("打卡点", "field stop"),
    ("简卡", "field card"),
    ("资料照片", "reference photo"),
    ("非本站踏勘", "not surveyed by this site"),
    ("国家级", "national"),
    ("世界级", "UNESCO Global"),
    ("金钉子", "GSSP"),
    ("只看不挖", "look, don’t take"),
    ("房山区", "Fangshan District"),
    ("北京", "Beijing"),
    ("上海", "Shanghai"),
    ("太古宙–新生代", "Archean–Cenozoic"),
    ("太古宙", "Archean"),
    ("太古代", "Archean"),
    ("古元古代", "Paleoproterozoic"),
    ("中元古代", "Mesoproterozoic"),
    ("中元古界", "Mesoproterozoic"),
    ("新元古代", "Neoproterozoic"),
    ("新元古界", "Neoproterozoic"),
    ("元古宙", "Proterozoic"),
    ("古生代", "Paleozoic"),
    ("寒武纪", "Cambrian"),
    ("寒武系", "Cambrian"),
    ("奥陶纪", "Ordovician"),
    ("奥陶系", "Ordovician"),
    ("志留纪", "Silurian"),
    ("泥盆纪", "Devonian"),
    ("石炭纪", "Carboniferous"),
    ("石炭系", "Carboniferous"),
    ("二叠纪", "Permian"),
    ("二叠系", "Permian"),
    ("中生代", "Mesozoic"),
    ("三叠纪", "Triassic"),
    ("三叠系", "Triassic"),
    ("侏罗纪", "Jurassic"),
    ("侏罗系", "Jurassic"),
    ("白垩纪", "Cretaceous"),
    ("白垩系", "Cretaceous"),
    ("新生代", "Cenozoic"),
    ("古近纪", "Paleogene"),
    ("新近纪", "Neogene"),
    ("第四纪", "Quaternary"),
    ("全新世", "Holocene"),
    ("更新世", "Pleistocene"),
    ("长城系", "Changcheng System"),
    ("蓟县系", "Jixian System"),
    ("青白口系", "Qingbaikou System"),
    ("长兴阶", "Changhsingian"),
    ("印度阶", "Induan"),
    ("达瑞威尔阶", "Darriwilian"),
    ("江山阶", "Jiangshanian"),
    ("大坪阶", "Dapingian"),
    ("赫南特阶", "Hirnantian"),
    ("排碧阶", "Paibian"),
    ("古丈阶", "Guzhangian"),
    ("吴家坪阶", "Wuchiapingian"),
    ("维宪阶", "Visean"),
    ("乌溜阶", "Wuliuan"),
    ("苗岭统", "Miaolingian"),
    ("白云岩", "dolostone"),
    ("灰岩", "limestone"),
    ("石灰岩", "limestone"),
    ("石英砂岩", "quartz sandstone"),
    ("石英岩", "quartzite"),
    ("花岗岩", "granite"),
    ("玄武岩", "basalt"),
    ("流纹岩", "rhyolite"),
    ("凝灰岩", "tuff"),
    ("砂岩", "sandstone"),
    ("砾岩", "conglomerate"),
    ("页岩", "shale"),
    ("泥岩", "mudstone"),
    ("叠层石", "stromatolite"),
    ("喀斯特", "karst"),
    ("丹霞", "Danxia"),
    ("峰林", "fenglin"),
    ("峰丛", "fengcong"),
    ("天坑", "tiankeng"),
    ("溶洞", "cave"),
    ("石芽", "karren"),
    ("节理", "joint"),
    ("层理", "bedding"),
    ("不整合", "unconformity"),
    ("夷平面", "planation surface"),
    ("球状风化", "spheroidal weathering"),
    ("柱状节理", "columnar jointing"),
    ("破火山口", "caldera"),
    ("玛珥湖", "maar"),
    ("堰塞湖", "dammed lake"),
    ("红层", "red beds"),
    ("黄土", "loess"),
    ("雅丹", "yardang"),
    ("火山碎屑", "pyroclastics"),
    ("熔岩", "lava"),
    ("化石", "fossil"),
    ("恐龙", "dinosaur"),
    ("约 14 亿年", "~1.4 Ga"),
    ("约14亿年", "~1.4 Ga"),
    ("亿年", " Ga"),
    ("百万年", " Ma"),
    ("万年前", " ka"),
    ("西山抬升", "Western Hills uplift"),
    ("潮坪", "tidal flat"),
    ("浅海碳酸盐岩再次覆盖", "shallow-marine carbonate covered the area again"),
    ("日后成为溶洞围岩", "later the cave wall-rock"),
    ("节理控制洞道分层", "joints steered cave storeys"),
    ("北方喀斯特", "northern karst"),
    ("桂林峰林平原", "Guilin fenglin plain"),
    ("拒马河", "Juma River"),
    ("石花洞", "Stone Flower Cave"),
    ("十渡", "Shidu"),
    ("周口店", "Zhoukoudian"),
    ("白石山", "Baishi Mountain"),
    ("佘山", "Sheshan"),
    ("崇明", "Chongming"),
    ("张家界", "Zhangjiajie"),
    ("丹霞山", "Danxiashan"),
    ("五大连池", "Wudalianchi"),
    ("长白山", "Changbaishan"),
    ("嵩山", "Songshan"),
    ("黄山", "Huangshan"),
    ("石林", "Shilin"),
    ("煤山", "Meishan"),
    ("蓟县", "Jixian"),
    ("房山", "Fangshan"),
]

TOKENS.sort(key=lambda x: len(x[0]), reverse=True)

GENERIC_GEO = {
    "峰丛或溶洞观景台": "Fengcong / cave viewpoint",
    "岩溶峡谷步道": "Karst-gorge path",
    "洞穴大厅入口": "Cave-hall entrance",
    "主园区观景台": "Main park viewpoint",
    "典型露头": "Type outcrop",
    "游客中心展板": "Visitor-centre panel",
    "火山锥观景台": "Cone viewpoint",
    "熔岩流露头": "Lava-flow outcrop",
    "火山口或堰塞湖岸": "Crater or dammed-lake shore",
    "化石层观景/博物馆": "Fossil-bed viewpoint / museum",
    "地层剖面廊道": "Stratigraphic gallery",
    "园区解说点": "Park interpretation point",
    "花岗岩峰林": "Granite peak forest",
    "石蛋或球状风化": "Tors / spheroidal weathering",
    "裂隙槽谷": "Joint-controlled slot",
    "主剖面观景栈道": "Section boardwalk",
    "不整合接触点": "Unconformity contact",
    "层型标志牌": "Stratotype marker",
    "红崖临空面": "Red-cliff face",
    "巷谷或一线天": "Alleyway / slot canyon",
    "方山台地面": "Mesa surface",
    "解说": "Interpretation point",
    "冰舌观景台": "Glacier-tongue viewpoint",
    "U 形谷坡": "U-shaped valley side",
    "冰川遗迹解说点": "Glacial-landform panel",
    "海蚀崖或柱状节理": "Sea cliff or columnar joints",
    "潮间带岩石": "Intertidal rock",
    "海湾观景台": "Bay viewpoint",
    "地质博物馆": "Geology museum",
    "崩塌堆积观景": "Collapse-deposit viewpoint",
    "石花洞": "Stone Flower Cave",
    "十渡拒马河谷": "Shidu, Juma River valley",
    "周口店遗址博物馆": "Zhoukoudian site museum",
    "白石山": "Baishi Mountain",
    "金鞭溪石英砂岩柱": "Golden Whip Stream quartz-sandstone pillars",
    "袁家界夷平面": "Yuanjiajie planation surface",
    "天子山方山": "Tianzi Mountain mesa",
    "阳元石赤壁": "Yangyuanshi red cliff",
    "锦江巷谷": "Jinjiang alleyway",
    "巴寨方山": "Bazhai mesa",
    "乃林石林": "Nailin stone forest",
    "大小石林": "Major and Minor Stone Forest",
    "乃古石林": "Naigu Stone Forest",
    "老黑山火口": "Laohei crater",
    "火烧山熔岩": "Huoshao lava",
    "三池连珠": "Three linked lava-dammed lakes",
    "西佘山火山岩": "West Sheshan volcanic rock",
    "东佘山露头": "East Sheshan outcrop",
    "天池破火山口": "Tianchi caldera",
    "煤山 D 剖面": "Meishan D section",
    "黄泥塘剖面": "Huangnitang section",
    "雾迷山组叠层石": "Wumishan stromatolites",
    "长城系剖面": "Changcheng System section",
    "园区总览": "Park overview",
}

PH_LOOK = {
    "bedding": "Stand on the open path. Point to the top and base of one bed. You have read it when you can say whether the beds above and below belong to the same package. Located to the park or viewpoint — no sampling coordinates.",
    "joint": "Stand on the open path. Use both hands to show two joint sets and how they cut the rock into blocks. Located to the park or viewpoint — no sampling coordinates.",
    "fold": "Stand on the open path. Point to the hinge where beds bend — a curved ridge is not automatically a fold. Located to the park or viewpoint — no sampling coordinates.",
    "unconformity": "Stand at the marked section. Beds above and below do not share a dip; the surface between them is erosion, not an ordinary bedding plane. No sampling.",
    "peak": "From an open viewpoint, name the pillar or peak boundary: joint, dissolution groove, or collapse face — not just a silhouette. Located to the park or viewpoint.",
    "cave_speleothem": "In the cave, recognise a stalactite as calcium grown back out of water. Do not touch. Follow the on-site brief. No sampling.",
    "lava": "On the open path, find vesicles, ropey or scoriaceous texture, and separate them from sedimentary bedding. Located to the park or viewpoint.",
    "fossil_layer": "At the gallery or protected walkway: a fossil is a bed, not a souvenir. Look, photograph, note. Do not hammer or collect.",
    "collapse": "Point to a slide surface or angular talus. A rubble pile is not lava. Stay on the open path.",
    "pillar": "Read the pillar’s cross-section and any hard–soft ledges, and separate it from a neighbouring pillar of a different rock. Located to the park or viewpoint.",
    "dike": "The sheet cuts the country rock; walls are roughly parallel; grain size differs. Located to the park or viewpoint — no sampling coordinates.",
    "stromatolite": "Laminae convex-up mark the top. Stromatolites are microbial mats, not ornamental stone. Do not chisel. Located to the park or viewpoint.",
    "other": "First name the rock, then the one process this stop is here to prove. Located to the park or viewpoint — no sampling coordinates.",
}

HAND_LOOK = {
    "jx-wumishan": "Stand at an open section or panel on the Wumishan Formation. Find stromatolites: laminae like sliced cabbage, convex-up. You have read it when you can point to the top of one lamina — not treat dolostone as a souvenir. Park/path only. No sampling.",
    "jx-changcheng": "Stand on the lower section. Sandstone–shale interbeds are the early Changcheng rift transgression. You have read it when you can say clastics come before Wumishan dolostone, from the bottom up. Watch traffic at roadside cuts.",
    "jx-overview": "Walk the groups as a contents list: Changcheng → Jixian → Qingbaikou. This is North China’s Meso–Neoproterozoic ruler, not a karst famous mountain and not the granite of Panshan.",
}

LANDFORM_EN = {
    "karst": "karst",
    "danxia": "Danxia",
    "zhangjiajie_sandstone": "quartz-sandstone peak forest",
    "granite_peak": "granite peaks",
    "volcano": "volcano",
    "yardang": "yardang",
    "glacier": "glacier",
    "loess": "loess",
    "coast": "coast",
    "fossil": "fossil locality",
    "stratigraphy": "stratigraphic section",
    "geo_hazard": "geo-hazard landform",
    "other": "geosite",
}

SAFETY_EN = {
    "karst": [
        "Follow the cave brief; do not leave the group.",
        "Stay out of ungated sinks and streams after heavy rain.",
        "Do not hammer or touch speleothems.",
    ],
    "danxia": [
        "Rockfall under cliffs — stay on the path.",
        "Do not climb unprotected walls.",
        "Red-bed sandstone is slick in rain.",
    ],
    "zhangjiajie_sandstone": [
        "Rockfall in the peak forest — do not climb fences.",
        "Sandstone is slick in rain.",
        "Do not climb unprotected pillars.",
    ],
    "granite_peak": [
        "Joint faces shed blocks.",
        "Do not climb unprotected walls.",
        "Rock is slick in rain.",
    ],
    "volcano": [
        "Crater walls and scoria slopes are loose — stay on the path.",
        "Watch for burns at hot springs.",
        "Do not climb crater fences.",
    ],
    "yardang": [
        "Wind and sand cut visibility; it is easy to get lost.",
        "Summer ground is hot; carry water.",
        "Do not stand at the foot of undercut pillars.",
    ],
    "glacier": [
        "Stay off closed ice tongues.",
        "Watch crevasses, icefall and altitude sickness.",
        "Strong UV — wear glasses.",
    ],
    "loess": [
        "Loess scarps collapse; stay away from the foot of the wall.",
        "Mud after rain; watch your footing.",
    ],
    "coast": [
        "Read the tide table before you go down.",
        "A rising tide can cut the intertidal return.",
        "Stay off the water in storm surge and typhoons.",
    ],
    "fossil": [
        "Do not climb out of the protected gallery.",
        "No scraping, no collecting. Fossil beds are not public dig sites.",
    ],
    "stratigraphy": [
        "Do not climb or sample the face.",
        "Watch traffic at roadside sections.",
        "Boardwalks are slick when wet.",
    ],
    "geo_hazard": [
        "Landslide and collapse remnants are still unstable — open paths only.",
        "Stay off steep faces after rain.",
    ],
    "other": ["Stay on open paths. Do not climb fences.", "Ground is slick in rain."],
}

SAFETY_CHONGMING = [
    "Chongming is an estuary sand island. Read tide and weather; stay off the flats in storm surge.",
    "Tidal flats, reed beds and bird reserves close by season — do not walk into wetlands.",
    "Soft mud swallows feet. There are no caves, glaciers or craters here.",
]
SAFETY_URBAN = [
    "Municipal paths and park roads — watch traffic.",
    "Stay out of closed worksites, restricted campuses and private yards.",
    "Woodland steps are slick after rain.",
]

LEGAL_EN = (
    "Protected geoheritage. Look, photograph, note. Do not hammer, dig, or take rock, mineral or fossil. "
    "Prices and hours follow the official listing on the day. This guide does not sell tickets."
)
LEGAL_FOSSIL_EN = (
    "Under China’s fossil-protection regulations, fossils are in principle state property. "
    "Look, photograph, note. Report important finds. Do not hammer, dig, or take anything home."
)

GSSP_EN = {
    "meishan": {
        "stage_name": "Changhsingian (Permian) and Induan (Triassic) / Permian–Triassic boundary",
        "boundary_defined": "Two spikes on Meishan D: base of the Changhsingian (near first appearance of the conodont Clarkina wangi) and the Permian–Triassic boundary (first appearance of Hindeodus parvus). The latter records one of the Phanerozoic’s largest extinctions.",
        "index_fossil": "Clarkina wangi; Hindeodus parvus (conodonts)",
        "ratified_year": 2001,
        "section_name": "Meishan D section, Changxing, Zhejiang",
        "visit_possible": "Open to visitors. A protected gallery and museum serve the section. Fossil beds are mapped only to the park / boardwalk — no sampling coordinates.",
        "protection_rule": "National geoheritage. No excavation, scraping or sampling. Independent GSSP section — not part of Changshan UNESCO Global Geopark.",
    },
    "gssp-huangnitang": {
        "stage_name": "Darriwilian (Ordovician)",
        "boundary_defined": "Base of the Darriwilian, China’s first GSSP, defined on the Huangnitang section.",
        "index_fossil": "The nominated conodont / graptolite index of the Darriwilian GSSP",
        "ratified_year": 1997,
        "section_name": "Huangnitang section, Changshan, Zhejiang",
        "visit_possible": "Open to visitors inside Changshan UNESCO Global Geopark. Boardwalk and panels. Protected section.",
        "protection_rule": "No sampling. The spike belongs to Changshan park; Meishan is a different, independent section.",
    },
    "gssp-jiangshan": {
        "stage_name": "Jiangshanian (Cambrian)",
        "boundary_defined": "Base of the Jiangshanian on the Duibian section, Jiangshan, Zhejiang.",
        "index_fossil": "The nominated Jiangshanian index fossil",
        "ratified_year": 2011,
        "section_name": "Duibian section, Jiangshan, Zhejiang",
        "visit_possible": "Protected section. Visit with site management; do not climb the face on your own.",
        "protection_rule": "No sampling. An independent GSSP, not hosted by a geopark.",
    },
    "gssp-huanghuachang": {
        "stage_name": "Dapingian (Ordovician)",
        "boundary_defined": "Base of the Dapingian on the Huanghuachang section, Yichang.",
        "index_fossil": "The nominated Dapingian index fossil",
        "ratified_year": 2007,
        "section_name": "Huanghuachang section, Yichang, Hubei",
        "visit_possible": "Can be visited as part of the Yichang Ordovician section group. The golden-spike bed is protected.",
        "protection_rule": "No sampling. Independent section.",
    },
    "gssp-wangjiawan": {
        "stage_name": "Hirnantian (Ordovician)",
        "boundary_defined": "Base of the Hirnantian on the Wangjiawan section, Yichang.",
        "index_fossil": "The nominated Hirnantian index fossil",
        "ratified_year": 2006,
        "section_name": "Wangjiawan section, Yichang, Hubei",
        "visit_possible": "Can be visited with the Yichang Ordovician section group.",
        "protection_rule": "No sampling. Independent section.",
    },
    "gssp-paibi": {
        "stage_name": "Paibian (Cambrian)",
        "boundary_defined": "Base of the Paibian on the Paibi section, hosted inside Xiangxi UNESCO Global Geopark.",
        "index_fossil": "The nominated Paibian index fossil",
        "ratified_year": 2003,
        "section_name": "Paibi section, Huayuan, Hunan",
        "visit_possible": "Inside Xiangxi UNESCO Global Geopark. Protected section, visitable.",
        "protection_rule": "No sampling.",
    },
    "gssp-guzhang": {
        "stage_name": "Guzhangian (Cambrian)",
        "boundary_defined": "Base of the Guzhangian on the Luoyixi / Guzhang section, hosted inside Xiangxi UNESCO Global Geopark.",
        "index_fossil": "The nominated Guzhangian index fossil",
        "ratified_year": 2008,
        "section_name": "Luoyixi section, Guzhang, Hunan",
        "visit_possible": "Protected section and nearby red stone-forest park, visitable.",
        "protection_rule": "No sampling.",
    },
    "gssp-penglaitan": {
        "stage_name": "Wuchiapingian (Permian)",
        "boundary_defined": "Base of the Wuchiapingian on the Penglaitan section, Laibin.",
        "index_fossil": "The nominated Wuchiapingian index fossil",
        "ratified_year": 2004,
        "section_name": "Penglaitan section, Laibin, Guangxi",
        "visit_possible": "On the Hongshui River at Laibin. Protected section; view from the path.",
        "protection_rule": "No sampling. Independent section — not part of Changshan park.",
    },
    "gssp-pengchong": {
        "stage_name": "Visean (Carboniferous)",
        "boundary_defined": "Base of the Visean on the Pengchong section, Liuzhou.",
        "index_fossil": "The nominated Visean index fossil",
        "ratified_year": 2008,
        "section_name": "Pengchong section, Liuzhou, Guangxi",
        "visit_possible": "Research-protected section. Contact local natural-resources staff; do not enter farm-cut faces on your own.",
        "protection_rule": "No sampling. Independent section.",
    },
    "gssp-wuliu": {
        "stage_name": "Wuliuan (Cambrian) / base of the Miaolingian",
        "boundary_defined": "Base of the Wuliuan and of the Miaolingian Series on the Wuliu–Zengjiayan section, Jianhe.",
        "index_fossil": "The nominated Wuliuan index fossil",
        "ratified_year": 2018,
        "section_name": "Wuliu–Zengjiayan section, Jianhe, Guizhou",
        "visit_possible": "Inside the related units of Miaoling National Geopark. Protected section.",
        "protection_rule": "No sampling. Independent section.",
    },
}

AREA_EN = {
    "fangshan-shihuadong": {
        "name": "Stone Flower Cave unit",
        "summary": "A northern karst cave. Stone flags, draperies and flowers in Wumishan dolostone.",
    },
    "fangshan-zhoukoudian": {
        "name": "Zhoukoudian unit",
        "summary": "Peking Man site. Cave fill and human evolution — not a place to dig fossils.",
    },
    "fangshan-shidu": {
        "name": "Shidu unit",
        "summary": "A carbonate gorge cut by the Juma River — the valley face of northern karst.",
    },
}

LANDFORM_STAGES = {
    "karst": [
        {"name": "Carbonate deposited", "age": "Palaeozoic or older", "what": "Limestone or dolostone laid down in a sea or tidal flat."},
        {"name": "Uplift and jointing", "age": "Mesozoic–Cenozoic", "what": "Beds rise above base level; joints steer water."},
        {"name": "Dissolution", "age": "Cenozoic–present", "what": "Water takes the rock apart into pinnacles, caves or tiankengs."},
        {"name": "What you see today", "age": "Present", "what": "Confirm carbonate with a drop of dilute acid. This is not quartz-sandstone peak forest."},
    ],
    "danxia": [
        {"name": "Red beds deposited", "age": "Cretaceous–Palaeogene", "what": "Oxidised sandstone and conglomerate in a continental basin."},
        {"name": "Uplift and vertical joints", "age": "Cenozoic", "what": "Joints cut the red beds into walls."},
        {"name": "Collapse", "age": "Present landscape", "what": "Hard beds ledge, soft beds recess, blocks fall — cliffs, alleyways, mesas."},
        {"name": "What you see today", "age": "Present", "what": "A red cliff with joints, not a colourful hill cut only by wind."},
    ],
    "zhangjiajie_sandstone": [
        {"name": "Quartz sandstone deposited", "age": "Mid–Late Devonian", "what": "Quartz-rich sandstone, not carbonate."},
        {"name": "Planation", "age": "Mesozoic–Cenozoic", "what": "A flat top before the pillars."},
        {"name": "Joint collapse", "age": "Cenozoic–present", "what": "Vertical joints isolate mesas, walls, clusters, then pillars."},
        {"name": "What you see today", "age": "Present", "what": "Near-square pillars that do not fizz with acid. Not karst, not Danxia."},
    ],
    "granite_peak": [
        {"name": "Magma froze", "age": "Mesozoic pluton", "what": "Coarse quartz and feldspar granite."},
        {"name": "Unroofing", "age": "Cenozoic", "what": "The pluton is lifted and stripped."},
        {"name": "Joints and spheroidal weathering", "age": "Present landscape", "what": "Tors and pillars — not volcanic bombs."},
        {"name": "What you see today", "age": "Present", "what": "Feel coarse quartz. This is not a volcanic cone."},
    ],
    "volcano": [
        {"name": "Eruption", "age": "See the park age", "what": "Lava, scoria or tuff, depending on the magma."},
        {"name": "Cone, caldera or dam", "age": "After the eruption", "what": "Name the landform: cinder cone, caldera lake, or lava-dammed lake."},
        {"name": "Weathering", "age": "Present", "what": "Vesicles and cooling joints remain."},
        {"name": "What you see today", "age": "Present", "what": "Do not call every cone active. Sheshan is a Cretaceous volcanic hill, not a national geopark."},
    ],
    "yardang": [
        {"name": "Soft beds deposited", "age": "Cenozoic lake or river", "what": "Sandstone–mudstone couplets."},
        {"name": "Aridity and wind", "age": "Quaternary–present", "what": "Prevailing wind cuts ridges parallel to itself."},
        {"name": "What you see today", "age": "Present", "what": "Directional ridges, not Danxia collapse cliffs."},
    ],
    "glacier": [
        {"name": "Rock of the range", "age": "Orogen", "what": "Granite, metamorphic rock or both."},
        {"name": "Ice erosion", "age": "Quaternary–present", "what": "U-shaped valleys, moraines, striae."},
        {"name": "What you see today", "age": "Present", "what": "Stay off closed ice tongues. A V-shaped river valley is not this trail."},
    ],
    "loess": [
        {"name": "Dust landed", "age": "Quaternary", "what": "Aeolian silt with vertical joints. Yuan, liang, mao."},
        {"name": "The river cuts", "age": "Pleistocene–present", "what": "The Yellow River incises its own silt and bedrock sills."},
        {"name": "What you see today", "age": "Present", "what": "Not red-bed Danxia. Hukou is a knickpoint, not a cave."},
    ],
    "coast": [
        {"name": "Bedrock or sand", "age": "See the park", "what": "Waves either cut rock or move sand."},
        {"name": "Marine process", "age": "Holocene–present", "what": "Cliffs, columns, bars, or a growing sand island."},
        {"name": "What you see today", "age": "Present", "what": "Read the tide table. Chongming is sand; Sheshan is the rock hill."},
    ],
    "fossil": [
        {"name": "The bed was laid down", "age": "See the park age", "what": "A lake, river or sea captured the organisms."},
        {"name": "Burial and protection", "age": "After deposition", "what": "The bed is now a gallery, not a quarry."},
        {"name": "What you see today", "age": "Present", "what": "Look, photograph, note. Do not dig. Fossils are in principle state property."},
    ],
    "stratigraphy": [
        {"name": "The section was deposited", "age": "See the park age", "what": "Beds in order, bottom to top."},
        {"name": "A boundary is marked", "age": "Ratified GSSP or stratotype", "what": "A golden spike is a point in a section, not a souvenir."},
        {"name": "What you see today", "age": "Present", "what": "Sketch what stage sits above and below. No sampling."},
    ],
    "geo_hazard": [
        {"name": "The slope failed", "age": "Historic or Holocene", "what": "Landslide, collapse or ice-dam outburst."},
        {"name": "The deposit sits", "age": "Present", "what": "The pile is still unstable."},
        {"name": "What you see today", "age": "Present", "what": "Open paths only. This is not a lava flow unless the park says so."},
    ],
    "other": [
        {"name": "Rock of the site", "age": "See listed age", "what": "Name the rock before the scenery."},
        {"name": "The process", "age": "See the park", "what": "One process this stop is here to prove."},
        {"name": "What you see today", "age": "Present", "what": "Read the outcrop. Do not collect."},
    ],
}

VISIT_EN = {
    "price_note": "Confirm price, concessions and booking on the official listing on the day. This guide does not sell tickets.",
    "opening_hours": "Follow the park notice on the day.",
    "peak_season": "School holidays and public holidays.",
    "closed_days": "Follow the official notice.",
    "free_policy": "Concessions (seniors, students, local) follow the official listing — check again before you go.",
    "transport": "Reach the park by local transit or road. Timetables follow local notices.",
    "best_season": "Low-angle light in spring and autumn makes bedding easier to read. Watch rain and rockfall in high summer.",
}

ROUTE_EN = {
    "name": "Field walk",
    "duration": "Half a day to a day",
    "difficulty": "Moderate; stay on park paths",
    "how_to_go": "Collect the official map at the visitor centre. Walk the field stops in order. Do not take closed shortcuts.",
    "notes": "This is a rock-reading walk, not a scenery checklist. Stop five minutes at each outcrop for bedding and joints.",
    "accessible": "Viewpoints usually have paths; some sections need steps.",
}


def has_cjk(s: object) -> bool:
    return bool(CJK.search(json.dumps(s, ensure_ascii=False) if not isinstance(s, str) else s))


def tr(s: str) -> str:
    if not s:
        return s
    out = s
    for a, b in TOKENS:
        if a in out:
            out = out.replace(a, b)
    out = re.sub(r"约\s*", "~", out)
    return out


def city_en(city: str) -> str:
    if not city:
        return ""
    if city in CITY_SPECIAL:
        return CITY_SPECIAL[city]
    if not has_cjk(city):
        return city
    rest = city
    suffix = ""
    for zh, en in SUFFIX:
        if rest.endswith(zh):
            rest = rest[: -len(zh)]
            suffix = en
            break
    py = " ".join(w.capitalize() for w in lazy_pinyin(rest, style=Style.NORMAL))
    return (py + suffix).strip()


def pinyin_title(name: str) -> str:
    return " ".join(w.capitalize() for w in lazy_pinyin(name, style=Style.NORMAL))


def clean_text(s: str, fallback: str) -> str:
    t = tr(s or "").strip()
    if not t or has_cjk(t):
        return fallback
    return t


def geo_name_en(name: str, phen: str) -> str:
    if name in GENERIC_GEO:
        return GENERIC_GEO[name]
    t = tr(name)
    if t and not has_cjk(t):
        return t
    py = pinyin_title(re.sub(r"[（(].*[)）]", "", name).strip())
    phen_en = {
        "bedding": "bedding",
        "joint": "joints",
        "fold": "fold",
        "unconformity": "unconformity",
        "peak": "peak",
        "cave_speleothem": "cave",
        "lava": "lava",
        "fossil_layer": "fossil bed",
        "collapse": "collapse",
        "pillar": "pillar",
        "dike": "dike",
        "stromatolite": "stromatolite",
        "other": "field stop",
    }.get(phen, "field stop")
    return f"{py} ({phen_en})" if py else phen_en.capitalize()


def look_en(gid: str, phen: str, name_en: str) -> str:
    if gid in HAND_LOOK:
        return HAND_LOOK[gid]
    body = PH_LOOK.get(phen, PH_LOOK["other"])
    return f"{name_en}. {body}"


def rock_en(item: dict) -> dict:
    name = clean_text(item.get("name") or "", "Outcrop rock")
    how = clean_text(
        item.get("how_to_recognize") or "",
        "Field ID: texture and structure. Look, do not collect.",
    )
    return {"name": name, "how_to_recognize": how, "collect_allowed": False}


def timeline_en(site: dict, existing: list | None) -> list:
    lf = (site.get("landform_types") or ["other"])[0]
    stages = existing or []
    out = []
    for i, st in enumerate(stages):
        name = clean_text(st.get("name") or "", f"Stage {i + 1}")
        age = clean_text(st.get("age") or "", site.get("geologic_age_text") or "See listed age")
        what = clean_text(st.get("what") or "", "Read the rock at this stage. Do not collect.")
        # If original English overlay already had English `what` but Chinese name, keep what if clean
        out.append({"name": name, "age": tr(age) if not has_cjk(tr(age)) else age if not has_cjk(age) else "See listed age", "what": what})
    if not out or sum(1 for x in out if has_cjk(x)) == len(out):
        return LANDFORM_STAGES.get(lf, LANDFORM_STAGES["other"])
    # If any stage still CJK, replace whole timeline with landform template
    if any(has_cjk(x) for x in out):
        return LANDFORM_STAGES.get(lf, LANDFORM_STAGES["other"])
    return out


def age_en(text: str) -> str:
    t = tr(text or "")
    if t and not has_cjk(t):
        return t
    return "See the park page for the listed age."


def safety_en(site: dict) -> list[str]:
    if site["id"] == "chongming":
        return SAFETY_CHONGMING
    if "urban_geosite" in site.get("types", []):
        return SAFETY_URBAN
    if "gssp" in site.get("types", []):
        return SAFETY_EN["stratigraphy"]
    primary = (site.get("landform_types") or ["other"])[0]
    notes = list(SAFETY_EN.get(primary, SAFETY_EN["other"]))
    if "fossil" in site.get("landform_types", []) and primary != "fossil":
        notes.append("Fossils: look, don’t take.")
    return notes


def legal_en(site: dict) -> str:
    if "gssp" in site.get("types", []) or "fossil" in site.get("landform_types", []):
        return LEGAL_FOSSIL_EN
    return LEGAL_EN


def fallback_hook(site: dict) -> str:
    name = (site.get("name_en") or site["id"]).replace("UNESCO Global Geopark", "").replace("National Geopark", "").strip()
    lf = LANDFORM_EN.get((site.get("landform_types") or ["other"])[0], "geosite")
    prov = PROVINCE_EN.get(site.get("province") or "", site.get("province") or "")
    return f"{name} is a {lf} geosite in {prov}. Read the rock on the ground; do not collect."


def fallback_formation(site: dict) -> str:
    name = (site.get("name_en") or site["id"]).replace("UNESCO Global Geopark", "").strip()
    lf = LANDFORM_EN.get((site.get("landform_types") or ["other"])[0], "geosite")
    age = age_en(site.get("geologic_age_text") or "")
    return (
        f"{name} is built on {lf}. Listed age: {age}. "
        "Name the rock first, then the process. Confirm mix-ups on the park page. Look, don’t take."
    )


def keep_or_clean(val: str, fallback: str) -> str:
    if not val:
        return fallback
    if not has_cjk(val):
        return val
    cleaned = tr(val)
    if cleaned and not has_cjk(cleaned):
        return cleaned
    return fallback


def site_overlay(site: dict, old: dict) -> dict:
    lf = (site.get("landform_types") or ["other"])[0]
    name = (site.get("name_en") or site["id"]).replace("UNESCO Global Geopark", "").replace("National Geopark", "").strip()
    city = city_en(site.get("city") or "")
    age = age_en(site.get("geologic_age_text") or "")
    hook = keep_or_clean(old.get("hook") or "", fallback_hook(site))
    formation = keep_or_clean(old.get("formation_short") or "", fallback_formation(site))
    evo = keep_or_clean(
        old.get("evolution_sequence") or "",
        f"Rock → structure → surface process. At {name}, the landform to name is {LANDFORM_EN.get(lf, 'this geosite')}.",
    )
    today = keep_or_clean(
        old.get("what_you_see_today") or "",
        f"At {name}, confirm the listed rock and the one process this park is here to prove.",
    )
    tips_in = old.get("observation_tips") or site.get("observation_tips") or []
    tips = []
    for t in tips_in:
        tt = keep_or_clean(t, "")
        if tt:
            tips.append(tt)
    if not tips:
        tips = [
            "Name the rock before the view.",
            "One process per stop — write it down.",
            "Look, photograph, note. Do not hammer or collect.",
        ]
    corr_in = old.get("corrections") or site.get("corrections") or []
    corr = [keep_or_clean(c, "") for c in corr_in]
    corr = [c for c in corr if c]
    rocks_in = old.get("visible_rocks_minerals_fossils") or site.get("visible_rocks_minerals_fossils") or []
    rocks = [rock_en(r) for r in rocks_in]
    if not rocks:
        rocks = [rock_en({"name": "Outcrop rock", "how_to_recognize": "Field ID: texture and structure. Look, do not collect."})]
    timeline = timeline_en(site, old.get("formation_timeline") or site.get("formation_timeline"))
    out = {
        "city": city,
        "geologic_age_text": age,
        "hook": hook,
        "formation_short": formation,
        "evolution_sequence": evo,
        "what_you_see_today": today,
        "observation_tips": tips,
        "formation_timeline": timeline,
        "visible_rocks_minerals_fossils": rocks,
        "safety_notes": safety_en(site),
        "legal_notes": legal_en(site),
    }
    if corr:
        out["corrections"] = corr
    ps = old.get("park_structure") or site.get("park_structure")
    if ps:
        out["park_structure"] = keep_or_clean(ps, "")
        if not out["park_structure"]:
            del out["park_structure"]
    if site["id"] in GSSP_EN:
        out["gssp"] = GSSP_EN[site["id"]]
    elif site.get("gssp"):
        g = site["gssp"]
        out["gssp"] = {
            "stage_name": keep_or_clean(g.get("stage_name") or "", "GSSP stage"),
            "boundary_defined": keep_or_clean(g.get("boundary_defined") or "", "See the ICS GSSP list."),
            "index_fossil": keep_or_clean(g.get("index_fossil") or "", "See the ICS dossier."),
            "ratified_year": g.get("ratified_year") or 0,
            "section_name": keep_or_clean(g.get("section_name") or "", name),
            "visit_possible": keep_or_clean(g.get("visit_possible") or "", "Protected section. No sampling."),
            "protection_rule": keep_or_clean(g.get("protection_rule") or "", "No sampling. Look, don’t take."),
        }
    return out


def all_geosites() -> list[dict]:
    overlay_ids = set()
    out: list[dict] = []
    for bundle in (UP.get("geosites") or {}, STD.get("geosites") or {}):
        for sid, lst in bundle.items():
            overlay_ids.add(sid)
            out.extend(lst)
    for g in GEO:
        if g.get("site_id") not in overlay_ids:
            out.append(g)
    return out


def main() -> None:
    old_sites = OLD_EN.get("sites") or {}
    sites_out = {}
    cities = {}
    for s in SITES:
        old = old_sites.get(s["id"]) or {}
        ov = site_overlay(s, old)
        sites_out[s["id"]] = ov
        cities[s["id"]] = ov["city"]

    geos_out = {}
    for g in all_geosites():
        nm = geo_name_en(g.get("name") or "", g.get("phenomenon_type") or "other")
        geos_out[g["id"]] = {
            "name": nm,
            "look_here": look_en(g["id"], g.get("phenomenon_type") or "other", nm),
        }

    visits_out = {v["site_id"]: dict(VISIT_EN) for v in VISITS}
    routes_out = {r["id"]: dict(ROUTE_EN) for r in ROUTES}
    for sid, lst in (UP.get("routes") or {}).items():
        for r in lst:
            routes_out[r["id"]] = dict(ROUTE_EN)
    for sid, lst in (STD.get("routes") or {}).items():
        for r in lst:
            routes_out.setdefault(r["id"], dict(ROUTE_EN))

    areas_out = {}
    for a in AREAS:
        if a["id"] in AREA_EN:
            areas_out[a["id"]] = AREA_EN[a["id"]]
        else:
            areas_out[a["id"]] = {
                "name": keep_or_clean(a.get("name") or "", pinyin_title(a.get("name") or "Park unit")),
                "summary": keep_or_clean(a.get("summary") or "", "A unit of this park. Read the rock; do not collect."),
            }

    bundle = {
        "sites": sites_out,
        "geosites": geos_out,
        "visits": visits_out,
        "routes": routes_out,
        "areas": areas_out,
    }

    def count_cjk(obj, path="") -> list[str]:
        hits = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                hits += count_cjk(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                hits += count_cjk(v, f"{path}[{i}]")
        elif isinstance(obj, str) and CJK.search(obj):
            hits.append(path)
        return hits

    hits = count_cjk(bundle)
    print("CJK leftovers", len(hits))
    for h in hits[:20]:
        print(" ", h)

    (ROOT / "data/en.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n")
    (ROOT / "data/cities-en.json").write_text(json.dumps(cities, ensure_ascii=False, indent=2) + "\n")
    print("wrote", ROOT / "data/en.json", "sites", len(sites_out), "geosites", len(geos_out))


if __name__ == "__main__":
    main()
