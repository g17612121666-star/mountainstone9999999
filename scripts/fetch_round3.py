#!/usr/bin/env python3
"""Round-3 waterfall: Commons file search + Openverse + gov/Xinhua/IUGS pages.

JPEG magic is 2 bytes. Commons needs Referer. Wikipedia pageimages are
almost always locator maps — skip them.
"""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "round3"
OUT.mkdir(parents=True, exist_ok=True)
UA = "ShanShiZhiFieldGuide/3.0 (https://shanshizhi.grok.me; educational CC-aware fetch)"
CTX = ssl.create_default_context()

DONE = json.loads((ROOT / "data" / "cover_credits.json").read_text())
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
SITE_BY = {s["id"]: s for s in SITES}

BAD = re.compile(
    r"(map|logo|flag|coat of arms|location|locator|diagram|svg|"
    r"China[A-Z][a-z]+[A-Z]|mcp\.png|Administrative|"
    r"martian crater|Mars Reconnaissance|HiRISE|"
    r"museum interior|visitor.?center|游客服务|售票|大门|牌坊|题名|"
    r"塑像|雕像|statue|temple hall|大殿|牌楼|"
    r"火车站|railway station|"
    r"延庆硅化木|安阳小南海|河南.?老君山|"
    r"台湾|taiwan|gesala quintana|getu feleke|austin zanda|"
    r"marathon|界碑|Earth_\d+ million)",
    re.I,
)

