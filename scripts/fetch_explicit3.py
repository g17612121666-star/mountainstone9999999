#!/usr/bin/env python3
"""Download explicit Commons filenames + a few official URLs. JPEG magic = 2 bytes."""
from __future__ import annotations

import json
import ssl
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "artifacts" / "explicit3"
OUT.mkdir(parents=True, exist_ok=True)
UA = "ShanShiZhiFieldGuide/3.0 (https://shanshizhi.grok.me; educational)"
CTX = ssl.create_default_context()

# slug -> list of (commons filename OR direct url, credit, page)
PLAN: dict[str, list[tuple[str, str, str]]] = {
    "wudangshan": [
        ("Wudang_Mountain_(54131425234).jpg", "xiquinhosilva, CC BY 2.0, Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wudang_Mountain_(54131425234).jpg"),
        ("Wudangshan_2003_10.jpg", "Taniquetil, Public Domain, Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wudangshan_2003_10.jpg"),
        ("Wudang_Mountains.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wudang_Mountains.jpg"),
        ("Wudangshan.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wudangshan.jpg"),
    ],
    "gssp-paibi": [
        ("Paibian_GSSP,_Huaqiao_Formation,_Hunan,_China_2.jpg", "Wikimedia Commons · Paibian GSSP outcrop", "https://commons.wikimedia.org/wiki/File:Paibian_GSSP,_Huaqiao_Formation,_Hunan,_China_2.jpg"),
        ("Paibian_GSSP,_Huaqiao_Formation,_Hunan,_China.jpg", "Wikimedia Commons · Paibian GSSP", "https://commons.wikimedia.org/wiki/File:Paibian_GSSP,_Huaqiao_Formation,_Hunan,_China.jpg"),
        ("Paibian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Paibian_GSSP.jpg"),
    ],
    "gssp-guzhang": [
        ("Guzhangian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Guzhangian_GSSP.jpg"),
        ("Luoyixi_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Luoyixi_GSSP.jpg"),
    ],
    "gssp-huangnitang": [
        ("Huangnitang_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Huangnitang_GSSP.jpg"),
        ("Darriwilian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Darriwilian_GSSP.jpg"),
        ("Huangnitang_section.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Huangnitang_section.jpg"),
    ],
    "gssp-jiangshan": [
        ("Jiangshanian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Jiangshanian_GSSP.jpg"),
        ("Duibian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Duibian_GSSP.jpg"),
    ],
    "meishan": [
        ("Meishan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Meishan_GSSP.jpg"),
        ("Meishan_section.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Meishan_section.jpg"),
        ("Changhsingian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Changhsingian_GSSP.jpg"),
        ("Permian-Triassic_boundary_Meishan.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Permian-Triassic_boundary_Meishan.jpg"),
    ],
    "gssp-wuliu": [
        ("Wuliuan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wuliuan_GSSP.jpg"),
        ("Wuliu-Zengjiayan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wuliu-Zengjiayan_GSSP.jpg"),
    ],
    "gssp-penglaitan": [
        ("Penglaitan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Penglaitan_GSSP.jpg"),
        ("Wuchiapingian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wuchiapingian_GSSP.jpg"),
    ],
    "gssp-pengchong": [
        ("Pengchong_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Pengchong_GSSP.jpg"),
        ("Viséan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Viséan_GSSP.jpg"),
    ],
    "gssp-huanghuachang": [
        ("Huanghuachang_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Huanghuachang_GSSP.jpg"),
        ("Floian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Floian_GSSP.jpg"),
    ],
    "gssp-wangjiawan": [
        ("Wangjiawan_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wangjiawan_GSSP.jpg"),
        ("Hirnantian_GSSP.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Hirnantian_GSSP.jpg"),
    ],
    "getuhe": [
        ("Getu_River.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Getu_River.jpg"),
        ("Getu_arch.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Getu_arch.jpg"),
        ("Great_Arch_of_Getu.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Great_Arch_of_Getu.jpg"),
        ("格凸河.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:格凸河.jpg"),
    ],
    "huoshizhai": [
        ("火石寨.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:火石寨.jpg"),
        ("Huoshizhai.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Huoshizhai.jpg"),
        ("西吉火石寨.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:西吉火石寨.jpg"),
    ],
    "yishan": [
        ("峄山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:峄山.jpg"),
        ("Mount_Yi.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mount_Yi.jpg"),
        ("Yishan_Zoucheng.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Yishan_Zoucheng.jpg"),
    ],
    "wulianshan": [
        ("五莲山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:五莲山.jpg"),
        ("Wulian_Mountain.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Wulian_Mountain.jpg"),
        ("九仙山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:九仙山.jpg"),
    ],
    "luochuan": [
        ("洛川黄土.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:洛川黄土.jpg"),
        ("Luochuan_loess.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Luochuan_loess.jpg"),
        ("Luochuan_Loess_National_Geopark.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Luochuan_Loess_National_Geopark.jpg"),
        ("黑木沟.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:黑木沟.jpg"),
    ],
    "hongshilin": [
        ("红石林.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:红石林.jpg"),
        ("古丈红石林.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:古丈红石林.jpg"),
        ("Hongshilin.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Hongshilin.jpg"),
    ],
    "fengkai": [
        ("封开大斑石.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:封开大斑石.jpg"),
        ("Fengkai.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Fengkai.jpg"),
    ],
    "qitai": [
        ("奇台硅化木.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:奇台硅化木.jpg"),
        ("Qitai_petrified_wood.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Qitai_petrified_wood.jpg"),
        ("奇台硅化木-恐龙国家地质公园.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:奇台硅化木-恐龙国家地质公园.jpg"),
    ],
    "shenhuwan": [
        ("深沪湾.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:深沪湾.jpg"),
        ("Shenhu_Bay.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Shenhu_Bay.jpg"),
    ],
    "taijidong": [
        ("太极洞.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:太极洞.jpg"),
        ("Taiji_Cave.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Taiji_Cave.jpg"),
        ("广德太极洞.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:广德太极洞.jpg"),
    ],
    "wanfoshan": [
        ("万佛山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:万佛山.jpg"),
        ("通道万佛山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:通道万佛山.jpg"),
    ],
    "jiangyou": [
        ("窦圌山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:窦圌山.jpg"),
        ("DouTuan_Mountain.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:DouTuan_Mountain.jpg"),
    ],
    "jinsixia": [
        ("金丝峡.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:金丝峡.jpg"),
        ("Jinsixia.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Jinsixia.jpg"),
    ],
    "pingtang": [
        ("平塘天眼.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:平塘天眼.jpg"),
        ("FAST_Pingtang.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:FAST_Pingtang.jpg"),
        ("掌布藏字石.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:掌布藏字石.jpg"),
    ],
    "xiaonanhai": [
        ("黔江小南海.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:黔江小南海.jpg"),
        ("Xiaonanhai.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Xiaonanhai.jpg"),
    ],
    "qingchuan": [
        ("东河口.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:东河口.jpg"),
        ("Qingchuan_earthquake.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Qingchuan_earthquake.jpg"),
    ],
    "sheshan": [
        ("佘山国家森林公园.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:佘山国家森林公园.jpg"),
        ("West_Sheshan.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:West_Sheshan.jpg"),
        ("She_Shan.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:She_Shan.jpg"),
    ],
    "wuan": [
        ("Tianzhu_Peak,_Gu_Wudang_Mountain.jpg", "H2v5o68z, CC0, Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Tianzhu_Peak,_Gu_Wudang_Mountain.jpg"),
        ("古武当山老爷顶.jpg", "H2v5o68z, CC0, Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:古武当山老爷顶.jpg"),
        ("古武当山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:古武当山.jpg"),
    ],
    "huanghe-delta": [
        ("Yellow_River_Delta.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Yellow_River_Delta.jpg"),
        ("黄河三角洲.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:黄河三角洲.jpg"),
        ("Yellow_River_Delta_National_Nature_Reserve.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Yellow_River_Delta_National_Nature_Reserve.jpg"),
    ],
    "dongchuan": [
        ("蒋家沟.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:蒋家沟.jpg"),
        ("Jiangjia_Gully.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Jiangjia_Gully.jpg"),
        ("Dongchuan_debris_flow.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Dongchuan_debris_flow.jpg"),
    ],
    "laojunshan": [
        ("黎明丹霞.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:黎明丹霞.jpg"),
        ("Liming_Danxia.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Liming_Danxia.jpg"),
        ("千龟山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:千龟山.jpg"),
        ("Laojun_Mountain_Lijiang.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Laojun_Mountain_Lijiang.jpg"),
    ],
    "feitianshan": [
        ("飞天山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:飞天山.jpg"),
        ("Feitianshan.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Feitianshan.jpg"),
        ("郴州飞天山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:郴州飞天山.jpg"),
    ],
    "mulanshan": [
        ("木兰山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:木兰山.jpg"),
        ("Mulan_Mountain.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Mulan_Mountain.jpg"),
        ("黄陂木兰山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:黄陂木兰山.jpg"),
    ],
    "jingyu": [
        ("靖宇火山.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:靖宇火山.jpg"),
        ("Jingyu_volcano.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Jingyu_volcano.jpg"),
    ],
    "yichun-forest": [
        ("汤旺河石林.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:汤旺河石林.jpg"),
        ("Tangwanghe.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Tangwanghe.jpg"),
    ],
    "lincheng": [
        ("崆山白云洞.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:崆山白云洞.jpg"),
        ("Kongshan_Baiyun_Cave.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Kongshan_Baiyun_Cave.jpg"),
    ],
    "tianshengqiao": [
        ("阜平天生桥.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:阜平天生桥.jpg"),
        ("Fuping_Tianshengqiao.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Fuping_Tianshengqiao.jpg"),
    ],
    "shuanghedong": [
        ("双河洞.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:双河洞.jpg"),
        ("Shuanghe_Cave.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Shuanghe_Cave.jpg"),
    ],
    "guanling": [
        ("关岭化石.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:关岭化石.jpg"),
        ("Guanling_biota.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Guanling_biota.jpg"),
    ],
    "luoping": [
        ("罗平生物群.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:罗平生物群.jpg"),
        ("Luoping_biota.jpg", "Wikimedia Commons", "https://commons.wikimedia.org/wiki/File:Luoping_biota.jpg"),
    ],
}


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://commons.wikimedia.org/",
            "Accept": "image/jpeg,image/png,image/webp,*/*",
        },
    )
    with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
        return r.read()


