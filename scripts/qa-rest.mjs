import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8080";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pages = [
  "/sites/danxiashan",
  "/sites/zhangjiajie",
  "/routes/loess-yellow-river",
  "/catalog",
  "/sites/qiyunshan",
  "/sites/zhucheng",
];
for (const path of pages) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(700);
  const text = await page.locator("body").innerText();
  const imgs = await page.$$eval("img", (els) => els.map((e) => e.getAttribute("src") || ""));
  const iframes = await page.$$eval("iframe", (els) => els.map((e) => e.getAttribute("src") || ""));
  const name = path.replace(/\W+/g, "_");
  await page.screenshot({ path: `/workspace/screenshots/qa3${name}.png` });
  const forbidden = ["写在某", "再套地貌名词", "核心观景台", "剖面步道", "站在开放步道或观景台看"].filter((f) =>
    text.includes(f),
  );
  console.log(
    JSON.stringify({
      path,
      forbidden,
      nimg: imgs.length,
      covers: imgs.filter((s) => s.includes("/covers/")),
      bv: iframes.filter((s) => s.includes("bilibili")),
      hukou: imgs.some((s) => s.includes("hukou")),
      schematic: text.includes("示意"),
      emptyVideo: text.includes("暂无合适现场讲解"),
      specimen: text.includes("馆藏标本"),
    }),
  );
}

await page.addInitScript(() => {
  localStorage.setItem("shanshizhi-locale", JSON.stringify({ state: { locale: "en" }, version: 0 }));
});
for (const path of ["/sites/shihuadong", "/sites/yesanpo", "/sites/sheshan", "/catalog"]) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const body = await page.locator("article, main").first().innerText();
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  console.log("EN", path, lang, "cjk", cjk, body.slice(0, 140).replace(/\s+/g, " "));
  await page.screenshot({ path: `/workspace/screenshots/qa3en${path.replace(/\W+/g, "_")}.png` });
}

await browser.close();
