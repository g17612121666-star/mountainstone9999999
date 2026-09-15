#!/usr/bin/env python3
"""Round-4: official gov/press pages + Commons geosearch + text search.

JPEG magic = 2 bytes. PNG converted via Pillow. Commons needs Referer.
"""
from __future__ import annotations

import io
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "round4"
OUT.mkdir(parents=True, exist_ok=True)
UA = "ShanShiZhiFieldGuide/4.0 (https://shanshizhi.grok.me; educational CC-aware fetch)"
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
    r"marathon|界碑|Earth_\d+ million|Getar River|"
    r"杜鹃|azalea|rhododendron|apple orchard|"
    r"glass bridge|玻璃桥|玻璃栈道)",
    re.I,
)

# Official / press pages (level 3–6). Scrape images from HTML.
PAGES: list[tuple[str, str, str]] = [
    ("yichun-forest", "https://wlt.hlj.gov.cn/wlt/c114254/202408/c00_31760103.shtml", "4-hlj-wlt"),
    ("tianshengqiao", "https://www.bdfuping.gov.cn/news/92.html", "4-fuping-gov"),
    ("feitianshan", "http://hn.people.com.cn/n2/2023/0222/c336521-40311427.html", "4-people-hn"),
    ("huanghe-delta", "http://pic.people.com.cn/n1/2023/1028/c1016-40105404-7.html", "4-xinhua-people"),
    ("huanghe-delta", "http://pic.people.com.cn/n1/2025/0612/c1016-40499171.html", "4-people-pic"),
    ("huoshizhai", "http://nx.people.com.cn/n2/2023/0204/c192493-40288883.html", "4-people-nx"),
    ("huoshizhai", "http://nx.people.com.cn/n2/2023/0814/c192482-40530339.html", "4-people-nx2"),
    ("laojunshan", "http://yn.people.com.cn/n2/2022/0701/c372453-40019172.html", "4-people-yn"),
    ("laojunshan", "http://yn.people.com.cn/n2/2020/0411/c372453-33942118.html", "4-people-yn2"),
    ("getuhe", "http://gz.people.com.cn/n2/2020/0612/c389359-34083144.html", "4-people-gz"),
    ("fengshan", "http://dkj.gxzf.gov.cn/cxzt/dxkp/t3339421.shtml", "4-gx-dkj"),
    ("wulianshan", "http://paper.people.com.cn/rmrbhwb/pc/content/202512/04/content_30118385.html", "4-people-wulian"),
    ("sheshan", "https://www.songjiang.gov.cn/xwzx/bmdt/202309/t20230915_11234567.html", "4-songjiang"),
]