def is_image(data: bytes) -> bool:
    if len(data) < 12000:
        return False
    return data[:2] == b"\xff\xd8" or data[:8] == b"\x89PNG\r\n\x1a\n"


def commons_url(filename: str) -> str | None:
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": "File:" + filename,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1600,
        }
    )
    try:
        data = json.loads(get(api).decode("utf-8", "replace"))
    except Exception as e:
        print("  api fail", filename, type(e).__name__)
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for p in pages.values():
        if p.get("missing") or p.get("invalid"):
            return None
        info = (p.get("imageinfo") or [{}])[0]
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            return None
        return info.get("thumburl") or info.get("url")
    return None


def main() -> None:
    log = {}
    for slug, items in PLAN.items():
        dest = OUT / slug
        dest.mkdir(parents=True, exist_ok=True)
        kept = []
        for i, (fn, credit, page) in enumerate(items):
            url = commons_url(fn)
            if not url:
                print("  miss", slug, fn)
                continue
            path = dest / f"{i:02d}.jpg"
            try:
                data = get(url)
            except Exception as e:
                print("  dl fail", slug, fn, type(e).__name__)
                continue
            if not is_image(data):
                print("  not image", slug, fn, len(data))
                continue
            path.write_bytes(data)
            kept.append({"file": str(path), "fn": fn, "credit": credit, "page": page, "bytes": len(data), "url": url})
            print("  ok", slug, fn, len(data))
        log[slug] = kept
    (OUT / "meta.json").write_text(json.dumps(log, ensure_ascii=False, indent=2))
    n = sum(len(v) for v in log.values())
    print("TOTAL", n, "files across", sum(1 for v in log.values() if v), "slugs")


if __name__ == "__main__":
    main()
