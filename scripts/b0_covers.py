#!/usr/bin/env python3
"""B0: fetch field stills, replace diagram covers, write covers-qa.csv."""
from __future__ import annotations

import json
import re
import ssl
import urllib.parse
import urllib.request
from collections import Counter
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
ART = ROOT / "artifacts" / "b0"
CREDITS_PATH = ROOT / "data" / "cover_credits.json"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/7.1 (https://mountainstone.grok.me; educational)"
CTX = ssl.create_default_context()
ART.mkdir(parents=True, exist_ok=True)

PDFS = {
    "iugs100": "https://iugs-geoheritage.org/publications-dl/IUGS-FIRST-100-SITES-WEB-BOOK.pdf",
    "wuchiapingian": "https://stratigraphy.org/gssps/files/wuchiapingian.pdf",
    "visean": "https://stratigraphy.org/gssps/files/visean.pdf",
    "jiangshanian": "https://stratigraphy.org/gssps/files/jiangshanian.pdf",
    "changhsingian": "https://stratigraphy.org/gssps/files/changhsiangian.pdf",
    "induan": "https://stratigraphy.org/gssps/files/induan.pdf",
    "jixian2014": "http://www.ysxb.ac.cn/dzdqs-data/aps/2014/10/PDF/20141015.pdf",
    "jixian2014b": "https://cdn.sciengine.com/doi/pdf/1C70485777684BE5BC595F77EF050705",
    "episodes_jiangshan": "https://www.episodes.org/journal/download_pdf.php?doi=10.18814/epiiugs/2012/v35i4/002",
    "episodes_penglaitan": "https://www.episodes.org/journal/download_pdf.php?doi=10.18814/epiiugs/2006/v29i4/003",
    "episodes_pengchong": "https://www.episodes.org/journal/download_pdf.php?doi=10.18814/epiiugs/2003/v26i2/003",
}

IMAGES = {
    "meishan_tw2.jpg": "https://pbs.twimg.com/media/GFIjJaTWoAADxZB?format=jpg&name=orig",
    "meishan_tw2b.jpg": "https://pbs.twimg.com/media/GFIjJaTWoAADxZB.jpg:large",
}


def fetch(url: str, dest: Path, timeout: int = 90) -> bool:
    if dest.exists() and dest.stat().st_size > 8000:
        print("have", dest.name, dest.stat().st_size)
        return True
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Referer": "https://stratigraphy.org/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            data = r.read()
    except Exception as e:
        print("fail", url[:90], e)
        return False
    if len(data) < 2000:
        print("tiny", dest.name, len(data))
        return False
    dest.write_bytes(data)
    print("got", dest.name, len(data), data[:4])
    return True


def extract_pdf(pdf: Path, prefix: str) -> list[Path]:
    import fitz

    out: list[Path] = []
    doc = fitz.open(pdf)
    for i, page in enumerate(doc):
        for j, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            try:
                pix = fitz.Pixmap(doc, xref)
            except Exception:
                continue
            if pix.n >= 5:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            dest = ART / f"{prefix}_p{i}_{j}_{pix.width}x{pix.height}.png"
            if pix.width < 180 or pix.height < 140:
                continue
            pix.save(dest.as_posix())
            out.append(dest)
    print("extract", pdf.name, len(out))
    return out


def esri(lat: float, lon: float, span: float, dest: Path) -> bool:
    bbox = f"{lon-span},{lat-span*0.7},{lon+span},{lat+span*0.7}"
    url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?" + urllib.parse.urlencode(
        {
            "bbox": bbox,
            "bboxSR": "4326",
            "imageSR": "4326",
            "size": "1600,1000",
            "format": "jpg",
            "f": "image",
        }
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/jpeg"})
    try:
        with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
            raw = r.read()
    except Exception as e:
        print("sat fail", dest.name, e)
        return False
    if len(raw) < 8000 or raw[:2] != b"\xff\xd8":
        print("sat not jpeg", dest.name, len(raw))
        return False
    dest.write_bytes(raw)
    print("sat", dest.name, len(raw))
    return True


def commons(query: str, n: int = 12) -> list[dict]:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": n,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
            "format": "json",
        }
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print("commons fail", query, e)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    hits = []
    for p in pages.values():
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        if not mime.startswith("image/") or mime.endswith("svg+xml"):
            continue
        hits.append(
            {
                "title": p.get("title"),
                "url": info.get("thumburl") or info.get("url"),
                "full": info.get("url"),
                "w": info.get("thumbwidth") or info.get("width"),
                "h": info.get("thumbheight") or info.get("height"),
            }
        )
    print("commons", query, len(hits), [h["title"] for h in hits[:6]])
    return hits


