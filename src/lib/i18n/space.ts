import { sanitizeGeologicAge } from "@/lib/geo/age";

const AGE_ROCK =
  /(Mesozoic|Cenozoic|Paleozoic|Palaeozoic|Cretaceous|Jurassic|Triassic|Permian|Carboniferous|Devonian|Silurian|Ordovician|Cambrian|Quaternary|Neogene|Paleogene|Palaeogene|Precambrian|Proterozoic|Archean)(?=[A-Za-z])/gi;

const WORD_WORD =
  /(?<=[a-z])(?=[A-Z])|(?<=[A-Za-z])(?=\d)|(?<=\d)(?=[A-Z])/g;

const GLUED: Array<[RegExp, string | ((m: string) => string)]> = [
  [/deposited(?=marine)/gi, "deposited "],
  [/joints(?=Mesozoic)/gi, "joints "],
  [/Dissolution(?=to)/gi, "Dissolution "],
  [/limestone(?=Shilin)/gi, "limestone "],
  [/Cambrian(?=Wuliuan)/gi, "Cambrian "],
  [/(granite|limestone|sandstone|basalt|karst|marine|red beds)(?=[A-Z])/gi, (m: string) => `${m} `],
];

/** Insert missing spaces in unvetted English concatenations. Never invent translations. */
export function repairEnSpacing(s: string): string {
  if (!s) return s;
  let out = s.replace(AGE_ROCK, (m) => `${m} `);
  out = out.replace(WORD_WORD, " ");
  for (const [re, ins] of GLUED) {
    out = out.replace(re, ins as never);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Drop machine glue and editor notes. Do not add geology that was not already in the sentence. */
export function polishMachineEn(raw: string): string {
  if (!raw) return "";
  if (/copy-edited|english body not yet/i.test(raw)) return "";
  let out = repairEnSpacing(raw);
  out = out.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");
  out = out.replace(/\bgranite\s+peaks?\b(?:\s*,?\s*and\s+|\s*,?\s*)granite\s+peaks?\b/gi, "granite peaks");
  out = out.replace(/Listed age:\s*([^.]+)\./gi, (_m, token: string) => {
    const age = sanitizeGeologicAge(String(token));
    return age ? `Age: ${age}.` : "";
  });
  out = out.replace(/\bAge as listed\.?/gi, "");
  out = out.replace(/\bred beds\s+danxia\b/gi, "Danxia red beds");
  out = out
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(/:\s*\./g, ".")
    .trim();
  return out;
}

export function joinLabeled(label: string, value: string, locale: "zh" | "en"): string {
  const v = value.trim();
  if (!v) return "";
  if (locale === "en") return `${label} ${polishMachineEn(v)}`.replace(/\s{2,}/g, " ").trim();
  return `${label}${v}`;
}

/** Name and age never share a node without an explicit separator. */
export function joinNameAge(name: string, age: string, locale: "zh" | "en"): string {
  const n = name.replace(/^\d+[\.\s、．]+/, "").trim();
  const a = age.trim();
  if (!n) return "";
  if (!a) return locale === "en" ? polishMachineEn(n) : n;
  const joined = `${n} · ${a}`;
  return locale === "en" ? polishMachineEn(joined) : joined;
}

export function countChip(title: string, n: number): { title: string; count: string; aria: string } {
  return {
    title,
    count: String(n),
    aria: `${title} ${n}`,
  };
}