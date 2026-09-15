#!/usr/bin/env python3
"""Download remaining world-park field photos via Wikipedia / Commons."""
from __future__ import annotations

import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path("/workspace/public/covers")
CREDITS = Path("/workspace/data/cover_credits.json")
UA = "ShanShiZhi/1.0 (geoscience field guide; educational use)"
CTX = ssl.create_default_context()

# title variants: (wiki_lang, title)
QUERIES = {
    "leye-fengshan": [
        ("zh", "大石围天坑"),
        ("en", "Dashiwei Tiankeng"),
        ("zh", "乐业天坑"),
        ("en", "Leye-Fengshan Global Geopark"),
    ],
    "xingwen": [
        ("zh", "兴文石海"),
        ("en", "Xingwen Stone Forest"),
        ("zh", "兴文世界地质公园"),
        ("en", "Xingwen Global Geopark"),
    ],
    "guangwushan": [
        ("zh", "光雾山"),
        ("en", "Guangwu Mountain"),
        ("zh", "诺水河"),
        ("en", "Nuoshui River"),
    ],
    "xingyi": [
        ("zh", "万峰林"),
        ("en", "Wanfenglin"),
        ("zh", "马岭河峡谷"),
        ("en", "Maling River Canyon"),
        ("zh", "兴义市"),
    ],
    "cangshan": [
        ("zh", "苍山"),
        ("en", "Cangshan"),
        ("zh", "点苍山"),
        ("en", "Dali Cangshan"),
    ],
    "cuihuashan": [
        ("zh", "翠华山"),
        ("en", "Cuihua Mountain"),
        ("zh", "终南山"),
        ("en", "Zhongnan Mountains"),
    ],
    "linxia": [
        ("zh", "临夏回族自治州"),
        ("en", "Linxia"),
        ("zh", "和政古动物化石"),
        ("en", "Hezheng fossils"),
        ("zh", "炳灵寺"),
    ],
    "kanbula": [
        ("zh", "坎布拉国家森林公园"),
        ("en", "Kanbula National Forest Park"),
        ("zh", "坎布拉"),
        ("en", "Kanbula"),
    ],
    "kunlunshan": [
        ("zh", "玉珠峰"),
        ("en", "Yuzhu Peak"),
        ("zh", "昆仑山口"),
        ("en", "Kunlun Pass"),
        ("zh", "昆仑山"),
        ("en", "Kunlun Mountains"),
    ],
    "keketuohai": [
        ("zh", "可可托海"),
        ("en", "Koktokay"),
        ("en", "Keketuohai"),
        ("zh", "额尔齐斯河"),
        ("en", "Irtysh River"),
    ],
    "hukou": [
        ("zh", "壶口瀑布"),
        ("en", "Hukou Waterfall"),
    ],
    "sheshan": [
        ("zh", "佘山"),
        ("en", "Sheshan Hill"),
    ],
    "zhoukoudian": [
        ("zh", "周口店北京人遗址"),
        ("en", "Zhoukoudian"),
    ],
    "jixian": [
        ("zh", "盘山"),
        ("en", "Mount Pan"),
        ("zh", "蓟县"),
    ],
    "chengjiang": [
        ("zh", "澄江化石地"),
        ("en", "Chengjiang fossil site"),
        ("zh", "帽天山"),
    ],
    "datong-volcano": [
        ("zh", "大同火山群"),
        ("en", "Datong volcanoes"),
    ],
}

SKIP = (
    "map", "location", "logo", "railway", "station", "flag", "svg", "street",
    "road", "downtown", "icon", "coat of arms", "locator", "diagram",
    "shenzhen", "taiwan", "temple interior",
)

DIRECT = {
    "hukou": "Hukou_Waterfalls,_Shaanxi_28.jpg",
    "leye-fengshan": "Dashiwei.jpg",
    "xingwen": "Xingwen_Karst.jpg",
    "cangshan": "Cangshan_Dali.jpg",
    "cuihuashan": "Cuihuashan.jpg",
    "kanbula": "Kanbula_National_Forest_Park.jpg",
    "keketuohai": "Keketuohai.jpg",
    "zhoukoudian": "Zhoukoudian_Peking_Man_Site.jpg",
    "chengjiang": "Chengjiang_Maotianshan_Shales.jpg",
}


