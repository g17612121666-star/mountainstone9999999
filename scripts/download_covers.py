#!/usr/bin/env python3
"""Download Wikimedia Commons photos into public/covers/{id}.jpg."""
from __future__ import annotations

import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
OUT.mkdir(parents=True, exist_ok=True)
UA = "ShanShiZhi/1.0 (Chinese geoscience field guide; educational)"
CTX = ssl.create_default_context()

# id -> list of (commons filename, credit, caption)
EXPLICIT: dict[str, list[tuple[str, str, str]]] = {
    "zhangjiajie": [
        ("Sandstone_spire_forest_Zhangjiajie_Hunan.jpg", "Lianguanlun, 2024, CC BY-SA 4.0", "石英砂岩峰林。不是喀斯特，不是丹霞。"),
        ("Wulingyuan_3.jpg", "John Philip, CC BY-SA 2.0", "武陵源石英砂岩柱。"),
    ],
    "huangshan": [
        ("HuangShan.JPG", "Arne Hückelheim, CC BY-SA", "燕山期花岗岩峰林。不是火山锥。"),
        ("Huangshan.jpg", "Ariel Steiner, CC BY-SA", "黄山花岗岩与云海。"),
    ],
    "changbaishan": [
        ("20230604_Tian_Chi,_Changbai_Shan.jpg", "Yumeto, 2023, CC BY-SA", "天池是破火山口湖，不是陨石坑。"),
        ("Heaven_Lake,_Changbai.jpg", "Charlie fong, Public Domain", "长白山天池。"),
    ],
    "wudalianchi": [
        ("Panorama_of_Laohei_Volcano_Crater,_Aug_2019.jpg", "颜邯, 2019, CC BY-SA", "老黑山渣锥火口。钾质玄武岩。"),
    ],
    "shilin": [
        ("Shilin_Yunnan_China_Shilin-Stone-Forest-10.jpg", "Uwe Aranas / CEphoto, CC BY-SA", "茅口组灰岩剑状石林。"),
    ],
    "danxiashan": [
        ("20251102_Danxia_Shan_(134604).jpg", "Yumeto, 2025, CC BY-SA", "丹霞地貌定义地：红层、垂直节理、崩塌。"),
        ("丹霞山_01.jpg", "Mx. Granger, 2019, CC BY-SA", "广东丹霞山。"),
    ],
    "hukou": [
        ("Hukou_Waterfalls,_Shaanxi_28.jpg", "Wikimedia Commons, CC BY-SA", "纸坊组硬砂岩岩槛。不是喀斯特落水洞。"),
    ],
    "yanqing": [
        ("GeoPark.jpg", "Kinianox, CC BY-SA", "延庆世界地质公园。"),
    ],
    "leiqiong": [
        ("Leiqiong_Global_Geopark_-_01.jpg", "Anna Frodesiak, CC0", "雷琼火山。玛珥湖不是天坑。"),
    ],
    "huguangyan": [
        ("Leiqiong_Global_Geopark_-_01.jpg", "Anna Frodesiak, CC0", "湖光岩玛珥湖，雷琼世界地质公园雷州半岛一侧。"),
    ],
    "haikou-volcano": [
        ("Leiqiong_Global_Geopark_-_01.jpg", "Anna Frodesiak, CC0", "海口石山是雷琼世界地质公园琼北园区。"),
    ],
    "dunhuang": [
        ("Dunhuang_Yardang_National_Geopark_1.JPG", "Wikimedia Commons, CC BY-SA", "敦煌雅丹。风把河湖相切成垄槽。"),
        ("Lion_Yardang,_near_Dunhuang.jpg", "Wikimedia Commons", "雅丹近景。"),
    ],
    "zhangye": [
        ("Zhangye_Danxia_2016.jpg", "Marcus Hsu, 2016, CC BY-SA 4.0", "干旱区彩色河湖相砂泥岩丘陵，不是丹霞山那种丹霞。"),
    ],
    "taishan": [
        ("Taishan_(1535).JPG", "Jiang, Public Domain", "太古宙岩基掀斜成东岳。不是年轻火山。"),
        ("Tai_Shan_2015.08.12_08-49-56.jpg", "Wikimedia Commons", "泰山。"),
    ],
    "songshan": [
        ("Shaolin_Temple_-_Mount_Song_-_3.jpg", "Wikimedia Commons", "嵩山石英岩峰。五代同堂，不是一座花岗岩名山。"),
        ("Mount_Song.jpg", "Wikimedia Commons", "嵩山。"),
    ],
    "yuntaishan": [
        ("Yuntai_Mountain_Henan.jpg", "Wikimedia Commons", "云台地貌：水平岩层与断层长崖。"),
        ("Red_Stone_Gorge,_Yuntai_Mountain.jpg", "Wikimedia Commons", "云台山红石峡。"),
    ],
    "hongkong": [
        ("High_Island_Reservoir_East_Dam_hexagonal_columns.jpg", "Wikimedia Commons", "香港早白垩世酸性火成岩柱状节理。"),
        ("Hexagonal_volcanic_columns_Hong_Kong.jpg", "Wikimedia Commons", "西贡六角柱。"),
    ],
    "siguniang": [
        ("Mount_Siguniang.jpg", "Wikimedia Commons", "四姑娘山。松潘–甘孜造山带极高山。"),
        ("Siguniang_Mountain.jpg", "Wikimedia Commons", "四姑娘山。"),
    ],
    "jingpohu": [
        ("Jingpo_Lake.jpg", "Wikimedia Commons", "镜泊湖：玄武岩流堰塞牡丹江，不是破火山口。"),
        ("Diaoshuilou_Waterfall.jpg", "Wikimedia Commons", "吊水楼瀑布。"),
    ],
    "sanqingshan": [
        ("Mount_Sanqing.jpg", "Wikimedia Commons", "三清山花岗岩峰林。燕山期岩基 + 垂直节理。"),
        ("Sanqingshan.jpg", "Wikimedia Commons", "三清山。"),
    ],
    "lushan": [
        ("Lushan_Waterfall.jpg", "Wikimedia Commons", "庐山断块山。第四纪冰川与否可以争论，断层不能。"),
        ("Mount_Lu.jpg", "Wikimedia Commons", "庐山。"),
    ],
    "yandangshan": [
        ("Yandang_Mountains.jpg", "Wikimedia Commons", "雁荡山白垩纪流纹质破火山，不是玄武岩锥。"),
        ("Yandangshan.jpg", "Wikimedia Commons", "雁荡山。"),
    ],
    "hexigten": [
        ("Hexigten_Global_Geopark.jpg", "Wikimedia Commons", "克什克腾花岗岩与火山。"),
        ("Asihatu_Stone_Forest.jpg", "Wikimedia Commons", "阿斯哈图石林。"),
    ],
    "arxan": [
        ("Arxan.jpg", "Wikimedia Commons", "阿尔山火山与天池。"),
        ("Aershan.jpg", "Wikimedia Commons", "阿尔山。"),
    ],
    "alxa": [
        ("Badain_Jaran_Desert.jpg", "Wikimedia Commons", "阿拉善沙漠与巴丹吉林高大沙山。"),
        ("Badain_Jaran.jpg", "Wikimedia Commons", "巴丹吉林。"),
    ],
    "tianzhushan": [
        ("Tianzhu_Mountain.jpg", "Wikimedia Commons", "天柱山花岗岩与超高压变质岩。"),
        ("Tianzhushan.jpg", "Wikimedia Commons", "天柱山。"),
    ],
    "jiuhuashan": [
        ("Jiuhuashan.jpg", "Wikimedia Commons", "九华山燕山期花岗岩。不是火山颈。"),
        ("Jiuhua_Mountain.jpg", "Wikimedia Commons", "九华山。"),
    ],
    "taining": [
        ("Taining_Fujian.jpg", "Wikimedia Commons", "泰宁青年期丹霞，金湖把巷谷淹成水上赤壁。"),
        ("Jin_Lake_Taining.jpg", "Wikimedia Commons", "泰宁金湖。"),
    ],
    "longhushan": [
        ("Longhu_Mountain.jpg", "Wikimedia Commons", "龙虎山丹霞。红层、垂直节理、崩塌。"),
        ("Longhushan.jpg", "Wikimedia Commons", "龙虎山。"),
    ],
    "wugongshan": [
        ("Wugong_Mountain.jpg", "Wikimedia Commons", "武功山花岗岩穹隆与高山草甸。"),
        ("Wugongshan.jpg", "Wikimedia Commons", "武功山。"),
    ],
    "yimengshan": [
        ("Yimeng_Mountain.jpg", "Wikimedia Commons", "沂蒙山花岗岩与岱崮地貌。岱崮不是张家界砂岩。"),
        ("Mengshan.jpg", "Wikimedia Commons", "蒙山。"),
    ],
    "wangwushan": [
        ("Wangwu_Mountain.jpg", "Wikimedia Commons", "王屋山前寒武系与黄河。"),
        ("Wangwushan.jpg", "Wikimedia Commons", "王屋山。"),
    ],
    "funiushan": [
        ("Funiu_Mountain.jpg", "Wikimedia Commons", "伏牛山。秦岭东段。"),
        ("Funiushan.jpg", "Wikimedia Commons", "伏牛山。"),
    ],
    "shennongjia": [
        ("Shennongjia.jpg", "Wikimedia Commons", "神农架喀斯特与森林。"),
        ("Shennongjia_Nature_Reserve.jpg", "Wikimedia Commons", "神农架。"),
    ],
    "enshi": [
        ("Enshi_Grand_Canyon.jpg", "Wikimedia Commons", "恩施大峡谷碳酸盐岩长崖。"),
        ("Tenglong_Cave.jpg", "Wikimedia Commons", "腾龙洞。"),
    ],
    "xiangxi": [
        ("Fenghuang_Ancient_Town.jpg", "Wikimedia Commons", "湘西喀斯特。排碧、古丈金钉子在园的地质尺度上。"),
        ("Dehang.jpg", "Wikimedia Commons", "德夯。"),
    ],
    "leye-fengshan": [
        ("Dashiwei_Tiankeng.jpg", "Wikimedia Commons", "乐业大石围天坑。地下河塌出来的，不是采石场。"),
        ("Fengshan_Karst.jpg", "Wikimedia Commons", "凤山岩溶。"),
    ],
    "yunyang": [
        ("Yunyang_Dinosaur.jpg", "Wikimedia Commons", "云阳恐龙与龙缸天坑。"),
        ("Longgang_Tiankeng.jpg", "Wikimedia Commons", "龙缸。"),
    ],
    "zigong": [
        ("Zigong_Dinosaur_Museum.jpg", "Wikimedia Commons", "自贡大山铺恐龙。只看不挖。"),
        ("Zigong.jpg", "Wikimedia Commons", "自贡。"),
    ],
    "xingwen": [
        ("Xingwen_Stone_Forest.jpg", "Wikimedia Commons", "兴文石海。二叠系灰岩天坑与石林。"),
        ("Xingwen.jpg", "Wikimedia Commons", "兴文。"),
    ],
    "guangwushan": [
        ("Guangwu_Mountain.jpg", "Wikimedia Commons", "光雾山–诺水河喀斯特。"),
        ("Nuoshuihe.jpg", "Wikimedia Commons", "诺水河。"),
    ],
    "xingyi": [
        ("Maling_River_Canyon.jpg", "Wikimedia Commons", "兴义马岭河峡谷与生物群。"),
        ("Xingyi_Guizhou.jpg", "Wikimedia Commons", "兴义。"),
    ],
    "zhijindong": [
        ("Zhijin_Cave.jpg", "Wikimedia Commons", "织金洞地下厅堂。不是天坑。"),
        ("Zhijindong.jpg", "Wikimedia Commons", "织金洞。"),
    ],
    "cangshan": [
        ("Dali_Cangshan.jpg", "Wikimedia Commons", "苍山变质岩与断层。冰川只是改写顶部。"),
        ("Cangshan_Dali.jpg", "Wikimedia Commons", "苍山。"),
    ],
    "cuihuashan": [
        ("Cuihua_Mountain.jpg", "Wikimedia Commons", "终南山翠华山崩塌。不是火山口。"),
        ("Zhongnanshan.jpg", "Wikimedia Commons", "终南山。"),
    ],
    "linxia": [
        ("Linxia_Basin.jpg", "Wikimedia Commons", "临夏盆地新生代哺乳动物化石。只看不挖。"),
        ("Hezheng.jpg", "Wikimedia Commons", "和政。"),
    ],
    "kanbula": [
        ("Kanbula_National_Forest_Park.jpg", "Wikimedia Commons", "坎布拉丹霞。贵德盆地红层被黄河切开。"),
        ("Kanbula.jpg", "Wikimedia Commons", "坎布拉。"),
    ],
    "kunlunshan": [
        ("Kunlun_Pass.jpg", "Wikimedia Commons", "昆仑山。造山带与极高山。"),
        ("Kunlun_Mountains.jpg", "Wikimedia Commons", "昆仑山。"),
    ],
    "keketuohai": [
        ("Keketuohai.jpg", "Wikimedia Commons", "可可托海伟晶岩与花岗岩。"),
        ("Koktokay.jpg", "Wikimedia Commons", "可可托海。"),
    ],
    "fangshan": [
        ("Shidu_Fangshan.jpg", "Wikimedia Commons", "房山十渡河谷喀斯特。北方峡谷，不是桂林峰林平原。"),
        ("Zhoukoudian.jpg", "Wikimedia Commons", "周口店。"),
    ],
    "ningde": [
        ("Taimushan.jpg", "Wikimedia Commons", "宁德太姥山花岗岩海蚀。"),
        ("Baishuiyang.jpg", "Wikimedia Commons", "白水洋。"),
    ],
    "longyan": [
        ("Guanzhai_Mountain.jpg", "Wikimedia Commons", "龙岩冠豸山丹霞。"),
        ("Meihuashan.jpg", "Wikimedia Commons", "梅花山。"),
    ],
    "dabieshan-hg": [
        ("Dabie_Mountains.jpg", "Wikimedia Commons", "大别山超高压变质带。榴辉岩是关键，不是普通花岗岩名山。"),
        ("Dabieshan.jpg", "Wikimedia Commons", "大别山。"),
    ],
    "chishui": [
        ("Chishui_Danxia.jpg", "Wikimedia Commons", "赤水丹霞。中国丹霞世界遗产的组成部分。"),
    ],
    "langshan": [
        ("Langshan_Hunan.jpg", "Wikimedia Commons", "崀山丹霞。"),
    ],
    "tengchong": [
        ("Tengchong_Volcano.jpg", "Wikimedia Commons", "腾冲火山与地热。"),
    ],
    "chengjiang": [
        ("Chengjiang_Fossil_Site.jpg", "Wikimedia Commons", "澄江化石地。寒武纪生命大爆发，只看不挖。"),
        ("Fuxian_Lake.jpg", "Wikimedia Commons", "抚仙湖一带。"),
    ],
    "sheshan": [
        ("Sheshan_Shanghai.jpg", "Wikimedia Commons", "上海佘山。平原上的白垩纪火山锥残丘，不是国家地质公园。"),
        ("She_Shan.jpg", "Wikimedia Commons", "佘山。"),
    ],
    "zhoukoudian": [
        ("Zhoukoudian_Peking_Man_Site.jpg", "Wikimedia Commons", "周口店。看洞穴堆积，不是挖龙骨。"),
        ("Zhoukoudian.jpg", "Wikimedia Commons", "周口店。"),
    ],
    "jixian": [
        ("Jixian_section.jpg", "Wikimedia Commons", "蓟县中上元古界剖面。"),
        ("Wuling_Mountain_Jixian.jpg", "Wikimedia Commons", "蓟州。"),
    ],
    "changshan": [
        ("Changshan_Zhejiang.jpg", "Wikimedia Commons", "常山世界地质公园。黄泥塘金钉子在园内，煤山不在。"),
    ],
    "meishan": [
        ("Meishan_section_Changxing.jpg", "Wikimedia Commons", "煤山剖面。示意或保护廊，禁止取样。"),
    ],
}

