#!/usr/bin/env python3
"""Last-resort covers: Esri World Imagery of the site's own coordinates. Real photo of that place, not a schematic."""
from __future__ import annotations

import json
import re
import ssl
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
CREDITS = ROOT / "data" / "cover_credits.json"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/7.0 (https://mountainstone.grok.me; educational)"
CTX = ssl.create_default_context()


def have() -> set[str]:
    ok = set()
    for p in OUT.iterdir():
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        if re.fullmatch(r".+-\d+", p.stem):
            continue
        if p.stat().st_size < 25000:
            continue
        ok.add(p.stem)
    return ok


def export(lat: float, lon: float, span: float = 0.06) -> bytes:
    bbox = f"{lon-span},{lat-span*0.7},{lon+span},{lat+span*0.7}"
    url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?" + urllib.parse.urlencode(
        {
            "bbox": bbox,
            "bboxSR": "4326",
            "imageSR": "4326",
            "size": "1280,800",
            "format": "jpg",
            "f": "image",
        }
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/jpeg"})
    with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
        return r.read()


def main() -> None:
    got = have()
    todo = [s for s in SITES if s["id"] not in got]
    print("sat-fill", len(todo))
    credits = json.loads(CREDITS.read_text())
    for s in todo:
        sid = s["id"]
        lon, lat = s["coordinates"]
        span = 0.03 if s.get("types") and "gssp" in s["types"] else 0.07
        try:
            raw = export(lat, lon, span)
        except Exception as e:
            print("fail", sid, e)
            continue
        if len(raw) < 8000 or raw[:2] != b"\xff\xd8":
            print("not jpeg", sid, len(raw), raw[:8])
            continue
        im = Image.open(BytesIO(raw)).convert("RGB")
        buf = BytesIO()
        im.save(buf, "JPEG", quality=86)
        jpg = buf.getvalue()
        (OUT / f"{sid}.jpg").write_bytes(jpg)
        credits[sid] = {
            "credit": "Esri World Imagery · 该点坐标卫星资料照片，非本站踏勘",
            "caption": "资料照片，非本站踏勘",
            "src": f"/covers/{sid}.jpg",
            "gallery": [],
        }
        print("OK", sid, len(jpg))
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
    have2 = have()
    still = [s["id"] for s in SITES if s["id"] not in have2]
    print("still", still)


if __name__ == "__main__":
    main()
