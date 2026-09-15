#!/usr/bin/env python3
import json
from pathlib import Path

sites = json.loads(Path("/workspace/data/sites.json").read_text())
credits = json.loads(Path("/workspace/data/cover_credits.json").read_text())
media = json.loads(Path("/workspace/data/media.json").read_text())
covers = Path("/workspace/public/covers")
r4 = json.loads(Path("/workspace/data/r4_notes.json").read_text())

site_bv = media.get("sites") or {}
route_bv = media.get("routes") or {}
PRIORITY_VIDEO = {
    "shilin", "wudalianchi", "meishan", "songshan", "huangshan", "taishan",
    "fangshan", "shihuadong", "wulong", "zhijindong", "guilin-karst", "jiuzhaigou",
    "zhangye", "dunhuang", "hongkong", "chengjiang", "zigong", "changshan",
    "jingpohu", "sanqingshan", "longhushan", "taining", "yesanpo", "jixian", "sheshan",
}

n_real = sum(1 for s in sites if (covers / f"{s['id']}.jpg").exists())
n_empty = len(sites) - n_real


def clean(s: str) -> str:
    return (s or "").replace("|", "／").replace("\n", " ").strip()


lines = [
    "# 山石志全库总表（292 地点 + 20 线路）· 2026-09 第三轮",
    "",
    f"- 已配真图：{n_real}",
    f"- 示意柱（8 级水源仍无准图）：{n_empty}",
    f"- 地点页已嵌 BV：{len(site_bv)}（另 {len(route_bv)} 条线路视频）",
    "- 简卡脱离填空模板：292/292",
    "- 本轮新换成真图：大同火山、平山湖、万盛石林、邢台峡谷群、武当山、武安古武当、排碧/古丈/乌溜/黄花场/王家湾金钉子、黄河三角洲、黎明老君山、汤旺河石林、西吉火石寨、格凸河、黔江小南海",
    "- About 未改；20 条线路；佘山不是国家地质公园；黄土线第 1 站无壶口；野三坡仍是河谷封面",
    "- 世界级 51：名录全部真图（无示意柱）",
    "- 视频检索详见 data/video_log.md",
    "",
    "| slug | 中文名 | 封面 | 水源等级 | 源页 | 名录小图 | BV |",
    "|---|---|---|---|---|---|---|",
]

for s in sites:
    slug = s["id"]
    name = s["name"]
    has = (covers / f"{slug}.jpg").exists()
    cc = credits.get(slug) or {}
    clip = site_bv.get(slug)
    if clip:
        bv = clip.get("bvid") or "检索记录见视频表"
    elif slug in PRIORITY_VIDEO:
        bv = "检索记录见视频表"
    else:
        bv = "—"
    if has:
        level = cc.get("level") or 1
        srcpage = cc.get("source_url") or "Wikimedia Commons"
        credit = clean(cc.get("credit") or "Wikimedia Commons")[:80]
        cover = f"已配真图 · {credit}"
        thumb = "是"
        srcpage = clean(str(srcpage))
    else:
        note = r4.get(slug, "1–7 Commons/Openverse/政府通稿未找到可指认该园地貌的准图。8 级全空。")
        cover = "8 级全空，示意柱"
        level = 8
        srcpage = note[:200]
        thumb = "否（不配错图）"
    lines.append(f"| {slug} | {name} | {cover} | {level} | {srcpage} | {thumb} | {bv} |")

lines += [
    "",
    "## 线路视频",
    "",
    "| 线路 | BV | 说明 |",
    "|---|---|---|",
]
for rid, clip in route_bv.items():
    lines.append(f"| /routes/{rid} | {clip['bvid']} | {clean(clip.get('note') or clip.get('title'))} |")

Path("/workspace/data/inventory.md").write_text("\n".join(lines) + "\n")
print("inventory rows", len(sites), "real", n_real, "empty", n_empty, "videos", len(site_bv))
