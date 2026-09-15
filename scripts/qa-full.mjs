import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "http://127.0.0.1:8080";
mkdirSync("/workspace/screenshots", { recursive: true });

const FORBIDDEN = [
  "写在某",
  "再套地貌名词",
  "核心观景台",
  "剖面步道",
  "本园出露的沉积",
  "站在开放步道或观景台看",
  "暂无该打卡点公开露头照片",
];

const PAGES = [
  "/sites/yesanpo",
  "/sites/sheshan",
  "/sites/xixian-loess",
  "/sites/laoniuwan",
  "/sites/weizhoudao",
  "/sites/yonghe",
  "/sites/shihuadong",
  "/sites/chongming",
  "/sites/zhucheng",
  "/sites/xiangxi",
  "/sites/huanglong",
  "/sites/zhangshiyan",
  "/sites/luhe",
  "/sites/benxi",
  "/sites/danxiashan",
  "/sites/zhangjiajie",
  "/routes/loess-yellow-river",
  "/catalog",
];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const report = [];

for (const path of PAGES) {
  const url = BASE + path;
  const res = await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(600);
  const text = await page.locator("article, main, body").first().innerText();
  const imgs = await page.$$eval("img", (els) =>
    els.map((e) => ({ src: e.getAttribute("src") || "", alt: e.getAttribute("alt") || "" })),
  );
  const hits = FORBIDDEN.filter((f) => text.includes(f));
  const iframes = await page.$$eval("iframe", (els) => els.map((e) => e.getAttribute("src") || ""));
  const hero = imgs[0]?.src || "";
  const name = path.replace(/\W+/g, "_");
  await page.screenshot({ path: `/workspace/screenshots/qa2${name}.png`, fullPage: false });
  report.push({
    path,
    status: res?.status(),
    hits,
    hero,
    imgCount: imgs.length,
    covers: imgs.filter((i) => i.src.includes("/covers/")).map((i) => i.src),
    iframes,
    hasSchematic: text.includes("示意地层柱") || text.includes("示意地层"),
    hasEmptyVideo: text.includes("暂无合适现场讲解"),
  });
  console.log(path, "hits", hits, "hero", hero.slice(0, 70), "imgs", imgs.length, "schematic", text.includes("示意"));
}

await page.addInitScript(() => {
  localStorage.setItem("shanshizhi-locale", JSON.stringify({ state: { locale: "en" }, version: 0 }));
});
for (const path of ["/sites/shihuadong", "/sites/yesanpo", "/sites/sheshan", "/catalog", "/routes/loess-yellow-river"]) {
  await page.goto(BASE + path, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(500);
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  const body = await page.locator("article, main").first().innerText();
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const sample = body.slice(0, 220).replace(/\s+/g, " ");
  const name = "en" + path.replace(/\W+/g, "_");
  await page.screenshot({ path: `/workspace/screenshots/qa2${name}.png` });
  report.push({ path: "EN " + path, htmlLang, cjk, sample });
  console.log("EN", path, "lang", htmlLang, "cjk", cjk, sample.slice(0, 90));
}

writeFileSync("/workspace/screenshots/qa2-report.json", JSON.stringify(report, null, 2));
await browser.close();
console.log("done");