# Extra Commons / Openverse queries (park + landform + synonym)
QUERIES: dict[str, list[str]] = {
    "yichun-forest": ["汤旺河石林", "Tangwanghe granite stone forest", "伊春花岗岩石林 一线天"],
    "tianshengqiao": ["阜平天生桥", "Fuping Tianshengqiao waterfall", "阜平 片麻岩 天生桥"],
    "feitianshan": ["郴州飞天山 丹霞", "Feitianshan Danxia Chenzhou", "飞天山 天生桥"],
    "huanghe-delta": ["黄河三角洲 东营 航拍", "Yellow River Delta Dongying aerial wetland"],
    "huoshizhai": ["西吉火石寨 丹霞", "Huoshizhai Danxia Ningxia", "火石寨 擎天柱"],
    "laojunshan": ["黎明丹霞 丽江", "Liming Danxia Lijiang", "千龟山 黎明"],
    "getuhe": ["格凸河 大穿洞", "Getu karst arch Guizhou", "紫云格凸河 天生桥"],
    "fengshan": ["凤山三门海", "Fengshan Sanmenhai tiankeng", "三门海 天窗"],
    "yishan": ["邹城峄山 花岗岩", "Mount Yi Zoucheng granite", "峄山 五华峰"],
    "wulianshan": ["五莲山 花岗岩", "Wulianshan granite Rizhao", "九仙山 五莲 岩"],
    "hongshilin": ["古丈红石林", "Guzhang red stone forest", "红石林 湖南 喀斯特"],
    "fengkai": ["封开大斑石", "Fengkai granite boulder", "封开 花岗岩 巨石"],
    "shenhuwan": ["深沪湾 海滩岩", "Shenhu Bay beachrock Jinjiang", "晋江深沪湾 古森林"],
    "wanfoshan": ["通道万佛山 丹霞", "Tongdao Wanfoshan Danxia"],
    "shiniuzhai": ["平江石牛寨 丹霞", "Shiniuzhai Danxia Pingjiang"],
    "meijiang": ["涟源湄江 丹霞", "Meijiang Danxia Lianyuan"],
    "lingtongshan": ["平和灵通山 丹霞", "Lingtongshan Danxia Pinghe"],
    "fozishan": ["政和佛子山 丹霞", "Fozishan Danxia Zhenghe"],
    "jinsixia": ["商南金丝峡", "Jinsixia canyon Shangnan"],
    "xiaonanhai": ["黔江小南海 堰塞湖", "Qianjiang Xiaonanhai earthquake lake"],
    "jiangyou": ["江油窦圌山", "Doutuanshan Jiangyou"],
    "qijiang": ["綦江老瀛山 丹霞", "Laoyingshan Danxia Qijiang"],
    "pingtang": ["平塘掌布 藏字石", "Pingtang tiankeng Guizhou"],
    "guanling": ["关岭化石群 海百合", "Guanling biota crinoid"],
    "qitai": ["奇台硅化木", "Qitai petrified wood Xinjiang"],
    "jingyu": ["靖宇火山锥", "Jingyu volcano Jilin"],
    "siping": ["四平山门 火山颈", "Siping Shanmen volcanic neck"],
    "huangsongyu": ["平谷黄松峪 峡谷", "Huangsongyu canyon Pinggu", "天云山 平谷 岩"],
    "lincheng": ["崆山白云洞", "Kongshan cave Lincheng"],
    "liujiang": ["秦皇岛柳江盆地 剖面", "Liujiang basin Qinhuangdao"],
    "xinglong": ["兴隆溶洞 河北", "Xinglong cave Hebei"],
    "qianan": ["迁安红峪口 花岗岩", "Qian'an granite Hebei"],
    "youyu": ["右玉火山颈", "Youyu volcanic neck Shanxi"],
    "xixian-loess": ["隰县黄土塬", "Xixian loess plateau Shanxi"],
    "ningcheng": ["宁城道虎沟 化石", "Daohugou Ningcheng"],
    "xilinhot": ["锡林浩特 阿巴嘎火山", "Abaga volcano Xilinhot"],
    "qiguoshan": ["巴林左旗七锅山 火山", "Qiguoshan volcano"],
    "wuda": ["乌达植物庞贝", "Wuda vegetational Pompeii"],
    "huludao": ["葫芦岛龙潭大峡谷", "Longtan canyon Huludao"],
    "fusong": ["抚松火山 玄武岩", "Fusong basalt Jilin"],
    "meishan": ["煤山 D剖面 长兴", "Meishan GSSP Changxing section", "Changhsingian GSSP outcrop"],
    "gssp-huangnitang": ["Huangnitang GSSP Darriwilian section", "黄泥塘 金钉子 剖面"],
    "gssp-jiangshan": ["Jiangshanian GSSP Duibian", "江山碓边 金钉子"],
    "gssp-penglaitan": ["Penglaitan GSSP Wuchiapingian", "来宾蓬莱滩 金钉子"],
    "gssp-pengchong": ["Pengchong GSSP Visean", "柳州碰冲 金钉子"],
    "sheshan": ["佘山西山 火山岩", "Sheshan rhyolite Shanghai", "西佘山 基岩"],
    "luochuan": ["洛川黑木沟 黄土剖面", "Luochuan loess section Heimugou"],
    "zhengzhou-huanghe": ["郑州黄河风景区 邙山", "Zhengzhou Yellow River loess bluff"],
    "baisha-crater": ["海南白沙陨石坑", "Baisha crater Hainan"],
    "dongchuan": ["东川蒋家沟 泥石流", "Jiangjia gully debris flow"],
    "yigong": ["易贡滑坡 堰塞湖", "Yigong landslide Tibet"],
    "qingchuan": ["青川东河口 地震遗址", "Donghekou Qingchuan"],
    "liujiaxia": ["刘家峡恐龙足迹", "Liujiaxia dinosaur track"],
    "guangeogou": ["宕昌官鹅沟 峡谷", "Guangeogou canyon"],
    "yeliguan": ["冶力关 临潭", "Yeliguan Gansu"],
    "hezheng": ["和政古动物化石", "Hezheng fossil"],
    "jimunai": ["吉木乃草原石城", "Jimunai yardang"],
    "qibailong": ["大化七百弄 峰丛", "Qibailong fengcong"],
    "guiping": ["桂平西山 花岗岩", "Guiping Xishan granite"],
    "yizhou-shilin": ["宜州水上石林", "Yizhou stone forest"],
    "mulanshan": ["黄陂木兰山", "Mulanshan Huangpi"],
    "shuanghedong": ["绥阳双河洞", "Shuanghedong cave"],
    "sinan": ["思南石林 乌江", "Sinan stone forest"],
    "miaoling": ["黔东南苗岭 地质", "Miaoling geopark"],
    "wumengshan": ["六盘水乌蒙山 地质", "Wumengshan Liupanshui"],
    "anxiang": ["安县生物礁", "Anxian reef"],
    "shehong": ["射洪硅化木", "Shehong petrified wood"],
    "dabashan": ["通江诺水河 喀斯特", "Nuoshuihe karst"],
    "nangongshan": ["岚皋南宫山", "Nangongshan Langao"],
    "liping": ["汉中黎坪 丹霞", "Liping Danxia Hanzhong"],
    "xinchang": ["新昌硅化木", "Xinchang petrified wood"],
    "cangnan-fanshan": ["苍南矾山 明矾石", "Fanshan alunite Cangnan"],
    "taijidong": ["广德太极洞", "Taiji Cave Guangde"],
    "tianedong": ["宁化天鹅洞", "Tian'e cave Ninghua"],
    "shiniushan": ["德化石牛山 花岗岩", "Shiniushan Dehua"],
    "changle-volcano": ["昌乐火山 玄武岩", "Changle volcano Shandong"],
    "laiyang": ["莱阳金刚口 恐龙", "Laiyang dinosaur Shandong"],
    "yunxian": ["郧阳青龙山恐龙蛋", "Yunxian dinosaur egg"],
    "yuanan": ["远安化石 三叠", "Yuan'an fossil Hubei"],
    "baotianman": ["内乡宝天曼", "Baotianman Nanyang"],
    "guanshan": ["辉县关山 峡谷", "Guanshan Huixian"],
    "shenlingzhai": ["洛宁神灵寨 花岗岩", "Shenlingzhai Luoning"],
    "jingangtai": ["商城金刚台", "Jingangtai Shangcheng"],
    "daweishan": ["浏阳大围山", "Daweishan Liuyang"],
    "fenghuang": ["凤凰南华山 地质", "Fenghuang geopark Hunan"],
    "lingxiaoyan": ["阳春凌霄岩", "Lingxiaoyan Yangchun"],
    "yangshan": ["阳山喀斯特 广东", "Yangshan karst Guangdong"],
    "qinglan": ["饶平青岚 海蚀", "Qinglan Raoping"],
    "enping": ["恩平地热 温泉", "Enping hot spring"],
    "sanduao": ["三都澳 海蚀柱", "Sanduao sea stack"],
    "qiyaoshan": ["石柱七曜山", "Qiyaoshan Shizhu"],
    "gesala": ["盐边格萨拉 石林", "Gesala Yanbian"],
    "luoping": ["罗平生物群 海百合", "Luoping biota"],
    "mianzhu": ["绵竹清平 汉旺 山体", "Mianzhu Qingping"],
}


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