def white_stats(im: Image.Image) -> tuple[float, int]:
    small = im.convert("RGB").resize((120, 80))
    px = list(small.getdata())
    n = len(px)
    white = sum(1 for r, g, b in px if r > 235 and g > 235 and b > 235) / n
    colors = len({(r // 16, g // 16, b // 16) for r, g, b in px})
    return white, colors


def looks_diagram(path: Path) -> bool:
    try:
        im = Image.open(path)
    except Exception:
        return False
    w, h = im.size
    white, colors = white_stats(im)
    if white >= 0.22:
        return True
    if colors <= 38 and white >= 0.10:
        return True
    # very tall maps / plates with huge white margins
    if h > w * 1.6 and white >= 0.12:
        return True
    return False


def save_jpg(im: Image.Image, dest: Path, quality: int = 88) -> None:
    rgb = im.convert("RGB")
    rgb.save(dest, "JPEG", quality=quality, optimize=True)


def crop_largest_photoish(path: Path) -> Image.Image | None:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    return im


def main() -> None:
    for key, url in PDFS.items():
        dest = ART / f"{key}.pdf"
        fetch(url, dest)

    for name, url in IMAGES.items():
        fetch(url, ART / name)

    # IUGS page imgs
    html_path = ART / "iugs_meishan.html"
    fetch(
        "https://iugs-geoheritage.org/geoheritage_sites/gssps-of-meishan-the-chronostratigraphic-record-of-the-biggest-phanerozoic-mass-extinction/",
        html_path,
    )
    if html_path.exists():
        html = html_path.read_text(errors="ignore")
        urls = re.findall(r'https?://[^"\']+\.(?:jpg|jpeg|png|webp)', html, re.I)
        urls += re.findall(r'/wp-content/uploads/[^"\']+\.(?:jpg|jpeg|png|webp)', html, re.I)
        print("iugs html urls", urls[:20])
        for i, u in enumerate(urls[:20]):
            if u.startswith("/"):
                u = "https://iugs-geoheritage.org" + u
            fetch(u, ART / f"iugs_html_{i}{Path(u).suffix or '.jpg'}")

    for key in PDFS:
        pdf = ART / f"{key}.pdf"
        if pdf.exists() and pdf.stat().st_size > 20000:
            try:
                extract_pdf(pdf, key)
            except Exception as e:
                print("extract fail", key, e)

    for q in [
        "蓟县 叠层石",
        "Wumishan stromatolite Jixian",
        "Meishan GSSP Changxing",
        "Penglaitan GSSP",
        "Pengchong GSSP Liuzhou",
        "Duibian Jiangshan GSSP",
        "雾迷山组 叠层石",
    ]:
        hits = commons(q)
        for i, h in enumerate(hits[:4]):
            slug = re.sub(r"[^\w.-]+", "_", (h["title"] or "x"))[:80]
            dest = ART / f"commons_{slug}.jpg"
            if h.get("url"):
                fetch(h["url"], dest)

    # satellite fallbacks at the actual section coordinates
    esri(40.0534, 117.3573, 0.04, ART / "sat_jixian.jpg")  # Wumishan sample / 五名山
    esri(31.0819, 119.705, 0.012, ART / "sat_meishan.jpg")
    esri(23.6953, 109.3211, 0.02, ART / "sat_penglaitan.jpg")
    esri(24.433, 109.45, 0.02, ART / "sat_pengchong.jpg")
    esri(28.8163, 118.6148, 0.02, ART / "sat_jiangshan.jpg")

    # inventory extracted
    rows = []
    for p in sorted(ART.iterdir()):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        try:
            im = Image.open(p)
        except Exception:
            continue
        white, colors = white_stats(im)
        rows.append((p.name, im.size, round(white, 3), colors, "D" if looks_diagram(p) else "P"))
    print("\n=== extracted ===")
    for r in rows:
        print(f"{r[4]:1} {r[0]:60} {r[1]} white={r[2]} colors={r[3]}")


if __name__ == "__main__":
    main()
