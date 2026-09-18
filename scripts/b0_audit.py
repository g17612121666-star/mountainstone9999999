#!/usr/bin/env python3
"""B0: persist geologic ages, recaption diagram galleries, write covers-qa.csv."""
from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
SITES_PATH = ROOT / "data" / "sites.json"
CREDITS_PATH = ROOT / "data" / "cover_credits.json"
CSV_PATH = ROOT / "covers-qa.csv"
DATA_CSV = ROOT / "data" / "covers-qa.csv"

AGE_TOKEN = re.compile(
    r"宙|代|纪|世|期|阶|Ma\b|百万年|亿年|年前|寒武|奥陶|志留|泥盆|石炭|二叠|三叠|侏罗|白垩|"
    r"古近|新近|第四|全新|更新|上新|中新|渐新|始新|古新|震旦|南华|青白口|蓟县|长城|太古|元古|"
    r"古生|中生|新生|前寒武|新元古|中元古|古元古|晚|早|中|现代|现今|至今|"
    r"Holocene|Pleistocene|Pliocene|Miocene|Oligocene|Eocene|Paleocene|Quaternary|"
    r"Neogene|Paleogene|Palaeogene|Cretaceous|Jurassic|Triassic|Permian|"
    r"Carboniferous|Devonian|Silurian|Ordovician|Cambrian|Proterozoic|Archean|"
    r"Precambrian|Paleozoic|Palaeozoic|Mesozoic|Cenozoic|Ediacaran|Cryogenian|Tonian|"
    r"to the present|present\b",
    re.I,
)
ROCK_ONLY = re.compile(
    r"^(丹霞|碳酸盐岩|石英砂岩|花岗岩|综合|喀斯特|火山|玄武岩|流纹岩|砂岩|灰岩|页岩|地貌|红层|"
    r"峰林|熔岩|凝灰岩|片麻岩|片岩|板岩|大理岩|黄土|雅丹|海岸|化石|沉积岩|岩浆岩|变质岩|火山岩|"
    r"岩溶|峡谷)([、，/\s].*)?$"
)
ROCK_STRIP = re.compile(
    r"碳酸盐岩|石英砂岩|花岗闪长岩|超高压变质带|温泉与花岗岩|花岗岩海蚀|变质岩与碳酸盐岩|"
    r"火山碎屑岩|火山岩|玄武岩|安山岩|粗面岩|流纹岩|凝灰岩|白云岩|砂岩|灰岩|页岩|片麻岩|片岩|"
    r"板岩|大理岩|花岗岩|红层|峰林|熔岩|丹霞|岩溶|峡谷|喀斯特|火成岩|沉积岩|岩浆岩|变质岩|"
    r"黄土|雅丹|海岸|化石点?|综合|火山|地貌",
)

DIAGRAM_CREDIT = re.compile(
    r"示意图|范围示意图|磁性地层|地层对比|地质图|柱状图|路线图|科学图表|示意地层柱|考察路线"
)
SPECIMEN_CREDIT = re.compile(r"馆藏标本|标本，非野外|非野外露头|Mount Pan|盘山标本")
SAT_CREDIT = re.compile(r"Esri World Imagery|卫星资料照片|该点坐标卫星")

PATCH_AGE = {
    "lincheng": "寒武–奥陶纪",
    "wuan": "寒武–奥陶纪",
    "xingtai-canyon": "中元古代",
    "huoshizhai": "白垩纪",
    "hongkong": "早白垩世",
    "sheshan": "晚白垩世",
    "jixian": "中–新元古界",
    "meishan": "二叠纪–三叠纪",
}