def to_jpeg(data: bytes) -> bytes | None:
    if len(data) < 8000:
        return None
    if data[:2] == b"\xff\xd8":
        return data
    try:
        im = Image.open(io.BytesIO(data))
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=88, optimize=True)
        out = buf.getvalue()
        return out if len(out) > 8000 else None
    except Exception:
        return None


def is_image_raw(data: bytes) -> bool:
    if len(data) < 8000:
        return False
    if data[:2] == b"\xff\xd8":
        return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False


def commons_search(q: str, limit: int = 10) -> list[dict]:
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
        blob = f"{title} {desc}"
        if BAD.search(blob):
            continue
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


def commons_geosearch(lat: float, lon: float, radius: int = 8000) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "list": "geosearch",
            "gscoord": f"{lat}|{lon}",
            "gsradius": radius,
            "gsnamespace": 6,
            "gslimit": 15,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  geosearch fail", type(e).__name__)
        return []
    titles = [x.get("title") for x in (data.get("query") or {}).get("geosearch") or [] if x.get("title")]
    if not titles:
        return []
    info_api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": "|".join(titles[:12]),
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(info_api).decode("utf-8", "replace"))
    except Exception:
        return []
    out = []
    for p in (data.get("query") or {}).get("pages") or {}:
        rec = ((data.get("query") or {}).get("pages") or {}).get(p)
        if not rec:
            continue
    # iterate values
    out = []
    for rec in ((data.get("query") or {}).get("pages") or {}).values():
        title = rec.get("title") or ""
        if BAD.search(title):
            continue
        info = (rec.get("imageinfo") or [{}])[0]
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        meta = info.get("extmetadata") or {}
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        artist = re.sub(r"<[^>]+>", " ", (meta.get("Artist") or {}).get("value") or "")
        artist = re.sub(r"\s+", " ", artist).strip()
        desc = re.sub(r"<[^>]+>", " ", (meta.get("ImageDescription") or {}).get("value") or "")
        desc = re.sub(r"\s+", " ", desc).strip()[:240]
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        out.append(
            {
                "title": title,
                "url": thumb,
                "orig": info.get("url"),
                "license": lic,
                "artist": artist,
                "desc": desc,
                "source": "commons-geo",
                "query": "geosearch",
                "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
            }
        )
    return out