SEARCH = {
    "zhangjiajie": "Zhangjiajie sandstone pillar",
    "huangshan": "Huangshan granite",
    "changbaishan": "Changbai Tianchi",
    "wudalianchi": "Wudalianchi volcano",
    "shilin": "Shilin Stone Forest Yunnan",
    "danxiashan": "Mount Danxia Guangdong",
    "taishan": "Mount Tai Shandong",
    "songshan": "Mount Song Shaolin",
    "yuntaishan": "Yuntai Mountain Henan",
    "hongkong": "Hong Kong hexagonal columns Sai Kung",
    "siguniang": "Mount Siguniang",
    "jingpohu": "Jingpo Lake Heilongjiang",
    "sanqingshan": "Mount Sanqing",
    "lushan": "Mount Lu Jiangxi",
    "yandangshan": "Yandang Mountains",
    "hexigten": "Hexigten granite",
    "arxan": "Arxan volcano",
    "alxa": "Badain Jaran",
    "tianzhushan": "Tianzhu Mountain Anhui",
    "jiuhuashan": "Jiuhua Mountain",
    "taining": "Taining Fujian danxia",
    "longhushan": "Longhu Mountain",
    "fangshan": "Shidu Fangshan",
    "enshi": "Enshi Grand Canyon",
    "zhijindong": "Zhijin Cave",
    "zhangye": "Zhangye Danxia",
    "dunhuang": "Dunhuang Yardang",
    "leiqiong": "Huguangyan maar",
    "kanbula": "Kanbula Qinghai",
    "tengchong": "Tengchong volcano",
    "chengjiang": "Chengjiang fossil site",
    "zigong": "Zigong dinosaur",
    "huashan": "Mount Hua granite",
    "jiuzhaigou": "Jiuzhaigou",
    "huanglong": "Huanglong Sichuan",
    "wulong": "Wulong tiankeng",
    "hailuogou": "Hailuogou glacier",
    "chishui": "Chishui danxia",
    "langshan": "Langshan Hunan",
    "datong-volcano": "Datong volcano Shanxi",
    "guilin-karst": "Guilin karst Li River",
    "yulongxueshan": "Jade Dragon Snow Mountain",
}


