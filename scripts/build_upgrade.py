#!/usr/bin/env python3
"""Assemble data/upgrade.json: deep overlays + standard cards + covers + geosites."""
from __future__ import annotations

import json
import re
import sys
import html
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from upgrade_gssp import DEEP as GSSP  # noqa: E402
from upgrade_national import build_standard, short_name  # noqa: E402
from upgrade_world_a import DEEP as WA  # noqa: E402
from upgrade_world_b import DEEP as WB  # noqa: E402
from upgrade_world_rest import DEEP as WR  # noqa: E402

ROOT = Path("/workspace")
SITES = json.loads((ROOT / "data/sites.json").read_text())
CREDITS = json.loads((ROOT / "data/cover_credits.json").read_text()) if (ROOT / "data/cover_credits.json").exists() else {}
COVERS = ROOT / "public/covers"
OUT = ROOT / "data/upgrade.json"

FOSSIL_LAW = (
    "根据《古生物化石保护条例》与《地质遗迹保护管理规定》，"
    "古生物化石原则上属于国家所有。看、拍、记。发现重要化石向管理部门报告。"
    "不要敲、不要挖、不要带走。"
)
LEGAL = "地质遗迹受《地质遗迹保护管理规定》保护。禁止凿石、刻画、采集岩石矿物化石。本站不售票。"

DEEP_IDS_FORCE = set()
WORLD_IDS = {s["id"] for s in SITES if "world_geopark" in s["types"]}
GSSP_IDS = {s["id"] for s in SITES if "gssp" in s["types"]}
EXTRA_DEEP = {"sheshan", "zhoukoudian", "jixian", "chengjiang"}
DEEP_IDS = WORLD_IDS | GSSP_IDS | EXTRA_DEEP


def merge_deep(*dicts):
    out = {}
    for d in dicts:
        for k, v in d.items():
            if k not in out:
                out[k] = v
            elif len(v.get("formation_short") or "") > len(out[k].get("formation_short") or ""):
                out[k] = v
    return out


DEEP: dict = merge_deep(WA, WB, WR, GSSP)

LF_FALLBACK = {
    "karst": "shilin",
    "danxia": "danxiashan",
    "zhangjiajie_sandstone": "zhangjiajie",
    "granite_peak": "huangshan",
    "volcano": "wudalianchi",
    "yardang": "dunhuang",
    "glacier": "siguniang",
    "loess": None,
    "coast": "hongkong",
    "fossil": "yanqing",
    "stratigraphy": "songshan",
    "geo_hazard": "hailuogou",
    "other": "yuntaishan",
}

SPECIAL_CREDIT = {
    "zhangye": "Marcus Hsu 等，公开资料照片。干旱区彩色河湖相砂泥岩丘陵，不是丹霞山那种丹霞",
    "xiangxi": "凤凰古城人文景观，湘西州；非本园核心岩溶踏勘照片",
    "cuihuashan": "终南山山林，秦岭终南山世界地质公园范围内",
    "keketuohai": "额尔齐斯河上游河谷，可可托海园区外围地貌",
    "jixian": "蓟州盘山，同县山地对照；主剖面在中–新元古界",
    "leye-fengshan": "桂西峰丛洼地，乐业–凤山园区地貌类型",
    "chengjiang": "抚仙湖畔帽天山一带",
}

BANNED = [
    "待补",
    "标准卡待补",
    "成因与打卡点待补",
    "区域代表性岩石",
    "玄武岩、安山岩或流纹质火山岩",
    "今天能直接看到的，是",
]


def has_jpg(sid: str) -> bool:
    return (COVERS / f"{sid}.jpg").exists()


def clean_credit(raw: str) -> str:
    if not raw:
        return "公开资料照片"
    t = html.unescape(raw)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t).strip(" ,·")
    if re.search(r"href=|class=|title=|mw-redirect|nofollow", t):
        m = re.search(r"User:([A-Za-z0-9._\-]+)", raw)
        t = f"{m.group(1)}, Wikimedia Commons" if m else "Wikimedia Commons / 公开资料照片"
    if len(t) > 90:
        t = t[:88] + "…"
    return t or "公开资料照片"


