#!/usr/bin/env python3
"""Round-5: Commons + Openverse + official-page scrape for remaining schematic parks."""
from __future__ import annotations

import io
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "round5"
OUT.mkdir(parents=True, exist_ok=True)
UA = "ShanShiZhiFieldGuide/5.0 (https://shanshizhi.grok.me; educational CC-aware fetch)"
CTX = ssl.create_default_context()

DONE = json.loads((ROOT / "data" / "cover_credits.json").read_text())
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
EMPTY = [s for s in SITES if s["id"] not in DONE or not (ROOT / "public" / "covers" / f"{s['id']}.jpg").exists()]

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
    r"glass bridge|玻璃桥|玻璃栈道|"
    r"View of Earth|ISS0|from the ISS|"
    r"高椅岭|Gaoyiling|"
    r"凤凰古城|"
    r"FAST|天眼|"
    r"重兴塔|"
    r"皇都侗寨)",
    re.I,
)

QUERIES: dict[str, list[str]] = {
    "yichun-forest": ["汤旺河石林", "Tangwanghe granite", "伊春 花岗岩石林", "Tangwanghe stone forest"],
    "tianshengqiao": ["阜平天生桥", "Fuping natural bridge", "阜平 瀑布 天生桥"],
    "feitianshan": ["郴州飞天山 丹霞", "Feitianshan Danxia", "飞天山 天生桥 郴州"],
    "huoshizhai": ["西吉火石寨", "Huoshizhai Danxia", "火石寨 擎天柱"],
    "getuhe": ["格凸河", "Getu River karst", "紫云 大穿洞", "Getu natural bridge"],
    "hongshilin": ["古丈红石林", "Guzhang red stone forest", "红石林 湘西"],
    "qitai": ["奇台硅化木", "Qitai petrified wood", "硅化木 准噶尔"],
    "jingyu": ["靖宇火山", "Jingyu volcano", "靖宇 火山锥"],
    "luochuan": ["洛川黄土", "Luochuan loess", "黑木沟 黄土剖面"],
    "huangsongyu": ["黄松峪", "天云山 平谷", "Huangsongyu Pinggu", "石林峡 平谷"],
    "siping": ["四平山门", "Siping volcanic neck", "山门 火山颈"],
    "wulianshan": ["五莲山", "Wulianshan granite", "九仙山 五莲"],
    "yishan": ["邹城峄山", "Mount Yi Zoucheng", "峄山 花岗岩"],
    "pingtang": ["平塘掌布", "Pingtang tiankeng", "平塘 藏字石"],
    "fengshan": ["凤山三门海", "Fengshan Sanmenhai", "三门海 天窗"],
    "xiaonanhai": ["黔江小南海", "Qianjiang Xiaonanhai", "小南海 堰塞湖 重庆"],
    "shuanghedong": ["绥阳双河洞", "Shuanghedong cave", "双河洞 贵州"],
    "jinsixia": ["商南金丝峡", "Jinsixia Shangnan"],
    "wanfoshan": ["通道万佛山", "Wanfoshan Danxia Tongdao"],
    "shiniuzhai": ["平江石牛寨", "Shiniuzhai Danxia"],
    "shenhuwan": ["深沪湾 海滩岩", "Shenhu Bay beachrock", "晋江 古森林"],
    "xinchang": ["新昌硅化木", "Xinchang petrified wood"],
    "meishan": ["Meishan GSSP", "Changhsingian GSSP", "煤山 D剖面", "Meishan section Changxing"],
    "gssp-huangnitang": ["Huangnitang GSSP", "Darriwilian GSSP Changshan", "黄泥塘 金钉子"],
    "gssp-jiangshan": ["Jiangshanian GSSP", "Duibian GSSP", "江山碓边"],
    "gssp-penglaitan": ["Penglaitan GSSP", "Wuchiapingian GSSP", "蓬莱滩 金钉子"],
    "gssp-pengchong": ["Pengchong GSSP", "Visean GSSP Liuzhou", "碰冲 金钉子"],
    "sheshan": ["佘山 上海 火山岩", "Sheshan Shanghai hill", "西佘山 基岩"],
    "youyu": ["右玉火山颈", "Youyu volcanic neck"],
    "xixian-loess": ["隰县黄土", "Xixian loess"],
    "lincheng": ["崆山白云洞", "Kongshan Lincheng"],
    "liujiang": ["柳江盆地 秦皇岛", "Liujiang basin Qinhuangdao"],
    "xinglong": ["兴隆溶洞 河北", "Xinglong cave Hebei"],
    "qianan": ["迁安 红峪口", "Qian'an granite Hebei"],
    "ningcheng": ["宁城道虎沟", "Daohugou Ningcheng"],
    "xilinhot": ["阿巴嘎火山", "Abaga volcano", "锡林浩特 火山"],
    "qiguoshan": ["七锅山 火山", "Qiguoshan volcano"],
    "wuda": ["乌达植物庞贝", "Wuda Pompeii plant"],
    "huludao": ["龙潭大峡谷 葫芦岛", "Longtan canyon Huludao"],
    "fusong": ["抚松火山", "Fusong volcano Jilin"],
    "zhengzhou-huanghe": ["郑州黄河 邙山", "Zhengzhou Yellow River scenic"],
    "baisha-crater": ["白沙陨石坑", "Baisha crater Hainan"],
    "dongchuan": ["蒋家沟 泥石流", "Jiangjia gully"],
    "yigong": ["易贡滑坡", "Yigong landslide"],
    "qingchuan": ["青川东河口", "Donghekou Qingchuan"],
    "liujiaxia": ["刘家峡恐龙足迹", "Liujiaxia dinosaur track"],
    "guangeogou": ["官鹅沟", "Guangeogou canyon"],
    "yeliguan": ["冶力关", "Yeliguan Gansu"],
    "hezheng": ["和政化石", "Hezheng fossil"],
    "jimunai": ["吉木乃石城", "Jimunai stone city"],
    "qibailong": ["七百弄", "Qibailong fengcong"],
    "guiping": ["桂平西山", "Guiping Xishan"],
    "yizhou-shilin": ["宜州水上石林", "Yizhou stone forest"],
    "mulanshan": ["木兰山 黄陂", "Mulanshan Wuhan"],
    "sinan": ["思南石林", "Sinan stone forest"],
    "miaoling": ["苗岭 地质公园", "Miaoling geopark"],
    "wumengshan": ["乌蒙山 六盘水", "Wumengshan Liupanshui"],
    "anxiang": ["安县生物礁", "Anxian reef"],
    "shehong": ["射洪硅化木", "Shehong petrified wood"],
    "dabashan": ["诺水河", "Nuoshuihe karst"],
    "nangongshan": ["南宫山 岚皋", "Nangongshan"],
    "liping": ["黎坪 丹霞", "Liping Danxia Hanzhong"],
    "cangnan-fanshan": ["苍南矾山", "Fanshan alunite"],
    "taijidong": ["太极洞 广德", "Taiji Cave Guangde"],
    "tianedong": ["天鹅洞 宁化", "Tian'e cave"],
    "shiniushan": ["石牛山 德化", "Shiniushan Dehua"],
    "changle-volcano": ["昌乐火山", "Changle volcano"],
    "laiyang": ["莱阳恐龙", "Laiyang dinosaur"],
    "yunxian": ["郧县恐龙蛋", "Yunxian dinosaur egg"],
    "yuanan": ["远安化石", "Yuan'an fossil"],
    "baotianman": ["宝天曼", "Baotianman"],
    "guanshan": ["关山 辉县", "Guanshan Huixian"],
    "shenlingzhai": ["神灵寨", "Shenlingzhai"],
    "jingangtai": ["金刚台", "Jingangtai"],
    "daweishan": ["大围山 浏阳", "Daweishan Liuyang"],
    "fenghuang": ["凤凰南华山", "Fenghuang geopark Hunan"],
    "lingxiaoyan": ["凌霄岩", "Lingxiaoyan"],
    "yangshan": ["阳山喀斯特", "Yangshan karst"],
    "qinglan": ["青岚 饶平", "Qinglan Raoping"],
    "enping": ["恩平地热", "Enping hot spring"],
    "sanduao": ["三都澳", "Sanduao"],
    "qiyaoshan": ["七曜山", "Qiyaoshan"],
    "gesala": ["格萨拉", "Gesala Yanbian"],
    "luoping": ["罗平生物群", "Luoping biota"],
    "mianzhu": ["绵竹清平", "Mianzhu Qingping"],
    "fengyangshan": ["凤阳山 安徽", "Fengyangshan Anhui"],
    "marenshan": ["马仁山", "Marenshan"],
    "shitai": ["石台溶洞", "Shitai cave"],
    "baiyunshan-fj": ["白云山 福建 地质", "Baiyunshan Fujian geopark"],
    "lingtongshan": ["灵通山", "Lingtongshan"],
    "fozishan": ["佛子山 政和", "Fozishan"],
    "qingliu": ["清流温泉 福建", "Qingliu hot spring"],
    "sanming-jiaoye": ["三明郊野", "Sanming suburban geopark"],
    "guantaishan": ["官台山", "Guantaishan"],
    "shicheng": ["石城 江西 地质", "Shicheng Jiangxi"],
    "yiyuan": ["沂源鲁山", "Yiyuan Lushan"],
    "daimeishan": ["黛眉山", "Daimeishan"],
    "xiaoqinling": ["小秦岭", "Xiaoqinling"],
    "ruyang": ["汝阳恐龙", "Ruyang dinosaur"],
    "wufeng": ["五峰 地质公园", "Wufeng Hubei geopark"],
    "jiubujiang": ["酒埠江", "Jiubujiang"],
    "wulongshan": ["乌龙山 湖南", "Wulongshan Hunan"],
    "meijiang": ["湄江 丹霞", "Meijiang Danxia"],
    "xuefenghu": ["雪峰湖", "Xuefenghu"],
    "baishuidong": ["白水洞 新邵", "Baishuidong"],
    "fengkai": ["封开大斑石", "Fengkai granite"],
    "luocheng": ["罗城 地质", "Luocheng geopark"],
    "donglan": ["东兰 地质", "Donglan geopark"],
    "wuhuangshan": ["五皇山", "Wuhuangshan"],
    "qijiang": ["綦江老瀛山", "Laoyingshan Qijiang"],
    "jiangyou": ["江油窦圌山", "Doutuanshan Jiangyou"],
    "guanling": ["关岭化石", "Guanling fossil"],
    "shankou": ["山口 地质公园 黑龙江", "Shankou Heilongjiang"],
    "qinggang": ["青冈猛犸", "Qinggang mammoth"],
    "jiguanshan": ["鸡冠山 黑龙江", "Jiguanshan Heilongjiang"],
    "fenghuangshan-hlj": ["凤凰山 黑龙江 地质", "Fenghuangshan Heilongjiang"],
}