def get(url: str, timeout: int = 45) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read()


def download_file(filename: str, dest: Path) -> bool:
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(
        filename
    ) + "?width=1600"
    try:
        data = get(url)
        if len(data) < 8000:
            return False
        if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n" and b"<html" in data[:200].lower():
            return False
        dest.write_bytes(data)
        return dest.stat().st_size > 8000
    except Exception as e:
        print(" fail", filename, type(e).__name__, e)
        return False


def search_commons(q: str) -> list[tuple[str, str]]:
    api = (
        "https://commons.wikimedia.org/w/api.php?"
        + urllib.parse.urlencode(
            {
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrnamespace": 6,
                "gsrlimit": 8,
                "gsrsearch": q,
                "prop": "imageinfo",
                "iiprop": "url|mime|size|extmetadata",
                "iiurlwidth": 1600,
            }
        )
    )
    try:
        raw = json.loads(get(api, timeout=30).decode("utf-8", "replace"))
    except Exception as e:
        print(" search fail", q, e)
        return []
    pages = (raw.get("query") or {}).get("pages") or {}
    hits = []
    for p in pages.values():
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        mime = info.get("mime") or ""
        if mime not in ("image/jpeg", "image/png"):
            continue
        title = p.get("title", "").replace("File:", "")
        artist = ""
        meta = info.get("extmetadata") or {}
        if meta.get("Artist"):
            artist = str(meta["Artist"].get("value") or "")
            artist = (
                artist.replace("<", " ")
                .replace(">", " ")
                .replace("&nbsp;", " ")
            )
            # strip tags roughly
            while "<" in artist and ">" in artist:
                a = artist.find("<")
                b = artist.find(">", a)
                if b < 0:
                    break
                artist = artist[:a] + " " + artist[b + 1 :]
            artist = " ".join(artist.split())[:80]
        hits.append((title, artist or "Wikimedia Commons"))
    return hits


