#!/usr/bin/env python3
"""Commons fetch that only accepts files whose title contains a park token."""
from __future__ import annotations

import hashlib
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "strict_covers"
PUB = ROOT / "public" / "covers"
SITES = json.loads((ROOT / "data" / "sites.json").read_text())
UA = "ShanShiZhiFieldGuide/1.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()

HONEST = {
    "sheshan", "xixian-loess", "meishan", "qiyunshan",
    "zhengzhou-huanghe", "huanghe-delta",
    "gssp-huangnitang", "gssp-jiangshan", "gssp-huanghuachang",
    "gssp-wangjiawan", "gssp-paibi", "gssp-guzhang",
    "gssp-penglaitan", "gssp-pengchong", "gssp-wuliu",
}

# token that MUST appear in File: title (zh or latin)
MUST = {
    "zhangshiyan": ["嶂石岩", "Zhangshiyan"],
    "luhe": ["桂子山", "六合石柱", "Luhe columnar", "columnar", "石柱林"],
    "huanglong": ["黄龙", "Huanglong"],
    "xiangxi": ["红石林", "古丈"],
    "hongshilin": ["红石林", "古丈"],
    "lufeng": ["禄丰", "Lufengosaurus", "Lufeng"],
    "yanchuan": ["乾坤湾", "延川"],
    "datong-volcano": ["大同火山", "Datong volcano", "大同火山群"],
    "maijishan": ["麦积山", "Maijishan"],
    "luochuan": ["洛川黄土", "Luochuan loess", "洛川"],
    "kongtongshan": ["崆峒山", "Kongtong"],
    "pingshanhu": ["平山湖", "Pingshanhu"],
    "guide": ["贵德", "Guide Yellow", "贵德黄河"],
    "pingtang": ["平塘", "Pingtang", "掌布"],
    "yangshan": ["阳山国家", "阳山地貌", "广东阳山"],
    "fengkai": ["封开", "Fengkai", "斑石"],
    "dapeng": ["大鹏半岛", "大鹏地质", "Dapeng Peninsula"],
    "guiping": ["桂平西山", "桂平"],
    "qijiang": ["綦江", "老瀛山", "Qijiang"],
    "jiangyou": ["窦圌山", "江油窦"],
    "huayingshan": ["华蓥山", "Huaying"],
    "gesala": ["格萨拉", "Gesala"],
    "jimunai": ["吉木乃", "Jimunai"],
    "guanshan": ["辉县关山", "关山地质"],
    "daweishan": ["大围山", "Daweishan", "浏阳大围"],
    "huangsongyu": ["黄松峪", "Huangsongyu"],
    "yunmengshan": ["云蒙山", "Yunmeng"],
    "wuan": ["武安国家地质", "古武当", "武安地质"],
    "qianan": ["迁安地质", "迁安花岗岩"],
    "siping": ["四平山门", "四平地质"],
    "jiguanshan": ["鸡西鸡冠", "密山鸡冠", "鸡冠山国家"],
    "donglan": ["东兰"],
    "luocheng": ["罗城"],
    "xiangxi": ["红石林", "古丈", "芙蓉镇喀斯特"],
    "longwan": ["辉南龙湾", "龙湾火山", "三角龙湾"],
    "jingyu": ["靖宇火山", "靖宇矿泉"],
    "fusong": ["抚松火山", "抚松地质"],
    "shankou": ["黑龙江山口", "山口地质公园"],
    "jinzhou": ["锦州笔架", "锦州地质"],
    "xinglong": ["兴隆溶洞", "兴隆地质"],
    "liujiang": ["柳江盆地", "秦皇岛柳江"],
    "lincheng": ["崆山白云洞", "临城溶洞"],
    "tianshengqiao": ["阜平天生桥", "天生桥 阜平"],
    "xingtai-canyon": ["邢台峡谷", "邢台大峡谷"],
    "youyu": ["右玉火山"],
    "xilinhot": ["阿巴嘎火山", "锡林浩特火山"],
    "qiguoshan": ["七锅山"],
    "wuda": ["乌达植物", "乌达化石"],
    "huludao": ["龙潭大峡谷"],
    "yichun-forest": ["花岗岩石林", "伊春石林"],
    "fenghuangshan-hlj": ["凤凰山国家地质", "鸡西凤凰"],
    "qinggang": ["青冈猛犸", "青冈化石"],
    "xinchang": ["新昌硅化木"],
    "cangnan-fanshan": ["矾山", "明矾石"],
    "fushan": ["浮山 火山", "安徽浮山"],
    "fengyangshan": ["凤阳山"],
    "marenshan": ["马仁山"],
    "shitai": ["石台溶洞", "蓬莱洞"],
    "zhangzhou-volcano": ["漳州火山", "南碇岛", "滨海火山"],
    "shenhuwan": ["深沪湾"],
    "tianedong": ["天鹅洞"],
    "shiniushan": ["石牛山"],
    "baishuiyang": ["白水洋"],
    "baiyunshan-fj": ["福建白云山"],
    "lingtongshan": ["灵通山"],
    "fozishan": ["佛子山"],
    "qingliu": ["清流温泉"],
    "sanming-jiaoye": ["三明郊野"],
    "sanduao": ["三都澳"],
    "guantaishan": ["官台山"],
    "shicheng": ["石城丹霞"],
    "laiyang": ["莱阳白垩", "莱阳恐龙"],
    "yiyuan": ["沂源鲁山", "沂源溶洞"],
    "changle-volcano": ["昌乐火山"],
    "wulianshan": ["五莲山", "九仙山"],
    "baotianman": ["宝天曼"],
    "chayashan": ["嵖岈山"],
    "shenlingzhai": ["神灵寨"],
    "daimeishan": ["黛眉山"],
    "jingangtai": ["金刚台"],
    "xiaoqinling": ["小秦岭"],
    "linlushan": ["林虑山", "红旗渠"],
    "ruyang": ["汝阳恐龙"],
    "mulanshan": ["木兰山"],
    "yunxian": ["郧县恐龙蛋", "青龙山恐龙蛋"],
    "wudangshan": ["武当山"],
    "wufeng": ["五峰"],
    "yuanan": ["远安化石"],
    "feitianshan": ["飞天山"],
    "fenghuang": ["凤凰南华山"],
    "jiubujiang": ["酒埠江"],
    "wulongshan": ["乌龙山"],
    "meijiang": ["湄江"],
    "shiniuzhai": ["石牛寨"],
    "wanfoshan": ["万佛山"],
    "xuefenghu": ["雪峰湖"],
    "baishuidong": ["白水洞"],
    "lingxiaoyan": ["凌霄岩"],
    "enping": ["恩平温泉"],
    "qinglan": ["青岚"],
    "ziyuan": ["资源八角寨", "八角寨"],
    "fengshan": ["凤山三门海", "凤山岩溶"],
    "xiangqiao": ["香桥"],
    "qibailong": ["七百弄"],
    "yizhou-shilin": ["宜州石林", "水上石林"],
    "wuhuangshan": ["五皇山"],
    "baisha-crater": ["白沙陨石"],
    "xiaonanhai": ["小南海"],
    "wansheng": ["万盛石林", "黑山谷"],
    "qiyaoshan": ["七曜山"],
    "longmenshan": ["龙门山"],
    "anxiang": ["生物礁"],
    "shehong": ["射洪硅化木"],
    "dabashan": ["大巴山"],
    "qingchuan": ["青川地震", "东河口"],
    "mianzhu": ["汉旺", "清平"],
    "daguglacier": ["达古冰川", "Dagu Glacier"],
    "guanling": ["关岭化石"],
    "shuanghedong": ["双河洞"],
    "wumengshan": ["乌蒙山", "韭菜坪"],
    "sinan": ["思南"],
    "miaoling": ["苗岭"],
    "getuhe": ["格凸河", "Getu"],
    "laojunshan": ["黎明丹霞", "老君山"],
    "jiuxiang": ["九乡"],
    "luoping": ["罗平生物群", "罗平化石"],
    "dongchuan": ["东川泥石流", "蒋家沟"],
    "weishan": ["巍山"],
    "yigong": ["易贡"],
    "zhada": ["札达土林", "Zanda"],
    "everest-ordovician": ["珠穆朗玛", "Everest"],
    "rongbuk": ["绒布", "Rongbuk"],
    "yanchuan": ["乾坤湾", "延川"],
    "jinsixia": ["金丝峡"],
    "nangongshan": ["南宫山"],
    "liping": ["黎坪"],
    "liujiaxia": ["刘家峡恐龙"],
    "bingling": ["炳灵丹霞"],
    "guangeogou": ["官鹅沟"],
    "yeliguan": ["冶力关"],
    "hezheng": ["和政化石", "和政古动物"],
    "animaging": ["阿尼玛卿", "Anyemaqen"],
    "huoshizhai": ["火石寨"],
    "qitai": ["奇台硅化木", "硅化木"],
    "bagongshan": ["八公山"],
    "taijidong": ["太极洞"],
    "ningcheng": ["宁城", "道虎沟"],
}

