#!/usr/bin/env python3
"""Search Wikimedia Commons for unique geology photos. Never reuse a hash."""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "new_covers"
PUB = ROOT / "public" / "covers"
CREDITS = ROOT / "data" / "cover_credits.json"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/1.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()

HONEST_EMPTY = {
    "sheshan",
    "xixian-loess",
    "meishan",
    "qiyunshan",
    "zhengzhou-huanghe",
    "huanghe-delta",
    "gssp-huangnitang",
    "gssp-jiangshan",
    "gssp-huanghuachang",
    "gssp-wangjiawan",
    "gssp-paibi",
    "gssp-guzhang",
    "gssp-penglaitan",
    "gssp-pengchong",
    "gssp-wuliu",
}

BAD_CN = (
    "寺", "庙", "教堂", "天文台", "地图", "牌坊", "大门", "塑像", "摩崖", "题名",
    "观音", "佛像", "塔院", "古城", "故居", "水电站", "火车站", "机场", "望远镜",
    "自行车", "鲜花", "花卉", "墓", "陵园", "夜景", "夜色", "灯会", "博物馆展",
    "展厅", "雕像", "雕塑", "纪念碑", "牌匾", "题刻", "红绿灯",
)
BAD_EN = (
    "map", "location", "logo", "statue", "temple", "church", "gate", "ticket",
    "stele", "inscription", "pagoda", "monastery", "buddha", "plaza", "night",
    "flower", "blossom", "airport", "railway", "station", "hydroelectric",
    "telescope", "insect", "portrait", "painting", "museum interior", "bicycle",
    "cemetery", "tomb", "grave", "cityscape", "street view", "building",
    "flag", "coat of arms", "svg", "diagram", "chart",
)