def openverse_search(q: str, limit: int = 6) -> list[dict]:
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
        if any(x in low for x in ("logo", "icon", "sprite", "avatar", "qrcode", "qr_code", "banner_nav", "1x1", "pixel", "share.png", "weixin")):
            continue
        out.append(u)
    return out[:20]


def download(url: str, dest: Path, referer: str | None = None) -> bool:
    try:
        data = get(url, timeout=50, referer=referer)
    except Exception as e:
        print("   dl fail", dest.name, type(e).__name__)
        return False
    jpeg = to_jpeg(data) if is_image_raw(data) or data[:8] == b"\x89PNG\r\n\x1a\n" else None
    if not jpeg:
        jpeg = to_jpeg(data)
    if not jpeg:
        return False
    dest.write_bytes(jpeg)
    return True


def run_slug(slug: str, queries: list[str]) -> list[dict]:
    dest = OUT / slug
    dest.mkdir(parents=True, exist_ok=True)
    seen: set[str] = set()
    kept: list[dict] = []
    site = SITE_BY.get(slug) or {}
    coords = site.get("coordinates") or []
    hits: list[dict] = []
    if len(coords) == 2:
        lon, lat = coords
        try:
            hits.extend(commons_geosearch(float(lat), float(lon)))
        except Exception as e:
            print("  geo", slug, type(e).__name__)
    for q in queries:
        hits.extend(commons_search(q))
        hits.extend(openverse_search(q))
        if len(hits) >= 18:
            break
        time.sleep(0.12)
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
    (dest / "meta.json").write_text(json.dumps(kept, ensure_ascii=False, indent=2))
    print(f"  {slug}: {len(kept)} files")
    return kept


def run_pages() -> dict:
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
        time.sleep(0.15)
    (OUT / "pages.json").write_text(json.dumps(by_slug, ensure_ascii=False, indent=2))
    return by_slug


def main() -> None:
    remaining = [s["id"] for s in SITES if s["id"] not in DONE]
    print("remaining schematic:", len(remaining))
    print("=== scrape official pages ===")
    run_pages()
    order = [s for s in QUERIES if s not in DONE] + [s for s in remaining if s not in QUERIES]
    # cap this run to keep wall time reasonable; all remaining still get a query via QUERIES or name
    print("will search", len(order), "slugs")
    print("=== commons geo + text + openverse ===")
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {}
        for slug in order:
            site = SITE_BY[slug]
            qs = QUERIES.get(slug) or [site["name"], site.get("name_en") or slug]
            futs[ex.submit(run_slug, slug, qs)] = slug
        for fut in as_completed(futs):
            slug = futs[fut]
            try:
                fut.result()
            except Exception as e:
                print(" FAIL", slug, type(e).__name__, e)


if __name__ == "__main__":
    main()
