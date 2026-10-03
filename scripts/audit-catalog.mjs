#!/usr/bin/env node
/**
 * Repeatable catalog audit for 山石志.
 *   node scripts/audit-catalog.mjs
 *   node scripts/audit-catalog.mjs --out data/audit/ledger.json
 *
 * Reads the raw JSON and cover files. It does not fetch the network.
 * Runtime merges (patches, deep pages) can still change what a page shows.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const outArg = process.argv.indexOf("--out");
const outPath = outArg >= 0 ? process.argv[outArg + 1] : "data/audit/ledger.json";

const sites = JSON.parse(readFileSync("data/sites.json", "utf8"));
const geosites = JSON.parse(readFileSync("data/geosites.json", "utf8"));
const routes = JSON.parse(readFileSync("data/routes.json", "utf8"));
const visits = JSON.parse(readFileSync("data/visits.json", "utf8"));

const GENERIC = /峰丛或溶洞观景台|岩溶峡谷步道|洞穴大厅入口|主园区观景台|典型露头|游客中心展板|火山锥观景台|熔岩流露头|核心观景台|剖面步道|半日地质步道/;
const CHINA = { lng: [73.4, 135.1], lat: [3.8, 53.6] };

const ledger = [];
function add(row) {
  ledger.push(row);
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc2 && marker !== 0xc1) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}

const files = readdirSync("public/covers");
const hashToFiles = new Map();
for (const name of files) {
  if (!/\.jpe?g$/i.test(name)) continue;
  const p = `public/covers/${name}`;
  const buf = readFileSync(p);
  const hash = createHash("md5").update(buf).digest("hex");
  const list = hashToFiles.get(hash) ?? [];
  list.push(name);
  hashToFiles.set(hash, list);
  const size = jpegSize(buf);
  const short = size ? Math.min(size.w, size.h) : null;
  if (short != null && short < 400) {
    add({
      id: name.replace(/\.jpe?g$/i, ""),
      field: "cover_file",
      issue: `短边 ${short}px（${size.w}×${size.h}）`,
      severity: "medium",
      suggestion: "换一张短边至少 800px 的图，换不到就空着",
      status: "open",
    });
  }
}
for (const [hash, names] of hashToFiles) {
  if (names.length < 2) continue;
  add({
    id: names.join("+"),
    field: "cover_file",
    issue: `字节相同 ${hash.slice(0, 8)}：${names.join(", ")}`,
    severity: "medium",
    suggestion: "只留真正属于该地点的那一张",
    status: "open",
  });
}

const sentenceCount = new Map();
for (const s of sites) {
  const lng = s.coordinates?.[0];
  const lat = s.coordinates?.[1];
  if (typeof lng !== "number" || typeof lat !== "number") {
    add({ id: s.id, field: "coordinates", issue: "缺坐标", severity: "high", suggestion: "补上或标待核实", status: "open" });
  } else if (lng < CHINA.lng[0] || lng > CHINA.lng[1] || lat < CHINA.lat[0] || lat > CHINA.lat[1]) {
    add({
      id: s.id,
      field: "coordinates",
      issue: `落在粗略国界盒外 ${lng},${lat}`,
      severity: "high",
      suggestion: "核对后改到中国一侧，或标明跨境",
      status: "open",
    });
  }
  const age = s.geologic_age_text || "";
  if (/年代待考与|与碳酸盐岩|与花岗岩|与温泉|与峡谷|与冰川/.test(age)) {
    add({ id: s.id, field: "geologic_age_text", issue: age, severity: "high", suggestion: "拆开，查不到就写待核实", status: "open" });
  }
  const a = s.geologic_age_start_ma;
  const b = s.geologic_age_end_ma;
  if (typeof a === "number" && typeof b === "number") {
    if (a < b && a > 0 && b - a > 20) {
      add({
        id: s.id,
        field: "geologic_age",
        issue: `起 ${a} 小于止 ${b}，像是把老的和新的写反了`,
        severity: "high",
        suggestion: "确认哪头是更老的",
        status: "open",
      });
    }
    if (a === b) {
      add({
        id: s.id,
        field: "geologic_age",
        issue: `年龄区间长度为 0（${a}）`,
        severity: "low",
        suggestion: "若只是一个年龄点，在台账里注明，不要假装成一段",
        status: "open",
      });
    }
  }
  if (!age) {
    add({ id: s.id, field: "geologic_age_text", issue: "年代为空", severity: "medium", suggestion: "查到再写，否则页面显示待核实", status: "open" });
  }
  const credit = s.cover_credit || "";
  if (/<[^>]+>|href=/.test(credit)) {
    add({ id: s.id, field: "cover_credit", issue: "署名里有 HTML", severity: "medium", suggestion: "洗成作者和许可证", status: "open" });
  }
  for (const field of ["hook", "formation_short", "what_you_see_today"]) {
    const text = (s[field] || "").replace(/\s+/g, "");
    if (text.length < 12) continue;
    const key = field + ":" + text;
    sentenceCount.set(key, (sentenceCount.get(key) ?? 0) + 1);
  }
  if ((s.video && s.video.bvid) || false) {
    /* counted below */
  }
}

for (const [key, n] of sentenceCount) {
  if (n < 8) continue;
  const field = key.slice(0, key.indexOf(":"));
  add({
    id: `(${n} sites)`,
    field,
    issue: `同一句出现 ${n} 次`,
    severity: "high",
    suggestion: "不要再套同一句。写不出就标简卡",
    status: "open",
  });
}

const fakeStops = geosites.filter((g) => GENERIC.test(g.name || "") || /-auto\d+$/.test(g.id || ""));
const exactFake = fakeStops.filter((g) => g.public_precision === "exact");
add({
  id: "geosites",
  field: "public_precision",
  issue: `套话观察点 ${fakeStops.length}，其中标成 exact 的 ${exactFake.length}`,
  severity: "high",
  suggestion: "页面已隐藏套话点。原始表还在，不要当成实测点",
  status: "hidden-in-ui",
});

const templateRoutes = routes.filter((r) => r.name === "半日地质步道");
add({
  id: "routes",
  field: "name",
  issue: `名为「半日地质步道」的线路 ${templateRoutes.length} 条`,
  severity: "high",
  suggestion: "页面不再展示这个名字。有真实线路再补",
  status: "hidden-in-ui",
});

const withVideo = sites.filter((s) => s.video?.bvid).length;
add({
  id: "videos",
  field: "video",
  issue: `sites.json 里自带视频 ${withVideo} 处（合并媒体表后会多几条）`,
  severity: "low",
  suggestion: "没有核实过的相关片子就不要借别的园来顶",
  status: "policy",
});

const ticketNotes = new Map();
for (const v of visits) {
  const note = v.price_note || "";
  ticketNotes.set(note, (ticketNotes.get(note) ?? 0) + 1);
}
add({
  id: "visits",
  field: "price_note",
  issue: `票价说明只有 ${ticketNotes.size} 种句子，共 ${visits.length} 条`,
  severity: "medium",
  suggestion: "未核实的票价不要写具体数字",
  status: "open",
});

const summary = {
  generated: new Date().toISOString().slice(0, 10),
  sites: sites.length,
  geosites: geosites.length,
  routes: routes.length,
  ledger: ledger.length,
  high: ledger.filter((r) => r.severity === "high").length,
  medium: ledger.filter((r) => r.severity === "medium").length,
  low: ledger.filter((r) => r.severity === "low").length,
};
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify({ summary, ledger }, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
console.log("wrote", outPath);
void statSync;
