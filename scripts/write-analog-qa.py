#!/usr/bin/env python3
"""Write data/analog-qa.csv from catalog JSON + cover credits (no invented geology)."""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path("/workspace")
DIAGRAM = re.compile(r"地质图|柱状|磁性地层|示意图|地层柱|map of|column", re.I)
SAT = re.compile(r"卫星|Esri World Imagery", re.I)
SPECIMEN = re.compile(r"馆藏标本|标本，非野外|非野外露头")

PREFERRED = {
    "karst": ["shilin", "guilin-karst", "zhijindong", "shihuadong", "wulong", "jiuzhaigou", "huanglong"],
    "danxia": ["danxiashan", "longhushan", "taining", "langshan", "chishui", "qiyunshan", "huoshizhai"],
    "zhangjiajie_sandstone": ["zhangjiajie", "zhangshiyan"],
    "granite_peak": ["huangshan", "sanqingshan", "taishan", "chayashan", "huashan"],
    "volcano": ["wudalianchi", "changbaishan", "jingpohu", "weizhoudao", "tengchong", "huguangyan", "yandangshan"],
    "yardang": ["dunhuang", "alxa", "zhada", "pingshanhu"],
    "glacier": ["hailuogou", "yulongxueshan", "siguniang", "daguglacier"],
    "loess": ["luochuan", "xixian-loess"],
    "coast": ["hongkong", "dapeng", "dalian-coast", "pingtan"],
    "fossil": ["chengjiang", "zhucheng", "shanwang", "zigong", "zhoukoudian"],
    "stratigraphy": ["songshan", "jixian", "meishan", "taishan", "fangshan", "gssp-huangnitang"],
    "geo_hazard": ["xiaonanhai", "cuihuashan", "longmenshan"],
    "other": ["fangshan", "yesanpo", "lushan"],
    "colorful_clastic": ["zhangye"],
}

HARD_BANS = {
    "zhangye": "must not analog Danxiashan / danxia family",
    "zhangjiajie": "must not analog karst (Shilin/Guilin)",
    "xiqiaoshan": "must not analog pahoehoe / Hawaiian basalt narrative",
    "sheshan": "must not analog Shanghai national geopark (Chongming) as the same park",
}

SAMPLE = [
    "zhangye", "zhangjiajie", "xiqiaoshan", "sheshan", "chongming", "xixian-loess", "luochuan",
    "shilin", "guilin-karst", "danxiashan", "fangshan", "jixian", "meishan", "gssp-huangnitang",
    "wudalianchi", "changbaishan", "huangshan", "sanqingshan", "taishan", "songshan",
    "yuntaishan", "hukou", "shihuadong", "shidu", "yanqing", "zigong", "chengjiang", "hongkong",
    "huguangyan", "leiqiong", "pingshanhu", "zhada", "dunhuang",
]


def family(site: dict) -> str:
    if site["id"] == "zhangye":
        return "colorful_clastic"
    types = site.get("landform_types") or ["other"]
    primary = types[0] if types else "other"
    if primary == "other" and len(types) > 1 and types[1] != "danxia":
        return types[1]
    return primary


def cover_type(credit: str, src: str) -> str:
    if not src:
        return "missing"
    if DIAGRAM.search(credit or ""):
        return "map_or_diagram"
    if SPECIMEN.search(credit or "") and "不是展柜标本" not in (credit or "") and "原位" not in (credit or ""):
        return "specimen"
    if SAT.search(credit or "") or src.startswith("http"):
        return "satellite"
    if re.search(r"露头|剖面|保护廊|叠层石|骨床", credit or ""):
        return "photo_outcrop"
    return "photo_landscape"


