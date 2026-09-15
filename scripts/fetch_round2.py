#!/usr/bin/env python3
"""Round-2 cover fetch: Commons + Wikipedia + Openverse, curated queries.

Downloads candidates to artifacts/round2/{slug}/ and writes meta.json.
Does NOT overwrite public/covers until a human/agent visual check.
"""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "round2"
UA = "ShanShiZhiFieldGuide/2.0 (https://shanshizhi.grok.me; educational CC-aware fetch)"
CTX = ssl.create_default_context()

# Parks that already have an accepted own cover in public/covers — skip.
SKIP_DONE = {
    "luhe", "zhangshiyan",  # already in cover_credits + jpg; inventory stale
}

# Honest schematic leftovers that previous round reserved: still TRY this round
# (user explicitly asked to retry 六合/嶂石岩/佘山/煤山/隰县 via levels 4–7).

BAD_TITLE = re.compile(
    r"(map|logo|flag|coat of arms|location|locator|diagram|svg|"
    r"museum interior|visitor.?center|游客服务|售票|大门|牌坊|题名|"
    r"塑像|雕像|statue|temple hall|大殿|牌楼|公路 - |隧道|tunnel|"
    r"火车站|railway station|street view|解放路|"
    r"people.?s.?court|法庭|墓地|tomb|grave|"
    r"延庆硅化木|安阳小南海|河南.?老君山|"
    r"台湾|taiwan|gesala quintana|getu feleke|austin zanda|"
    r"marathon|界碑)",
    re.I,
)