PAGES = [
    ("yichun-forest", "http://hlj.people.com.cn/n2/2020/0406/c396544-33929757.html", "4-people-hlj"),
    ("yichun-forest", "http://hlj.people.com.cn/n2/2025/0816/c220024-41324343.html", "4-people-hlj2"),
    ("yichun-forest", "http://society.people.com.cn/n1/2018/0922/c1008-30308786.html", "4-people-society"),
    ("huoshizhai", "http://nx.people.com.cn/n2/2023/0204/c192493-40288883.html", "4-people-nx"),
    ("huoshizhai", "https://www.nx.gov.cn/ssjn/esyj/202303/t20230330_4015332.html", "4-nx-gov"),
    ("huoshizhai", "https://whhlyt.nx.gov.cn/jqjd/gys_66590/hszgjdzgy/", "4-nx-whhlyt"),
    ("getuhe", "http://gz.people.com.cn/n2/2020/0612/c389359-34083144.html", "4-people-gz"),
    ("getuhe", "http://gz.people.com.cn/n2/2026/0324/c389359-41532658.html", "4-people-gz2"),
    ("hongshilin", "http://whhlyt.hunan.gov.cn/whhlyt/news/tpxw/201909/t20190910_5481414.html", "4-hunan-whhlyt"),
    ("qitai", "https://lcj.xinjiang.gov.cn/lcj/c112462/202306/d323225f16134ed9af745c00261defe3.shtml", "4-xj-lcj"),
    ("tianshengqiao", "http://he.people.com.cn/n2/2025/1106/c192235-41403822.html", "4-people-he"),
    ("fengshan", "http://gx.people.com.cn/n2/2021/0510/c179430-34716900.html", "4-people-gx"),
    ("xiaonanhai", "http://cq.people.com.cn/n2/2021/0728/c367640-34839999.html", "4-people-cq"),
    ("jinsixia", "http://sn.people.com.cn/n2/2021/1012/c378288-34948411.html", "4-people-sn"),
    ("wanfoshan", "http://hn.people.com.cn/n2/2021/0408/c356887-34664218.html", "4-people-hn"),
    ("shiniuzhai", "http://hn.people.com.cn/n2/2020/0916/c356887-34308766.html", "4-people-hn2"),
    ("siping", "http://jl.people.com.cn/n2/2021/0518/c349771-34728000.html", "4-people-jl"),
    ("wulianshan", "http://sd.people.com.cn/n2/2021/0428/c166192-34700218.html", "4-people-sd"),
    ("yishan", "http://sd.people.com.cn/n2/2020/0909/c166192-34283000.html", "4-people-sd2"),
    ("daimeishan", "http://ha.people.com.cn/n2/2021/0512/c351638-34721000.html", "4-people-ha"),
    ("guanling", "http://gz.people.com.cn/n2/2021/0422/c194827-34689000.html", "4-people-gz3"),
    ("luochuan", "http://sn.people.com.cn/n2/2020/0915/c378288-34306000.html", "4-people-sn2"),
    ("zhengzhou-huanghe", "http://ha.people.com.cn/n2/2021/0708/c192235-34789000.html", "4-people-ha2"),
    ("xilinhot", "http://nm.people.com.cn/n2/2021/0812/c196667-34861200.html", "4-people-nm"),
    ("qijiang", "http://cq.people.com.cn/n2/2021/0518/c365404-34729000.html", "4-people-cq2"),
]


