#!/usr/bin/env python3
"""Sequential Wikidata P18 + Commons geosearch. Slow to avoid 429."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
CREDITS = ROOT / "data" / "cover_credits.json"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/6.0 (https://mountainstone.grok.me; educational)"
CTX = ssl.create_default_context()
BAD = re.compile(
    r"(map|location|locator|logo|flag|diagram|schematic|svg|icon|subdivision|"
    r"administrative|位置图|行政区|示意图|地层柱|馆藏|展柜|标本|"
    r"church|basilica|observatory|天文台|教堂|people.?s.?republic)",
    re.I,
)


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return r.read()


def is_map(data: bytes) -> bool:
    try:
        im = Image.open(BytesIO(data))
    except Exception:
        return True
    w, h = im.size
    if w < 300 or h < 200:
        return True
    cols = im.convert("RGB").resize((40, 40)).getcolors(maxcolors=2500)
    return bool(cols and len(cols) < 28)


def to_jpeg(data: bytes) -> bytes | None:
    try:
        im = Image.open(BytesIO(data))
        if im.mode != "RGB":
            im = im.convert("RGB")
        buf = BytesIO()
        im.save(buf, "JPEG", quality=85, optimize=True)
        out = buf.getvalue()
        if len(out) < 10000 or is_map(out):
            return None
        return out
    except Exception:
        return None


def have() -> set[str]:
    ok = set()
    for p in OUT.iterdir():
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        if re.fullmatch(r".+-\d+", p.stem):
            continue
        if p.stat().st_size < 25000:
            continue
        try:
            if is_map(p.read_bytes()):
                continue
        except Exception:
            continue
        ok.add(p.stem)
    return ok


def save(sid: str, data: bytes, credit: str) -> bool:
    jpg = to_jpeg(data)
    if not jpg:
        return False
    (OUT / f"{sid}.jpg").write_bytes(jpg)
    credits = json.loads(CREDITS.read_text())
    credits[sid] = {
        "credit": credit if "资料照片" in credit else credit + " · 资料照片",
        "caption": "资料照片，非本站踏勘",
        "src": f"/covers/{sid}.jpg",
        "gallery": [],
    }
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
    print("OK", sid, len(jpg), credit[:70])
    return True


def short(s: dict) -> str:
    n = s["name"]
    for b in ("联合国教科文组织", "世界地质公园", "国家地质公园", "地质公园"):
        n = n.replace(b, "")
    return n.strip() or s["name"]


def wikidata_p18(title: str) -> tuple[bytes, str] | None:
    api = "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "wbsearchentities",
            "search": title,
            "language": "zh",
            "uselang": "zh",
            "format": "json",
            "type": "item",
            "limit": 5,
        }
    )
    try:
        data = json.loads(get(api).decode())
    except Exception:
        return None
    ids = [x["id"] for x in data.get("search") or [] if x.get("id")]
    if not ids:
        return None
    api2 = "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "wbgetentities", "ids": "|".join(ids[:3]), "props": "claims|labels", "format": "json"}
    )
    try:
        ent = json.loads(get(api2).decode()).get("entities") or {}
    except Exception:
        return None
    for eid, e in ent.items():
        claims = (e.get("claims") or {}).get("P18") or []
        for c in claims:
            fn = ((c.get("mainsnak") or {}).get("datavalue") or {}).get("value")
            if not fn or BAD.search(fn):
                continue
            file_api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
                {
                    "action": "query",
                    "format": "json",
                    "titles": "File:" + fn,
                    "prop": "imageinfo",
                    "iiprop": "url|mime|size",
                    "iiurlwidth": 1600,
                }
            )
            try:
                pages = (json.loads(get(file_api).decode()).get("query") or {}).get("pages") or {}
                info = (next(iter(pages.values())).get("imageinfo") or [{}])[0]
                url = info.get("thumburl") or info.get("url")
                if not url:
                    continue
                raw = get(url)
                label = ((e.get("labels") or {}).get("zh") or {}).get("value") or title
                return raw, f"Wikidata / Wikimedia Commons · {label} · 资料照片"
            except Exception:
                continue
    return None


def geosearch(lat: float, lon: float) -> tuple[bytes, str] | None:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "geosearch",
            "ggscoord": f"{lat}|{lon}",
            "ggsradius": 15000,
            "ggsnamespace": 6,
            "ggslimit": 10,
            "ggsprimary": "all",
            "prop": "imageinfo",
            "iiprop": "url|mime|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        pages = (json.loads(get(api).decode()).get("query") or {}).get("pages") or {}
    except Exception as e:
        print("  geo err", e)
        return None
    for p in pages.values():
        title = (p.get("title") or "").replace("File:", "")
        if BAD.search(title):
            continue
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        url = info.get("thumburl") or info.get("url")
        if not url or ("jpeg" not in mime and "png" not in mime):
            continue
        try:
            raw = get(url)
        except Exception:
            continue
        artist = re.sub(r"<[^>]+>", "", ((info.get("extmetadata") or {}).get("Artist") or {}).get("value") or "")[:60]
        return raw, f"{artist}, Wikimedia Commons · 资料照片" if artist else "Wikimedia Commons · 资料照片"
    return None


def wiki_summary(lang: str, title: str) -> tuple[bytes, str] | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img or BAD.search(img + " " + (data.get("title") or "") + " " + (data.get("description") or "")):
        return None
    try:
        raw = get(img)
    except Exception:
        return None
    return raw, f"维基百科「{data.get('title') or title}」条目配图 · 资料照片"


def main() -> None:
    got = have()
    todo = [s for s in SITES if s["id"] not in got]
    print("todo", len(todo))
    fail = []
    for i, s in enumerate(todo, 1):
        sid = s["id"]
        print(f"[{i}/{len(todo)}] {sid} {s['name']}")
        name = short(s)
        hit = None
        for title in [s["name"], name, s.get("name_en") or ""]:
            if not title:
                continue
            hit = wikidata_p18(title)
            if hit:
                break
            time.sleep(0.4)
            hit = wiki_summary("zh", title)
            if hit:
                break
            time.sleep(0.3)
        if not hit:
            lon, lat = s.get("coordinates") or [None, None]
            if isinstance(lat, (int, float)):
                time.sleep(0.5)
                hit = geosearch(lat, lon)
        if hit and save(sid, hit[0], hit[1]):
            pass
        else:
            fail.append(sid)
            print("  FAIL")
        time.sleep(0.7)
    print("still", fail, "n", len(fail))


if __name__ == "__main__":
    main()