HAND_Q = {
    "zhangshiyan": ["嶂石岩", "赞皇嶂石岩", "Zhangshiyan quartzite"],
    "luhe": ["六合石柱林", "桂子山石柱", "南京柱状节理", "Luhe columnar basalt"],
    "huanglong": ["黄龙钙华", "黄龙五彩池", "Huanglong travertine pools"],
    "xiangxi": ["古丈红石林", "湖南红石林", "Guzhang red stone forest"],
    "hongshilin": ["古丈红石林", "红石林 古丈"],
    "lufeng": ["禄丰恐龙化石", "Lufengosaurus skeleton"],
    "yanchuan": ["乾坤湾", "延川乾坤湾", "Yellow River Qiankunwan"],
    "shenxianju": ["神仙居", "仙居神仙居 峰"],
    "xiandu": ["缙云仙都", "鼎湖峰"],
    "datong-volcano": ["大同火山群", "大同火山锥"],
    "longwan": ["辉南龙湾", "龙湾火山湖"],
    "bingyugou": ["冰峪沟", "大连冰峪"],
    "wangmangling": ["王莽岭", "陵川王莽岭"],
    "chayashan": ["嵖岈山", "遂平嵖岈山"],
    "wudangshan": ["武当山山峰", "Wudang Mountains peak landscape"],
    "maijishan": ["麦积山远眺", "Maijishan cliff"],
    "huoshizhai": ["火石寨", "西吉火石寨丹霞"],
    "qitai": ["奇台硅化木", "新疆硅化木"],
    "liujiaxia": ["刘家峡恐龙", "永靖恐龙足迹"],
    "hezheng": ["和政古动物化石", "和政化石"],
    "daguglacier": ["达古冰川", "Dagu Glacier"],
    "laojunshan": ["黎明丹霞", "丽江老君山丹霞"],
    "jiuxiang": ["宜良九乡溶洞", "九乡峡谷"],
    "getuhe": ["格凸河", "紫云格凸河"],
    "feitianshan": ["郴州飞天山", "飞天山丹霞"],
    "mulanshan": ["黄陂木兰山", "木兰山变质岩"],
    "xinchang": ["新昌硅化木", "新昌化石木"],
    "tangshan-fangshan": ["南京汤山溶洞", "南京方山"],
    "zhangzhou-volcano": ["漳州滨海火山", "南碇岛柱状节理"],
    "shenhuwan": ["深沪湾", "晋江深沪湾古森林"],
    "baishuiyang": ["屏南白水洋", "白水洋 浅水广场"],
    "xiongershan": ["抱犊崮", "枣庄抱犊崮"],
    "linlushan": ["林虑山", "林州太行大峡谷"],
    "xiaonanhai": ["黔江小南海", "小南海地震堰塞湖"],
    "qingchuan": ["青川地震遗迹", "东河口地震遗址"],
    "zhada": ["札达土林", "Zanda earth forest"],
    "yigong": ["易贡冰川", "易贡湖"],
    "animaging": ["阿尼玛卿", "Anyemaqen glacier"],
    "everest-ordovician": ["珠穆朗玛峰北坡", "Mount Everest north face"],
    "rongbuk": ["绒布冰川", "Rongbuk Glacier"],
    "guanling": ["关岭化石", "关岭生物群"],
    "shuanghedong": ["绥阳双河洞", "双河洞"],
    "wumengshan": ["乌蒙山 六盘水", "韭菜坪"],
    "dongchuan": ["东川泥石流", "蒋家沟泥石流"],
    "jinsixia": ["商南金丝峡", "金丝峡峡谷"],
    "nangongshan": ["岚皋南宫山", "南宫山"],
    "liping": ["汉中黎坪", "黎坪国家森林"],
    "bingling": ["炳灵丹霞", "永靖丹霞地貌"],
    "guangeogou": ["宕昌官鹅沟", "官鹅沟峡谷"],
    "yeliguan": ["冶力关", "冶木峡"],
    "pingtang": ["平塘峡谷", "掌布藏字石"],
    "yangshan": ["阳山国家地质公园", "阳山喀斯特"],
    "fengkai": ["封开斑石", "封开龙山"],
    "dapeng": ["大鹏半岛海岸", "深圳大鹏火山岩海岸"],
    "guiping": ["桂平西山", "桂平花岗岩"],
    "luocheng": ["罗城喀斯特", "罗城怀群"],
    "donglan": ["东兰喀斯特", "东兰红水河"],
    "qijiang": ["綦江老瀛山", "綦江恐龙足迹"],
    "jiangyou": ["江油窦圌山", "窦圌山"],
    "huayingshan": ["华蓥山天池", "华蓥山地貌"],
    "gesala": ["格萨拉", "盐边格萨拉"],
    "guide": ["贵德黄河", "贵德丹霞"],
    "luochuan": ["洛川黄土剖面", "洛川黄土"],
    "kongtongshan": ["崆峒山 平凉", "崆峒山地貌"],
    "pingshanhu": ["平山湖大峡谷", "张掖平山湖"],
    "jimunai": ["吉木乃石城", "吉木乃草原石城"],
    "huangsongyu": ["黄松峪峡谷", "平谷黄松峪"],
    "yunmengshan": ["密云云蒙山", "云蒙山花岗岩"],
    "wuan": ["武安国家地质公园", "武安古武当山"],
    "qianan": ["迁安花岗岩", "迁安地质公园"],
    "siping": ["四平山门", "四平地质公园 火山"],
    "jiguanshan": ["鸡冠山 密山", "鸡西鸡冠山"],
    "yishan": ["峄山", "邹城峄山 花岗岩"],
    "guanshan": ["辉县关山", "关山地貌 河南"],
    "daweishan": ["浏阳大围山", "大围山地貌"],
    "tianshengqiao": ["阜平天生桥", "天生桥 阜平"],
    "liujiang": ["柳江盆地", "秦皇岛柳江"],
    "lincheng": ["临城溶洞", "崆山白云洞"],
    "xinglong": ["兴隆溶洞", "兴隆国家地质公园"],
    "xingtai-canyon": ["邢台峡谷群", "太行邢台峡谷"],
    "youyu": ["右玉火山颈", "右玉火山"],
    "yushe": ["榆社化石", "榆社博物馆化石"],
    "ningcheng": ["宁城化石", "宁城道虎沟"],
    "xilinhot": ["锡林浩特火山", "阿巴嘎火山"],
    "qiguoshan": ["七锅山", "巴林左旗火山"],
    "wuda": ["乌达植物化石", "乌达煤田化石"],
    "jinzhou": ["锦州笔架山", "锦州花岗岩"],
    "huludao": ["龙潭大峡谷 葫芦岛", "建昌龙潭峡谷"],
    "jingyu": ["靖宇火山", "靖宇矿泉"],
    "fusong": ["抚松火山", "抚松地质"],
    "yichun-forest": ["伊春花岗岩石林", "小兴安岭石林"],
    "fenghuangshan-hlj": ["黑龙江凤凰山", "凤凰山 鸡西"],
    "shankou": ["山口地质公园", "黑龙江山口"],
    "qinggang": ["青冈猛犸象", "青冈化石"],
    "cangnan-fanshan": ["苍南矾山", "矾山明矾石"],
    "fushan": ["浮山 安徽", "浮山火山岩"],
    "bagongshan": ["八公山", "淮南八公山"],
    "guniujiang": ["牯牛降", "祁门牯牛降"],
    "dabieshan-luan": ["大别山 六安", "天堂寨"],
    "fengyangshan": ["凤阳山 安徽", "凤阳韭山"],
    "taijidong": ["广德太极洞", "太极洞"],
    "marenshan": ["马仁山", "繁昌马仁山"],
    "shitai": ["石台溶洞", "石台蓬莱洞"],
    "tianedong": ["宁化天鹅洞", "天鹅洞群"],
    "shiniushan": ["德化石牛山", "石牛山 德化"],
    "baiyunshan-fj": ["福建白云山", "泰宁白云山"],
    "lingtongshan": ["灵通山", "平和灵通山"],
    "fozishan": ["佛子山 政和", "政和佛子山"],
    "qingliu": ["清流温泉", "清流地质"],
    "sanming-jiaoye": ["三明郊野", "三明地质公园"],
    "sanduao": ["三都澳", "宁德三都澳"],
    "guantaishan": ["官台山", "寿宁官台山"],
    "shicheng": ["石城 江西", "石城丹霞"],
    "laiyang": ["莱阳白垩纪", "莱阳恐龙"],
    "yiyuan": ["沂源鲁山", "沂源溶洞"],
    "changle-volcano": ["昌乐火山", "昌乐蓝宝石火山"],
    "wulianshan": ["五莲山", "九仙山 五莲"],
    "baotianman": ["宝天曼", "内乡宝天曼"],
    "shenlingzhai": ["神灵寨", "洛宁神灵寨"],
    "daimeishan": ["黛眉山", "洛阳黛眉山"],
    "jingangtai": ["金刚台", "商城金刚台"],
    "xiaoqinling": ["小秦岭", "灵宝小秦岭"],
    "ruyang": ["汝阳恐龙", "汝阳黄河巨龙"],
    "yunxian": ["郧县恐龙蛋", "青龙山恐龙蛋"],
    "wufeng": ["五峰后河", "五峰地质"],
    "yuanan": ["远安化石", "远安盐池河"],
    "fenghuang": ["凤凰南华山", "凤凰喀斯特"],
    "jiubujiang": ["酒埠江", "攸县酒埠江"],
    "wulongshan": ["乌龙山 湖南", "龙山乌龙山"],
    "meijiang": ["湄江 涟源", "湄江喀斯特"],
    "shiniuzhai": ["石牛寨", "平江石牛寨丹霞"],
    "wanfoshan": ["万佛山 通道", "通道丹霞"],
    "xuefenghu": ["雪峰湖", "安化雪峰山"],
    "baishuidong": ["白水洞 新邵", "新邵白水洞"],
    "lingxiaoyan": ["凌霄岩", "阳春凌霄岩"],
    "enping": ["恩平温泉", "恩平地热"],
    "qinglan": ["青岚", "饶平青岚"],
    "ziyuan": ["资源八角寨", "资源丹霞"],
    "fengshan": ["凤山岩溶", "凤山三门海"],
    "xiangqiao": ["香桥岩溶", "鹿寨香桥"],
    "qibailong": ["七百弄", "大化七百弄"],
    "yizhou-shilin": ["宜州水上石林", "宜州石林"],
    "wuhuangshan": ["五皇山", "浦北五皇山"],
    "baisha-crater": ["白沙陨石坑", "海南白沙"],
    "wansheng": ["万盛石林", "万盛黑山谷"],
    "qiyaoshan": ["七曜山", "石柱七曜山"],
    "longmenshan": ["龙门山断裂", "彭州龙门山"],
    "anxiang": ["安县生物礁", "安州生物礁"],
    "shehong": ["射洪硅化木", "硅化木 射洪"],
    "dabashan": ["大巴山 宣汉", "宣汉百里峡"],
    "mianzhu": ["汉旺地震", "绵竹清平"],
    "sinan": ["思南乌江", "思南石林"],
    "miaoling": ["苗岭 黔东南", "雷公山"],
    "weishan": ["巍山红河源", "巍山地貌"],
    "luoping": ["罗平生物群", "罗平化石"],
    "laojunshan": ["黎明丹霞", "老君山黎明"],
}