def get(url: str, timeout: int = 35, referer: str | None = None) -> bytes:
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
    if len(data) < 12000:
        return None
    if data[:2] == b"\xff\xd8":
        return data
    try:
        im = Image.open(io.BytesIO(data))
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        w, h = im.size
        if min(w, h) < 400:
            return None
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=88, optimize=True)
        out = buf.getvalue()
        return out if len(out) > 12000 else None
    except Exception:
        return None


def commons_search(q: str, limit: int = 8) -> list[dict]:
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
        if size and size < 25000:
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
        if re.search(r"ISS|View of Earth|from space", blob, re.I):
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


def openverse_search(q: str, limit: int = 6) -> list[dict]:
    api = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {"q": q, "license_type": "all", "page_size": limit}
    )
    try:
        data = json.loads(get(api, timeout=20).decode("utf-8", "replace"))
    except Exception as e:
        print("  openverse fail", q, type(e).__name__)
        return []
    out = []
    for it in data.get("results") or []:
        title = it.get("title") or ""
        desc = (it.get("description") or "")[:200]
        if BAD.search(f"{title} {desc}"):
            continue
        url = it.get("url")
        if not url:
            continue
        out.append(
            {
                "title": title,
                "url": url,
                "orig": url,
                "license": it.get("license") or "",
                "artist": it.get("creator") or "",
                "desc": desc,
                "source": "openverse",
                "query": q,
                "page": it.get("foreign_landing_url") or url,
            }
        )
    return out


