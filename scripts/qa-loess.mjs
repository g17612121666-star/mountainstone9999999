import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await page.goto("http://127.0.0.1:8080/routes/loess-yellow-river", {
  waitUntil: "domcontentloaded",
  timeout: 20000,
});
await page.waitForTimeout(800);
const stops = await page.$$eval("article li, article section li, a[href*='/sites/']", (els) =>
  els.slice(0, 20).map((e) => ({
    text: (e.innerText || "").slice(0, 80).replace(/\s+/g, " "),
    imgs: [...e.querySelectorAll("img")].map((i) => i.getAttribute("src")),
  })),
);
console.log(JSON.stringify(stops, null, 2));
const html = await page.content();
const hukouCount = (html.match(/hukou\.jpg/g) || []).length;
const xixian = html.includes("xixian") || html.includes("隰县");
console.log("hukou.jpg count", hukouCount, "xixian mentioned", xixian);
await page.evaluate(() => window.scrollTo(0, 1800));
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/qa-loess-stops.png" });
await page.evaluate(() => window.scrollTo(0, 2600));
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/qa-loess-stops2.png" });
await browser.close();
