#!/usr/bin/env python3
"""Landform sketch covers + favicon.ico. Shown as 示意, not field photos."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COVERS = ROOT / "public" / "covers"
COVERS.mkdir(parents=True, exist_ok=True)

PALETTE = {
    "karst": ("#cfc6b6", "#8a9a90", "#5c6b62"),
    "danxia": ("#c4a07a", "#a05a42", "#6b3b32"),
    "zhangjiajie_sandstone": ("#d4c4a4", "#b08968", "#6b5344"),
    "granite_peak": ("#d2cdc4", "#9a958c", "#5c574e"),
    "volcano": ("#4a4540", "#6b5344", "#7a3b32"),
    "yardang": ("#d8c49a", "#b08958", "#8a6a40"),
    "glacier": ("#d7ddd8", "#8aa0a8", "#4a5c6a"),
    "loess": ("#d9c48c", "#c4a05a", "#8a7040"),
    "coast": ("#c8d0d4", "#6a8a92", "#3d5c52"),
    "fossil": ("#cfc6b0", "#8a7a64", "#5c4a38"),
    "stratigraphy": ("#d4cbb8", "#8a7a64", "#3d5c52"),
    "geo_hazard": ("#c8c0b4", "#7a6e5c", "#5c4a38"),
    "other": ("#d4cbb8", "#9a8b78", "#6b5344"),
}

LABEL = {
    "karst": "喀斯特示意",
    "danxia": "丹霞示意",
    "zhangjiajie_sandstone": "砂岩峰林示意",
    "granite_peak": "花岗岩峰林示意",
    "volcano": "火山示意",
    "yardang": "雅丹示意",
    "glacier": "冰川示意",
    "loess": "黄土示意",
    "coast": "海岸岛屿示意",
    "fossil": "化石层示意",
    "stratigraphy": "地层柱示意",
    "geo_hazard": "地质灾害遗迹示意",
    "other": "地貌示意",
}


def peaks(c: str, b: str) -> str:
    return f"""
  <rect x="48" y="36" width="28" height="82" fill="{c}"/>
  <rect x="92" y="24" width="22" height="94" fill="{b}"/>
  <rect x="128" y="48" width="34" height="70" fill="{c}"/>
  <rect x="176" y="20" width="18" height="98" fill="{b}"/>
  <rect x="210" y="40" width="40" height="78" fill="{c}"/>
  <rect x="268" y="28" width="24" height="90" fill="{b}"/>
  <rect x="310" y="52" width="36" height="66" fill="{c}"/>
"""


def extra(kind: str, a: str, b: str, c: str) -> str:
    if kind in ("zhangjiajie_sandstone", "granite_peak", "danxia"):
        return peaks(c, b)
    if kind == "volcano":
        return f"""
  <polygon points="70,118 140,38 210,118" fill="{c}"/>
  <polygon points="180,118 250,52 320,118" fill="{b}"/>
  <ellipse cx="250" cy="52" rx="18" ry="7" fill="#2c261c" opacity="0.45"/>
"""
    if kind == "karst":
        return f"""
  <ellipse cx="90" cy="118" rx="40" ry="70" fill="{c}"/>
  <ellipse cx="170" cy="118" rx="28" ry="86" fill="{b}"/>
  <ellipse cx="240" cy="118" rx="36" ry="64" fill="{c}"/>
  <ellipse cx="310" cy="118" rx="30" ry="78" fill="{b}"/>
"""
    if kind == "coast":
        return f"""
  <rect x="0" y="108" width="400" height="72" fill="{b}"/>
  <rect x="0" y="128" width="400" height="52" fill="{c}" opacity="0.7"/>
  <ellipse cx="70" cy="118" rx="46" ry="14" fill="{a}"/>
  <ellipse cx="300" cy="122" rx="70" ry="16" fill="{a}"/>
"""
    if kind == "glacier":
        return f"""
  <polygon points="40,130 120,40 200,130" fill="{b}"/>
  <polygon points="160,130 250,28 340,130" fill="{c}"/>
"""
    if kind == "yardang":
        return f"""
  <rect x="50" y="70" width="22" height="60" fill="{c}"/>
  <rect x="90" y="50" width="18" height="80" fill="{b}"/>
  <rect x="130" y="62" width="28" height="68" fill="{c}"/>
  <rect x="180" y="44" width="16" height="86" fill="{b}"/>
  <rect x="220" y="58" width="24" height="72" fill="{c}"/>
  <rect x="270" y="48" width="20" height="82" fill="{b}"/>
  <rect x="320" y="66" width="30" height="64" fill="{c}"/>