IMG_RE = re.compile(
    r'(?:src|data-src|data-original)=["\']([^"\']+\.(?:jpg|jpeg|png|webp)(?:\?[^"\']*)?)["\']',
    re.I,
)
PEOPLE_NMEDIA = re.compile(r"https?://[^\"'\s]+NMediaFile[^\"'\s]+\.(?:jpg|jpeg|png|webp)", re.I)
PEOPLE_LOCAL = re.compile(r"(?:LOCAL|MAIN)\d[^\"'\s]+\.(?:jpg|jpeg|png)", re.I)


def scrape_page(url: str) -> list[str]:
    try:
        html = get(url, timeout=25).decode("utf-8", "replace")
    except Exception as e:
        print("  page fail", url[:70], type(e).__name__)
        return []
    found = set()
    for m in IMG_RE.finditer(html):
        u = m.group(1)
        if u.startswith("//"):
            u = "https:" + u
        elif u.startswith("/"):
            parsed = urllib.parse.urlparse(url)
            u = f"{parsed.scheme}://{parsed.netloc}{u}"
        found.add(u)
    for m in PEOPLE_NMEDIA.finditer(html):
        found.add(m.group(0))
    # people.cn often uses relative NMediaFile
    for m in re.finditer(r"/NMediaFile/[^\"'\s]+\.(?:jpe?g|png|webp)", html, re.I):
        parsed = urllib.parse.urlparse(url)
        found.add(f"{parsed.scheme}://{parsed.netloc}{m.group(0)}")
    out = []
    for u in found:
        low = u.lower()
        if any(x in low for x in ("logo", "icon", "avatar", "qrcode", "button", "sprite", "1x1", "pixel", "share")):
            continue
        if "people.com.cn" in low and ("100x" in low or "w100" in low or "w200" in low):
            continue
        out.append(u)
    return out