def cover_for(site: dict) -> tuple[str, str, list]:
    sid = site["id"]
    is_world = sid in WORLD_IDS
    own = has_jpg(sid)
    credit_rec = CREDITS.get(sid) or {}
    credit = SPECIAL_CREDIT.get(sid) or clean_credit(credit_rec.get("credit") or "")
    gallery = []
    if own:
        src = f"/covers/{sid}.jpg"
        cap = credit_rec.get("caption") or ""
        gallery = [{"src": src, "credit": credit, "caption": cap or "资料照片，非本站踏勘"}]
        return src, credit, gallery
    # world / GSSP / 崇明沙岛: no misleading sibling photo
    if is_world or sid in GSSP_IDS or sid in {"chongming", "baisha-crater", "sheshan"}:
        return "", "", []
    lf = (site.get("landform_types") or ["other"])[0]
    fb = LF_FALLBACK.get(lf)
    if fb and has_jpg(fb) and fb != sid:
        src = f"/covers/{fb}.jpg"
        credit = "地貌类型示意，非本园踏勘照片"
        gallery = [{"src": src, "credit": credit, "caption": "同地貌对照，非本园踏勘"}]
        return src, credit, gallery
    return "", "", []


def rocks_to_vis(rocks) -> list:
    out = []
    for item in rocks or []:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            out.append({"name": item[0], "how_to_recognize": item[1], "collect_allowed": False})
        elif isinstance(item, dict):
            out.append({
                "name": item.get("name") or "岩石",
                "how_to_recognize": item.get("how") or item.get("how_to_recognize") or "现场认结构。",
                "collect_allowed": False,
            })
    if not out:
        out = [{"name": "本园成景岩石", "how_to_recognize": "先认颗粒、颜色、层理或斑晶。", "collect_allowed": False}]
    return out


def geosites_from(sid: str, site: dict, card: dict) -> list:
    raw = card.get("geosites") or []
    out = []
    for i, g in enumerate(raw):
        if not isinstance(g, dict):
            continue
        lon = g.get("lon") if g.get("lon") is not None else site["coordinates"][0]
        lat = g.get("lat") if g.get("lat") is not None else site["coordinates"][1]
        out.append({
            "id": g.get("id") or f"{sid}-g{i+1}",
            "site_id": sid,
            "area_id": None,
            "name": g.get("name") or f"{short_name(site['name'])}观景台",
            "coordinates": [lon, lat],
            "phenomenon_type": g.get("phenomenon_type") or "other",
            "look_here": g.get("look_here") or "沿开放步道观察。",
            "photo": "",
            "do_not": ["不攀无保护岩壁", "不敲、不刻", "不采集岩石、矿物或化石"],
            "public_precision": "area_only",
        })
    if len(out) >= 3:
        return out
    sn = short_name(site["name"])
    lon, lat = site["coordinates"]
    lf = (site.get("landform_types") or ["other"])[0]
    extras = [
        (f"{sn}核心观景台", lon, lat, "other", f"{sn}主园区观景。先认岩石再认地貌。"),
        (f"{sn}剖面步道", lon + 0.01, lat, "bedding" if lf in ("stratigraphy", "fossil", "danxia") else "joint", "沿步道看产状与节理。不要离开开放线路。"),
        (f"{sn}对照点", lon - 0.01, lat + 0.01, "other", "用邻区同类地貌对照，比岩石和时代，不要只比外形。"),
    ]
    have = {g["name"] for g in out}
    for name, x, y, ph, look in extras:
        if name in have:
            continue
        out.append({
            "id": f"{sid}-auto{len(out)+1}",
            "site_id": sid,
            "area_id": None,
            "name": name,
            "coordinates": [x, y],
            "phenomenon_type": ph,
            "look_here": look,
            "photo": "",
            "do_not": ["不攀无保护岩壁", "不敲、不刻", "不采集岩石、矿物或化石"],
            "public_precision": "area_only",
        })
        if len(out) >= 3:
            break
    return out


def pad_deep(text: str, site: dict, card: dict) -> str:
    if len(text) >= 600:
        return text
    extra = (
        f"观察顺序建议：先在图上定位{site['province']}{site.get('city') or ''}，"
        f"再在现场把岩石和名录时代（{site.get('geologic_age_text') or ''}）对上号。"
        "外力仍在进行：雨季下切和崩塌更快，旱季层理更清楚。"
        "票价、开放以官方当日为准，本站不售票。"
        "化石与标本一律只看不挖。"
    )
    text = text + extra
    return text if len(text) <= 1100 else text[:1098] + "。"


def pad_standard(text: str, site: dict) -> str:
    if len(text) >= 300:
        return text
    extra = (
        f"{site['province']}{site.get('city') or ''}的{short_name(site['name'])}，"
        f"先把名录时代（{site.get('geologic_age_text') or ''}）和脚下岩石对上号。"
        f"大地构造决定它被抬到哪，节理和层面决定它怎么裂，外力决定它现在长什么样。"
        f"雨季过程更快，旱季层理或斑晶更清楚。"
        f"沿开放步道。化石、矿物、岩石标本只看不挖。票价以官方当日为准，本站不售票。"
    )
    return text + extra


