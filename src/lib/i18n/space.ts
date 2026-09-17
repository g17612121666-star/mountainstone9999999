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

export function joinLabeled(label: string, value: string, locale: "zh" | "en"): string {
  const v = value.trim();
  if (!v) return "";
  if (locale === "en") return `${label} ${repairEnSpacing(v)}`.replace(/\s{2,}/g, " ");
  return `${label}${v}`;
}

/** Name and age never share a node without an explicit separator. */
export function joinNameAge(name: string, age: string, locale: "zh" | "en"): string {
  const n = name.replace(/^\d+[\.\s、．]+/, "").trim();
  const a = age.trim();
  if (!n) return "";
  if (!a) return locale === "en" ? repairEnSpacing(n) : n;
  const joined = `${n} · ${a}`;
  return locale === "en" ? repairEnSpacing(joined) : joined;
}

export function countChip(title: string, n: number): { title: string; count: string; aria: string } {
  return {
    title,
    count: String(n),
    aria: `${title} ${n}`,
  };
}