# slug -> extra Commons / Openverse queries (park + landform + synonym)
QUERIES: dict[str, list[str]] = {
    "datong-volcano": ["大同火山群", "大同火山 金山", "Datong volcanic field Jinshan", "狼窝山 火山"],
    "huoshizhai": ["火石寨 丹霞", "西吉火石寨", "Huoshizhai Danxia", "火石寨 擎天柱"],
    "getuhe": ["格凸河", "Getu River karst", "紫云格凸河", "Getu arch Guizhou"],
    "pingshanhu": ["平山湖大峡谷", "张掖平山湖", "Pingshanhu canyon"],
    "wudangshan": ["武当山 峰", "Wudang Mountains peak", "武当山 岩", "Wudangshan granite"],
    "wansheng": ["万盛石林", "Wansheng Stone Forest", "万盛经开区 石林"],
    "laojunshan": ["黎明丹霞", "Liming Danxia", "老君山 黎明 丹霞", "千龟山 丽江"],
    "xingtai-canyon": ["邢台大峡谷", "邢台峡谷群", "黄巢峡", "Xingtai Grand Canyon"],
    "meishan": ["煤山剖面", "Meishan GSSP", "长兴煤山 金钉子", "Changhsingian GSSP Meishan section"],
    "gssp-huangnitang": ["Huangnitang GSSP", "黄泥塘 金钉子", "Darriwilian Huangnitang section"],
    "gssp-jiangshan": ["Duibian GSSP", "江山碓边 金钉子", "Jiangshanian GSSP"],
    "luochuan": ["洛川黄土 剖面", "Luochuan loess section", "洛川黑木沟"],
    "sheshan": ["佘山 火山岩", "西佘山 露头", "Sheshan volcanic rock Shanghai"],
    "xixian-loess": ["隰县黄土", "隰县 黄土塬", "Xixian loess"],
    "huanghe-delta": ["东营 黄河三角洲 湿地", "Yellow River Delta Dongying aerial"],
    "zhengzhou-huanghe": ["郑州黄河风景区", "花园口 黄河", "郑州黄河 峡谷"],
    "feitianshan": ["飞天山 丹霞", "郴州飞天山", "飞天山 天生桥 丹霞"],
    "hongshilin": ["古丈红石林", "红石林 湖南", "Guzhang red stone forest"],
    "yishan": ["邹城峄山", "峄山 花岗岩", "Yishan Zoucheng"],
    "wulianshan": ["五莲山", "九仙山 五莲", "Wulianshan granite"],
    "shenhuwan": ["深沪湾 海滩岩", "晋江深沪湾", "Shenhu Bay beachrock"],
    "taijidong": ["广德太极洞", "太极洞 钟乳石"],
    "huangsongyu": ["黄松峪 峡谷", "天云山 平谷 岩", "Huangsongyu canyon Pinggu"],
    "jingyu": ["靖宇火山", "靖宇矿泉 火山锥", "Jingyu volcano cone"],
    "fengkai": ["封开大斑石", "封开 花岗岩", "Fengkai granite boulder"],
    "qitai": ["奇台硅化木", "硅化木 恐龙沟 奇台", "Qitai petrified wood Xinjiang"],
    "guanling": ["关岭化石", "关岭生物群", "Guanling biota fossil"],
    "luoping": ["罗平生物群", "罗平 海百合", "Luoping biota"],
    "dongchuan": ["蒋家沟 泥石流", "东川泥石流 沟", "Jiangjia gully debris flow"],
    "baisha-crater": ["白沙陨石坑", "海南白沙 陨石", "Baisha crater Hainan"],
    "jinsixia": ["商南金丝峡", "金丝峡 峡谷"],
    "nangongshan": ["岚皋南宫山", "南宫山 火山"],
    "liping": ["汉中黎坪", "黎坪 丹霞"],
    "liujiaxia": ["刘家峡恐龙", "永靖 恐龙足迹"],
    "guangeogou": ["宕昌官鹅沟", "官鹅沟 峡谷"],
    "yeliguan": ["冶力关", "临潭冶力关"],
    "hezheng": ["和政古动物", "和政化石"],
    "qingchuan": ["青川东河口 地震", "东河口地震遗址"],
    "mianzhu": ["绵竹清平", "汉旺地震 遗迹 山体"],
    "gesala": ["盐边格萨拉", "格萨拉 石林"],
    "jiangyou": ["窦圌山", "江油窦圌山"],
    "anxiang": ["安县生物礁", "安州生物礁"],
    "shehong": ["射洪硅化木", "射洪 硅化木"],
    "dabashan": ["通江诺水河", "大巴山 喀斯特 通江"],
    "xiaonanhai": ["黔江小南海 堰塞湖", "小南海 地震湖 重庆"],
    "qijiang": ["綦江老瀛山", "老瀛山 丹霞"],
    "qiyaoshan": ["石柱七曜山", "七曜山 喀斯特"],
    "shuanghedong": ["绥阳双河洞", "双河洞 溶洞"],
    "wumengshan": ["六盘水乌蒙山", "乌蒙山 地质公园"],
    "pingtang": ["平塘掌布", "掌布藏字石", "平塘天坑"],
    "sinan": ["思南石林", "思南乌江 喀斯特"],
    "miaoling": ["苗岭 地质公园", "黔东南苗岭"],
    "gssp-paibi": ["Paibi GSSP", "排碧 金钉子", "花垣排碧 剖面"],
    "gssp-guzhang": ["Guzhangian GSSP", "古丈罗依溪 金钉子"],
    "gssp-wuliu": ["Wuliuan GSSP", "剑河乌溜 金钉子", "曾家岩 金钉子"],
    "gssp-penglaitan": ["Penglaitan GSSP", "蓬莱滩 金钉子", "来宾蓬莱滩"],
    "gssp-pengchong": ["Pengchong GSSP", "柳州碰冲 金钉子"],
    "gssp-huanghuachang": ["Huanghuachang GSSP", "黄花场 金钉子", "宜昌黄花场"],
    "gssp-wangjiawan": ["Wangjiawan GSSP", "王家湾 金钉子", "宜昌王家湾 奥陶"],
    "youyu": ["右玉火山颈", "杀虎口 火山颈"],
    "xilinhot": ["阿巴嘎火山", "锡林浩特 火山锥"],
    "qiguoshan": ["七锅山 巴林左旗", "巴林左旗 火山"],
    "ningcheng": ["道虎沟 化石", "宁城道虎沟"],
    "wuda": ["乌达植物庞贝", "Wuda vegetational Pompeii", "乌达 化石森林"],
    "huludao": ["葫芦岛龙潭大峡谷", "龙潭大峡谷 建昌"],
    "fusong": ["抚松火山", "抚松 玄武岩"],
    "siping": ["四平山门", "山门 四平 地质"],
    "yichun-forest": ["汤旺河石林", "伊春花岗岩石林", "Tangwanghe stone forest"],
    "fenghuangshan-hlj": ["黑龙江凤凰山 地质", "鸡西凤凰山"],
    "shankou": ["克东山口 地质公园"],
    "qinggang": ["青冈猛犸象", "青冈 猛犸"],
    "jiguanshan": ["密山鸡冠山", "鸡西鸡冠山 地质"],
    "xinchang": ["新昌硅化木", "新昌 硅化木公园"],
    "cangnan-fanshan": ["苍南矾山", "矾山 明矾石"],
    "fengyangshan": ["凤阳山 韭山", "凤阳 地质公园 岩"],
    "marenshan": ["繁昌马仁山", "马仁山 花岗岩"],
    "shitai": ["石台蓬莱仙洞", "石台溶洞"],
    "tianedong": ["宁化天鹅洞", "天鹅洞 溶洞"],
    "shiniushan": ["德化石牛山", "石牛山 花岗岩"],
    "baiyunshan-fj": ["德化白云山", "福建白云山 地质"],
    "lingtongshan": ["平和灵通山", "灵通岩 丹霞"],
    "fozishan": ["政和佛子山", "佛子山 丹霞"],
    "qingliu": ["清流温泉 地质"],
    "sanming-jiaoye": ["三明郊野 地质公园"],
    "sanduao": ["三都澳 海蚀", "宁德三都澳 岸"],
    "guantaishan": ["寿宁官台山"],
    "shicheng": ["石城 丹霞 江西", "石城地质公园"],
    "laiyang": ["莱阳恐龙 白垩", "莱阳 金刚口"],
    "yiyuan": ["沂源鲁山", "沂源 溶洞 地质"],
    "changle-volcano": ["昌乐火山", "昌乐 玄武岩 蓝宝石"],
    "baotianman": ["内乡宝天曼", "宝天曼 花岗岩"],
    "guanshan": ["辉县关山", "关山地质公园 河南"],
    "shenlingzhai": ["洛宁神灵寨", "神灵寨 花岗岩"],
    "daimeishan": ["新安黛眉山", "黛眉山 峡谷"],
    "jingangtai": ["商城金刚台", "金刚台 地质"],
    "xiaoqinling": ["小秦岭 地质公园", "灵宝小秦岭"],
    "ruyang": ["汝阳恐龙", "汝阳 恐龙足迹"],
    "mulanshan": ["黄陂木兰山", "木兰山 变质岩"],
    "yunxian": ["郧阳恐龙蛋", "青龙山恐龙蛋"],
    "wufeng": ["五峰后河", "五峰地质公园 湖北"],
    "yuanan": ["远安化石", "远安 三叠"],
    "fenghuang": ["凤凰南华山", "凤凰地质公园 湖南 岩"],
    "jiubujiang": ["酒埠江 溶洞", "醴陵酒埠江"],
    "wulongshan": ["龙山乌龙山", "乌龙山 湖南 峡谷"],
    "meijiang": ["涟源湄江", "湄江 丹霞"],
    "shiniuzhai": ["平江石牛寨", "石牛寨 丹霞"],
    "daweishan": ["浏阳大围山", "大围山 花岗岩"],
    "wanfoshan": ["通道万佛山", "万佛山 丹霞 湖南"],
    "xuefenghu": ["安化雪峰湖", "雪峰湖 地质"],
    "baishuidong": ["新邵白水洞", "白水洞 丹霞"],
    "lingxiaoyan": ["阳春凌霄岩", "凌霄岩 溶洞"],
    "enping": ["恩平温泉", "恩平 地热"],
    "yangshan": ["阳山地质公园", "阳山 喀斯特"],
    "qinglan": ["饶平青岚", "青岚 花岗岩 海蚀"],
    "fengshan": ["凤山三门海", "凤山岩溶"],
    "qibailong": ["大化七百弄", "七百弄 峰丛"],
    "guiping": ["桂平西山", "桂平地质公园"],
    "yizhou-shilin": ["宜州水上石林", "宜州 石林"],
    "wuhuangshan": ["浦北五皇山"],
    "luocheng": ["罗城地质公园", "罗城 喀斯特"],
    "donglan": ["东兰地质公园", "东兰 喀斯特"],
    "jimunai": ["吉木乃草原石城", "吉木乃 风蚀"],
    "liujiang": ["柳江盆地", "秦皇岛柳江 剖面"],
    "lincheng": ["崆山白云洞", "临城溶洞"],
    "wuan": ["古武当山 武安", "武安地质公园"],
    "xinglong": ["兴隆溶洞 河北"],
    "qianan": ["迁安红峪口", "迁安花岗岩"],
    "tianshengqiao": ["阜平天生桥", "天生桥 阜平"],
    "huangsongyu": ["黄松峪水库 峡谷", "平谷黄松峪 山"],
}