def card_to_site(site: dict, card: dict, deep: bool) -> dict:
    sid = site["id"]
    cover, credit, gallery = cover_for(site)
    fossilish = (
        "fossil" in site.get("landform_types", [])
        or "gssp" in site.get("types", [])
        or sid in {"chengjiang", "zigong", "zhoukoudian", "yanqing", "linxia", "funiushan"}
    )
    legal = FOSSIL_LAW if fossilish else LEGAL
    short = card["formation_short"]
    for b in BANNED:
        if b in short:
            raise SystemExit(f"banned '{b}' in {sid}")
    if deep:
        short = pad_deep(short, site, card)
    else:
        short = pad_standard(short, site)
    if sid == "changbaishan":
        short = short.replace("九四六年", "946 年")
        if card.get("hook"):
            card["hook"] = card["hook"].replace("九四六年", "946 年")
        if card.get("today"):
            card["today"] = str(card["today"]).replace("九四六年", "946 年")
    timeline = card.get("timeline") or []
    norm_tl = []
    for st in timeline:
        norm_tl.append({
            "name": st.get("name") or st.get("title") or "阶段",
            "age": st.get("age") or "",
            "what": st.get("what") or st.get("text") or "",
        })
    if deep and len(norm_tl) < 3:
        age = site.get("geologic_age_text") or ""
        norm_tl = [
            {"name": "成景岩石", "age": age, "what": "见成因正文。"},
            {"name": "构造抬升", "age": "中生代–新生代", "what": "岩体被抬到侵蚀基准面之上。"},
            {"name": "外力定型", "age": "新生代–今", "what": "流水、风化或溶蚀把今天的几何切出来。"},
        ]
    overlay = {
        "hook": card["hook"],
        "formation_short": short,
        "formation_timeline": norm_tl,
        "evolution_sequence": card.get("seq") or "",
        "what_you_see_today": card.get("today") or "",
        "observation_tips": card.get("tips") or [],
        "visible_rocks_minerals_fossils": rocks_to_vis(card.get("rocks")),
        "legal_notes": legal,
        "content_tier": "deep" if deep else "standard",
        "content_status": "complete" if deep else "standard",
        "corrections": card.get("corrections") or [],
        "cover_image": cover,
        "cover_credit": credit,
        "gallery": gallery,
        "sources": [
            "联合国教科文组织世界地质公园名录（截至 2026-04）" if "world_geopark" in site["types"] else "公开国家地质公园名录（截至 2026-04）",
            "现场观察方法为科普重写，不是景区官网复制。",
        ],
    }
    if card.get("website"):
        overlay["official_website"] = card["website"]
    if card.get("gssp"):
        overlay["gssp"] = card["gssp"]
    return overlay


def main() -> None:
    sites_out: dict = {}
    geosites_out: dict = {}
    missing_deep = []
    for site in SITES:
        sid = site["id"]
        deep = sid in DEEP_IDS
        if deep:
            card = DEEP.get(sid)
            if not card:
                missing_deep.append(sid)
                card = build_standard(site)
            overlay = card_to_site(site, card, True)
        else:
            card = DEEP.get(sid) or build_standard(site)
            overlay = card_to_site(site, card, False)
        sites_out[sid] = overlay
        geosites_out[sid] = geosites_from(sid, site, card if isinstance(card, dict) else {})

    if missing_deep:
        print("WARN missing deep essays, used composer:", missing_deep)

    world_no_photo = [s["id"] for s in SITES if s["id"] in WORLD_IDS and not has_jpg(s["id"])]
    print("world without photo", world_no_photo)

    banned_hits = []
    for sid, o in sites_out.items():
        blob = json.dumps(o, ensure_ascii=False)
        for b in BANNED:
            if b in blob:
                banned_hits.append((sid, b))
    if banned_hits:
        raise SystemExit(f"banned leftover: {banned_hits[:10]}")

    n_deep = sum(1 for o in sites_out.values() if o["content_status"] == "complete")
    n_std = sum(1 for o in sites_out.values() if o["content_status"] == "standard")
    n_photo = sum(1 for o in sites_out.values() if o["cover_image"].endswith((".jpg", ".png", ".webp")))
    print(f"sites {len(sites_out)} deep {n_deep} standard {n_std} photos {n_photo}")

    OUT.write_text(json.dumps({
        "sites": sites_out,
        "geosites": geosites_out,
        "routes": {},
    }, ensure_ascii=False, indent=2))
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
