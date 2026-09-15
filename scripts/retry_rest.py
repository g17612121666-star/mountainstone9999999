#!/usr/bin/env python3
import json, ssl, time, urllib.parse, urllib.request
from pathlib import Path
OUT = Path("/workspace/public/covers")
UA = "ShanShiZhi/1.0 (field guide; educational)"
CTX = ssl.create_default_context()
TITLES = {
    "xiangxi": ["德夯苗寨", "凤凰古城", "红石林"],
    "leye-fengshan": ["乐业天坑", "大石围", "凤山岩溶"],
    "yunyang": ["云阳龙缸天坑", "云阳恐龙"],
    "zigong": ["自贡恐龙博物馆", "自贡"],
    "xingwen": ["兴文石海", "兴文天坑"],
    "guangwushan": ["光雾山", "诺水河"],
    "xingyi": ["马岭河", "兴义"],
    "zhijindong": ["织金洞"],
    "cangshan": ["大理苍山", "苍山洱海"],
    "cuihuashan": ["翠华山", "终南山"],
    "linxia": ["和政古动物化石博物馆", "临夏"],
    "kanbula": ["坎布拉", "坎布拉丹霞"],
    "kunlunshan": ["昆仑山口", "玉珠峰"],
    "keketuohai": ["可可托海", "额尔齐斯河"],
    "hukou": ["黄河壶口瀑布", "壶口瀑布"],
    "sheshan": ["上海佘山", "西佘山"],
    "zhoukoudian": ["周口店遗址", "北京人遗址"],
    "jixian": ["蓟县中上元古界", "蓟州盘山"],
    "meishan": ["煤山金钉子", "长兴灰岩"],
    "chengjiang": ["澄江化石地", "帽天山"],
    "datong-volcano": ["大同火山群", "大同火山"],
}

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
        return r.read()

def wiki(title):
    api = "https://zh.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
        "action":"query","format":"json","titles":title,"prop":"pageimages",
        "pithumbsize":1280,"piprop":"thumbnail|name",
    })
    data = json.loads(get(api).decode("utf-8","replace"))
    for p in (data.get("query") or {}).get("pages", {}).values():
        th = (p.get("thumbnail") or {}).get("source")
        if th and "svg" not in th:
            return th
    return None

def save(url, dest):
    data = get(url)
    if len(data) < 12000 or data[:1]==b"<":
        return False
    dest.write_bytes(data)
    return dest.stat().st_size > 12000

credits_path = Path("/workspace/data/cover_credits.json")
credits = json.loads(credits_path.read_text()) if credits_path.exists() else {}
for sid, titles in TITLES.items():
    dest = OUT / f"{sid}.jpg"
    if dest.exists() and dest.stat().st_size > 30000:
        print("keep", sid); continue
    print("need", sid)
    ok=False
    for t in titles:
        time.sleep(1.6)
        try:
            u = wiki(t)
        except Exception as e:
            print(" ", t, type(e).__name__); continue
        if not u:
            continue
        print(" ", t, u[-50:])
        try:
            if save(u, dest):
                credits[sid] = {"credit": f"维基百科「{t}」条目配图", "caption":"", "src": f"/covers/{sid}.jpg"}
                print("  ok", dest.stat().st_size); ok=True; break
        except Exception as e:
            print("  save", type(e).__name__)
    if not ok:
        print(" MISS", sid)
credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=2), encoding="utf-8")
print("world missing", [s for s in [
 "xiangxi","leye-fengshan","yunyang","zigong","xingwen","guangwushan","xingyi",
 "zhijindong","cangshan","cuihuashan","linxia","kanbula","kunlunshan","keketuohai"]
 if not (OUT/f"{s}.jpg").exists()])
