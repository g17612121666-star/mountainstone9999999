#!/usr/bin/env python3
"""Fast Wikipedia pageimages + explicit Commons filenames for schematic parks."""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "explicit2"
UA = "ShanShiZhiFieldGuide/2.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()

# slug -> (wiki titles to try, commons filenames to try)
PLAN: dict[str, tuple[list[tuple[str, str]], list[str]]] = {
    "qiyunshan": ([("zh", "齐云山"), ("en", "Mount Qiyun")], ["齐云山.jpg", "Qiyunshan.jpg", "Mount_Qiyun.jpg"]),
    "wudangshan": ([("zh", "武当山"), ("en", "Wudang Mountains")], ["武当山.jpg", "Wudangshan.jpg", "Wudang_Mountains.jpg"]),
    "kongtongshan": ([("zh", "崆峒山"), ("en", "Kongtong Mountains")], ["崆峒山.jpg", "Kongtong_Mountain.jpg"]),
    "zhada": ([("zh", "札达土林"), ("en", "Zanda County"), ("zh", "古格王国")], ["扎达土林.jpg", "札达土林.jpg", "Tsaparang.jpg"]),
    "datong-volcano": ([("zh", "大同火山群")], ["大同火山群.jpg", "大同火山.jpg"]),
    "sheshan": ([("zh", "佘山"), ("en", "She Shan")], ["佘山.jpg", "Sheshan.jpg", "West_Sheshan.jpg", "She_Shan.jpg"]),
    "meishan": ([("zh", "长兴县"), ("en", "Changhsingian")], ["Meishan_section.jpg", "煤山剖面.jpg"]),
    "luochuan": ([("zh", "洛川县"), ("en", "Luochuan County")], ["洛川黄土.jpg", "Luochuan_loess.jpg"]),
    "fushan": ([("zh", "浮山 (安徽)")], ["安徽浮山.jpg", "枞阳浮山.jpg"]),
    "chayashan": ([("zh", "嵖岈山")], ["嵖岈山.jpg"]),
    "yishan": ([("zh", "峄山")], ["峄山.jpg", "邹城峄山.jpg"]),
    "xiongershan": ([("zh", "抱犊崮")], ["抱犊崮.jpg", "Baodugu.jpg"]),
    "ziyuan": ([("zh", "八角寨"), ("zh", "资源县")], ["八角寨.jpg", "资源八角寨.jpg"]),
    "feitianshan": ([("zh", "飞天山")], ["飞天山.jpg", "郴州飞天山.jpg"]),
    "huoshizhai": ([("zh", "火石寨国家森林公园")], ["火石寨.jpg", "西吉火石寨.jpg"]),
    "wanfoshan": ([("zh", "万佛山 (湖南)")], ["通道万佛山.jpg", "万佛山.jpg"]),
    "getuhe": ([("zh", "格凸河"), ("en", "Getu River")], ["格凸河.jpg", "Getu_River.jpg"]),
    "laojunshan": ([("zh", "黎明乡"), ("en", "Liming, Yulong County")], ["黎明丹霞.jpg", "Liming_Danxia.jpg"]),
    "pingshanhu": ([("zh", "平山湖大峡谷")], ["平山湖大峡谷.jpg", "平山湖.jpg"]),
    "dapeng": ([("zh", "大鹏半岛"), ("en", "Dapeng Peninsula")], ["大鹏半岛.jpg", "Dapeng_Peninsula.jpg"]),
    "huangsongyu": ([("zh", "黄松峪乡")], ["黄松峪.jpg"]),
    "lincheng": ([("zh", "崆山白云洞")], ["崆山白云洞.jpg"]),
    "wuan": ([("zh", "古武当山")], ["古武当山.jpg"]),
    "jinzhou": ([("zh", "笔架山 (锦州)"), ("en", "Bijia Mountain")], ["笔架山.jpg", "Bijia_Mountain.jpg"]),
    "longwan": ([("zh", "龙湾群国家森林公园")], ["三角龙湾.jpg", "辉南龙湾.jpg"]),
    "siping": ([("zh", "山门镇 (四平市)")], ["四平山门.jpg"]),
    "qianan": ([("zh", "迁安市")], []),
    "shuanghedong": ([("zh", "双河洞")], ["双河洞.jpg", "Shuanghe_Cave.jpg"]),
    "xiaonanhai": ([("zh", "小南海 (重庆)")], ["黔江小南海.jpg"]),
    "fengkai": ([("zh", "封开县")], ["封开大斑石.jpg"]),
    "jiangyou": ([("zh", "窦圌山")], ["窦圌山.jpg"]),
    "huayingshan": ([("zh", "华蓥山")], ["华蓥山.jpg", "华蓥山石林.jpg"]),
    "dongchuan": ([("zh", "东川红土地"), ("zh", "蒋家沟")], ["东川红土地.jpg", "Dongchuan_red_land.jpg"]),
    "qitai": ([("zh", "奇台硅化木-恐龙国家地质公园")], ["奇台硅化木.jpg"]),
    "yichun-forest": ([("zh", "汤旺河林海奇石")], ["汤旺河石林.jpg"]),
    "wulianshan": ([("zh", "五莲山"), ("zh", "九仙山 (五莲)")], ["五莲山.jpg", "九仙山.jpg"]),
    "mulanshan": ([("zh", "木兰山")], ["木兰山.jpg", "黄陂木兰山.jpg"]),
    "xinchang": ([("zh", "新昌硅化木")], ["新昌硅化木.jpg"]),
    "shenhuwan": ([("zh", "深沪湾")], ["深沪湾.jpg"]),
    "sanduao": ([("zh", "三都澳")], ["三都澳.jpg"]),
    "cangnan-fanshan": ([("zh", "矾山镇 (苍南县)")], ["苍南矾山.jpg"]),
    "taijidong": ([("zh", "太极洞")], ["广德太极洞.jpg"]),
    "xingtai-canyon": ([("zh", "邢台大峡谷")], ["邢台大峡谷.jpg"]),
    "tianshengqiao": ([("zh", "阜平县")], ["阜平天生桥.jpg"]),
    "wansheng": ([("zh", "万盛石林")], ["万盛石林.jpg"]),
    "hongshilin": ([("zh", "红石林")], ["古丈红石林.jpg"]),
    "qibailong": ([("zh", "七百弄")], ["七百弄.jpg"]),
    "fengshan": ([("zh", "凤山县")], ["凤山三门海.jpg"]),
    "jinsixia": ([("zh", "金丝峡")], ["商南金丝峡.jpg"]),
    "bingling": ([("zh", "炳灵寺"), ("en", "Bingling Temple")], ["炳灵寺.jpg", "Bingling_Temple.jpg"]),
    "guangeogou": ([("zh", "官鹅沟")], ["官鹅沟.jpg"]),
    "yeliguan": ([("zh", "冶力关镇")], ["冶力关.jpg"]),
    "hezheng": ([("zh", "和政古动物化石博物馆")], []),
    "qingchuan": ([("zh", "东河口地震遗址")], ["青川东河口.jpg"]),
    "mianzhu": ([("zh", "汉旺镇")], ["汉旺钟楼.jpg"]),
    "zhengzhou-huanghe": ([("zh", "花园口"), ("zh", "郑州黄河风景名胜区")], ["花园口.jpg"]),
    "huanghe-delta": ([("zh", "黄河三角洲"), ("en", "Yellow River Delta")], ["黄河三角洲.jpg", "Yellow_River_Delta.jpg"]),
    "xixian-loess": ([("zh", "隰县")], []),
    "meijiang": ([("zh", "湄江风景区")], ["湄江.jpg"]),
    "lingtongshan": ([("zh", "灵通岩")], ["平和灵通山.jpg"]),
    "changle-volcano": ([("zh", "昌乐县")], ["昌乐火山.jpg"]),
    "laiyang": ([("zh", "莱阳恐龙国家地质公园")], []),
    "yunxian": ([("zh", "青龙山恐龙蛋化石群")], []),
    "pingtang": ([("zh", "掌布乡")], ["平塘掌布.jpg"]),
    "sinan": ([("zh", "思南石林")], ["思南石林.jpg"]),
    "nangongshan": ([("zh", "南宫山")], ["岚皋南宫山.jpg"]),
    "liping": ([("zh", "黎坪国家森林公园")], ["黎坪.jpg"]),
    "liujiaxia": ([("zh", "刘家峡恐龙国家地质公园")], []),
    "qijiang": ([("zh", "老瀛山")], ["綦江老瀛山.jpg"]),
    "shehong": ([("zh", "射洪市")], ["射洪硅化木.jpg"]),
    "ningcheng": ([("zh", "道虎沟化石层")], []),
    "liujiang": ([("zh", "柳江盆地")], []),
    "xinglong": ([("zh", "兴隆溶洞")], ["兴隆溶洞.jpg"]),
    "shiniuzhai": ([("zh", "石牛寨")], ["平江石牛寨.jpg"]),
    "daweishan": ([("zh", "大围山 (湖南)")], ["浏阳大围山.jpg"]),
    "baotianman": ([("zh", "宝天曼")], ["宝天曼.jpg"]),
    "jingangtai": ([("zh", "金刚台")], ["商城金刚台.jpg"]),
    "shenlingzhai": ([("zh", "神灵寨")], ["洛宁神灵寨.jpg"]),
    "daimeishan": ([("zh", "黛眉山")], ["新安黛眉山.jpg"]),
    "guanshan": ([("zh", "关山 (辉县)")], ["辉县关山.jpg"]),
    "xiaoqinling": ([("zh", "小秦岭")], ["小秦岭.jpg"]),
    "yiyuan": ([("zh", "沂源县")], ["沂源溶洞.jpg"]),
    "wufeng": ([("zh", "五峰土家族自治县")], ["五峰后河.jpg"]),
    "enping": ([("zh", "恩平市")], ["恩平温泉.jpg"]),
    "yangshan": ([("zh", "阳山县")], []),
    "lingxiaoyan": ([("zh", "凌霄岩")], ["阳春凌霄岩.jpg"]),
    "qinglan": ([("zh", "饶平县")], []),
    "yizhou-shilin": ([("zh", "宜州区")], ["宜州石林.jpg"]),
    "luocheng": ([("zh", "罗城仫佬族自治县")], []),
    "donglan": ([("zh", "东兰县")], []),
    "baisha-crater": ([("zh", "白沙黎族自治县")], ["白沙陨石坑.jpg"]),
    "anxiang": ([("zh", "安州区")], ["安县生物礁.jpg"]),
    "dabashan": ([("zh", "诺水河")], ["通江诺水河.jpg"]),
    "gesala": ([("zh", "盐边县")], ["格萨拉.jpg"]),
    "wumengshan": ([("zh", "乌蒙山")], ["六盘水乌蒙山.jpg"]),
    "miaoling": ([("zh", "苗岭")], []),
    "luoping": ([("zh", "罗平县")], ["罗平油菜花.jpg"]),
    "yigong": ([("zh", "易贡乡")], ["易贡滑坡.jpg"]),
    "jimunai": ([("zh", "吉木乃县")], ["吉木乃石城.jpg"]),
    "youyu": ([("zh", "杀虎口")], ["右玉火山.jpg"]),
    "xilinhot": ([("zh", "阿巴嘎旗")], ["阿巴嘎火山.jpg"]),
    "fusong": ([("zh", "抚松县")], []),
    "jingyu": ([("zh", "靖宇县")], ["靖宇火山.jpg"]),
    "shankou": ([("zh", "克东县")], []),
    "jiguanshan": ([("zh", "鸡东县")], ["鸡冠山.jpg"]),
    "huludao": ([("zh", "龙潭大峡谷")], ["葫芦岛龙潭大峡谷.jpg"]),
    "wuda": ([("zh", "乌达区")], ["乌达植物化石.jpg"]),
    "gssp-huangnitang": ([("en", "Darriwilian"), ("zh", "黄泥塘")], ["Huangnitang.jpg"]),
    "gssp-jiangshan": ([("en", "Jiangshanian")], ["Duibian_GSSP.jpg"]),
    "gssp-huanghuachang": ([("en", "Dapingian")], ["Huanghuachang_GSSP.jpg"]),
    "gssp-wangjiawan": ([("en", "Hirnantian")], ["Wangjiawan_GSSP.jpg"]),
    "gssp-paibi": ([("en", "Paibian"), ("zh", "排碧乡")], ["Paibi_GSSP.jpg"]),
    "gssp-guzhang": ([("en", "Guzhangian")], ["Luoyixi_GSSP.jpg"]),
    "gssp-penglaitan": ([("en", "Wuchiapingian")], ["Penglaitan_GSSP.jpg"]),
    "gssp-pengchong": ([("en", "Visean")], ["Pengchong_GSSP.jpg"]),
    "gssp-wuliu": ([("en", "Wuliuan")], ["Wuliu_GSSP.jpg"]),
    "fengyangshan": ([("zh", "凤阳县")], ["凤阳山.jpg"]),
    "marenshan": ([("zh", "繁昌区")], ["马仁山.jpg"]),
    "shitai": ([("zh", "石台县")], ["石台溶洞.jpg"]),
    "tianedong": ([("zh", "宁化县")], ["宁化天鹅洞.jpg"]),
    "shiniushan": ([("zh", "石牛山 (德化)")], ["德化石牛山.jpg"]),
    "baiyunshan-fj": ([("zh", "白云山 (福安)")], ["福安白云山.jpg"]),
    "fozishan": ([("zh", "政和县")], ["政和佛子山.jpg"]),
    "guantaishan": ([("zh", "寿宁县")], ["官台山.jpg"]),
    "shicheng": ([("zh", "石城县")], ["石城通天寨.jpg"]),
    "ruyang": ([("zh", "汝阳县")], ["汝阳恐龙.jpg"]),
    "yuanan": ([("zh", "远安县")], []),
    "fenghuang": ([("zh", "南华山"), ("zh", "凤凰古城")], []),  # 古城可能被拒
    "wulongshan": ([("zh", "龙山县")], []),
    "jiubujiang": ([("zh", "攸县")], ["酒埠江.jpg"]),
    "xuefenghu": ([("zh", "安化县")], ["雪峰湖.jpg"]),
    "baishuidong": ([("zh", "新邵县")], ["白水洞.jpg"]),
    "qiyaoshan": ([("zh", "石柱土家族自治县")], []),
    "wuhuangshan": ([("zh", "浦北县")], ["五皇山.jpg"]),
    "guiping": ([("zh", "桂平西山")], ["桂平西山.jpg"]),
    "qingliu": ([("zh", "清流县")], []),
    "sanming-jiaoye": ([("zh", "三明市")], []),
    "qiguoshan": ([("zh", "巴林左旗")], ["七锅山.jpg"]),
    "yichun-forest": ([("zh", "汤旺河区")], ["汤旺河石林.jpg"]),
    "fenghuangshan-hlj": ([("zh", "鸡西市")], []),
    "qinggang": ([("zh", "青冈县")], []),
}