# typo fix: I accidentally put a tuple in HAND_Q
# "xinglong", ["兴隆溶洞"...]  -- will catch below

def get(url: str, timeout: int = 35) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def is_jpeg(data: bytes) -> bool:
    return data[:2] == b"\xff\xd8"


def bad_text(s: str) -> bool:
    low = (s or "").lower()
    if any(b in (s or "") for b in BAD_CN):
        return True
    if any(b in low for b in BAD_EN):
        return True
    return False


def artist_from_meta(meta: dict) -> str:
    artist = (meta.get("Artist") or {}).get("value") or ""
    artist = re.sub(r"<[^>]+>", " ", artist)
    artist = " ".join(artist.split())[:80]
    lic = (meta.get("LicenseShortName") or {}).get("value") or ""
    lic = re.sub(r"<[^>]+>", " ", lic)
    bits = [x for x in (artist, lic, "Wikimedia Commons") if x]
    return ", ".join(bits)


def commons_search(q: str, limit: int = 8) -> list[str]:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "list": "search",
            "srsearch": q,
            "srnamespace": 6,
            "srlimit": limit,
            "format": "json",
        }
    )
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return []
    out = []
    for hit in (data.get("query") or {}).get("search") or []:
        title = hit.get("title") or ""
        if title.startswith("File:"):
            out.append(title)
    return out