# Direct source pages (level 3–6). Images scraped from HTML.
PAGES: list[tuple[str, str, str]] = [
    ("datong-volcano", "https://www.yunzhou.gov.cn/yzqrmzfz/imagedatong/202307/a481ab9a5f034ef0b26eacf71f084288.shtml", "4-yunzhou-gov"),
    ("datong-volcano", "https://news.cri.cn/20220121/aab9945c-5a80-245b-42d9-f9f46e6cb716.html", "4-cri"),
    ("datong-volcano", "https://www.dt.gov.cn/dtszf/xwfbh/202401/c675a4b935544b46a9add3a0ba785ed6.shtml", "4-dt-gov"),
    ("getuhe", "http://www.xinhuanet.com/english/2018-09/01/c_137436890.htm", "4-xinhua"),
    ("getuhe", "http://www.xinhuanet.com/english/2018-09/01/c_137436890_2.htm", "4-xinhua"),
    ("getuhe", "http://www.xinhuanet.com/english/2018-09/01/c_137436890_4.htm", "4-xinhua"),
    ("pingshanhu", "http://www.xinhuanet.com/photo/2021-04/26/c_1127376880.htm", "4-xinhua"),
    ("pingshanhu", "http://pic.people.com.cn/n1/2025/1215/c1016-40624379.html", "4-people"),
    ("pingshanhu", "https://www.zhangye.gov.cn/dzdt/tszy/202505/t20250520_1403468_ghb.html", "4-zhangye-gov"),
    ("huoshizhai", "https://whhlyt.nx.gov.cn/jqjd/gys_66590/hszgjdzgy/", "4-nx-whhlyt"),
    ("huoshizhai", "https://www.nx.gov.cn/ssjn/esyj/202303/t20230330_4015332.html", "4-nx-gov"),
    ("wansheng", "https://ws.cq.gov.cn/zjws/rwwswyxs/cyws/202301/t20230131_11550693.html", "4-wansheng-gov"),
    ("wansheng", "https://cq.cqnews.net/cqqx/html/web/content_1507082492948443136.html", "4-hualong"),
    ("laojunshan", "http://yn.people.com.cn/n2/2020/0411/c372453-33942118.html", "4-people-yn"),
    ("xingtai-canyon", "http://he.people.com.cn/n2/2025/0917/c192235-41354532.html", "4-people-he"),
    ("meishan", "https://iugs-geoheritage.org/geoheritage_sites/gssps-of-meishan-the-chronostratigraphic-record-of-the-biggest-phanerozoic-mass-extinction/", "3-iugs"),
    ("gssp-huangnitang", "https://ordovician.stratigraphy.org/darriwilian", "3-ics"),
    ("gssp-huangnitang", "https://timescalefoundation.org/gssp/detail.php?periodid=137&top_parentid=0", "3-timescale"),
    ("gssp-jiangshan", "https://timescalefoundation.org/gssp/", "3-timescale"),
    ("luochuan", "https://images.cnrs.fr/photo/20090001_1518", "3-cnrs"),
]


