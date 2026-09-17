#!/usr/bin/env python3
"""Named official stills + Openverse/Wikipedia jpeg covers for every remaining empty site."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
CREDITS = ROOT / "data" / "cover_credits.json"
SITES = {s["id"]: s for s in json.loads((ROOT / "data" / "sites.json").read_text())}
UA = "ShanShiZhiFieldGuide/5.0 (https://mountainstone.grok.me; educational cover fill)"
CTX = ssl.create_default_context()
PROBE = ROOT / "artifacts" / "probe"

# (slug, src_path_or_url, credit, is_local)
NAMED: list[tuple[str, str, str, bool]] = [
    ("sheshan", str(OUT / "sheshan.jpg"), "上海道台, CC BY-SA 4.0, Wikimedia Commons · 西佘山山体远眺 · 资料照片", True),
    ("jixian", str(PROBE / "jixian_dili3.jpg"), "吴军江 / 中国国家地理 · 蓟县叠层石野外露头 · 资料照片", True),
    ("meishan", str(PROBE / "meishan_igg2.jpg"), "中国科学院地质与地球物理研究所 · Geology 2021 图1B 煤山剖面露头 · 资料照片", True),
    ("gssp-huangnitang", str(PROBE / "cas_W020240513313890247578.png"), "《中国科学报》/ 中国科学院 · 达瑞威尔阶黄泥塘金钉子剖面 · 资料照片", True),
]

EXTRA = {
    "jixian": [
        (PROBE / "jixian_dili2.jpg", "吴军江 / 中国国家地理 · 蓟县叠层石纵切面 · 资料照片"),
        (PROBE / "jixian_ys2.jpg", "岩石学报 2014 图2 · 蓟县雾迷山组/铁岭组野外露头 · 资料照片"),
    ],
    "gssp-huangnitang": [
        (PROBE / "cas_W020240513313890116815.png", "《中国科学报》/ 中国科学院 · 黄泥塘金钉子剖面全景 · 资料照片"),
    ],
    "sheshan": [
        (OUT / "sheshan.jpg", "上海道台, CC BY-SA 4.0, Wikimedia Commons · 西佘山 · 资料照片"),
    ],
}

# tiny / locator maps / wrong city from first pass
FORCE_BAD = {
    "xixian-loess",
    "huludao",
    "qinggang",
    "fenghuangshan-hlj",
    "xinglong",
    "tianshengqiao",
    "ningcheng",
}

BAD_NAME = re.compile(
    r"(map|location|locator|logo|flag|diagram|schematic|svg|icon|"
    r"position.?map|blank map|subdivision|administrative|"
    r"位置图|行政区|示意图|地层柱|馆藏|展柜|标本|"
    r"church|basilica|observatory|天文台|教堂|鼓楼|小学|"
    r"people.?s.?republic|coat of arms)",
    re.I,
)


def http_get(url: str, referer: str | None = None, timeout: int = 35) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Referer": referer or "https://mountainstone.grok.me/",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def looks_like_map(data: bytes) -> bool:
    try:
        im = Image.open(BytesIO(data))
    except Exception:
        return True
    w, h = im.size
    if w < 280 or h < 180:
        return True
    if im.format in {"GIF", "SVG"}:
        return True
    rgb = im.convert("RGB").resize((40, 40))
    cols = rgb.getcolors(maxcolors=2000)
    if cols is not None and len(cols) < 28:
        return True
    return False


def to_jpeg(data: bytes) -> bytes | None:
    try:
        im = Image.open(BytesIO(data))
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        buf = BytesIO()
        im.save(buf, "JPEG", quality=86, optimize=True)
        out = buf.getvalue()
        if len(out) < 9000:
            return None
        if looks_like_map(out):
            return None
        return out
    except Exception:
        return None


def write_cover(sid: str, data: bytes, credit: str, extras: list[tuple[bytes, str]] | None = None) -> None:
    jpg = to_jpeg(data)
    if not jpg:
        raise RuntimeError("not a usable photo")
    dest = OUT / f"{sid}.jpg"
    dest.write_bytes(jpg)
    rec: dict = {
        "credit": credit if "资料照片" in credit else credit + " · 资料照片",
        "caption": "资料照片，非本站踏勘",
        "src": f"/covers/{sid}.jpg",
        "gallery": [],
    }
    if extras:
        n = 2
        for blob, cr in extras:
            j = to_jpeg(blob)
            if not j:
                continue
            p = OUT / f"{sid}-{n}.jpg"
            p.write_bytes(j)
            rec["gallery"].append(
                {"src": f"/covers/{sid}-{n}.jpg", "credit": cr, "caption": "资料照片，非本站踏勘"}
            )
            n += 1
            if n > 4:
                break
    credits = json.loads(CREDITS.read_text())
    credits[sid] = rec
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
    print("COVER", sid, dest.stat().st_size, credit[:60])


def short(s: dict) -> str:
    n = s["name"]
    for b in ("联合国教科文组织", "世界地质公园", "国家地质公园", "地质公园"):
        n = n.replace(b, "")
    return n.strip() or s["name"]


def wiki_jpeg(lang: str, title: str) -> tuple[bytes, str] | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = json.loads(http_get(url).decode("utf-8", "replace"))
    except Exception:
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img:
        return None
    blob = (data.get("title") or "") + " " + (data.get("description") or "") + " " + img
    if BAD_NAME.search(blob):
        return None
    try:
        raw = http_get(img, referer=url)
    except Exception:
        return None
    if looks_like_map(raw):
        return None
    return raw, f"维基百科「{data.get('title') or title}」条目配图 · 资料照片"


def openverse(q: str) -> tuple[bytes, str] | None:
    api = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {"q": q, "page_size": 8, "license_type": "all", "category": "photograph"}
    )
    try:
        data = json.loads(http_get(api).decode("utf-8", "replace"))
    except Exception:
        return None
    for it in data.get("results") or []:
        title = (it.get("title") or "") + " " + (it.get("foreign_landing_url") or "")
        if BAD_NAME.search(title):
            continue
        url = it.get("url") or ""
        if not url:
            continue
        try:
            raw = http_get(url, referer=it.get("foreign_landing_url") or url)
        except Exception:
            continue
        if looks_like_map(raw):
            continue
        creator = it.get("creator") or ""
        lic = it.get("license") or ""
        credit = ", ".join(x for x in (creator[:60], lic, "Openverse · 资料照片") if x)
        return raw, credit
    return None


def geosearch_jpeg(lat: float, lon: float) -> tuple[bytes, str] | None:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "geosearch",
            "ggscoord": f"{lat}|{lon}",
            "ggsradius": 12000,
            "ggsnamespace": 6,
            "ggslimit": 8,
            "ggsprimary": "all",
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(http_get(api).decode("utf-8", "replace"))
    except Exception:
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        title = (p.get("title") or "").replace("File:", "")
        if BAD_NAME.search(title):
            continue
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        url = info.get("thumburl") or info.get("url") or ""
        if "jpeg" not in mime and "png" not in mime:
            continue
        if not url:
            continue
        try:
            raw = http_get(url)
        except Exception:
            continue
        if looks_like_map(raw):
            continue
        meta = info.get("extmetadata") or {}
        artist = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value") or "")[:70]
        credit = ", ".join(x for x in (artist, "Wikimedia Commons · 资料照片") if x)
        return raw, credit
    return None


def fill_one(sid: str) -> str:
    s = SITES[sid]
    name = short(s)
    en = s.get("name_en") or ""
    tries: list[tuple[str, str]] = []
    if name:
        tries.append(("wiki-zh", name))
        tries.append(("ov", name + " 中国"))
        tries.append(("ov", name))
    if en:
        tries.append(("wiki-en", en))
        tries.append(("ov", en + " China"))
        tries.append(("ov", en + " geopark"))
    tries.append(("wiki-zh", s["name"]))
    lon, lat = s.get("coordinates") or [None, None]
    for kind, val in tries:
        try:
            hit = None
            if kind == "wiki-zh":
                hit = wiki_jpeg("zh", val)
            elif kind == "wiki-en":
                hit = wiki_jpeg("en", val)
            elif kind == "ov":
                hit = openverse(val)
            if hit:
                write_cover(sid, hit[0], hit[1])
                return "ok"
        except Exception as e:
            print("  try fail", sid, kind, type(e).__name__)
        time.sleep(0.25)
    if isinstance(lat, (int, float)) and isinstance(lon, (int, float)):
        try:
            hit = geosearch_jpeg(lat, lon)
            if hit:
                write_cover(sid, hit[0], hit[1])
                return "ok"
        except Exception as e:
            print("  geo fail", sid, e)
    return "fail"


def seed_named() -> None:
    for sid, src, credit, _local in NAMED:
        path = Path(src)
        if not path.exists():
            print("missing named", sid, src)
            continue
        extras = []
        for p, cr in EXTRA.get(sid, []):
            if p.exists() and p.resolve() != path.resolve():
                extras.append((p.read_bytes(), cr))
        try:
            write_cover(sid, path.read_bytes(), credit, extras)
        except Exception as e:
            print("named fail", sid, e)


def existing_ok() -> set[str]:
    good = set()
    for p in OUT.iterdir():
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        if re.fullmatch(r".+-\d+", p.stem):
            continue
        if p.stem in FORCE_BAD:
            continue
        try:
            if looks_like_map(p.read_bytes()) or p.stat().st_size < 20000:
                print("treat as bad", p.name, p.stat().st_size)
                continue
        except Exception:
            continue
        good.add(p.stem)
    return good


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    seed_named()
    have = existing_ok()
    todo = [s["id"] for s in SITES.values() if s["id"] not in have]
    print("todo", len(todo))
    failed = []
    # serial-ish with a small pool to avoid 429
    with ThreadPoolExecutor(max_workers=3) as ex:
        futs = {ex.submit(fill_one, sid): sid for sid in todo}
        for fut in as_completed(futs):
            sid = futs[fut]
            try:
                st = fut.result()
            except Exception as e:
                st = "fail"
                print("exc", sid, e)
            if st != "ok":
                failed.append(sid)
    have2 = existing_ok()
    still = [s["id"] for s in SITES.values() if s["id"] not in have2]
    print("still", len(still), still)
    print("failed this pass", failed)


if __name__ == "__main__":
    main()
