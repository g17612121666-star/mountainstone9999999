#!/usr/bin/env python3
"""Retry missing world-park covers via Wikipedia pageimages + Commons thumbs."""
from __future__ import annotations

import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
UA = "ShanShiZhi/1.0 (Chinese geoscience field guide; educational)"
CTX = ssl.create_default_context()

SKIP = ("map", "location", "logo", "railway", "station", "flag", "svg", "street", "road", "downtown", "panoramio (")

WIKI = {
    "jingpohu": "镜泊湖",
    "taining": "泰宁",
    "ningde": "太姥山",
    "longyan": "冠豸山",
    "jiuhuashan": "九华山",
    "yimengshan": "沂蒙山",
    "wangwushan": "王屋山",
    "funiushan": "伏牛山",
    "dabieshan-hg": "大别山",
    "xiangxi": "德夯",
    "leye-fengshan": "大石围天坑",
    "yunyang": "云阳龙缸",
    "zigong": "自贡恐龙博物馆",
    "xingwen": "兴文石海",
    "guangwushan": "光雾山",
    "xingyi": "马岭河峡谷",
    "zhijindong": "织金洞",
    "cangshan": "苍山",
    "cuihuashan": "翠华山",
    "linxia": "和政古动物化石",
    "kanbula": "坎布拉国家森林公园",
    "kunlunshan": "昆仑山",
    "keketuohai": "可可托海",
    "hukou": "壶口瀑布",
    "sheshan": "佘山",
    "zhoukoudian": "周口店北京人遗址",
    "jixian": "蓟县国家地质公园",
    "meishan": "长兴煤山",
    "chengjiang": "澄江化石地",
    "huguangyan": "湖光岩",
    "haikou-volcano": "海口石山火山群",
    "langshan": "崀山",
    "tengchong": "腾冲火山",
    "huashan": "华山",
    "jiuzhaigou": "九寨沟",
    "wulong": "武隆喀斯特",
    "hailuogou": "海螺沟",
    "datong-volcano": "大同火山群",
    "guilin-karst": "桂林山水",
    "yulongxueshan": "玉龙雪山",
    "fangshan": "十渡",
    "hexigten": "阿斯哈图石林",
    "alxa": "巴丹吉林沙漠",
    "changshan": "常山黄泥塘",
    "tianzhushan": "天柱山",
    "enshi": "恩施大峡谷",
    "leiqiong": "湖光岩",
}


def get(url: str, timeout: int = 40) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def wiki_thumb(title: str) -> tuple[str, str] | None:
    api = "https://zh.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "pageimages",
            "pithumbsize": 1280,
            "piprop": "thumbnail|name|original",
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print(" wiki fail", title, e)
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        th = p.get("thumbnail") or {}
        src = th.get("source")
        name = p.get("pageimage") or title
        if src and "svg" not in src.lower():
            return src, name
    return None


def commons_search(q: str) -> list[str]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrnamespace": 6,
            "gsrlimit": 10,
            "gsrsearch": q,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 1280,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print(" commons fail", q, e)
        return []
    pages = ((data.get("query") or {}).get("pages") or {})
    urls = []
    for p in pages.values():
        title = (p.get("title") or "").lower()
        if any(s in title for s in SKIP):
            continue
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        if (info.get("mime") or "") not in ("image/jpeg", "image/png"):
            continue
        u = info.get("thumburl") or info.get("url")
        if u:
            urls.append(u)
    return urls


def save(url: str, dest: Path) -> bool:
    try:
        data = get(url)
        if len(data) < 12000:
            return False
        if data[:1] == b"<" or b"<html" in data[:80].lower():
            return False
        dest.write_bytes(data)
        return dest.stat().st_size > 12000
    except Exception as e:
        print("  get fail", type(e).__name__)
        return False


def main() -> None:
    credits_path = ROOT / "data" / "cover_credits.json"
    credits = json.loads(credits_path.read_text()) if credits_path.exists() else {}
    sites = json.loads((ROOT / "data" / "sites.json").read_text())
    world = [s["id"] for s in sites if "world_geopark" in s["types"]]
    extra = list(WIKI.keys())
    targets = list(dict.fromkeys(world + extra))
    for sid in targets:
        dest = OUT / f"{sid}.jpg"
        if dest.exists() and dest.stat().st_size > 30000:
            continue
        print("need", sid)
        hit = None
        title = WIKI.get(sid)
        if title:
            time.sleep(0.8)
            hit = wiki_thumb(title)
            if hit:
                print(" wiki", sid, hit[1])
                if save(hit[0], dest):
                    credits[sid] = {
                        "credit": f"维基百科「{title}」条目配图",
                        "caption": "",
                        "src": f"/covers/{sid}.jpg",
                    }
                    print("  ok", dest.stat().st_size)
                    continue
        time.sleep(0.8)
        for u in commons_search(title or sid):
            print(" thumb", sid, u[-60:])
            if save(u, dest):
                credits[sid] = {
                    "credit": "Wikimedia Commons 缩略图",
                    "caption": "",
                    "src": f"/covers/{sid}.jpg",
                }
                print("  ok", dest.stat().st_size)
                break
            time.sleep(0.6)
        else:
            print(" MISS", sid)
    credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=2), encoding="utf-8")
    have = sorted(p.stem for p in OUT.glob("*.jpg") if p.stat().st_size > 30000)
    print("have", len(have), have)


if __name__ == "__main__":
    main()