def get(url: str, timeout: int = 35) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def wiki_pageimage(lang: str, title: str) -> dict | None:
    api = f"https://{lang}.wikipedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "pageimages",
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
        orig = (p.get("original") or {}).get("source")
        th = (p.get("thumbnail") or {}).get("source")
        src = orig or th
        if not src or not name:
            continue
        blob = name.lower()
        if any(b in blob for b in ("map", "logo", "flag", "location", "coa", "svg")):
            continue
        return {"title": name, "url": src, "via": f"wiki:{lang}:{title}"}
    return None


def commons_file(filename: str) -> dict | None:
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(filename) + "?width=1600"
    try:
        data = get(url, timeout=40)
    except Exception:
        return None
    if len(data) < 12000:
        return None
    if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return {"title": filename, "bytes": data, "via": "commons-file"}


def save_url(url: str, dest: Path) -> bool:
    try:
        data = get(url, timeout=40)
    except Exception:
        return False
    if len(data) < 12000:
        return False
    if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n":
        return False
    dest.write_bytes(data)
    return True


def run_slug(slug: str, wikis: list, files: list) -> list[dict]:
    dest = OUT / slug
    dest.mkdir(parents=True, exist_ok=True)
    kept = []
    for lang, title in wikis:
        hit = wiki_pageimage(lang, title)
        if not hit:
            continue
        n = len(kept)
        path = dest / f"{n:02d}.jpg"
        if save_url(hit["url"], path):
            hit["file"] = str(path)
            hit["bytes"] = path.stat().st_size
            kept.append(hit)
            print(f"+ {slug} wiki {path.name} {hit['title'][:60]}")
        if len(kept) >= 2:
            break
    if len(kept) < 2:
        for fn in files:
            hit = commons_file(fn)
            if not hit:
                continue
            n = len(kept)
            path = dest / f"{n:02d}.jpg"
            path.write_bytes(hit["bytes"])
            kept.append({"title": fn, "via": "commons-file", "file": str(path), "bytes": path.stat().st_size})
            print(f"+ {slug} file {path.name} {fn}")
            if len(kept) >= 2:
                break
    (dest / "meta.json").write_text(json.dumps([{k: v for k, v in h.items() if k != "bytes" or not isinstance(v, bytes)} for h in kept], ensure_ascii=False, indent=2))
    return kept


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {}
    # sequential is more polite to wiki; but we have 100+ — use 4 threads
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(run_slug, slug, w, f): slug for slug, (w, f) in PLAN.items()}
        for fut in as_completed(futs):
            slug = futs[fut]
            try:
                kept = fut.result()
                summary[slug] = len(kept)
            except Exception as e:
                print("ERR", slug, type(e).__name__, e)
                summary[slug] = 0
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    print("GOT", sum(1 for v in summary.values() if v), "/", len(summary))


if __name__ == "__main__":
    main()