def get(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def commons_thumb(filename: str, width: int = 1600) -> bytes | None:
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(
        filename
    ) + f"?width={width}"
    try:
        data = get(url)
        if data[:3] in (b"\xff\xd8\xff", b"\x89PN") or data[:4] == b"RIFF":
            return data
        if len(data) > 8000 and data[:2] == b"\xff\xd8":
            return data
    except Exception as e:
        print("  commons fail", filename, e)
    return None


def wiki_pageimage(lang: str, title: str) -> tuple[bytes, str] | None:
    api = f"https://{lang}.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "prop": "pageimages|imageinfo",
            "piprop": "thumbnail|original|name",
            "pithumbsize": 1280,
            "pilicense": "any",
            "titles": title,
            "redirects": 1,
        }
    )
    try:
        raw = json.loads(get(api).decode("utf-8"))
    except Exception as e:
        print("  wiki fail", lang, title, e)
        return None
    pages = (raw.get("query") or {}).get("pages") or {}
    for p in pages.values():
        if not isinstance(p, dict):
            continue
        thumb = p.get("thumbnail") or {}
        src = thumb.get("source") or (p.get("original") or {}).get("source")
        name = (p.get("pageimage") or "") + " " + (src or "")
        low = name.lower()
        if any(s in low for s in SKIP):
            continue
        if not src or src.lower().endswith(".svg"):
            continue
        try:
            data = get(src)
        except Exception as e:
            print("  img fail", src, e)
            continue
        if len(data) < 8000:
            continue
        credit = f"维基百科「{title}」条目配图"
        return data, credit
    return None


def commons_search(q: str) -> tuple[bytes, str] | None:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,
            "gsrlimit": 8,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|mime",
            "iiurlwidth": 1280,
        }
    )
    try:
        raw = json.loads(get(api).decode("utf-8"))
    except Exception as e:
        print("  csearch fail", q, e)
        return None
    pages = (raw.get("query") or {}).get("pages") or {}
    for p in pages.values():
        if not isinstance(p, dict):
            continue
        title = p.get("title") or ""
        low = title.lower()
        if any(s in low for s in SKIP):
            continue
        infos = p.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        mime = (info.get("mime") or "")
        if "jpeg" not in mime and "png" not in mime and "webp" not in mime:
            continue
        src = info.get("thumburl") or info.get("url")
        if not src:
            continue
        try:
            data = get(src)
        except Exception:
            continue
        if len(data) < 8000:
            continue
        meta = info.get("extmetadata") or {}
        artist = ((meta.get("Artist") or {}).get("value") or "Wikimedia Commons")
        # strip tags roughly
        while "<" in artist:
            a = artist.find("<")
            b = artist.find(">", a)
            if b < 0:
                break
            artist = artist[:a] + artist[b + 1 :]
        artist = " ".join(artist.split())[:80]
        lic = ((meta.get("LicenseShortName") or {}).get("value") or "").strip()
        credit = f"{artist}{(' · ' + lic) if lic else ''}, Wikimedia Commons"
        return data, credit
    return None


def load_credits() -> dict:
    if CREDITS.exists():
        return json.loads(CREDITS.read_text())
    return {}


def save_credits(d: dict) -> None:
    CREDITS.write_text(json.dumps(d, ensure_ascii=False, indent=2))


def main() -> None:
    credits = load_credits()
    missing = [k for k in QUERIES if not (OUT / f"{k}.jpg").exists()]
    print("missing", missing)
    for sid in missing:
        dest = OUT / f"{sid}.jpg"
        got = None
        credit = ""
        if sid in DIRECT:
            data = commons_thumb(DIRECT[sid])
            if data:
                got, credit = data, f"Wikimedia Commons · {DIRECT[sid]}"
                print("  direct", sid)
        if not got:
            for lang, title in QUERIES[sid]:
                time.sleep(0.9)
                r = wiki_pageimage(lang, title)
                if r:
                    got, credit = r
                    print("  wiki", sid, lang, title)
                    break
        if not got:
            for _, title in QUERIES[sid][:3]:
                time.sleep(0.9)
                r = commons_search(title)
                if r:
                    got, credit = r
                    print("  csearch", sid, title)
                    break
        if got:
            dest.write_bytes(got)
            credits[sid] = {
                "credit": credit,
                "caption": "",
                "src": f"/covers/{sid}.jpg",
            }
            print("saved", sid, dest.stat().st_size)
        else:
            print("FAIL", sid)
    save_credits(credits)
    print("jpg count", len(list(OUT.glob("*.jpg"))))


if __name__ == "__main__":
    main()