"""
    if kind == "geo_hazard":
        return f"""
  <polygon points="30,118 160,70 290,118" fill="{b}"/>
  <polygon points="120,118 250,48 390,118" fill="{c}" opacity="0.85"/>
"""
    return f"""
  <polyline points="20,110 70,80 120,96 180,58 240,88 300,46 380,92" fill="none" stroke="{c}" stroke-width="8"/>
"""


def svg_for(kind: str) -> str:
    a, b, c = PALETTE[kind]
    title = LABEL[kind] + "，非实地照片"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180" role="img" aria-label="{title}">
  <title>{title}</title>
  <rect width="400" height="180" fill="{a}"/>
  <rect x="0" y="118" width="400" height="22" fill="{b}" opacity="0.85"/>
  <rect x="0" y="140" width="400" height="18" fill="{c}" opacity="0.9"/>
  <rect x="0" y="158" width="400" height="22" fill="#2c261c" opacity="0.55"/>
  {extra(kind, a, b, c)}
  <text x="16" y="24" fill="#2c261c" font-size="11" font-family="serif" opacity="0.7">{title}</text>
</svg>
"""


def png(w: int, h: int, pixel) -> bytes:
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw.extend(pixel(x, y))
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def column_pixel(x: int, y: int, size: int) -> bytes:
    # Stratigraphic column on paper, matching favicon.svg
    margin = max(2, size // 16)
    if x < margin or y < margin or x >= size - margin or y >= size - margin:
        return bytes((44, 38, 28, 255))
    inner = size - 2 * margin
    bands = [
        (107, 83, 68),
        (61, 92, 82),
        (122, 59, 50),
        (44, 38, 28),
    ]
    yy = y - margin
    band_h = inner / 4
    r, g, b = bands[min(3, int(yy / band_h))]
    # paper gutter
    if x < margin + size // 10 or x >= size - margin - size // 10:
        return bytes((244, 239, 230, 255))
    return bytes((r, g, b, 255))


def ico_from_png(png_bytes: bytes, w: int, h: int) -> bytes:
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", w if w < 256 else 0, h if h < 256 else 0, 0, 0, 1, 32, len(png_bytes), 22)
    return header + entry + png_bytes


def write_sitemap() -> None:
    import json

    sites = json.loads((ROOT / "data/sites.json").read_text())
    themes = json.loads((ROOT / "data/theme-routes.json").read_text())
    gssp_pub = {
        "gssp-huangnitang": "changshan-huangnitang",
        "meishan": "changxing-meishan",
        "gssp-jiangshan": "jiangshan",
        "gssp-huanghuachang": "huanghuachang",
        "gssp-wangjiawan": "wangjiawan",
        "gssp-paibi": "paibi",
        "gssp-guzhang": "guzhang",
        "gssp-penglaitan": "penglaitan",
        "gssp-pengchong": "pengchong",
        "gssp-wuliu": "wuliu",
    }
    site_pub = {"animaging": "anyemaqen"}
    urls = [
        "https://shanshizhi.grok.me/",
        "https://shanshizhi.grok.me/catalog",
        "https://shanshizhi.grok.me/routes",
        "https://shanshizhi.grok.me/about",
        "https://shanshizhi.grok.me/gssp",
    ]
    for t in themes:
        urls.append(f"https://shanshizhi.grok.me/routes/{t['id']}")
    for s in sites:
        if "gssp" in s["types"]:
            pid = gssp_pub.get(s["id"], s["id"].removeprefix("gssp-"))
            urls.append(f"https://shanshizhi.grok.me/gssp/{pid}")
        else:
            sid = site_pub.get(s["id"], s["id"])
            urls.append(f"https://shanshizhi.grok.me/sites/{sid}")
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        sm += ["  <url>", f"    <loc>{u}</loc>", "    <changefreq>weekly</changefreq>", "  </url>"]
    sm.append("</urlset>")
    (ROOT / "public/sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    print("sitemap", len(urls))


def main() -> None:
    for kind in PALETTE:
        (COVERS / f"{kind}.svg").write_text(svg_for(kind), encoding="utf-8")
    print("covers", len(PALETTE))
    p32 = png(32, 32, lambda x, y: column_pixel(x, y, 32))
    (ROOT / "public/favicon.ico").write_bytes(ico_from_png(p32, 32, 32))
    p180 = png(180, 180, lambda x, y: column_pixel(x, y, 180))
    (ROOT / "public/apple-touch-icon.png").write_bytes(p180)
    print("favicon.ico + apple-touch-icon.png")
    write_sitemap()


if __name__ == "__main__":
    main()