BAD_CN = ("寺", "庙", "教堂", "地图", "牌坊", "大门", "塑像", "古城", "故居",
          "水电站", "火车站", "机场", "望远镜", "自行车", "鲜花", "墓", "夜景",
          "雕像", "雕塑", "展厅", "题刻", "玻璃桥", "索道站")
BAD_EN = ("map", "logo", "statue", "temple", "church", "gate", "airport",
          "railway", "station", "hydroelectric", "telescope", "insect",
          "portrait", "painting", "bicycle", "cemetery", "museum interior",
          "pagoda", "monastery", "night", "flower", "blossom", "cableway",
          "bridge", "cityscape")


def get(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def bad(s: str) -> bool:
    low = (s or "").lower()
    return any(b in (s or "") for b in BAD_CN) or any(b in low for b in BAD_EN)


def artist(meta: dict) -> str:
    a = re.sub(r"<[^>]+>", " ", (meta.get("Artist") or {}).get("value") or "")
    a = " ".join(a.split())[:80]
    lic = re.sub(r"<[^>]+>", " ", (meta.get("LicenseShortName") or {}).get("value") or "")
    return ", ".join(x for x in (a, lic, "Wikimedia Commons") if x)


def search(q: str, n: int = 10) -> list[str]:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "query", "list": "search", "srsearch": q, "srnamespace": 6,
         "srlimit": n, "format": "json"}
    )
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return []
    return [h["title"] for h in (data.get("query") or {}).get("search") or [] if h.get("title", "").startswith("File:")]