def wiki_file(lang: str, title: str) -> str | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return None
    desc = (data.get("description") or "") + " " + (data.get("extract") or "")[:200]
    if any(x in desc.lower() for x in ("county", "district of", "town in", "city in china")):
        return None
    if any(x in desc for x in ("县", "县级", "镇政府", "古城")):
        # allow if the title itself is the landform
        if not any(k in title for k in ("地质", "地貌", "峡谷", "溶洞", "火山", "峰", "石林", "丹霞", "黄土")):
            return None
    if bad_text(desc) or bad_text(title):
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img:
        return None
    name = Path(urllib.parse.urlparse(img).path).name
    return "File:" + urllib.parse.unquote(name)


def imageinfo(titles: list[str]) -> list[dict]:
    if not titles:
        return []
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": "|".join(titles[:20]),
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return []
    rows = []
    for page in ((data.get("query") or {}).get("pages") or {}).values():
        title = page.get("title") or ""
        info = (page.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        if "jpeg" not in mime:
            continue
        if (info.get("width") or 0) < 500:
            continue
        if bad_text(title):
            continue
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        meta = info.get("extmetadata") or {}
        rows.append(
            {
                "title": title,
                "url": thumb,
                "credit": artist_from_meta(meta),
                "filename": Path(urllib.parse.urlparse(info.get("url") or thumb).path).name,
            }
        )
    return rows


def load_hashes() -> dict[str, str]:
    h: dict[str, str] = {}
    for p in PUB.glob("*.jpg"):
        h[hashlib.md5(p.read_bytes()).hexdigest()] = p.name
    return h


def short_name(name: str) -> str:
    return (
        name.replace("联合国教科文组织", "")
        .replace("世界地质公园", "")
        .replace("国家地质公园", "")
        .replace("地质公园", "")
        .replace("金钉子", "")
        .strip()
    )


def queries_for(site: dict) -> list[str]:
    sid = site["id"]
    qs = list(HAND_Q.get(sid) or [])
    sn = short_name(site["name"])
    en = site.get("name_en") or ""
    if sn:
        qs.append(sn)
        qs.append(sn + " 地貌")
    if en:
        qs.append(en)
        qs.append(en + " geopark")
    # unique preserve order
    seen = set()
    out = []
    for q in qs:
        q = q.strip()
        if q and q not in seen:
            seen.add(q)
            out.append(q)
    return out[:6]


def fetch_one(site: dict, used_hashes: dict[str, str]) -> dict | None:
    sid = site["id"]
    titles: list[str] = []
    for q in queries_for(site):
        titles.extend(commons_search(q, 6))
        # also try zh wikipedia summary
        wf = wiki_file("zh", q)
        if wf:
            titles.append(wf)
        time.sleep(0.05)
    # unique
    seen = set()
    uniq = []
    for t in titles:
        if t not in seen:
            seen.add(t)
            uniq.append(t)
    infos = []
    for i in range(0, min(len(uniq), 24), 8):
        infos.extend(imageinfo(uniq[i : i + 8]))
    for info in infos:
        try:
            data = get(info["url"])
        except Exception:
            continue
        if len(data) < 18000 or not is_jpeg(data):
            continue
        h = hashlib.md5(data).hexdigest()
        if h in used_hashes:
            continue
        dest = OUT / f"{sid}.jpg"
        dest.write_bytes(data)
        used_hashes[h] = dest.name
        return {
            "id": sid,
            "file": str(dest),
            "credit": info["credit"],
            "commons": info["title"],
            "url": info["url"],
            "bytes": len(data),
            "hash": h,
        }
    return None


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    used = load_hashes()
    # also hash already downloaded candidates
    for p in OUT.glob("*.jpg"):
        used[hashlib.md5(p.read_bytes()).hexdigest()] = p.name

    have = {p.stem for p in PUB.glob("*.jpg")}
    targets = []
    for s in SITES:
        if s["id"] in HONEST_EMPTY:
            continue
        if s["id"] in have:
            continue
        if (OUT / f"{s['id']}.jpg").exists():
            continue
        targets.append(s)
    print("targets", len(targets), "existing pub", len(have))
    log = []
    # sequential is kinder to the API; thread a little
    for i, s in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}] {s['id']} {s['name']}", flush=True)
        try:
            row = fetch_one(s, used)
        except Exception as e:
            print("  err", type(e).__name__, e)
            row = None
        if row:
            print("  OK", row["commons"], row["bytes"])
            log.append(row)
        else:
            print("  none")
        time.sleep(0.15)
    (OUT / "log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2))
    print("wrote", len(log), "candidates")


if __name__ == "__main__":
    main()