def save_candidate(slug: str, i: int, rec: dict) -> Path | None:
    dest_dir = OUT / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{i:02d}.jpg"
    meta = dest_dir / f"{i:02d}.json"
    try:
        referer = rec.get("page") if rec.get("source") == "commons" else rec.get("page")
        if rec.get("source") == "commons":
            referer = "https://commons.wikimedia.org/"
        data = get(rec["url"], referer=referer)
        jpeg = to_jpeg(data)
        if not jpeg:
            return None
        dest.write_bytes(jpeg)
        rec2 = dict(rec)
        rec2["bytes"] = len(jpeg)
        meta.write_text(json.dumps(rec2, ensure_ascii=False, indent=2))
        return dest
    except Exception as e:
        print("    dl fail", slug, type(e).__name__, rec.get("url", "")[:80])
        return None


def main():
    # 1) official pages
    pages = []
    for item in PAGES:
        if isinstance(item, str):
            continue
        pages.append(item)
    page_hits = {}
    for slug, url, tag in pages:
        print("PAGE", slug, tag)
        imgs = scrape_page(url)
        page_hits.setdefault(slug, []).append({"url": url, "tag": tag, "imgs": imgs[:20]})
        for i, img in enumerate(imgs[:8]):
            rec = {
                "title": tag,
                "url": img,
                "orig": img,
                "license": "政府/园区官方图，已署名并链回",
                "artist": tag,
                "desc": "",
                "source": "official",
                "query": tag,
                "page": url,
            }
            p = save_candidate(slug, 100 + i, rec)
            if p:
                print("  saved", p.name, img[:90])
        time.sleep(0.4)
    (OUT / "pages.json").write_text(json.dumps(page_hits, ensure_ascii=False, indent=2))

    # 2) commons + openverse for remaining empty
    summary = {}
    for s in EMPTY:
        slug = s["id"]
        qs = QUERIES.get(slug) or [s["name"], s.get("name_en") or ""]
        qs = [q for q in qs if q]
        cands = []
        for q in qs[:3]:
            print("COMMONS", slug, q)
            cands.extend(commons_search(q, 6))
            time.sleep(0.25)
        # one openverse
        q0 = qs[0]
        print("OPENVERSE", slug, q0)
        cands.extend(openverse_search(q0, 5))
        time.sleep(0.2)
        # dedupe by title
        seen = set()
        uniq = []
        for c in cands:
            k = c.get("title") or c.get("url")
            if k in seen:
                continue
            seen.add(k)
            uniq.append(c)
        saved = []
        for i, rec in enumerate(uniq[:8]):
            p = save_candidate(slug, i, rec)
            if p:
                saved.append({"path": str(p), **{k: rec.get(k) for k in ("title", "license", "artist", "page", "source", "desc")}})
                print("  saved", p.name, rec.get("title", "")[:70])
        summary[slug] = {"n": len(saved), "items": saved}
        (OUT / slug / "index.json").write_text(json.dumps(saved, ensure_ascii=False, indent=2))
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    print("DONE slugs", len(summary), "with files", sum(1 for v in summary.values() if v["n"]))


if __name__ == "__main__":
    main()