def sanitize(raw: str) -> str:
    text = re.sub(r"\s+", " ", raw or "").strip()
    if not text:
        return ""
    if ROCK_ONLY.match(text) and not AGE_TOKEN.search(text):
        return ""
    text = ROCK_STRIP.sub(" ", text)
    text = re.sub(r"[，,;]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" -–—·.")
    if not text or not AGE_TOKEN.search(text):
        return ""
    return text


def persist_ages() -> int:
    sites = json.loads(SITES_PATH.read_text())
    n = 0
    for s in sites:
        sid = s["id"]
        before = s.get("geologic_age_text") or ""
        after = PATCH_AGE.get(sid) or sanitize(before)
        if after != before:
            s["geologic_age_text"] = after
            n += 1
        for st in s.get("formation_timeline") or []:
            a = sanitize(st.get("age") or "")
            if a != (st.get("age") or ""):
                st["age"] = a
    SITES_PATH.write_text(json.dumps(sites, ensure_ascii=False, indent=2) + "\n")
    return n


def recaption_diagrams(credits: dict) -> int:
    n = 0
    for sid, cc in credits.items():
        gallery = cc.get("gallery") or []
        changed = False
        new_g = []
        for g in gallery:
            src = g.get("src") or ""
            credit = g.get("credit") or ""
            cap = g.get("caption") or ""
            if DIAGRAM_CREDIT.search(credit + cap + src):
                g["caption"] = "示意图，不是现场照片"
                changed = True
            # known paper-figure extras
            if sid == "jixian" and "jixian-2" in src:
                g["credit"] = "李怀坤等, 2014, 岩石学报 30(10) 图2 地质图/柱状图"
                g["caption"] = "示意图，不是现场照片"
                changed = True
            if sid == "meishan" and "meishan-2" in src:
                g["credit"] = "IUGS Geoheritage Site 018 磁性地层/对比图"
                g["caption"] = "示意图，不是现场照片"
                changed = True
            new_g.append(g)
        if changed:
            cc["gallery"] = new_g
            n += 1
        # cover credits must not claim 露头 if they are satellite
        cr = cc.get("credit") or ""
        if SAT_CREDIT.search(cr) and "露头" in cr:
            cc["credit"] = re.sub(r"[·•]?\s*[^·]*露头[^·]*", "", cr)
            cc["credit"] = re.sub(r"\s+", " ", cc["credit"]).strip(" ·")
            n += 1
        if "野外露头" in cr and SAT_CREDIT.search(cr):
            cc["caption"] = "该点坐标卫星资料照片，非本站踏勘"
    CREDITS_PATH.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
    return n


def classify(sid: str, credit: str, path: Path) -> tuple[str, str, str]:
    """return type, ok, action"""
    cr = credit or ""
    if not path.exists():
        return "other", "no", "missing_file"
    if SPECIMEN_CREDIT.search(cr):
        return "specimen", "no", "replace_specimen"
    if DIAGRAM_CREDIT.search(cr):
        return "map_or_diagram", "no", "replace_diagram"
    if SAT_CREDIT.search(cr):
        return "satellite", "yes", "keep_sat_labelled"
    # pixel heuristic
    try:
        im = Image.open(path)
        w, h = im.size
        small = im.convert("RGB").resize((48, 48))
        cols = small.getcolors(maxcolors=3000)
        ncolors = len(cols) if cols else 3000
        # maps/charts: few colours, lots of near-white
        pixels = list(small.getdata())
        white = sum(1 for r, g, b in pixels if r > 230 and g > 230 and b > 230)
        white_frac = white / max(1, len(pixels))
        if ncolors < 22 and white_frac > 0.35:
            return "map_or_diagram", "no", "pixel_few_colors_replace"
        if ncolors < 18:
            return "map_or_diagram", "no", "pixel_few_colors_replace"
        # named field stills
        if sid in {
            "jixian",
            "meishan",
            "gssp-jiangshan",
            "gssp-penglaitan",
            "gssp-huangnitang",
            "gssp-huanghuachang",
            "gssp-wangjiawan",
            "gssp-paibi",
            "gssp-guzhang",
            "gssp-wuliu",
        }:
            return "photo_outcrop", "yes", "keep_field"
        if "露头" in cr or "剖面" in cr or "GSSP" in cr or "金钉子" in cr:
            return "photo_outcrop", "yes", "keep"
        return "photo_landscape", "yes", "keep"
    except Exception as e:
        return "other", "no", f"unreadable:{e}"


def write_csv(sites: list, credits: dict) -> Counter:
    rows = []
    for s in sites:
        sid = s["id"]
        cc = credits.get(sid) or {}
        src = cc.get("src") or f"/covers/{sid}.jpg"
        fname = Path(src).name
        path = OUT / fname
        if not path.exists():
            for ext in (".jpg", ".jpeg", ".png", ".webp"):
                p = OUT / f"{sid}{ext}"
                if p.exists():
                    path = p
                    src = f"/covers/{p.name}"
                    break
        typ, ok, action = classify(sid, cc.get("credit") or "", path)
        rows.append(
            {
                "slug": sid,
                "file": src,
                "type": typ,
                "ok_for_cover": ok,
                "action": action,
                "credit": (cc.get("credit") or "").replace("\n", " ")[:180],
                "name": s.get("name") or sid,
            }
        )
    fieldnames = ["slug", "file", "type", "ok_for_cover", "action", "credit", "name"]
    for dest in (CSV_PATH, DATA_CSV):
        with dest.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(rows)
    return Counter((r["type"], r["ok_for_cover"]) for r in rows)


def main() -> None:
    n_age = persist_ages()
    credits = json.loads(CREDITS_PATH.read_text())
    n_cap = recaption_diagrams(credits)
    sites = json.loads(SITES_PATH.read_text())
    counts = write_csv(sites, json.loads(CREDITS_PATH.read_text()))
    print("ages_rewritten", n_age, "galleries_recaptioned", n_cap)
    print("qa", dict(counts))
    bad = [k for k, v in counts.items() if k[1] == "no"]
    print("bad_types", bad)


if __name__ == "__main__":
    main()
