const AGE_TOKEN =
  /宙|代|纪|世|期|阶|Ma\b|百万年|亿年|年前|寒武|奥陶|志留|泥盆|石炭|二叠|三叠|侏罗|白垩|古近|新近|第四|全新|更新|上新|中新|渐新|始新|古新|震旦|南华|青白口|蓟县|长城|太古|元古|古生|中生|新生|前寒武|新元古|中元古|古元古|晚|早|中|现代|现今|至今|Holocene|Pleistocene|Pliocene|Miocene|Oligocene|Eocene|Paleocene|Quaternary|Neogene|Paleogene|Palaeogene|Cretaceous|Jurassic|Triassic|Permian|Carboniferous|Devonian|Silurian|Ordovician|Cambrian|Proterozoic|Archean|Precambrian|Paleozoic|Palaeozoic|Mesozoic|Cenozoic|Ediacaran|Cryogenian|Tonian|to the present|present\b|Ma\b/i;

const ROCK_OR_LANDFORM_ONLY =
  /^(丹霞|碳酸盐岩|石英砂岩|花岗岩|综合|喀斯特|火山|玄武岩|流纹岩|砂岩|灰岩|页岩|地貌|红层|峰林|熔岩|凝灰岩|片麻岩|片岩|板岩|大理岩|黄土|雅丹|海岸|化石|沉积岩|岩浆岩|变质岩)([、，/\s].*)?$/;

const ROCK_ENV =
  /\b(carbonate|limestone|dolostone|granite|sandstone|quartz[- ]sandstone|basalt|rhyolite|tuff|red beds?|karst|danxia|marine or tidal flat)\b/gi;

const NOT_AGE_CLAUSE = /\blater uplifted\b/gi;

/** Keep geologic time words only. Rock/landform labels do not belong in 时代. */
export function sanitizeGeologicAge(raw: string | null | undefined): string {
  let text = (raw || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (/^Age as listed/i.test(text)) return "";
  if (ROCK_OR_LANDFORM_ONLY.test(text) && !AGE_TOKEN.test(text)) return "";
  text = text
    .replace(ROCK_ENV, " ")
    .replace(NOT_AGE_CLAUSE, " ")
    .replace(/[，,;]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—·.\s]+|[-–—·.\s]+$/g, "")
    .trim();
  if (!text) return "";
  if (!AGE_TOKEN.test(text)) {
    if (/丹霞|碳酸盐|石英砂岩|花岗岩|综合|喀斯特/.test(raw || "") && (raw || "").length < 24) return "";
    return "";
  }
  return text;
}

export function ageLabel(raw: string | null | undefined, locale: "zh" | "en"): string {
  const v = sanitizeGeologicAge(raw);
  if (v) return v;
  return locale === "en" ? "Age not yet established" : "年代待考";
}

/** Replace template 「时代：碳酸盐岩」 clauses with a real age or 年代待考. */
export function rewriteAgeClause(text: string, age: string): string {
  if (!text) return text;
  const fallback = age ? `时代：${age}` : "时代：年代待考";
  const fake =
    /时代：?(碳酸盐岩|石英砂岩|丹霞|花岗岩|综合|火山岩|岩浆岩|变质岩|火成岩|海岸|红层|峰林|喀斯特|花岗闪长岩|超高压变质带|温泉与花岗岩|花岗岩海蚀|变质岩与碳酸盐岩)/g;
  let out = text.replace(fake, fallback);
  out = out.replace(/时代：([^。]{1,24})/g, (_m, token: string) => {
    const t = String(token).trim();
    if (AGE_TOKEN.test(t) && !ROCK_OR_LANDFORM_ONLY.test(t)) return `时代：${t}`;
    return fallback;
  });
  return out;
}