def main() -> None:
    sites = json.loads((ROOT / "data" / "sites.json").read_text())
    world = [s["id"] for s in sites if "world_geopark" in s["types"]]
    extra = [
        "hukou",
        "sheshan",
        "zhoukoudian",
        "jixian",
        "meishan",
        "chengjiang",
        "huguangyan",
        "haikou-volcano",
        "chishui",
        "langshan",
        "tengchong",
        "huashan",
        "jiuzhaigou",
        "wulong",
        "hailuogou",
        "datong-volcano",
        "guilin-karst",
    ]
    targets = list(dict.fromkeys(world + extra))
    credits: dict[str, dict] = {}
    # reuse existing jpgs
    existing = {p.stem: p for p in OUT.glob("*.jpg")}
    for sid in targets:
        dest = OUT / f"{sid}.jpg"
        if dest.exists() and dest.stat().st_size > 20000:
            print(" keep", sid, dest.stat().st_size)
            if sid not in credits:
                credits[sid] = {
                    "credit": "Wikimedia Commons / 公开资料照片",
                    "caption": "",
                    "src": f"/covers/{sid}.jpg",
                }
            continue
        ok = False
        for fname, credit, caption in EXPLICIT.get(sid, []):
            print(" try", sid, fname)
            if download_file(fname, dest):
                credits[sid] = {"credit": credit, "caption": caption, "src": f"/covers/{sid}.jpg"}
                print("  ok", dest.stat().st_size)
                ok = True
                break
            time.sleep(0.25)
        if ok:
            continue
        q = SEARCH.get(sid) or sid.replace("-", " ")
        print(" search", sid, q)
        for title, artist in search_commons(q):
            print("  hit", title)
            if download_file(title, dest):
                credits[sid] = {
                    "credit": f"{artist}, Wikimedia Commons",
                    "caption": "",
                    "src": f"/covers/{sid}.jpg",
                }
                print("  ok", dest.stat().st_size)
                ok = True
                break
            time.sleep(0.3)
        if not ok:
            print(" MISS", sid)
        time.sleep(0.2)
    (ROOT / "data" / "cover_credits.json").write_text(
        json.dumps(credits, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("credits", len(credits), "jpgs", len(list(OUT.glob("*.jpg"))))


if __name__ == "__main__":
    main()
