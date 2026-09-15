#!/usr/bin/env python3
"""Fetch Wikipedia / Commons stills for parks that still have no own jpg."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public/covers"
CREDITS = ROOT / "data/cover_credits.json"
UA = "ShanShiZhiFieldGuide/1.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()
SKIP = {
    "sheshan",
    "xixian-loess",
    "meishan",
    "qiyunshan",
    "zhengzhou-huanghe",
    "huanghe-delta",
    "gssp-huangnitang",
    "gssp-jiangshan",
    "gssp-huanghuachang",
    "gssp-wangjiawan",
    "gssp-paibi",
    "gssp-guzhang",
    "gssp-penglaitan",
    "gssp-pengchong",
    "gssp-wuliu",
}
BAD = ("寺", "庙", "教堂", "天文台", "地图", "牌坊", "大门", "塑像", "摩崖", "题名", "观音", "佛", "塔院")
BAD_FILE = (
    "map",
    "location",
    "logo",
    "statue",
    "temple",
    "church",
    "gate",
    "ticket",
    "museum interior",
    "stele",
    "inscription",
    "pagoda",
    "monastery",
    "buddha",
    "guan yin",
    "plaza",
    "night",
    "flower",
    "blossom",
)


def get(url: str, timeout: int = 40) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def is_jpeg(data: bytes) -> bool:
    return data[:2] == b"\xff\xd8"


def wiki_summary(lang: str, title: str) -> dict | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img:
        return None
    desc = (data.get("description") or data.get("title") or "") + " " + (data.get("extract") or "")[:80]
    blob = desc + title
    if any(b in blob for b in BAD):
        return None
    low = (img + " " + title).lower()
    if any(b in low for b in BAD_FILE):
        return None
    return {"url": img, "title": data.get("title") or title, "desc": desc[:120], "filename": Path(urllib.parse.urlparse(img).path).name}


def download(url: str, dest: Path) -> bool:
    try:
        data = get(url)
    except Exception as e:
        print("  fail", type(e).__name__, e)
        return False
    if len(data) < 12000 or not is_jpeg(data):
        print("  reject bytes", len(data), "head", data[:12])
        return False
    dest.write_bytes(data)
    print("  wrote", dest.name, dest.stat().st_size)
    return True


def re_strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s or "")
    return " ".join(s.split())


def artist_from_commons(filename: str) -> str:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": "File:" + filename,
            "prop": "imageinfo",
            "iiprop": "extmetadata",
        }
    )
    try:
        data = json.loads(get(api).decode())
        pages = (data.get("query") or {}).get("pages") or {}
        info = next(iter(pages.values())).get("imageinfo") or [{}]
        meta = (info[0] or {}).get("extmetadata") or {}
        artist = re_strip_tags((meta.get("Artist") or {}).get("value") or "")
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        return ", ".join(x for x in (artist[:80], lic, "Wikimedia Commons") if x)
    except Exception:
        return "Wikimedia Commons"


def commons_search(query: str) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": 8,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(api).decode())
    except Exception as e:
        print("  commons fail", type(e).__name__, e)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = p.get("title") or ""
        info = (p.get("imageinfo") or [{}])[0]
        mime = info.get("mime") or ""
        url = info.get("thumburl") or info.get("url") or ""
        if "jpeg" not in mime and not url.lower().endswith((".jpg", ".jpeg")):
            continue
        blob = (title + " " + url).lower()
        if any(b in title for b in BAD) or any(b in blob for b in BAD_FILE):
            continue
        meta = info.get("extmetadata") or {}
        artist = re_strip_tags((meta.get("Artist") or {}).get("value") or "")
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        desc = re_strip_tags((meta.get("ImageDescription") or {}).get("value") or "")[:160]
        if any(b in desc for b in BAD):
            continue
        out.append(
            {
                "url": url,
                "title": title.replace("File:", ""),
                "credit": ", ".join(x for x in (artist[:80], lic, "Wikimedia Commons") if x),
                "desc": desc,
            }
        )
    return out


def titles_for(s: dict) -> list[tuple[str, str]]:
    name = s["name"]
    en = s.get("name_en") or ""
    short = (
        name.replace("联合国教科文组织", "")
        .replace("世界地质公园", "")
        .replace("国家地质公园", "")
        .replace("地质公园", "")
    )
    short = short.strip()
    out: list[tuple[str, str]] = []
    if short:
        out.append(("zh", short))
    if en and en.lower() != s["id"]:
        out.append(("en", en))
        out.append(("en", en + " Geopark"))
        out.append(("en", en + " National Geopark"))
    extras = {
        "zhangshiyan": [("zh", "嶂石岩"), ("en", "Zhangshiyan")],
        "baishishan": [("zh", "白石山 (涞源)"), ("zh", "涞源白石山"), ("en", "Baishi Mountain")],
        "benxi": [("zh", "本溪水洞"), ("en", "Benxi Water Caves")],
        "ningwu": [("zh", "宁武冰洞"), ("zh", "宁武万年冰洞")],
        "luhe": [("zh", "桂子山石柱"), ("zh", "六合石柱"), ("en", "Guizi Hill")],
        "jiayin": [("zh", "嘉荫恐龙国家地质公园"), ("zh", "嘉荫恐龙")],
        "chaoyang": [("zh", "朝阳鸟化石国家地质公园"), ("zh", "四合屯")],
        "chengde-danxia": [("zh", "承德双塔山"), ("en", "Shuangta Mountain")],
        "wutaishan": [("zh", "五台山北台"), ("en", "Mount Wutai")],
        "shanwang": [("zh", "山旺化石"), ("en", "Shanwang")],
        "laiyang": [("zh", "莱阳恐龙")],
        "pingtan": [("zh", "平潭岛"), ("en", "Pingtan Island")],
        "jingpohu": [("zh", "镜泊湖"), ("en", "Jingpo Lake")],
        "wuda": [("zh", "乌达煤火"), ("en", "Wuda coal fire")],
        "badain-jaran": [("zh", "巴丹吉林沙漠"), ("en", "Badain Jaran Desert")],
        "qitai": [("zh", "奇台硅化木"), ("zh", "硅化木恐龙国家地质公园")],
        "xingwen": [("zh", "兴文石海")],
        "xingyi": [("zh", "兴义万峰林")],
        "kanbula": [("zh", "坎布拉")],
        "cuihuashan": [("zh", "翠华山")],
        "alxa": [("zh", "阿拉善沙漠")],
    }
    out.extend(extras.get(s["id"], []))
    seen = set()
    uniq = []
    for lang, t in out:
        key = (lang, t)
        if key in seen:
            continue
        seen.add(key)
        uniq.append((lang, t))
    return uniq


def commons_queries(s: dict) -> list[str]:
    name = s["name"]
    short = (
        name.replace("联合国教科文组织", "")
        .replace("世界地质公园", "")
        .replace("国家地质公园", "")
        .replace("地质公园", "")
        .strip()
    )
    lf = (s.get("landform_types") or ["other"])[0]
    extra = {
        "karst": "喀斯特 OR karst OR 溶洞",
        "danxia": "丹霞 OR danxia",
        "zhangjiajie_sandstone": "砂岩峰林",
        "granite_peak": "花岗岩",
        "volcano": "火山 OR volcano OR 熔岩",
        "yardang": "雅丹 OR yardang",
        "glacier": "冰川 OR glacier",
        "loess": "黄土 OR loess",
        "coast": "海岸 OR 海蚀",
        "fossil": "化石 OR fossil",
        "stratigraphy": "剖面 OR outcrop",
        "geo_hazard": "滑坡 OR 堰塞",
        "other": "",
    }.get(lf, "")
    q = [short]
    if extra:
        q.append(f"{short} {extra}")
    en = s.get("name_en") or ""
    if en:
        q.append(en)
    special = {
        "luhe": ["桂子山 柱状节理", "Nanjing columnar joint"],
        "benxi": ["本溪水洞", "Benxi Water Cave interior"],
        "baishishan": ["涞源 白石山 峰林", "Laiyuan marble"],
        "zhangshiyan": ["嶂石岩 砂岩", "Zhangshiyan cliff"],
        "ningwu": ["宁武 冰洞", "Ningwu ice cave"],
        "jiayin": ["嘉荫 恐龙 化石"],
        "chaoyang": ["四合屯 化石", "Jehol Biota Chaoyang"],
        "chengde-danxia": ["承德 双塔山", "Chengde Danxia cliff"],
        "wutaishan": ["五台山 北台 山体", "Wutai Shan granite plateau -temple -monastery"],
        "wuda": ["乌达 煤火", "Wuda coal fire"],
        "badain-jaran": ["巴丹吉林 沙山", "Badain Jaran dune lake"],
    }
    q.extend(special.get(s["id"], []))
    return q


def credit_line(info: dict) -> str:
    fn = info.get("filename") or info.get("title") or ""
    if info.get("credit"):
        return info["credit"]
    if fn:
        return artist_from_commons(fn.split("/")[-1].split("?")[0])
    return f"Wikimedia / Wikipedia · {info.get('title') or ''}"


def main() -> None:
    sites = json.loads((ROOT / "data/sites.json").read_text())
    have = {p.stem for p in OUT.glob("*.jpg")}
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {}
    order = []
    named = [
        "zhangshiyan",
        "baishishan",
        "benxi",
        "ningwu",
        "luhe",
        "jiayin",
        "chaoyang",
        "chengde-danxia",
        "wutaishan",
        "shanwang",
        "laiyang",
        "pingtan",
        "dalian-coast",
        "changshan-islands",
        "shenhuwan",
        "linlushan",
        "huguan",
        "xingtai-canyon",
        "sanxia",
        "badain-jaran",
        "qitai",
        "nianbaoyuze",
        "animaging",
        "ruyang",
        "yunxian",
        "xingkaihu",
        "dabieshan-luan",
        "jingangtai",
        "wulianshan",
        "lincheng",
        "mulanshan",
        "tangshan-fangshan",
        "zhangzhou-volcano",
        "changyang",
        "wuda",
        "xingwen",
        "xingyi",
        "kanbula",
        "cuihuashan",
        "alxa",
        "keketuohai",
        "funiushan",
        "wangwushan",
        "yimengshan",
        "wugongshan",
        "jiuhuashan",
        "ningde",
        "longyan",
        "guangwushan",
        "xiangxi",
        "yunyang",
        "linxia",
        "kunlunshan",
        "yulongxueshan",
        "cangshan",
        "leiqiong",
        "haikou-volcano",
    ]
    byid = {s["id"]: s for s in sites}
    for i in named:
        if i in byid:
            order.append(byid[i])
    for s in sites:
        if s["id"] not in have and s["id"] not in SKIP and s not in order:
            order.append(s)
    added = 0
    for s in order:
        sid = s["id"]
        if sid in have or sid in SKIP:
            continue
        print("try", sid, s["name"])
        got = False
        for lang, title in titles_for(s):
            info = wiki_summary(lang, title)
            time.sleep(0.25)
            if not info:
                continue
            dest = OUT / f"{sid}.jpg"
            if download(info["url"], dest):
                credits[sid] = {
                    "src": f"/covers/{sid}.jpg",
                    "credit": credit_line(info),
                    "caption": "资料照片，非本站踏勘",
                    "source_page": info.get("title") or "",
                }
                have.add(sid)
                added += 1
                got = True
                break
        if not got:
            for q in commons_queries(s):
                hits = commons_search(q)
                time.sleep(0.25)
                for info in hits:
                    dest = OUT / f"{sid}.jpg"
                    if download(info["url"], dest):
                        credits[sid] = {
                            "src": f"/covers/{sid}.jpg",
                            "credit": info.get("credit") or credit_line(info),
                            "caption": "资料照片，非本站踏勘",
                            "source_page": info.get("title") or q,
                        }
                        have.add(sid)
                        added += 1
                        got = True
                        break
                if got:
                    break
        if not got:
            print("  none")
        if added >= 140:
            break
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
    print("added", added, "credits", len(credits), "have", len(have))


if __name__ == "__main__":
    main()