QUERIES: dict[str, list[str]] = {
    "huangsongyu": ["黄松峪", "平谷黄松峪", "Huangsongyu"],
    "tianshengqiao": ["阜平天生桥", "阜平天生桥国家地质公园"],
    "liujiang": ["柳江盆地", "秦皇岛柳江", "Liujiang Basin Qinhuangdao"],
    "lincheng": ["崆山白云洞", "临城溶洞", "Kongshan Baiyun Cave"],
    "wuan": ["武安古武当山", "古武当山", "武安国家地质公园"],
    "xinglong": ["兴隆溶洞", "兴隆国家地质公园 溶洞", "河北兴隆溶洞"],
    "qianan": ["迁安花岗岩", "迁安国家地质公园", "迁安红峪口"],
    "xingtai-canyon": ["邢台峡谷群", "邢台大峡谷", "Xingtai Grand Canyon"],
    "datong-volcano": ["大同火山群", "大同火山", "Datong volcano", "山西大同火山金山"],
    "youyu": ["右玉火山颈", "右玉火山", "杀虎口火山"],
    "xixian-loess": ["隰县黄土", "隰县黄土地质公园", "黄土塬 隰县"],
    "ningcheng": ["宁城国家地质公园", "宁城道虎沟", "道虎沟化石"],
    "xilinhot": ["阿巴嘎火山", "锡林浩特火山", "锡林郭勒火山"],
    "qiguoshan": ["七锅山", "巴林左旗七锅山"],
    "wuda": ["乌达植物庞贝", "乌达化石森林", "Wuda vegetational Pompeii"],
    "jinzhou": ["锦州笔架山", "笔架山 锦州", "Jinzhou Bijia Mountain"],
    "huludao": ["葫芦岛龙潭大峡谷", "龙潭大峡谷 葫芦岛"],
    "jingyu": ["靖宇火山", "靖宇矿泉", "靖宇火山矿泉群"],
    "fusong": ["抚松火山", "抚松地质公园", "抚松玄武岩"],
    "siping": ["四平山门", "山门水库 四平", "四平地质公园 山门"],
    "longwan": ["辉南龙湾", "三角龙湾", "龙湾火山", "Huinan Longwan"],
    "yichun-forest": ["伊春花岗岩石林", "汤旺河石林", "汤旺河国家公园 石林"],
    "fenghuangshan-hlj": ["黑龙江凤凰山", "鸡西凤凰山", "凤凰山国家地质公园 黑龙江"],
    "shankou": ["克东山口", "黑龙江山口地质公园", "五大连池山口"],
    "qinggang": ["青冈猛犸", "青冈猛犸象"],
    "jiguanshan": ["鸡冠山国家地质公园", "密山鸡冠山", "鸡西鸡冠山"],
    "sheshan": ["佘山 松江", "西佘山", "Sheshan Shanghai", "佘山火山岩"],
    "xinchang": ["新昌硅化木", "新昌硅化木国家地质公园"],
    "cangnan-fanshan": ["苍南矾山", "矾山矿", "苍南明矾石"],
    "meishan": ["煤山剖面", "长兴煤山", "Meishan GSSP", "Changhsingian GSSP", "煤山金钉子"],
    "gssp-huangnitang": ["黄泥塘金钉子", "Huangnitang GSSP", "Darriwilian GSSP Huangnitang"],
    "gssp-jiangshan": ["江山碓边", "Duibian GSSP", "Jiangshanian GSSP"],
    "qiyunshan": ["齐云山", "齐云山丹霞", "Qiyun Shan", "Qiyunshan"],
    "fushan": ["安徽浮山", "枞阳浮山", "浮山火山", "Fushan Zongyang"],
    "fengyangshan": ["凤阳山 安徽", "凤阳韭山", "凤阳山国家地质公园"],
    "taijidong": ["广德太极洞", "太极洞 钟乳", "Taiji Cave Guangde"],
    "marenshan": ["繁昌马仁山", "马仁山地质公园"],
    "shitai": ["石台溶洞", "石台蓬莱仙洞", "石台鱼龙洞"],
    "shenhuwan": ["深沪湾", "晋江深沪湾", "深沪湾硅化木"],
    "tianedong": ["宁化天鹅洞", "天鹅洞群"],
    "shiniushan": ["德化石牛山", "石牛山 德化"],
    "baiyunshan-fj": ["福安白云山", "白云山 福安 地质"],
    "lingtongshan": ["平和灵通山", "灵通山 丹霞", "灵通岩"],
    "fozishan": ["政和佛子山", "佛子山地质公园"],
    "qingliu": ["清流温泉", "清流地质公园"],
    "sanming-jiaoye": ["三明郊野地质公园", "三明溶洞"],
    "sanduao": ["三都澳", "宁德三都澳", "三都澳海岸"],
    "guantaishan": ["寿宁官台山", "官台山地质"],
    "shicheng": ["石城丹霞", "江西石城 通天寨"],
    "xiongershan": ["抱犊崮", "熊耳山 枣庄", "Baodugu"],
    "huanghe-delta": ["黄河三角洲", "东营黄河三角洲", "Yellow River Delta wetland"],
    "laiyang": ["莱阳恐龙", "莱阳白垩纪", "王氏群 莱阳"],
    "yiyuan": ["沂源溶洞", "沂源鲁山", "沂源猿人洞"],
    "changle-volcano": ["昌乐火山", "昌乐玄武岩", "昌乐火山口"],
    "wulianshan": ["五莲山", "九仙山 五莲", "Wulian Mountain"],
    "yishan": ["邹城峄山", "峄山 花岗岩", "Yishan Zoucheng"],
    "baotianman": ["宝天曼", "内乡宝天曼"],
    "chayashan": ["嵖岈山", "遂平嵖岈山", "Chaya Mountain"],
    "zhengzhou-huanghe": ["郑州黄河", "花园口", "郑州黄河地质公园"],
    "guanshan": ["辉县关山", "关山地质公园 河南"],
    "shenlingzhai": ["神灵寨", "洛宁神灵寨"],
    "daimeishan": ["黛眉山", "新安黛眉山"],
    "jingangtai": ["金刚台", "商城金刚台"],
    "xiaoqinling": ["小秦岭", "灵宝小秦岭"],
    "ruyang": ["汝阳恐龙", "汝阳巨型恐龙"],
    "mulanshan": ["木兰山 武汉", "黄陂木兰山"],
    "yunxian": ["郧县恐龙蛋", "青龙山恐龙蛋", "郧阳恐龙蛋"],
    "wudangshan": ["武当山", "Wudang Mountains", "Wudangshan"],
    "wufeng": ["五峰后河", "五峰地质公园", "湖北五峰喀斯特"],
    "yuanan": ["远安化石", "远安盐池河"],
    "gssp-huanghuachang": ["黄花场金钉子", "Huanghuachang GSSP", "Dapingian GSSP"],
    "gssp-wangjiawan": ["王家湾金钉子", "Wangjiawan GSSP", "Hirnantian GSSP"],
    "feitianshan": ["郴州飞天山", "飞天山丹霞", "Feitianshan"],
    "fenghuang": ["凤凰南华山", "凤凰地质公园 喀斯特", "凤凰县 奇梁洞"],
    "hongshilin": ["古丈红石林", "红石林 古丈", "Hongshilin"],
    "jiubujiang": ["酒埠江", "攸县酒埠江"],
    "wulongshan": ["乌龙山 龙山", "湖南乌龙山"],
    "meijiang": ["湄江 涟源", "湄江国家地质公园"],
    "shiniuzhai": ["平江石牛寨", "石牛寨丹霞"],
    "daweishan": ["浏阳大围山", "大围山 花岗岩"],
    "wanfoshan": ["通道万佛山", "万佛山丹霞", "Wanfoshan Tongdao"],
    "xuefenghu": ["安化雪峰湖", "雪峰湖地质公园"],
    "baishuidong": ["新邵白水洞", "白水洞 湖南"],
    "gssp-paibi": ["排碧金钉子", "Paibi GSSP", "Paibian GSSP"],
    "gssp-guzhang": ["罗依溪金钉子", "Guzhangian GSSP", "古丈金钉子"],
    "lingxiaoyan": ["阳春凌霄岩", "凌霄岩 溶洞"],
    "dapeng": ["大鹏半岛 海岸", "大鹏半岛地质公园", "Dapeng Peninsula", "西涌 火山"],
    "fengkai": ["封开斑石", "封开国家地质公园", "封开大斑石"],
    "enping": ["恩平温泉", "恩平地质公园", "恩平金山温泉"],
    "yangshan": ["阳山国家地质公园", "阳山喀斯特", "广东阳山"],
    "qinglan": ["饶平青岚", "青岚地质公园", "饶平火山"],
    "ziyuan": ["资源八角寨", "八角寨丹霞", "资江丹霞", "Ziyuan Danxia"],
    "fengshan": ["凤山岩溶", "凤山三门海", "Fengshan karst"],
    "qibailong": ["七百弄", "大化七百弄", "高峰丛"],
    "guiping": ["桂平西山", "桂平国家地质公园"],
    "yizhou-shilin": ["宜州水上石林", "宜州石林"],
    "wuhuangshan": ["浦北五皇山", "五皇山地质公园"],
    "luocheng": ["罗城地质公园", "罗城喀斯特", "罗城怀群"],
    "donglan": ["东兰国家地质公园", "东兰喀斯特"],
    "gssp-penglaitan": ["蓬莱滩金钉子", "Penglaitan GSSP", "Wuchiapingian GSSP"],
    "gssp-pengchong": ["碰冲金钉子", "Pengchong GSSP", "Visean GSSP Pengchong"],
    "baisha-crater": ["白沙陨石坑", "海南白沙陨石坑"],
    "xiaonanhai": ["黔江小南海", "小南海地震堰塞湖"],
    "wansheng": ["万盛石林", "万盛国家地质公园", "黑山谷"],
    "qijiang": ["綦江老瀛山", "老瀛山丹霞", "綦江木化石"],
    "qiyaoshan": ["石柱七曜山", "七曜山地质公园"],
    "anxiang": ["安县生物礁", "安州生物礁", "安县雎水"],
    "shehong": ["射洪硅化木", "射洪硅化木国家地质公园"],
    "huayingshan": ["华蓥山石林", "华蓥山天池石林", "华蓥山地质公园"],
    "jiangyou": ["江油窦圌山", "窦圌山", "江油国家地质公园"],
    "dabashan": ["通江大巴山", "大巴山国家地质公园 四川", "诺水河"],
    "qingchuan": ["青川地震遗迹", "青川东河口"],
    "mianzhu": ["汉旺地震", "绵竹清平", "汉旺钟楼"],
    "gesala": ["盐边格萨拉", "格萨拉地质公园"],
    "guanling": ["关岭化石", "关岭生物群", "Guanling biota"],
    "shuanghedong": ["绥阳双河洞", "双河洞", "Shuanghe Cave"],
    "wumengshan": ["乌蒙山国家地质公园", "六盘水乌蒙山"],
    "pingtang": ["平塘掌布", "掌布藏字石", "平塘喀斯特"],
    "sinan": ["思南乌江", "思南喀斯特", "思南石林"],
    "miaoling": ["苗岭国家地质公园", "黔东南苗岭", "凯里地质公园"],
    "getuhe": ["格凸河", "紫云格凸河", "Getu River", "Getu cave"],
    "gssp-wuliu": ["乌溜曾家岩", "Wuliu-Zengjiayan", "Wuliuan GSSP"],
    "laojunshan": ["黎明丹霞", "玉龙黎明", "老君山 黎明", "Liming Danxia"],
    "luoping": ["罗平生物群", "罗平鱼化石", "Luoping biota"],
    "dongchuan": ["东川泥石流", "蒋家沟", "东川红土地", "Jiangjiagou"],
    "yigong": ["易贡滑坡", "易贡国家地质公园", "易贡藏布"],
    "zhada": ["札达土林", "Zanda earth forest", "札达土林国家地质公园", "古格土林"],
    "luochuan": ["洛川黄土", "洛川黄土国家地质公园", "Luochuan loess"],
    "jinsixia": ["商南金丝峡", "金丝峡 峡谷"],
    "nangongshan": ["岚皋南宫山", "南宫山地质公园"],
    "liping": ["汉中黎坪", "黎坪国家地质公园"],
    "liujiaxia": ["刘家峡恐龙", "永靖恐龙足迹", "Liujiaxia dinosaur"],
    "kongtongshan": ["崆峒山", "平凉崆峒山", "Kongtong Shan"],
    "bingling": ["炳灵丹霞", "永靖炳灵", "炳灵寺丹霞"],
    "guangeogou": ["宕昌官鹅沟", "官鹅沟"],
    "yeliguan": ["冶力关", "临潭冶力关"],
    "pingshanhu": ["平山湖大峡谷", "张掖平山湖", "Pingshanhu"],
    "hezheng": ["和政化石", "和政古动物", "Hezheng fossils"],
    "huoshizhai": ["火石寨", "西吉火石寨", "Huoshizhai Danxia"],
    "qitai": ["奇台硅化木", "奇台魔鬼城 硅化木", "Qitai petrified wood", "硅化木园 奇台"],
    "jimunai": ["吉木乃石城", "草原石城", "吉木乃地质公园"],
}