def get(url: str, timeout: int = 40, referer: str | None = None) -> bytes:
    headers = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml,image/jpeg,image/png,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    if referer:
        headers["Referer"] = referer
    elif "wikimedia" in url or "wikipedia" in url:
        headers["Referer"] = "https://commons.wikimedia.org/"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def is_image(data: bytes) -> bool:
    if len(data) < 8000:
        return False
    if data[:2] == b"\xff\xd8":
        return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False


def commons_search(q: str, limit: int = 12) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  commons fail", q, type(e).__name__)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = p.get("title") or ""
        if BAD.search(title):
            continue
        info = (p.get("imageinfo") or [{}])[0]
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        size = info.get("size") or 0
        if size and size < 20000:
            continue
        meta = info.get("extmetadata") or {}
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        artist = re.sub(r"<[^>]+>", " ", (meta.get("Artist") or {}).get("value") or "")
        artist = re.sub(r"\s+", " ", artist).strip()
        desc = re.sub(r"<[^>]+>", " ", (meta.get("ImageDescription") or {}).get("value") or "")
        desc = re.sub(r"\s+", " ", desc).strip()[:240]
        thumb = info.get("thumburl") or info.get("url")
        orig = info.get("url")
        if not thumb:
            continue
        out.append(
            {
                "title": title,
                "url": thumb,
                "orig": orig,
                "license": lic,
                "artist": artist,
                "desc": desc,
                "source": "commons",
                "query": q,
                "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
            }
        )
    return out