def main() -> None:
    sites = json.loads((ROOT / "data/sites.json").read_text())
    credits = json.loads((ROOT / "data/cover_credits.json").read_text())
    extras = json.loads((ROOT / "data/disk_extras.json").read_text())
    by_id = {s["id"]: s for s in sites}
    fam_pools: dict[str, list[str]] = {}
    for s in sites:
        cc = credits.get(s["id"], {})
        src = cc.get("src") or s.get("cover_image") or ""
        credit = cc.get("credit") or s.get("cover_credit") or ""
        if cover_type(credit, src) in {"photo_outcrop", "photo_landscape"} and src.startswith("/covers/"):
            fam_pools.setdefault(family(s), []).append(s["id"])

    rows = []
    mismatch_clear = []
    for s in sites:
        sid = s["id"]
        cc = credits.get(sid, {})
        src = cc.get("src") or s.get("cover_image") or ""
        credit = cc.get("credit") or s.get("cover_credit") or ""
        ctype = cover_type(credit, src)
        fam = family(s)
        extra = extras.get(sid) or []
        own_extra = [p for p in extra if p.get("src") and not p.get("diagram") and not DIAGRAM.search(p.get("credit") or "")]
        pool = [d for d in fam_pools.get(fam, []) if d != sid]
        preferred = [d for d in PREFERRED.get(fam, []) if d in pool]
        donor = (preferred or pool)[0] if (preferred or pool) else ""
        if own_extra:
            genesis = f"own extra ({own_extra[0]['src']})"
            genesis_kind = "own"
        elif ctype != "satellite" and src:
            genesis = "satellite of this site"
            genesis_kind = "satellite"
        elif donor:
            genesis = f"analog {donor} (same family {fam})"
            genesis_kind = "analog"
        else:
            genesis = "satellite of this site (no same-family donor)"
            genesis_kind = "satellite"
        ban = HARD_BANS.get(sid, "")
        mismatch = "no"
        action = "keep"
        note = f"family={fam}"
        if sid == "zhangye":
            if donor in {"danxiashan", "longhushan", "taining", "langshan", "chishui"} or fam == "danxia":
                mismatch = "YES"
                action = "isolate colorful_clastic; no Danxia donor"
            elif genesis_kind == "analog" and by_id.get(donor, {}).get("landform_types", [None])[0] == "danxia":
                mismatch = "YES"
                action = "drop cross-family analog"
            else:
                action = "no Danxia analog; stops fall back to this-site satellite"
                note = "colorful_clastic only; Zhangye ≠ Danxiashan"
        if sid == "zhangjiajie" and donor in {"shilin", "guilin-karst", "zhijindong"}:
            mismatch = "YES"
            action = "keep zhangjiajie_sandstone family only"
        if sid == "xiqiaoshan":
            action = "trachyte quarry copy; analog volcano only, never pahoehoe caption"
            note = "volcano family; SITE_NOTE forbids ropey lava"
        if sid == "sheshan":
            action = "volcano analog OK; never call Sheshan Shanghai national geopark"
            note = "national geopark is Chongming"
        if ctype == "map_or_diagram":
            mismatch = "YES"
            action = "do not use diagram as cover"
        rows.append(
            {
                "slug": sid,
                "family": fam,
                "cover_file": src,
                "cover_type": ctype,
                "genesis_source": genesis,
                "genesis_kind": genesis_kind,
                "analog_donor": donor,
                "mismatch": mismatch,
                "ban": ban,
                "action": action,
                "note": note,
                "sampled": "yes" if sid in SAMPLE else "no",
            }
        )
        if mismatch == "no" and sid in HARD_BANS:
            mismatch_clear.append(sid)

    out = ROOT / "data/analog-qa.csv"
    fields = list(rows[0].keys())
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    sampled_bad = [r for r in rows if r["sampled"] == "yes" and r["mismatch"] == "YES"]
    print(f"wrote {out} rows={len(rows)} sampled_mismatch={len(sampled_bad)} hard_ban_clear={mismatch_clear}")
    for r in sampled_bad:
        print("BAD", r["slug"], r["action"])


if __name__ == "__main__":
    main()