def get(url: str, timeout: int = 40) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json,image/*,*/*",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def commons_search(q: str, limit: int = 8) -> list[dict]:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  commons fail", q, type(e).__name__, e)
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in pages.values():
        title = p.get("title") or ""
        info = (p.get("imageinfo") or [{}])[0]
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if BAD_TITLE.search(title):
            continue
        size = info.get("size") or 0
        if size and size < 12000:
            continue
        meta = info.get("extmetadata") or {}
        lic = (meta.get("LicenseShortName") or {}).get("value") or ""
        artist = re.sub(r"<[^>]+>", " ", (meta.get("Artist") or {}).get("value") or "")
        artist = re.sub(r"\s+", " ", artist).strip()
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        out.append(
            {
                "title": title,
                "url": thumb,
                "license": lic,
                "artist": artist,
                "source": "commons",
                "query": q,
            }
        )
    return out


def wiki_pageimage(title: str, lang: str = "zh") -> dict | None:
    api = f"https://{lang}.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "pageimages|pageterms",
            "pithumbsize": 1600,
            "piprop": "thumbnail|name|original",
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception:
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        name = p.get("pageimage") or ""
        if not name or BAD_TITLE.search(name):
            continue
        th = p.get("thumbnail") or {}
        src = th.get("source")
        orig = (p.get("original") or {}).get("source") or src
        if not src:
            continue
        return {
            "title": f"File:{name}",
            "url": orig or src,
            "license": "see wiki file page",
            "artist": f"{lang}.wikipedia pageimage",
            "source": f"wikipedia-{lang}",
            "query": title,
        }
    return None