def openverse_search(q: str, limit: int = 8) -> list[dict]:
    api = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {
            "q": q,
            "license_type": "all",
            "category": "photograph",
            "page_size": limit,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  openverse fail", q, type(e).__name__)
        return []
    out = []
    for r in data.get("results") or []:
        title = r.get("title") or ""
        if BAD.search(title):
            continue
        url = r.get("url") or r.get("thumbnail")
        if not url:
            continue
        out.append(
            {
                "title": title,
                "url": url,
                "license": (r.get("license") or "") + " " + (r.get("license_version") or ""),
                "artist": r.get("creator") or "",
                "source": "openverse:" + (r.get("source") or ""),
                "query": q,
                "page": r.get("foreign_landing_url") or "",
                "desc": (r.get("attribution") or "")[:240],
            }
        )
    return out


IMG_RE = re.compile(
    r'(?:src|data-src|data-original)=["\']([^"\']+\.(?:jpg|jpeg|png|webp)[^"\']*)["\']',
    re.I,
)
# Xinhua / people often put images in titlepic or wapindex
IMG_RE2 = re.compile(r'https?://[^"\'\s>]+\.(?:jpg|jpeg|png|webp)', re.I)


def scrape_page(url: str) -> list[str]:
    try:
        html = get(url, timeout=30).decode("utf-8", "replace")
    except Exception as e:
        print("  scrape fail", url[:80], type(e).__name__)
        return []
    found = set()
    for m in IMG_RE.findall(html):
        found.add(m)
    for m in IMG_RE2.findall(html):
        found.add(m)
    out = []
    for u in found:
        u = u.replace("\\/", "/")
        if u.startswith("//"):
            u = "https:" + u
        elif u.startswith("/"):
            parsed = urllib.parse.urlparse(url)
            u = f"{parsed.scheme}://{parsed.netloc}{u}"
        low = u.lower()
        if any(x in low for x in ("logo", "icon", "sprite", "avatar", "qrcode", "qr_code", "banner_nav", "1x1", "pixel")):
            continue
        if "gov.cn" in low and any(x in low for x in ("header", "footer", "nav")):
            continue
        out.append(u)
    return out[:20]


def download(url: str, dest: Path, referer: str | None = None) -> bool:
    try:
        data = get(url, timeout=50, referer=referer)
    except Exception as e:
        print("   dl fail", dest.name, type(e).__name__)
        return False
    if not is_image(data):
        return False
    dest.write_bytes(data)
    return True


def run_slug(slug: str, queries: list[str]) -> list[dict]:
    dest = OUT / slug
    dest.mkdir(parents=True, exist_ok=True)
    seen: set[str] = set()
    kept: list[dict] = []
    for q in queries:
        hits = commons_search(q) + openverse_search(q)
        for hit in hits:
            key = hit.get("title") or hit.get("url")
            if not key or key in seen:
                continue
            seen.add(key)
            n = len(kept)
            path = dest / f"{n:02d}.jpg"
            ok = download(hit["url"], path, referer="https://commons.wikimedia.org/")
            if not ok and hit.get("orig"):
                ok = download(hit["orig"], path, referer="https://commons.wikimedia.org/")
            if not ok:
                continue
            hit["file"] = str(path)
            hit["bytes"] = path.stat().st_size
            kept.append(hit)
            if len(kept) >= 6:
                break
        if len(kept) >= 6:
            break
        time.sleep(0.15)
    (dest / "meta.json").write_text(json.dumps(kept, ensure_ascii=False, indent=2))
    print(f"  {slug}: {len(kept)} files")
    return kept


def run_pages() -> None:
    by_slug: dict[str, list[dict]] = {}
    for slug, url, level in PAGES:
        dest = OUT / slug
        dest.mkdir(parents=True, exist_ok=True)
        imgs = scrape_page(url)
        print(f"  page {slug} {level} {len(imgs)} imgs {url[:70]}")
        existing = len(list(dest.glob("p*.jpg")))
        for i, img in enumerate(imgs[:8]):
            path = dest / f"p{existing + i:02d}.jpg"
            if download(img, path, referer=url):
                by_slug.setdefault(slug, []).append(
                    {
                        "title": img.split("/")[-1],
                        "url": img,
                        "source": level,
                        "page": url,
                        "file": str(path),
                        "bytes": path.stat().st_size,
                    }
                )
        time.sleep(0.2)
    (OUT / "pages.json").write_text(json.dumps(by_slug, ensure_ascii=False, indent=2))


def main() -> None:
    remaining = [s["id"] for s in SITES if s["id"] not in DONE]
    print("remaining schematic (no credit):", len(remaining))
    # prioritize queried ones, then rest
    order = [s for s in QUERIES if s not in DONE] + [s for s in remaining if s not in QUERIES]
    print("will search", len(order), "slugs")
    print("=== scrape official pages ===")
    run_pages()
    print("=== commons + openverse ===")
    # run in modest parallel
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {}
        for slug in order:
            qs = QUERIES.get(slug) or [SITE_BY[slug]["name"], SITE_BY[slug].get("name_en") or slug]
            futs[ex.submit(run_slug, slug, qs)] = slug
        for fut in as_completed(futs):
            slug = futs[fut]
            try:
                fut.result()
            except Exception as e:
                print(" FAIL", slug, type(e).__name__, e)


if __name__ == "__main__":
    main()
