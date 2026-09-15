#!/usr/bin/env python3
"""Replace misleading covers and add a second field photo where Commons has one."""
from __future__ import annotations

import ssl
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "covers"
UA = "ShanShiZhi/1.0 (Chinese geoscience field guide; educational)"
CTX = ssl.create_default_context()

# Accurate replacements for parks whose current jpg is the wrong landform.
REPLACE = {
    "xiangxi": ("Hongshilin1.jpg", "Popolon, 2017, CC BY-SA, Wikimedia Commons", "古丈红石林：含铁灰岩溶柱，不是凤凰古城。"),
    "keketuohai": ("可可托海三号矿坑.jpg", "Yanxutong1215, 2021, Wikimedia Commons", "可可托海三号矿坑：伟晶岩窗口，不是额尔齐斯河风景。"),
}

# Second photo for deep pages that already have a verified own cover.
SECOND = {
    "zhangjiajie": ("Wulingyuan_3.jpg", "John Philip, CC BY-SA 2.0, Wikimedia Commons", "武陵源石英砂岩柱。"),
    "danxiashan": ("丹霞山_01.jpg", "Mx. Granger, 2019, CC BY-SA, Wikimedia Commons", "广东丹霞山赤壁。"),
    "huangshan": ("Huangshan.jpg", "Ariel Steiner, CC BY-SA, Wikimedia Commons", "黄山花岗岩。"),
    "changbaishan": ("Heaven_Lake,_Changbai.jpg", "Charlie fong, Public Domain, Wikimedia Commons", "长白山天池破火山口。"),
    "taishan": ("Tai_Shan_2015.08.12_08-49-56.jpg", "Wikimedia Commons", "泰山。主峰是太古宙基底。"),
    "hongkong": ("Hexagonal_volcanic_columns_Hong_Kong.jpg", "Wikimedia Commons", "西贡酸性岩六角柱。"),
    "wudalianchi": ("Panorama_of_Laohei_Volcano_Crater,_Aug_2019.jpg", "颜邯, 2019, CC BY-SA, Wikimedia Commons", "老黑山渣锥火口。"),
    "shilin": ("Shilin_Yunnan_China_Shilin-Stone-Forest-03a.jpg", "Uwe Aranas / CEphoto, CC BY-SA, Wikimedia Commons", "石林剑状石柱。"),
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
            print(" small", filename, len(data))
            return False
        if data[:3] != b"\xff\xd8" and data[:8] != b"\x89PNG\r\n\x1a\n":
            print(" not image", filename)
            return False
        dest.write_bytes(data)
        print(" ok", dest.name, dest.stat().st_size)
        return True
    except Exception as e:
        print(" fail", filename, type(e).__name__, e)
        return False


def main() -> None:
    for sid, (fn, _c, _cap) in REPLACE.items():
        download_file(fn, OUT / f"{sid}.jpg")
    for sid, (fn, _c, _cap) in SECOND.items():
        dest = OUT / f"{sid}-2.jpg"
        if dest.exists() and dest.stat().st_size > 8000:
            print(" skip", dest.name)
            continue
        download_file(fn, dest)


if __name__ == "__main__":
    main()
