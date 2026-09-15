#!/usr/bin/env python3
"""Commons geosearch around each schematic park's coordinates."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "geo_covers"
UA = "ShanShiZhiFieldGuide/2.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()

inv = ROOT.joinpath("data/inventory.md").read_text()
schematic = set()
for line in inv.splitlines():
    if line.startswith("|") and "示意柱" in line:
        schematic.add(line.split("|")[1].strip())

sites = {s["id"]: s for s in json.loads(ROOT.joinpath("data/sites.json").read_text())}
# already accepted this round
schematic -= {"luhe", "zhangshiyan"}

BAD = re.compile(
    r"(map|logo|flag|coat of arms|location|locator|diagram|svg|"
    r"museum|游客|售票|大门|牌坊|塑像|statue|tomb|grave|"
    r"tunnel|隧道|火车站|court|法庭|people.?s.?republic|"
    r"icon|signboard)",
    re.I,
)


def get(url: str, timeout: int = 40) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def geosearch(lat: float, lon: float, radius: int = 8000, limit: int = 12) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "geosearch",
            "ggscoord": f"{lat}|{lon}",
            "ggsradius": radius,
            "ggsnamespace": 6,
            "ggslimit": limit,
            "ggsprimary": "all",
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  geo fail", type(e).__name__, e)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = p.get("title") or ""
        if BAD.search(title):
            continue
        info = (p.get("imageinfo") or [{}])[0]
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png"):
            continue
        meta = info.get("extmetadata") or {}
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        artist = re.sub(r"<[^>]+>", " ", (meta.get("Artist") or {}).get("value") or "")
        artist = re.sub(r"\s+", " ", artist).strip()
        desc = re.sub(r"<[^>]+>", " ", (meta.get("ImageDescription") or {}).get("value") or "")
        desc = re.sub(r"\s+", " ", desc).strip()[:180]
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        out.append(
            {
                "title": title,
                "url": thumb,
                "license": lic,
                "artist": artist,
                "desc": desc,
            }
        )
    return out


def download(url: str, dest: Path) -> bool:
    try:
        data = get(url, timeout=50)
    except Exception:
        return False
    if len(data) < 12000:
        return False
    if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n":
        return False
    dest.write_bytes(data)
    return True


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {}
    for slug in sorted(schematic):
        dest = OUT / slug
        meta_p = dest / "meta.json"
        if meta_p.exists():
            try:
                old = json.loads(meta_p.read_text())
                if old:
                    summary[slug] = len(old)
                    continue
            except Exception:
                pass
        s = sites.get(slug) or {}
        coords = s.get("coordinates") or []
        if len(coords) < 2:
            print(" no coords", slug)
            continue
        lon, lat = float(coords[0]), float(coords[1])
        print("==", slug, lat, lon)
        dest.mkdir(parents=True, exist_ok=True)
        hits = geosearch(lat, lon, radius=10000)
        if not hits:
            hits = geosearch(lat, lon, radius=20000, limit=15)
        kept = []
        for h in hits:
            n = len(kept)
            path = dest / f"{n:02d}.jpg"
            if download(h["url"], path):
                h["file"] = str(path)
                h["bytes"] = path.stat().st_size
                kept.append(h)
                print(f"   + {path.name} {h['title'][:70]}")
            if len(kept) >= 4:
                break
        meta_p.write_text(json.dumps(kept, ensure_ascii=False, indent=2))
        summary[slug] = len(kept)
        time.sleep(0.12)
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    print("DONE with-images", sum(1 for v in summary.values() if v), "/", len(summary))


if __name__ == "__main__":
    main()
