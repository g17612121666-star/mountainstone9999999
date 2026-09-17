#!/usr/bin/env python3
"""Fill every missing (and a few wrong) site covers from Commons / Wikipedia / named URLs."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
CREDITS = ROOT / "data" / "cover_credits.json"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/4.0 (https://mountainstone.grok.me; educational; cover-fill)"
CTX = ssl.create_default_context()
MIN_BYTES = 8000

BAD_TITLE = re.compile(
    r"(map|location|locator|logo|flag|coat of arms|diagram|schematic|svg|"
    r"icon|signboard|qr.?code|statue|temple|church|basilica|cathedral|"
    r"observatory|天文台|教堂|牌坊|大门|售票|游客中心|museum interior|"
    r"specimen|fossils? in (a )?case|exhibit|stele|inscription|pagoda|"
    r"monastery|buddha|plaza|night market|people.?s.?republic|"
    r"train station|metro|interchange|subdivision|blank map|"
    r"盘山标本|mount pan\b|panshan temple|pansi)",
    re.I,
)
BAD_DESC = re.compile(
    r"(馆藏标本|展柜|室内标本|示意图|地层柱|tourist group|合影)",
)

# slug -> list of (kind, value) kind in {file, url, wiki, search}
EXPLICIT: dict[str, list[tuple[str, str]]] = {
    "sheshan": [
        ("file", "上海 松江 佘山 西佘山 远眺.jpg"),
        ("url", "https://youimg1.c-ctrip.com/target/0104s120008ezq1yqE9B4_D_1180_558.jpg"),
        ("file", "Sheshan_hill_Songjiang_District_Shanghai.jpg"),
        ("wiki", "zh:佘山"),
        ("search", "佘山 松江 山体"),
    ],
    "jixian": [
        ("search", "蓟县国家地质公园"),
        ("search", "蓟县 中上元古界 剖面"),
        ("search", "雾迷山组 叠层石 蓟县"),
        ("search", "Jixian National Geopark"),
        ("search", "Wumishan Formation stromatolite Jixian"),
        ("wiki", "zh:蓟县国家地质公园"),
        ("wiki", "zh:蓟州区"),
        ("search", "蓟州 剖面 白云岩"),
    ],
    "meishan": [
        ("search", "长兴煤山 金钉子"),
        ("search", "Changhsingian GSSP Meishan"),
        ("search", "煤山剖面 长兴"),
        ("search", "Permian-Triassic boundary Meishan Changxing"),
        ("wiki", "zh:长兴阶"),
        ("wiki", "en:Changhsingian"),
        ("wiki", "zh:煤山镇 (长兴县)"),
        ("search", "Meishan D section"),
    ],
    "gssp-huangnitang": [
        ("search", "黄泥塘 金钉子"),
        ("search", "Huangnitang GSSP Darriwilian"),
        ("wiki", "en:Darriwilian"),
        ("wiki", "zh:达瑞威尔阶"),
        ("search", "常山黄泥塘"),
    ],
    "gssp-jiangshan": [
        ("search", "江山 碓边 金钉子"),
        ("search", "Jiangshanian GSSP Duibian"),
        ("wiki", "en:Jiangshanian"),
        ("wiki", "zh:江山阶"),
    ],
    "gssp-penglaitan": [
        ("search", "蓬莱滩 金钉子"),
        ("search", "Penglaitan GSSP"),
        ("wiki", "en:Wuchiapingian"),
        ("search", "来宾 蓬莱滩"),
    ],
    "gssp-pengchong": [
        ("search", "碰冲 金钉子"),
        ("search", "Pengchong GSSP Viséan"),
        ("wiki", "en:Viséan"),
        ("search", "柳州 碰冲"),
    ],
    "xixian-loess": [
        ("search", "隰县 黄土"),
        ("search", "Xixian loess Shanxi"),
        ("wiki", "zh:隰县"),
        ("search", "黄土高原 隰县"),
    ],
    "luochuan": [
        ("search", "洛川黄土国家地质公园"),
        ("search", "Luochuan loess"),
        ("wiki", "zh:洛川黄土国家地质公园"),
        ("wiki", "zh:洛川县"),
        ("search", "洛川 黄土剖面"),
    ],
    "zhengzhou-huanghe": [
        ("search", "郑州黄河国家地质公园"),
        ("search", "花园口 黄河"),
        ("wiki", "zh:郑州黄河国家地质公园"),
        ("wiki", "zh:花园口"),
        ("search", "黄河 地上河 郑州"),
    ],
    "yushe": [
        ("search", "榆社 地质公园"),
        ("search", "榆社化石 剖面"),
        ("wiki", "zh:榆社县"),
        ("search", "Yushe Shanxi landscape"),
    ],
    "shihuadong": [
        ("search", "房山石花洞"),
        ("wiki", "zh:石花洞"),
        ("search", "Shihuadong cave"),
    ],
    "qiyunshan": [
        ("file", "Qiyun Shan panorama.JPG"),
        ("search", "齐云山 丹霞"),
        ("wiki", "zh:齐云山"),
    ],
    "huangsongyu": [
        ("search", "黄松峪"),
        ("wiki", "zh:黄松峪乡"),
        ("search", "平谷 黄松峪 峡谷"),
    ],
    "tianshengqiao": [
        ("search", "阜平天生桥"),
        ("search", "阜平 天生桥 瀑布"),
        ("wiki", "zh:阜平县"),
    ],
    "liujiang": [
        ("search", "秦皇岛柳江"),
        ("search", "柳江盆地 地质"),
        ("wiki", "zh:抚宁区"),
    ],
    "wuda": [
        ("search", "乌达植物庞贝"),
        ("search", "Wuda vegetational Pompeii"),
        ("wiki", "en:Wuda, Inner Mongolia"),
        ("search", "乌达 煤火 化石林"),
    ],
    "baisha-crater": [
        ("search", "白沙陨石坑"),
        ("search", "Baisha crater Hainan"),
        ("wiki", "zh:白沙黎族自治县"),
    ],
    "changle-volcano": [
        ("search", "昌乐火山"),
        ("search", "昌乐 蓝宝石 火山"),
        ("wiki", "zh:昌乐县"),
    ],
    "ningcheng": [
        ("search", "宁城国家地质公园"),
        ("search", "道虎沟 化石"),
        ("wiki", "zh:宁城县"),
    ],
    "xilinhot": [
        ("search", "锡林浩特 火山"),
        ("search", "锡林郭勒 草原 火山"),
        ("wiki", "zh:锡林浩特市"),
    ],
    "youyu": [
        ("search", "右玉火山颈"),
        ("wiki", "zh:右玉县"),
        ("search", "右玉 火山"),
    ],
    "qinggang": [
        ("search", "青冈猛犸象"),
        ("wiki", "zh:青冈县"),
    ],
    "xinchang": [
        ("search", "新昌硅化木"),
        ("wiki", "zh:新昌县"),
        ("search", "新昌 硅化木 公园"),
    ],
    "qitai": [
        ("search", "奇台硅化木"),
        ("wiki", "zh:奇台县"),
        ("search", "Qitai petrified wood"),
    ],
    "shenhuwan": [
        ("search", "深沪湾"),
        ("wiki", "zh:深沪湾"),
        ("search", "晋江 深沪湾 海滩岩"),
    ],
    "cangnan-fanshan": [
        ("search", "苍南矾山"),
        ("wiki", "zh:矾山镇 (苍南县)"),
        ("search", "苍南 明矾石"),
    ],
}

FORCE = {"jixian", "yushe"}


def get(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Referer": "https://commons.wikimedia.org/",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def get_json(url: str) -> dict:
    return json.loads(get(url).decode("utf-8", "replace"))


def is_image(data: bytes) -> str | None:
    if data[:2] == b"\xff\xd8":
        return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def ugly(blob: str) -> bool:
    if BAD_TITLE.search(blob or ""):
        return True
    if BAD_DESC.search(blob or ""):
        return True
    return False


def artist_line(meta: dict) -> str:
    artist = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value") or "")
    artist = " ".join(artist.split())[:80]
    lic = (meta.get("LicenseShortName") or {}).get("value") or ""
    return ", ".join(x for x in (artist, lic, "Wikimedia Commons") if x) or "Wikimedia Commons · 资料照片"


def commons_file(title: str) -> dict | None:
    if not title.lower().startswith("file:"):
        title = "File:" + title
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = get_json(api)
    except Exception as e:
        print("  file fail", title, type(e).__name__, e)
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    page = next(iter(pages.values()))
    if page.get("missing"):
        return None
    info = (page.get("imageinfo") or [{}])[0]
    url = info.get("thumburl") or info.get("url") or ""
    mime = info.get("mime") or ""
    if not url:
        return None
    if "jpeg" not in mime and "png" not in mime and "webp" not in mime:
        return None
    name = (page.get("title") or title).replace("File:", "")
    meta = info.get("extmetadata") or {}
    desc = re.sub(r"<[^>]+>", "", (meta.get("ImageDescription") or {}).get("value") or "")
    if ugly(name + " " + desc):
        return None
    return {"url": url, "credit": artist_line(meta), "title": name, "desc": desc[:160]}


def commons_search(query: str, limit: int = 10) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = get_json(api)
    except Exception as e:
        print("  search fail", query, type(e).__name__)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = (p.get("title") or "").replace("File:", "")
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        url = info.get("thumburl") or info.get("url") or ""
        if not url:
            continue
        if "jpeg" not in mime and "png" not in mime:
            continue
        meta = info.get("extmetadata") or {}
        desc = re.sub(r"<[^>]+>", "", (meta.get("ImageDescription") or {}).get("value") or "")
        if ugly(title + " " + desc + " " + query):
            continue
        out.append({"url": url, "credit": artist_line(meta), "title": title, "desc": desc[:160]})
    return out


def wiki_image(lang: str, title: str) -> dict | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = get_json(url)
    except Exception:
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img:
        return None
    blob = (data.get("title") or "") + " " + (data.get("description") or "") + " " + (data.get("extract") or "")[:120]
    if ugly(blob + " " + img):
        return None
    return {
        "url": img,
        "credit": f"维基百科「{data.get('title') or title}」条目配图 · 资料照片",
        "title": data.get("title") or title,
        "desc": (data.get("description") or "")[:160],
    }


def geosearch(lat: float, lon: float, radius: int = 10000) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "geosearch",
            "ggscoord": f"{lat}|{lon}",
            "ggsradius": radius,
            "ggsnamespace": 6,
            "ggslimit": 12,
            "ggsprimary": "all",
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = get_json(api)
    except Exception:
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = (p.get("title") or "").replace("File:", "")
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        url = info.get("thumburl") or info.get("url") or ""
        if not url or ("jpeg" not in mime and "png" not in mime):
            continue
        meta = info.get("extmetadata") or {}
        desc = re.sub(r"<[^>]+>", "", (meta.get("ImageDescription") or {}).get("value") or "")
        if ugly(title + " " + desc):
            continue
        out.append({"url": url, "credit": artist_line(meta), "title": title, "desc": desc[:160]})
    return out


def save_image(url: str, dest_stem: Path, credit_hint: str) -> tuple[Path, str] | None:
    try:
        data = get(url)
    except Exception as e:
        print("   download fail", type(e).__name__, str(e)[:80], url[:80])
        return None
    kind = is_image(data)
    if not kind or len(data) < MIN_BYTES:
        print("   reject", kind, len(data), url[:80])
        return None
    dest = dest_stem.with_suffix("." + ("jpg" if kind == "jpg" else kind))
    dest.write_bytes(data)
    print("   wrote", dest.name, dest.stat().st_size)
    return dest, credit_hint


def short_name(s: dict) -> str:
    n = s["name"]
    for bit in ("联合国教科文组织", "世界地质公园", "国家地质公园", "地质公园"):
        n = n.replace(bit, "")
    return n.strip() or s["name"]


def candidates(s: dict) -> list[dict]:
    sid = s["id"]
    seen = set()
    out: list[dict] = []

    def add(item: dict | None) -> None:
        if not item or not item.get("url"):
            return
        if item["url"] in seen:
            return
        seen.add(item["url"])
        out.append(item)

    for kind, val in EXPLICIT.get(sid, []):
        if kind == "file":
            add(commons_file(val))
        elif kind == "url":
            add({"url": val, "credit": "公开资料照片", "title": val, "desc": ""})
        elif kind == "wiki":
            lang, title = val.split(":", 1)
            add(wiki_image(lang, title))
        elif kind == "search":
            for it in commons_search(val):
                add(it)
        time.sleep(0.12)

    name = short_name(s)
    en = s.get("name_en") or ""
    queries = [name, s["name"]]
    if en:
        queries += [en, en + " Geopark", en + " National Geopark"]
    lf = (s.get("landform_types") or ["other"])[0]
    extra_q = {
        "karst": "喀斯特 OR 溶洞",
        "volcano": "火山",
        "loess": "黄土",
        "fossil": "剖面",
        "stratigraphy": "剖面 GSSP",
        "danxia": "丹霞",
        "granite_peak": "花岗岩",
        "coast": "海岸",
        "geo_hazard": "滑坡 OR 堰塞",
        "glacier": "冰川",
        "yardang": "雅丹",
    }.get(lf, "")
    queries.append(f"{name} {extra_q}".strip())

    for q in queries:
        add(wiki_image("zh", q))
        add(wiki_image("en", q))
        for it in commons_search(q, limit=6):
            add(it)
        time.sleep(0.08)

    lon, lat = s.get("coordinates") or [None, None]
    if isinstance(lat, (int, float)) and isinstance(lon, (int, float)):
        for it in geosearch(lat, lon):
            add(it)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {}
    existing = {p.stem.split("-")[0] for p in OUT.glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}}
    # stems like sheshan-2 should not mark sheshan as extra-only; keep full stem check separately
    have_cover = set()
    for p in OUT.iterdir():
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        stem = p.stem
        if re.fullmatch(r".+-\d+", stem):
            continue
        have_cover.add(stem)

    missing = []
    for s in SITES:
        sid = s["id"]
        if sid in FORCE or sid not in have_cover:
            missing.append(s)
    print("to fill", len(missing), "of", len(SITES))

    filled = []
    failed = []
    for i, s in enumerate(missing, 1):
        sid = s["id"]
        print(f"[{i}/{len(missing)}] {sid} {s['name']}")
        got = None
        extras: list[dict] = []
        for item in candidates(s):
            dest_stem = OUT / sid
            saved = save_image(item["url"], dest_stem if got is None else OUT / f"{sid}-{len(extras)+2}", item["credit"])
            if not saved:
                continue
            path, _ = saved
            rec = {
                "src": f"/covers/{path.name}",
                "credit": item["credit"] + (" · 资料照片" if "资料照片" not in item["credit"] else ""),
                "caption": "资料照片，非本站踏勘",
                "title": item.get("title") or "",
            }
            if got is None:
                # first successful image is the cover; skip if this is a forced replace of a junk file we already overwrote
                got = rec
            else:
                extras.append(rec)
            if got and len(extras) >= 2:
                break
        if not got:
            failed.append(sid)
            print("  STILL EMPTY")
            continue
        credits[sid] = {
            "credit": got["credit"],
            "caption": got["caption"],
            "src": got["src"],
            "gallery": extras,
        }
        filled.append(sid)
        CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
        time.sleep(0.05)

    print("filled", len(filled), "failed", len(failed))
    print("FAIL", ", ".join(failed))
    # leftover missing after this pass
    have_cover = set()
    for p in OUT.iterdir():
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        if re.fullmatch(r".+-\d+", p.stem):
            continue
        have_cover.add(p.stem)
    still = [s["id"] for s in SITES if s["id"] not in have_cover]
    print("still no file", len(still), still)


if __name__ == "__main__":
    main()
