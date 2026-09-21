#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8080";
const OUT = "/workspace/screenshots";
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "jixian", path: "/sites/jixian", w: 1280, h: 900 },
  { name: "meishan", path: "/gssp/changxing-meishan", w: 1280, h: 900 },
  { name: "xixian-analog", path: "/sites/xixian-loess", w: 1280, h: 900 },
  { name: "catalog", path: "/catalog", w: 1280, h: 900 },
  { name: "xiqiaoshan", path: "/sites/xiqiaoshan", w: 1280, h: 900 },
  { name: "shihuadong", path: "/sites/shihuadong", w: 1280, h: 900 },
  { name: "zhangye", path: "/sites/zhangye", w: 1280, h: 900 },
  { name: "sheshan", path: "/sites/sheshan", w: 1280, h: 900 },
  { name: "jixian-mobile", path: "/sites/jixian", w: 390, h: 844 },
  { name: "meishan-mobile", path: "/gssp/changxing-meishan", w: 390, h: 844 },
];

const e2a = [
  "jixian","fangshan","shihuadong","shidu","yanqing","songshan","taishan","yuntaishan",
  "danxiashan","zhangjiajie","shilin","wudalianchi","changbaishan","huangshan","sanqingshan",
  "xiqiaoshan","sheshan","chongming","luochuan","xixian-loess","hukou",
];

async function main() {
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const report = { shots: [], ages: {}, analog: {}, en: {}, catalog: {} };

  for (const s of shots) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await page.goto(BASE + s.path, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 20000 });
    await page.waitForTimeout(600);
    const file = `${OUT}/${s.name}.png`;
    await page.screenshot({ path: file, fullPage: false });
    const body = await page.locator("body").innerText();
    report.shots.push({
      name: s.name,
      file,
      waitbu: body.includes("待补"),
      emptyThumb: body.includes("暂无现场照片"),
      analog: body.includes("类比示意") || body.includes("Analog, not this park"),
      sat: body.includes("卫星资料照片") || body.includes("Satellite image"),
      pahoehoe_as_fact: /先认气孔、绳状熔岩/.test(body),
      fangshan_analog: s.name === "zhangye" && /下图为房山/.test(body),
    });
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const id of e2a) {
    await page.goto(`${BASE}/sites/${id}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(200);
    const age = await page.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/时代\s+([^\n]+)/);
      return m ? m[1].trim() : "";
    });
    const body = await page.locator("body").innerText();
    report.ages[id] = {
      age,
      waitbu: body.includes("待补"),
      stops: (body.match(/看这里/g) || []).length,
      hook: body.split("\n").find((l) => l.length > 12 && !l.includes("时代") && !l.includes("筛选")) || "",
    };
  }

  await page.goto(`${BASE}/sites/zhangye`, { waitUntil: "domcontentloaded" });
  const zy = await page.locator("body").innerText();
  report.analog.zhangye = {
    fangshan: zy.includes("下图为房山"),
    danxia: /下图为.{0,8}丹霞山/.test(zy),
    sat: zy.includes("卫星资料照片"),
  };
  await page.goto(`${BASE}/sites/zhangjiajie`, { waitUntil: "domcontentloaded" });
  const zj = await page.locator("body").innerText();
  report.analog.zhangjiajie = {
    karst: /下图为.{0,12}(石林|桂林)/.test(zj),
    sandstone: zj.includes("石英砂岩") || zj.includes("张石岩"),
  };
  await page.goto(`${BASE}/sites/xixian-loess`, { waitUntil: "domcontentloaded" });
  const xx = await page.locator("body").innerText();
  report.analog.xixian = { luochuan: xx.includes("洛川"), analog: xx.includes("类比示意") };

  await page.goto(`${BASE}/catalog`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 20000 });
  await page.waitForTimeout(600);
  const cat = await page.locator("body").innerText();
  const imgs = await page.locator("img").count();
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => !i.naturalWidth && i.src).map((i) => i.src).slice(0, 8),
  );
  report.catalog = { empty: cat.includes("暂无现场照片"), imgs, broken };

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const enBtn = page.getByRole("button", { name: "EN" });
  if (await enBtn.count()) {
    await enBtn.click();
    await page.waitForTimeout(800);
  } else {
    await page.evaluate(() => {
      localStorage.setItem("shanshizhi-locale", JSON.stringify({ state: { locale: "en" }, version: 0 }));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
  }
  const enNav = await page.locator("header").innerText();
  report.en.nav = enNav;
  report.en.navHasCJK = /[\u4e00-\u9fff]/.test(enNav.replace(/中文/g, ""));
  await page.screenshot({ path: `${OUT}/en-home.png`, fullPage: false });

  // streets layer
  const streets = page.getByText(/Streets|标准/, { exact: true }).first();
  if (await streets.count()) {
    await streets.click().catch(() => {});
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: `${OUT}/en-map-streets.png`, fullPage: false });
  const tiles = await page.evaluate(() =>
    [...document.querySelectorAll(".leaflet-tile")]
      .map((i) => i.src)
      .filter(Boolean)
      .slice(0, 6),
  );
  report.en.tiles = tiles;
  report.en.maptiler = tiles.some((u) => /maptiler/i.test(u));

  writeFileSync(`${OUT}/e0e3-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