def openverse_search(q: str, limit: int = 5) -> list[dict]:
    api = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {
            "q": q,
            "license_type": "all",
            "category": "photograph",
            "page_size": limit,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  openverse fail", q, type(e).__name__)
        return []
    out = []
    for r in data.get("results") or []:
        title = r.get("title") or ""
        if BAD_TITLE.search(title):
            continue
        url = r.get("url") or r.get("thumbnail")
        if not url:
            continue
        out.append(
            {
                "title": title,
                "url": url,
                "license": r.get("license") or "",
                "artist": r.get("creator") or "",
                "source": "openverse:" + (r.get("source") or ""),
                "query": q,
                "foreign": r.get("foreign_landing_url") or "",
            }
        )
    return out


def download(url: str, dest: Path) -> bool:
    try:
        data = get(url, timeout=50)
    except Exception as e:
        print("   dl fail", dest.name, type(e).__name__)
        return False
    if len(data) < 8000:
        return False
    if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n" and data[:4] != b"RIFF":
        return False
    dest.write_bytes(data)
    return True


def run_one(slug: str, queries: list[str]) -> list[dict]:
    dest_dir = OUT / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    seen = set()
    kept: list[dict] = []
    # 1 Commons
    for q in queries:
        for hit in commons_search(q):
            key = hit["title"]
            if key in seen:
                continue
            seen.add(key)
            n = len(kept)
            ext = ".jpg"
            path = dest_dir / f"{n:02d}{ext}"
            if download(hit["url"], path):
                hit["file"] = str(path)
                hit["bytes"] = path.stat().st_size
                kept.append(hit)
                print(f"   + {slug} commons {path.name} {hit['title'][:60]}")
            if len(kept) >= 4:
                break
        if len(kept) >= 4:
            break
        time.sleep(0.15)
    # 2 Wikipedia pageimage
    if len(kept) < 2:
        for q in queries[:3]:
            for lang in ("zh", "en"):
                hit = wiki_pageimage(q, lang)
                if not hit:
                    continue
                key = hit["title"]
                if key in seen:
                    continue
                seen.add(key)
                n = len(kept)
                path = dest_dir / f"{n:02d}.jpg"
                if download(hit["url"], path):
                    hit["file"] = str(path)
                    hit["bytes"] = path.stat().st_size
                    kept.append(hit)
                    print(f"   + {slug} wiki {path.name} {hit['title'][:60]}")
                    break
            if len(kept) >= 2:
                break
    # 3 Openverse
    if len(kept) < 2:
        for q in queries[:2]:
            for hit in openverse_search(q):
                key = hit["title"] + hit["url"]
                if key in seen:
                    continue
                seen.add(key)
                n = len(kept)
                path = dest_dir / f"{n:02d}.jpg"
                if download(hit["url"], path):
                    hit["file"] = str(path)
                    hit["bytes"] = path.stat().st_size
                    kept.append(hit)
                    print(f"   + {slug} openverse {path.name} {hit['title'][:60]}")
                if len(kept) >= 3:
                    break
            if len(kept) >= 3:
                break
            time.sleep(0.2)
    (dest_dir / "meta.json").write_text(json.dumps(kept, ensure_ascii=False, indent=2))
    return kept


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {}
    for slug, qs in QUERIES.items():
        if slug in SKIP_DONE:
            continue
        existing = OUT / slug / "meta.json"
        if existing.exists():
            try:
                old = json.loads(existing.read_text())
                if old:
                    print(" skip", slug, len(old))
                    summary[slug] = old
                    continue
            except Exception:
                pass
        print("==", slug)
        kept = run_one(slug, qs)
        summary[slug] = [{"title": k.get("title"), "source": k.get("source"), "license": k.get("license"), "file": k.get("file"), "bytes": k.get("bytes")} for k in kept]
        time.sleep(0.1)
    (OUT / "summary.json").write_text(json.dumps({k: len(v) for k, v in summary.items()}, ensure_ascii=False, indent=2))
    got = sum(1 for v in summary.values() if v)
    print("DONE parks-with-candidates", got, "/", len(QUERIES) - len(SKIP_DONE))


if __name__ == "__main__":
    main()
