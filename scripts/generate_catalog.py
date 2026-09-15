#!/usr/bin/env python3
"""Expand compact park rows into the 山石志 JSON catalog."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from parks_part1 import ROWS as R1
from parks_part2 import ROWS as R2

OUT = Path("/workspace/data")
INFO_UPDATED = "2026-04-20"
CUTOFF = "2026-04"

PHENO = {
    "karst": ("cave_speleothem", "峰丛或溶洞观景台", "岩溶峡谷步道", "洞穴大厅入口"),
    "danxia": ("peak", "红崖临空面", "巷谷或一线天", "方山台地面"),
    "zhangjiajie_sandstone": ("pillar", "峰林观景台", "砂岩巷谷", "方山残顶"),
    "granite_peak": ("joint", "花岗岩峰林", "石蛋或球状风化", "裂隙槽谷"),
    "volcano": ("lava", "火山锥观景台", "熔岩流露头", "火山口或堰塞湖岸"),
    "yardang": ("other", "雅丹垄脊观景台", "风蚀壁龛", "戈壁地面"),
    "glacier": ("other", "冰舌观景台", "U 形谷坡", "冰川遗迹解说点"),
    "loess": ("bedding", "黄土剖面", "塬梁峁观景", "冲沟壁"),
    "coast": ("joint", "海蚀崖或柱状节理", "潮间带岩石", "海湾观景台"),
    "fossil": ("fossil_layer", "化石层观景/博物馆", "地层剖面廊道", "园区解说点"),
    "stratigraphy": ("bedding", "主剖面观景栈道", "不整合接触点", "层型标志牌"),
    "geo_hazard": ("collapse", "崩塌堆积观景", "滑面或断崖", "安全解说点"),
    "other": ("other", "主园区观景台", "典型露头", "游客中心展板"),
}

ROCK = {
    "karst": "碳酸盐岩（灰岩、白云岩）",
    "danxia": "陆相红层砂岩与砾岩",
    "zhangjiajie_sandstone": "厚层石英砂岩",
    "granite_peak": "花岗岩及酸性侵入岩",
    "volcano": "玄武岩、安山岩或流纹质火山岩",
    "yardang": "河湖相砂泥岩",
    "glacier": "高海拔变质岩或花岗岩",
    "loess": "风积黄土",
    "coast": "海岸带火山岩、花岗岩或沉积岩",
    "fossil": "含化石的沉积岩",
    "stratigraphy": "多时代沉积地层",
    "geo_hazard": "破裂岩体与堆积物",
    "other": "区域代表性岩石",
}

FORCE = {
    "karst": "流水溶蚀、地下河与崩塌",
    "danxia": "垂直节理控制下的风化剥落与崩塌",
    "zhangjiajie_sandstone": "流水下切、风化与重力崩塌",
    "granite_peak": "球状风化、冻融与崩塌",
    "volcano": "喷发建造，再被流水和风化改写",
    "yardang": "定向风蚀",
    "glacier": "冰蚀、冻融与后期流水",
    "loess": "风力堆积后被流水切割",
    "coast": "波浪、潮汐与差异侵蚀",
    "fossil": "差异风化把含化石层暴露出来",
    "stratigraphy": "抬升与剥蚀把时间切面露出来",
    "geo_hazard": "重力、地震或暴雨激发的破坏",
    "other": "风化剥蚀与流水",
}

LF_LABEL = {
    "karst": "喀斯特",
    "danxia": "丹霞",
    "zhangjiajie_sandstone": "砂岩峰林",
    "granite_peak": "花岗岩地貌",
    "volcano": "火山",
    "yardang": "雅丹",
    "glacier": "冰川",
    "loess": "黄土",
    "coast": "海岸",
    "fossil": "化石产地",
    "stratigraphy": "地层剖面",
    "geo_hazard": "地质灾害遗迹",
    "other": "综合地貌",
}

FLAG_MAP = {
    "W": "world_geopark",
    "N": "national_geopark",
    "C": "national_geopark_candidate",
    "G": "gssp",
    "I": "iugs_geoheritage",
    "U": "urban_geosite",
    "S": "stratotype",
    "L": "landform_site",
}

GSSP_EXTRA = {
    "gssp-huangnitang": {
        "stage_name": "奥陶系达瑞威尔阶（Darriwilian）",
        "boundary_defined": "笔石 Undulograptus austrodentatus 首现，定义达瑞威尔阶底界。",
        "index_fossil": "Undulograptus austrodentatus（笔石）",
        "ratified_year": 1997,
        "section_name": "浙江常山黄泥塘剖面",
        "visit_possible": "可参观。剖面在常山国家/世界地质公园内，有栈道与解说，属保护剖面。",
        "protection_rule": "禁止敲打、取样、刻画。观察层理与笔石印痕即可，不要用手抠化石。",
    },
    "meishan": {
        "stage_name": "二叠系长兴阶（Changhsingian）与三叠系印度阶（Induan）/二叠–三叠系界线",
        "boundary_defined": "煤山 D 剖面同时钉下两颗金钉子：长兴阶底界（牙形石 Clarkina wangi 首现附近）与二叠–三叠系界线（牙形石 Hindeodus parvus 首现）。后者记录显生宙最大生物灭绝之一。",
        "index_fossil": "Clarkina wangi；Hindeodus parvus（牙形石）",
        "ratified_year": 2001,
        "section_name": "浙江长兴煤山 D 剖面",
        "visit_possible": "可参观。建有煤山剖面保护设施与博物馆。化石层对公众模糊到园区/观景栈道，不提供可取样坐标。",
        "protection_rule": "国家级地质遗迹。禁止任何发掘、刮样、私藏化石。看剖面颜色、纹层与解说牌即可。",
    },
    "gssp-jiangshan": {
        "stage_name": "寒武系江山阶（Jiangshanian）",
        "boundary_defined": "三叶虫 Agnostotes orientalis 首现，定义芙蓉统江山阶底界。",
        "index_fossil": "Agnostotes orientalis（三叶虫）",
        "ratified_year": 2011,
        "section_name": "浙江江山碓边 B 剖面",
        "visit_possible": "保护剖面，可在管理人员许可下参观，不宜自行攀爬剖壁。",
        "protection_rule": "禁止采集三叶虫与任何岩样。只看、只拍、只记。",
    },
    "gssp-huanghuachang": {
        "stage_name": "奥陶系大坪阶（Dapingian）",
        "boundary_defined": "牙形石 Baltoniodus triangularis 最低出现，定义中奥陶统大坪阶底界。",
        "index_fossil": "Baltoniodus triangularis（牙形石）",
        "ratified_year": 2007,
        "section_name": "湖北宜昌黄花场剖面",
        "visit_possible": "剖面在宜昌黄花场一带，可结合三峡地质旅行参观，核心层型点受保护。",
        "protection_rule": "禁止敲击灰岩层型。牙形石需显微镜才能见，现场看的是岩性转换与层位标志。",
    },
    "gssp-wangjiawan": {
        "stage_name": "奥陶系赫南特阶（Hirnantian）",
        "boundary_defined": "笔石 Normalograptus extraordinarius 首现，并伴随碳同位素正偏移与冰期海平面下降。",
        "index_fossil": "Normalograptus extraordinarius（笔石）",
        "ratified_year": 2006,
        "section_name": "湖北宜昌王家湾剖面",
        "visit_possible": "可结合宜昌奥陶系剖面群参观。",
        "protection_rule": "层型点禁止取样。赫南特冰期的故事写在黑色笔石页岩里，不要把页岩掰回家。",
    },
    "gssp-paibi": {
        "stage_name": "寒武系排碧阶（Paibian）",
        "boundary_defined": "球接子三叶虫 Glyptagnostus reticulatus 首现，并与 SPICE 碳同位素正偏移吻合。",
        "index_fossil": "Glyptagnostus reticulatus（三叶虫）",
        "ratified_year": 2003,
        "section_name": "湖南花垣排碧剖面",
        "visit_possible": "湘西世界地质公园范围内，保护剖面，可参观。",
        "protection_rule": "禁止采集三叶虫。核心剖面坐标对公众只精确到园区。",
    },
    "gssp-guzhang": {
        "stage_name": "寒武系古丈阶（Guzhangian）",
        "boundary_defined": "三叶虫 Lejopyge laevigata 首现，定义苗岭统古丈阶底界。",
        "index_fossil": "Lejopyge laevigata（三叶虫）",
        "ratified_year": 2008,
        "section_name": "湖南古丈罗依溪剖面",
        "visit_possible": "可参观保护剖面与附近红石林园区。",
        "protection_rule": "禁止敲打黑色碳质页岩。化石层不对公众提供可发掘精度。",
    },
    "gssp-penglaitan": {
        "stage_name": "二叠系吴家坪阶（Wuchiapingian）",
        "boundary_defined": "牙形石 Clarkina postbitteri postbitteri 首现，定义乐平统吴家坪阶底界。",
        "index_fossil": "Clarkina postbitteri postbitteri（牙形石）",
        "ratified_year": 2005,
        "section_name": "广西来宾蓬莱滩剖面",
        "visit_possible": "来宾红水河畔，保护剖面，可远观与沿步道参观。",
        "protection_rule": "禁止在剖面上凿样。看的是深水硅质岩–灰岩转换，不是捡牙形石。",
    },
    "gssp-pengchong": {
        "stage_name": "石炭系维宪阶（Visean）",
        "boundary_defined": "有孔虫 Eoparastaffella simplex 首现，定义维宪阶底界。剖面在柳州北岸乡碰冲村南。",
        "index_fossil": "Eoparastaffella simplex（有孔虫）",
        "ratified_year": 2008,
        "section_name": "广西柳州碰冲剖面",
        "visit_possible": "科研保护剖面。建议联系当地自然资源管理部门，勿擅自进入农地剖壁。",
        "protection_rule": "禁止取样。有孔虫需薄片鉴定，现场只观察灰岩层序。",
    },
    "gssp-wuliu": {
        "stage_name": "寒武系乌溜阶（Wuliuan）/ 苗岭统底界",
        "boundary_defined": "三叶虫 Oryctocephalus indicus 首现，定义苗岭统与乌溜阶底界。",
        "index_fossil": "Oryctocephalus indicus（三叶虫）",
        "ratified_year": 2018,
        "section_name": "贵州剑河乌溜–曾家岩剖面",
        "visit_possible": "剑河苗岭国家地质公园相关园区内，保护剖面。",
        "protection_rule": "禁止采集三叶虫。化石层对公众模糊到园区中心。",
    },
}

RELATED = {
    "fangshan": ["shihuadong", "shidu", "baishishan", "yesanpo", "zhoukoudian", "yanqing"],
    "shihuadong": ["fangshan", "shidu", "zhoukoudian", "baishishan"],
    "shidu": ["fangshan", "shihuadong", "baishishan"],
    "baishishan": ["fangshan", "shidu", "yesanpo"],
    "zhoukoudian": ["fangshan", "shihuadong", "jixian"],
    "changshan": ["gssp-huangnitang", "gssp-jiangshan", "meishan"],
    "gssp-huangnitang": ["changshan", "gssp-jiangshan", "jixian"],
    "gssp-jiangshan": ["changshan", "gssp-huangnitang", "gssp-paibi"],
    "meishan": ["changshan", "gssp-penglaitan", "jixian"],
    "jixian": ["songshan", "gssp-huangnitang", "meishan"],
    "sheshan": ["chongming", "zhangzhou-volcano", "wudalianchi", "yandangshan"],
    "zhangjiajie": ["zhangshiyan", "langshan", "danxiashan"],
    "danxiashan": ["longhushan", "taining", "qiyunshan", "kanbula", "zhangye"],
    "shilin": ["xingwen", "zhijindong", "leye-fengshan", "guilin-karst", "shihuadong"],
    "wudalianchi": ["jingpohu", "changbaishan", "zhangzhou-volcano", "weizhoudao", "sheshan"],
    "hongkong": ["changshan-islands", "shenhuwan", "chongming", "zhangzhou-volcano"],
    "chengjiang": ["zigong", "shanwang", "jiayin", "chaoyang"],
    "zigong": ["chengjiang", "lufeng", "zhucheng", "yunyang"],
    "zhangye": ["dunhuang", "alxa", "chengde-danxia", "danxiashan"],
    "songshan": ["jixian", "taishan", "wutaishan"],
    "huangshan": ["sanqingshan", "tianzhushan", "jiuhuashan"],
    "leye-fengshan": ["fengshan", "shilin", "xingwen", "wulong"],
    "leiqiong": ["huguangyan", "haikou-volcano", "weizhoudao"],
    "ningde": ["taimushan", "baishuiyang", "baiyunshan-fj"],
    "guilin-karst": ["shilin", "leye-fengshan", "ziyuan"],
    "yunyang": ["zigong", "sanxia", "qijiang"],
    "linxia": ["hezheng", "shanwang", "chengjiang"],
    "alxa": ["badain-jaran", "dunhuang", "zhangye"],
    "everest-ordovician": ["rongbuk", "kunlunshan", "siguniang"],
    "rongbuk": ["everest-ordovician", "hailuogou"],
    "gssp-paibi": ["xiangxi", "gssp-guzhang", "gssp-wuliu"],
    "gssp-guzhang": ["xiangxi", "hongshilin", "gssp-paibi"],
    "gssp-wuliu": ["miaoling", "gssp-paibi", "chengjiang"],
    "gssp-penglaitan": ["meishan", "gssp-pengchong"],
    "gssp-pengchong": ["gssp-penglaitan", "guilin-karst"],
    "gssp-huanghuachang": ["gssp-wangjiawan", "sanxia", "changshan"],
    "gssp-wangjiawan": ["gssp-huanghuachang", "changshan", "meishan"],
    "wuda": ["meishan", "chengjiang"],
    "badain-jaran": ["alxa", "dunhuang"],
}

THEME_ROUTES = [
    {
        "id": "danxia",
        "name": "丹霞走廊",
        "thesis": "红层 + 垂直节理 + 崩塌。先到丹霞山看定义地，再沿线看同一套过程如何切出不同的崖、巷谷和方山。",
        "site_ids": ["danxiashan", "longhushan", "taining", "qiyunshan", "kanbula", "chishui", "langshan"],
        "site_roles": [
            "定义地：丹霞地貌的模式产地，把红层、节理、崩塌一次讲清。",
            "丹霞与道教崖墓叠在一起，看垂直节理如何切出孤立残丘。",
            "青年期丹霞：深切巷谷、水上丹霞，过程还没切到老年期残丘。",
            "皖南红层，和黄山花岗岩对照——邻山完全不是一种岩石。",
            "高原边缘的丹霞，海拔把同一过程抬到了黄河边上。",
            "中国丹霞世界遗产的组成部分，湿润区赤壁。",
            "崀山把丹霞的一线天和天生桥做得更完整。",
        ],
    },
    {
        "id": "karst",
        "name": "喀斯特王国",
        "thesis": "碳酸盐岩被水慢慢拆掉。石林是地表石芽，织金是地下宫殿，乐业是天坑，桂林是峰林，房山石花洞是北方对照。",
        "site_ids": ["shilin", "xingwen", "zhijindong", "leye-fengshan", "guilin-karst", "shihuadong", "wulong"],
        "site_roles": [
            "剑状石林：二叠纪灰岩被垂直裂隙和雨水切成的地表喀斯特。",
            "石海与天坑，看塌陷如何把地下空间翻到地面。",
            "洞穴化学沉积的教科书，看的是水里的钙如何再长成石头。",
            "天坑群：地下河顶板大规模塌陷的终极形态。",
            "峰林平原，湿润热带喀斯特的经典剖面。IUGS 地质遗产地。",
            "北方对照：雾迷山组白云岩里的石花洞，喀斯特不只在广西。",
            "武隆天坑地缝，世界自然遗产南中国喀斯特的一部分。",
        ],
    },
    {
        "id": "sandstone-peak",
        "name": "砂岩峰林与方山",
        "thesis": "张家界不是喀斯特。石英砂岩先被抬成夷平面，再沿垂直节理崩成方山、石墙、峰丛、峰林。嶂石岩是同一序列里更靠前的阶段。",
        "site_ids": ["zhangjiajie", "zhangshiyan", "xingtai-canyon"],
        "site_roles": [
            "石英砂岩峰林的模式地。夷平面→方山→石墙→峰丛→峰林。",
            "嶂石岩地貌代表点：大型阶梯状悬崖，峰林还没切碎。",
            "石英砂岩峡谷群，看的是下切而不是溶蚀。",
        ],
    },
    {
        "id": "granite",
        "name": "花岗岩名山",
        "thesis": "酸性岩浆在地下冷凝，抬升后被球状风化和节理拆成石林、石蛋和陡峰。黄山、三清山、天柱山走的是同一套岩石，构造部位不同。",
        "site_ids": ["huangshan", "sanqingshan", "tianzhushan", "huashan", "yimengshan"],
        "site_roles": [
            "花岗岩峰林与石蛋的样板，垂直节理+球状风化。",
            "柱状花岗岩峰林更瘦、更密，和黄山对照看节理密度。",
            "超高压变质岩被花岗岩刺穿，山里同时有两种深部故事。",
            "断块抬升的花岗岩，险在构造而不只在风化。",
            "鲁中南花岗岩与变质基底的对照。",
        ],
    },
    {
        "id": "volcano",
        "name": "中国火山",
        "thesis": "从五大连池的新期玄武岩，到镜泊湖的堰塞、长白山的层状火山、漳州和涠洲的滨海玄武岩、雁荡山的白垩纪流纹质破火山，最后用佘山做城市对照：上海平原上突然冒出来的白垩纪火山锥。",
        "site_ids": ["wudalianchi", "jingpohu", "changbaishan", "zhangzhou-volcano", "weizhoudao", "yandangshan", "sheshan", "tengchong", "haikou-volcano"],
        "site_roles": [
            "中国最新期火山群之一，熔岩、锥体、堰塞湖还在同一张图上。",
            "火山熔岩堰塞牡丹江，形成镜泊湖与地下森林。",
            "巨型复式火山，天池是塌陷的岩浆房顶盖。",
            "滨海玄武岩柱状节理，海浪把冷却裂隙洗出来。",
            "火山岛，看的是海底到海面的喷发序列。",
            "白垩纪流纹质破火山，和五大连池的玄武岩不是一种岩浆。",
            "城市对照：佘山是火山岩，不是花岗岩名山，也不是国家地质公园。",
            "腾冲火山地热，中国西南活跃的火山–地热系统。",
            "雷琼火山的海南一侧，玛珥湖与玄武岩台地。",
        ],
    },
    {
        "id": "fossil",
        "name": "化石产地（只看不挖）",
        "thesis": "化石是国家所有的地球档案。这条线只讲‘看到什么、如何认出、为什么不能挖’。澄江把寒武纪生命爆发摊在纸页状页岩上，自贡把侏罗纪恐龙埋在砂岩里。",
        "site_ids": ["chengjiang", "zigong", "shanwang", "jiayin", "chaoyang", "zhucheng", "linxia", "yunyang"],
        "site_roles": [
            "寒武纪早期特异埋藏，软躯体也留下来了。世界遗产 / IUGS。",
            "中侏罗世恐龙化石群，大山铺是看展品的地方，不是挖的地方。",
            "中新世硅藻土里的完整哺乳类、昆虫与植物。",
            "黑龙江嘉荫，晚白垩世恐龙。",
            "热河生物群，带羽毛恐龙与早期鸟类的地层。",
            "诸城恐龙，以数量和埋藏密集著称。",
            "临夏新生代哺乳动物群，和政羊、铲齿象写在红层里。",
            "云阳侏罗纪恐龙与三峡岩溶叠在同一座世界地质公园。",
        ],
    },
    {
        "id": "gssp",
        "name": "金钉子与标准剖面",
        "thesis": "金钉子是全球年代地层的尺子。常山钉下中国第一颗，煤山钉下灭绝与复苏的界线，蓟县把中元古界的时间展开，嵩山把太古宙到新生代叠成‘五代同堂’。",
        "site_ids": ["changshan", "gssp-huangnitang", "meishan", "jixian", "songshan", "gssp-jiangshan"],
        "site_roles": [
            "世界地质公园，园子为金钉子和奥陶系剖面而建。",
            "中国第一颗金钉子：奥陶系达瑞威尔阶。",
            "一剖两钉：长兴阶与二叠–三叠系界线。IUGS 遗产地。",
            "蓟县中上元古界标准剖面，华北的深时间尺子。",
            "前寒武‘五代同堂’，三个前寒武纪角度不整合。",
            "寒武系江山阶金钉子。",
        ],
    },
    {
        "id": "wind",
        "name": "风与沙",
        "thesis": "干旱区把岩石交给风。敦煌是雅丹，阿拉善是沙漠地质公园，克什克腾有花岗岩与风蚀的混合，张掖彩色丘陵常被误叫丹霞——它不是丹霞山那种丹霞。",
        "site_ids": ["dunhuang", "alxa", "hexigten", "zhangye", "badain-jaran", "qitai"],
        "site_roles": [
            "雅丹：定向风把河湖相砂泥岩削成垄槽。",
            "阿拉善沙漠世界地质公园，风成沙与基岩残丘。",
            "花岗岩石林遇上坝上风，岩石和风两套过程叠在一起。",
            "白垩纪彩色丘陵。不是丹霞山那种丹霞， palettes 来自沉积时的氧化还原。",
            "IUGS：必鲁特沙山与湖泊，世界最高沙丘之一。",
            "硅化木被风从侏罗纪河湖相里剥出来，看，不要捡。",
        ],
    },
    {
        "id": "ice",
        "name": "冰与极高山",
        "thesis": "冰川是移动的砂纸。四姑娘山、海螺沟、昆仑山把冰蚀、冰碛和极高山构造放在同一条线上。",
        "site_ids": ["siguniang", "hailuogou", "kunlunshan", "yulongxueshan", "nianbaoyuze", "animaging"],
        "site_roles": [
            "极高山与现代冰川，横断山的花岗闪长岩被冰切开。",
            "低海拔现代冰川，可走到冰舌看冰碛与 degenerating 冰面。",
            "昆仑造山带上的世界地质公园，冰与构造同时在场。",
            "玉龙雪山，中国最南端的现代海洋性冰川之一。",
            "年宝玉则，花岗岩石林遇上高原冰川。",
            "阿尼玛卿，东昆仑上的极高山冰帽。",
        ],
    },
    {
        "id": "coast",
        "name": "海岸与海岛",
        "thesis": "海浪是另一套节理显示剂。香港把早白垩世酸性火成岩的柱状节理洗到潮间带，长山列岛、深沪湾、崇明岛分别是基岩岛、古森林潮滩和河口沙岛。",
        "site_ids": ["hongkong", "changshan-islands", "shenhuwan", "chongming", "dalian-coast", "pingtan"],
        "site_roles": [
            "世界地质公园。六角柱状节理是冷却收缩，不是玄武岩才有。",
            "渤海海峡基岩列岛，变质岩海岸。",
            "深沪湾潮间带古森林与海岸风沙。",
            "上海的国家地质公园是崇明岛，不是佘山。河口沙岛还在长。",
            "大连滨海，老变质岩被海浪切出的海岸。",
            "平潭岛花岗岩石蛋与海蚀。",
        ],
    },
]

# site_id -> theme ids filled later

TICKETED_TRUE = {
    "zhangjiajie", "shilin", "danxiashan", "wudalianchi", "hongkong", "huangshan",
    "jiuzhaigou", "huanglong", "taishan", "sanqingshan", "tianzhushan", "yandangshan",
    "lushan", "longhushan", "taining", "zhijindong", "xingwen", "leye-fengshan",
    "wulong", "siguniang", "hailuogou", "changbaishan", "jingpohu", "fangshan",
    "shihuadong", "shidu", "yanqing", "zhoukoudian", "jixian", "chengjiang", "zigong",
    "zhangye", "dunhuang", "alxa", "kanbula", "kunlunshan", "huashan", "cuihuashan",
    "yuntaishan", "songshan", "funiushan", "wangwushan", "enshi", "shennongjia",
    "xiangxi", "langshan", "jiuhuashan", "ningde", "longyan", "wugongshan", "linxia",
    "yunyang", "xingyi", "cangshan", "tengchong", "yulongxueshan", "weizhoudao",
    "haikou-volcano", "leiqiong", "huguangyan", "xiqiaoshan", "dapeng", "chayashan",
    "hexigten", "arxan", "keketuohai", "kanas", "tianshan-tianchi", "qitai",
    "zhangshiyan", "yesanpo", "baishishan", "wutaishan", "hukou", "benxi",
    "chaoyang", "shanwang", "zhucheng", "taihu-xishan", "luhe", "changshan",
    "meishan", "bagongshan", "qiyunshan", "fushan", "shenhuwan", "taimushan",
    "guanzhishan", "pingtan", "xiongershan", "qingzhou", "changshan-islands",
    "sanxia", "mulanshan", "fenghuang", "hongshilin", "feitianshan", "fengkai",
    "guilin-karst", "ziyuan", "wansheng", "xiaonanhai", "longmenshan", "jiuxiang",
    "lufeng", "laojunshan", "zhada", "luochuan", "kongtongshan", "maijishan",
    "huoshizhai", "kuqa", "sheshan",
}

FREE_SITES = {
    "gssp-huangnitang", "gssp-jiangshan", "gssp-huanghuachang", "gssp-wangjiawan",
    "gssp-paibi", "gssp-guzhang", "gssp-penglaitan", "gssp-pengchong", "gssp-wuliu",
    "wuda", "everest-ordovician", "rongbuk", "badain-jaran", "chongming",
}

GSSP_HOOKS = {
    "gssp-huangnitang": "中国第一颗金钉子，全球奥陶系达瑞威尔阶的尺子。",
    "meishan": "一剖两钉：长兴阶，以及显生宙最大灭绝写在煤山的那条线。",
    "gssp-jiangshan": "寒武系江山阶的全球尺子，钉在浙西石灰岩里。",
    "gssp-huanghuachang": "奥陶系大坪阶金钉子，宜昌黄花场把中奥陶统的底钉死。",
    "gssp-wangjiawan": "赫南特阶金钉子：冰期、笔石和海平面写在同一层。",
    "gssp-paibi": "排碧阶金钉子，芙蓉统从湘西灰岩里开始。",
    "gssp-guzhang": "古丈阶金钉子，苗岭统的第七阶在罗依溪。",
    "gssp-penglaitan": "吴家坪阶金钉子，乐平统从红水河边开始。",
    "gssp-pengchong": "维宪阶金钉子，石炭纪第一颗阶一级的全球尺子。",
    "gssp-wuliu": "乌溜阶金钉子，寒武系苗岭统的底界在剑河。",
}


def trad(s: str) -> str:
    # 第一期不做事繁，字段预留：回退为简体。
    return s


def types_from_flags(flags: str, status: str) -> list[str]:
    types = []
    for f in flags.split(","):
        f = f.strip()
        if f == "D":
            continue
        t = FLAG_MAP.get(f)
        if t and t not in types:
            types.append(t)
    if status == "candidate" and "national_geopark_candidate" not in types:
        types.append("national_geopark_candidate")
    if not types:
        types.append("landform_site")
    return types


def expand_site(row: tuple) -> dict:
    (sid, name, name_en, province, city, lon, lat, landforms, status, flags,
     age, age_start, age_end, website) = row
    lfs = [x for x in landforms.split(",") if x]
    primary = lfs[0]
    is_deep = "D" in flags.split(",")
    types = types_from_flags(flags, status)
    lf_name = "、".join(LF_LABEL.get(x, x) for x in lfs)
    rock = ROCK.get(primary, ROCK["other"])
    force = FORCE.get(primary, FORCE["other"])

    if sid in GSSP_HOOKS:
        hook = GSSP_HOOKS[sid]
    elif sid == "sheshan":
        hook = "上海平原上突然冒出来的白垩纪火山锥，不是「搬来的土堆」。"
    elif sid == "zhangjiajie":
        hook = "3.8 亿年前的海滩，被切成三千多座石柱。"
    elif sid == "zhangye":
        hook = "彩色丘陵来自红层的氧化还原，不是丹霞山那种丹霞。"
    elif is_deep:
        hook = f"{lf_name}写在{province}{city}。"
    else:
        hook = f"{lf_name}。成因与打卡点待补。"

    formation = (
        f"岩石：{rock}。构造：区域抬升与节理（或层面）把岩体切开。外力：{force}。"
        + ("详细过程见深页时间轴。" if is_deep else "标准卡待补，先用这个三件套读现场。")
    )

    tips = [
        "先认岩石：颜色、颗粒、层理，再看它怎么裂。",
        "侧光和雨后，层理与节理更清楚。",
        "不要把所有平顶山都叫张家界地貌，也不要把所有红崖都叫丹霞。",
    ]
    if "fossil" in lfs or "G" in flags:
        tips.append("化石只看不挖。看见完整标本，拍照、记层位、报告管理部门。")

    visibles = [
        {
            "name": rock,
            "how_to_recognize": f"在{lf_name}现场，先用手（或眼睛）确认颗粒、颜色和层理，而不是先问‘这是不是名石’。",
            "collect_allowed": False,
        }
    ]
    if "fossil" in lfs:
        visibles.append({
            "name": "含化石层",
            "how_to_recognize": "化石往往沿层面富集。看到印痕就停手。",
            "collect_allowed": False,
        })

    safety = ["注意落石与陡崖，不要翻越护栏。", "暴雨后溪谷和溶洞不要进入。"]
    if primary == "glacier":
        safety.append("高原反应、冰裂缝与强紫外。不要走上冰舌未开放区。")
    if primary == "karst":
        safety.append("溶洞内听从管理，不要单独深入未开发洞穴。")
    if primary == "coast":
        safety.append("看潮汐表。柱状节理潮间带在涨潮时会断退路。")

    legal = "地质遗迹受《地质遗迹保护管理规定》保护。禁止凿石、刻画、采集。化石点另见《古生物化石保护条例》。"
    if "fossil" in lfs or "G" in flags or "I" in flags:
        legal += "化石原则上国家所有，禁止私挖私藏。"

    sources = [
        f"名录综合：国家林草局世界地质公园名录（截至 {CUTOFF} 并补 2025–2026 新晋）、公开国家地质公园名录、ICS 金钉子名录。",
    ]
    if website:
        sources.append(f"官网：{website}")

    site = {
        "id": sid,
        "name": name,
        "name_en": name_en,
        "name_traditional": trad(name),
        "name_official": name,
        "types": types,
        "status": status,
        "province": province,
        "city": city,
        "coordinates": [lon, lat],
        "landform_types": lfs,
        "geologic_age_text": age,
        "geologic_age_start_ma": age_start,
        "geologic_age_end_ma": age_end,
        "hook": hook,
        "formation_short": formation,
        "formation_timeline": [],
        "evolution_sequence": "",
        "what_you_see_today": f"今天能直接看到的，是{lf_name}被切开后的几何：崖、柱、洞、层或锥。细节在打卡点。",
        "observation_tips": tips,
        "visible_rocks_minerals_fossils": visibles,
        "safety_notes": safety,
        "legal_notes": legal,
        "related_site_ids": RELATED.get(sid, []),
        "theme_route_ids": [],
        "cover_image": f"/covers/{primary}.svg",
        "gallery": [],
        "official_website": website,
        "sources": sources,
        "content_tier": "deep" if is_deep else "standard",
        "content_status": "complete" if is_deep else "placeholder",
        "corrections": [],
    }
    if sid in GSSP_EXTRA:
        site["gssp"] = GSSP_EXTRA[sid]
    if sid == "zhangjiajie":
        site["corrections"] = ["张家界是石英砂岩峰林，不是喀斯特。园内石灰岩溶洞是另一套岩石。"]
    if sid == "zhangye":
        site["corrections"] = ["张掖彩色丘陵不等于丹霞山那种丹霞。红层颜色来自沉积期的铁氧化物，几何是丘陵不是丹霞赤壁。"]
    if sid == "sheshan":
        site["corrections"] = ["佘山是火山岩（流纹岩/凝灰岩），不是花岗岩名山。上海的国家地质公园是崇明岛。"]
    if sid == "zhangshiyan":
        site["corrections"] = ["方山是峰林演化序列中的一个阶段，不是所有平顶山都叫张家界地貌。"]
    return site


def geosites_for(site: dict) -> list[dict]:
    primary = site["landform_types"][0]
    pheno, n1, n2, n3 = PHENO.get(primary, PHENO["other"])
    lon, lat = site["coordinates"]
    precision = "area_only" if ("fossil" in site["landform_types"] or "gssp" in site["types"]) else "exact"
    # jitter at ~100–400 m for public points, never claim meter precision
    deltas = [(0.004, 0.002), (-0.003, 0.003), (0.002, -0.004)]
    names = [n1, n2, n3]
    out = []
    for i, (dx, dy) in enumerate(deltas):
        gid = f"{site['id']}-g{i+1}"
        out.append({
            "id": gid,
            "site_id": site["id"],
            "area_id": None,
            "name": names[i],
            "coordinates": [round(lon + dx, 4), round(lat + dy, 4)] if precision == "exact" else [lon, lat],
            "phenomenon_type": pheno if i == 0 else ("bedding" if i == 1 else "other"),
            "look_here": f"站在护栏或步道内侧，看{names[i]}：岩石、裂隙方向、和它被水或风切过的面。",
            "photo": "",
            "do_not": ["不攀无保护岩壁", "不敲岩石", "不采集化石或钟乳石"],
            "public_precision": precision,
        })
    return out


def route_for(site: dict, geos: list[dict]) -> dict:
    return {
        "id": f"{site['id']}-r1",
        "site_id": site["id"],
        "name": "半日地质步道",
        "duration": "3–5 小时",
        "difficulty": "中等，以园区步道为准",
        "distance_km": None,
        "elevation_m": None,
        "accessible": "主要观景台多有步道；核心剖面可能需走石阶。",
        "stop_geosite_ids": [g["id"] for g in geos],
        "how_to_go": "先到游客中心取官方导览图，按打卡点顺序走，不要抄未开放捷径。",
        "notes": "这是读岩石的路线，不是赶景点清单。每个点停够五分钟看层理和节理。",
    }


def visit_for(site: dict) -> dict:
    sid = site["id"]
    if sid in FREE_SITES:
        ticketed = False
        price = "免费开放。若遇临时管制，以现场为准。"
        url = site["official_website"]
    elif sid in TICKETED_TRUE:
        ticketed = True
        price = "多数核心景区收费。价格、优惠与是否预约以官方当日为准，本站不售票。"
        url = site["official_website"]
    else:
        ticketed = "unknown"
        price = "是否购票请核对该点官方渠道。本站不售票，也不把过期票价写成实时价。"
        url = site["official_website"]
    backups = []
    if ticketed is True and url:
        backups = []  # 不伪造美团深链
    return {
        "site_id": sid,
        "is_ticketed": ticketed,
        "price_note": price + " 以官方当日为准。",
        "opening_hours": "以园区当日公告为准",
        "peak_season": "暑期与节假日",
        "closed_days": "以官方公告为准",
        "reservation_required": "unknown",
        "free_policy": "老人、学生、本地优惠仅摘官方公开信息，出行前请再查一次。",
        "official_ticket_url": url,
        "backup_ticket_urls": backups,
        "transport": f"通常经{site['province']}{site['city']}转车或自驾到达园区。具体班次以当地交通公告为准。",
        "best_season": "春秋侧光好，层理清楚；盛夏注意暴雨和落石。",
        "info_updated_on": INFO_UPDATED,
    }


def main() -> None:
    seen: dict[str, tuple] = {}
    for row in R1 + R2:
        seen[row[0]] = row
    rows = list(seen.values())

    sites = [expand_site(r) for r in rows]
    by_id = {s["id"]: s for s in sites}

    # theme route backrefs
    for tr in THEME_ROUTES:
        for sid in tr["site_ids"]:
            if sid in by_id and tr["id"] not in by_id[sid]["theme_route_ids"]:
                by_id[sid]["theme_route_ids"].append(tr["id"])

    geosites: list[dict] = []
    routes: list[dict] = []
    visits: list[dict] = []
    for s in sites:
        gs = geosites_for(s)
        geosites.extend(gs)
        routes.append(route_for(s, gs))
        visits.append(visit_for(s))

    areas = [
        {"id": "fangshan-shihuadong", "site_id": "fangshan", "name": "石花洞园区", "coordinates": [115.93, 39.80], "summary": "北方喀斯特洞穴。雾迷山组白云岩里的石旗、石幔和石花。"},
        {"id": "fangshan-zhoukoudian", "site_id": "fangshan", "name": "周口店园区", "coordinates": [115.92, 39.69], "summary": "北京人遗址。看的是洞穴堆积与人类演化，不是挖化石。"},
        {"id": "fangshan-shidu", "site_id": "fangshan", "name": "十渡园区", "coordinates": [115.60, 39.64], "summary": "拒马河切开的碳酸盐岩峡谷，北方喀斯特的河谷面。"},
        {"id": "fangshan-baishishan", "site_id": "fangshan", "name": "白石山园区", "coordinates": [114.68, 39.25], "summary": "河北涞源。大理岩峰林，房山世界地质公园的跨省园区。"},
        {"id": "hk-saikung", "site_id": "hongkong", "name": "西贡火山岩园区", "coordinates": [114.36, 22.38], "summary": "早白垩世酸性火成岩柱状节理，IUGS 遗产点所在。"},
        {"id": "hk-ne", "site_id": "hongkong", "name": "新界东北沉积岩园区", "coordinates": [114.29, 22.54], "summary": "沉积岩海岸、断层与差异侵蚀。"},
    ]

    OUT.mkdir(parents=True, exist_ok=True)
    bundle = {
        "generated_on": INFO_UPDATED,
        "sources_cutoff": CUTOFF,
        "sites": sites,
        "areas": areas,
        "geosites": geosites,
        "routes": routes,
        "theme_routes": THEME_ROUTES,
        "visits": visits,
    }
    (OUT / "catalog.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    # split files for the published data model
    (OUT / "sites.json").write_text(json.dumps(sites, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "areas.json").write_text(json.dumps(areas, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "geosites.json").write_text(json.dumps(geosites, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "routes.json").write_text(json.dumps(routes, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "theme-routes.json").write_text(json.dumps(THEME_ROUTES, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "visits.json").write_text(json.dumps(visits, ensure_ascii=False, indent=2), encoding="utf-8")

    n_named = sum(1 for s in sites if "national_geopark" in s["types"])
    n_cand = sum(1 for s in sites if "national_geopark_candidate" in s["types"] and "national_geopark" not in s["types"])
    n_world = sum(1 for s in sites if "world_geopark" in s["types"])
    n_gssp = sum(1 for s in sites if "gssp" in s["types"])
    print(f"sites={len(sites)} national={n_named} candidate={n_cand} world={n_world} gssp={n_gssp} geosites={len(geosites)}")
    provinces = {}
    for s in sites:
        provinces[s["province"]] = provinces.get(s["province"], 0) + 1
    print("provinces", len(provinces), sorted(provinces))


if __name__ == "__main__":
    main()
