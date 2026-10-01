import { createServerFn } from "@tanstack/react-start";
import { getSite, sites } from "./catalog";
import { visibleCopy } from "./copy";
import { shortName } from "./labels";
import { localizeSite } from "@/lib/i18n/localize";
import type { Site } from "./types";

const LAND: Record<string, string[]> = {
  danxia: ["丹霞", "danxia", "红崖"],
  zhangjiajie_sandstone: ["张家界", "砂岩", "峰林", "sandstone", "zhangjiajie"],
  karst: ["喀斯特", "溶洞", "石林", "karst"],
  volcano: ["火山", "volcano", "玄武"],
  granite_peak: ["花岗岩", "granite"],
  fossil: ["化石", "fossil", "恐龙", "dinosaur"],
  stratigraphy: ["地层", "剖面", "金钉子", "gssp"],
  yardang: ["雅丹", "yardang", "敦煌"],
  coast: ["海岸", "海蚀", "coast"],
  glacier: ["冰川", "glacier"],
  loess: ["黄土", "loess"],
  geo_hazard: ["滑坡", "地震"],
};

const FALLBACK = [
  "danxiashan",
  "zhangjiajie",
  "huangshan",
  "shilin",
  "changbaishan",
  "chengjiang",
  "meishan",
  "sheshan",
  "dunhuang",
  "hongkong",
  "songshan",
];

function scoreSite(site: Site, q: string): number {
  const n = q.toLowerCase();
  let score = 0;
  const sn = shortName(site.name).toLowerCase();
  if (sn.length >= 2 && n.includes(sn)) score += 14;
  const en = (site.name_en || "").toLowerCase().split(",")[0]?.trim() || "";
  if (en.length > 3 && n.includes(en)) score += 12;
  if (site.province && n.includes(site.province)) score += 7;
  if (site.city && site.city.length >= 2 && n.includes(site.city)) score += 6;
  for (const lf of site.landform_types) {
    if ((LAND[lf] || []).some((w) => n.includes(w.toLowerCase()))) score += 5;
  }
  if (/金钉|gssp|阶/.test(n) && site.types.includes("gssp")) score += 7;
  if (/上海/.test(n) && (site.province === "上海" || site.id === "sheshan" || /崇明|佘山/.test(site.name))) score += 8;
  if (/化石|fossil|恐龙/.test(n) && (site.landform_types.includes("fossil") || site.types.includes("gssp") || /化石/.test(site.hook))) {
    score += 5;
  }
  if (/周末|不爬|近一点|城市/.test(n) && (site.province === "上海" || site.province === "江苏" || site.province === "浙江" || site.types.includes("urban_geosite"))) {
    score += 2;
  }
  return score;
}

function lineFor(site: Site, locale: "zh" | "en"): string {
  const loc = localizeSite(site, locale);
  const name = locale === "en" ? loc.name_en || shortName(site.name) : shortName(site.name);
  const hook = visibleCopy(loc.hook).slice(0, 72);
  return `${site.id} | ${name} | ${site.province} | ${site.landform_types.join(",")} | ${hook}`;
}

function spoken(site: Site, locale: "zh" | "en"): { why: string; watch: string } {
  const loc = localizeSite(site, locale);
  return {
    why: visibleCopy(loc.hook).slice(0, 180) || shortName(site.name),
    watch: visibleCopy(loc.observation_tips?.[0] || loc.what_you_see_today).slice(0, 180),
  };
}

function parsePicks(text: string): { intro: string; picks: { id: string; why: string; watch: string }[] } | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(trimmed.slice(start, end + 1)) as {
      intro?: string;
      picks?: { id?: string; why?: string; watch?: string }[];
    };
    if (!Array.isArray(obj.picks)) return null;
    return {
      intro: String(obj.intro || "").slice(0, 280),
      picks: obj.picks.slice(0, 4).map((p) => ({
        id: String(p?.id || "").trim(),
        why: String(p?.why || "").slice(0, 220),
        watch: String(p?.watch || "").slice(0, 220),
      })),
    };
  } catch {
    return null;
  }
}

let lastCall = 0;

export const recommendPlaces = createServerFn({ method: "POST" })
  .validator((data: { wish?: string; locale?: string }) => {
    const wish = String(data?.wish ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    const locale = data?.locale === "en" ? ("en" as const) : ("zh" as const);
    return { wish, locale };
  })
  .handler(async ({ data }) => {
    if (data.wish.length < 2) return { ok: false as const, error: "short" as const };

    const ranked = sites
      .map((s) => ({ s, score: scoreSite(s, data.wish) }))
      .sort((a, b) => b.score - a.score);
    const hits = ranked.filter((r) => r.score > 0).slice(0, 12);
    const pool = hits.length
      ? hits
      : FALLBACK.map((id) => sites.find((s) => s.id === id))
          .filter((s): s is Site => !!s)
          .map((s) => ({ s, score: 1 }));
    const fallback = pool.slice(0, 4).map(({ s }) => ({ id: s.id, ...spoken(s, data.locale) }));
    const listIntro =
      data.locale === "en"
        ? "These are the closest places already in the guide."
        : "名录里这几处比较贴你说的。";

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, intro: listIntro, picks: fallback };
    }

    const now = Date.now();
    if (now - lastCall < 2000) return { ok: false as const, error: "slow" as const };
    lastCall = now;

    const system = `You recommend places in a pocket geology guide. Reply with JSON only, no markdown.
{"intro":"one or two spoken sentences","picks":[{"id":"id from the list","why":"one sentence","watch":"one sentence: what to look at, and what not to hammer"}]}
Use 3 or 4 picks. Only ids from the list. Sound like a person typing, not a brochure. No "certainly". No "as an AI".
Language: ${data.locale === "en" ? "English" : "Chinese"}.
Do not mix these up: Sheshan is an urban site; Shanghai's national geopark is Chongming Island. Zhangye's colourful hills are not Danxia. Zhangjiajie quartz sandstone is not karst. Xiqiao is a trachyte dome, not Hawaiian rope lava. Fossils: look, don't take.`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.4,
          max_tokens: 500,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Wish: ${data.wish}\n\nPlaces:\n${pool.map(({ s }) => lineFor(s, data.locale)).join("\n")}`,
            },
          ],
        }),
      });
      if (!res.ok) return { ok: true as const, intro: listIntro, picks: fallback };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const parsed = parsePicks(body.choices?.[0]?.message?.content ?? "");
      const allowed = new Set(pool.map(({ s }) => s.id));
      const picks = (parsed?.picks || []).filter((p) => p.id && allowed.has(p.id) && getSite(p.id)).slice(0, 4);
      if (!picks.length) return { ok: true as const, intro: listIntro, picks: fallback };
      return {
        ok: true as const,
        intro: parsed?.intro || listIntro,
        picks: picks.map((p) => ({
          id: p.id,
          why: p.why || spoken(getSite(p.id)!, data.locale).why,
          watch: p.watch || spoken(getSite(p.id)!, data.locale).watch,
        })),
      };
    } catch {
      return { ok: true as const, intro: listIntro, picks: fallback };
    }
  });