def wiki_title(lang: str, title: str) -> str | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return None
    desc = (data.get("description") or "") + " " + (data.get("extract") or "")[:160]
    if any(x in desc.lower() for x in ("county", "city in china", "district of")):
        return None
    img = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if not img:
        return None
    return "File:" + urllib.parse.unquote(Path(urllib.parse.urlparse(img).path).name)


def imageinfo(titles: list[str]) -> list[dict]:
    if not titles:
        return []
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "query", "format": "json", "titles": "|".join(titles[:15]),
         "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1600}
    )
    try:
        data = json.loads(get(url).decode())
    except Exception:
        return []
    rows = []
    for page in ((data.get("query") or {}).get("pages") or {}).values():
        title = page.get("title") or ""
        info = (page.get("imageinfo") or [{}])[0]
        if "jpeg" not in (info.get("mime") or ""):
            continue
        if (info.get("width") or 0) < 500:
            continue
        if bad(title):
            continue
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        rows.append({"title": title, "url": thumb, "credit": artist(info.get("extmetadata") or {})})
    return rows


def tokens_ok(title: str, tokens: list[str]) -> bool:
    t = title
    tl = title.lower()
    for tok in tokens:
        if len(tok) < 2:
            continue
        if tok.lower() in tl or tok in t:
            return True
    return False


def hashes() -> dict[str, str]:
    h = {}
    for folder in (PUB, OUT):
        if not folder.exists():
            continue
        for p in folder.glob("*.jpg"):
            h[hashlib.md5(p.read_bytes()).hexdigest()] = p.name
    return h


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    used = hashes()
    have = {p.stem for p in PUB.glob("*.jpg")}
    targets = [s for s in SITES if s["id"] not in HONEST and s["id"] not in have]
    print("strict targets", len(targets))
    log = []
    for i, s in enumerate(targets, 1):
        sid = s["id"]
        toks = MUST.get(sid) or []
        sn = s["name"].replace("国家地质公园", "").replace("世界地质公园", "").replace("地质公园", "")
        toks = toks + [sn]
        queries = MUST.get(sid) or [sn]
        print(f"[{i}/{len(targets)}] {sid}", flush=True)
        titles: list[str] = []
        for q in queries[:4]:
            titles += search(q, 8)
            wf = wiki_title("zh", q)
            if wf:
                titles.append(wf)
            time.sleep(0.08)
        seen, uniq = set(), []
        for t in titles:
            if t not in seen:
                seen.add(t)
                uniq.append(t)
        uniq = [t for t in uniq if tokens_ok(t, toks) and not bad(t)]
        infos = []
        for j in range(0, min(len(uniq), 16), 8):
            infos += imageinfo(uniq[j:j+8])
        picked = None
        for info in infos:
            if not tokens_ok(info["title"], toks):
                continue
            try:
                data = get(info["url"])
            except Exception:
                continue
            if len(data) < 20000 or data[:2] != b"\xff\xd8":
                continue
            h = hashlib.md5(data).hexdigest()
            if h in used:
                continue
            dest = OUT / f"{sid}.jpg"
            dest.write_bytes(data)
            used[h] = dest.name
            picked = {"id": sid, "commons": info["title"], "credit": info["credit"], "bytes": len(data)}
            break
        if picked:
            print("  OK", picked["commons"], picked["bytes"])
            log.append(picked)
        else:
            print("  none")
    (OUT / "log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2))
    print("strict wrote", len(log))


if __name__ == "__main__":
    from pathlib import Path
    main()
