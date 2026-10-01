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

function spinEn(seed: string, lines: string[]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  return lines[h % lines.length] || lines[0];
}

/** Drop machine glue and editor notes. Do not add geology that was not already in the sentence. */
export function polishMachineEn(raw: string): string {
  if (!raw) return "";
  if (/copy-edited|english body not yet/i.test(raw)) return "";
  let out = repairEnSpacing(raw);
  out = out.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");
  out = out.replace(/\bgranite\s+peaks?\b(?:\s*,?\s*and\s+|\s*,?\s*)granite\s+peaks?\b/gi, "granite peaks");
  out = out.replace(
    /^(.+?) is built on ([^.]+)\.\s*(?:Listed age:[^.]+\.\s*|Age as listed\.?\s*)?(?:Name the rock first, then the process\.\s*)?(?:Confirm mix-ups on the park page\.\s*)?(?:Look, don.?t take\.?\s*)?(?:Look, do not take\.?\s*)?$/i,
    (_m, name: string, thing: string) => {
      const what = thing.replace(/\s+locality$/i, " site").replace(/\s+geosite$/i, "").trim();
      const line = spinEn(`${name}${what}`, [
        `${name} is a ${what} stop. Start with the rock in front of you.`,
        `At ${name} you are looking at ${what}. Colour and grain first.`,
        `${name}: ${what}. Look. Don't take a piece home.`,
      ]);
      return line;
    },
  );
  out = out.replace(
    /\bRock:\s*([^.]+)\.\s*Process:\s*([^.]+)\./gi,
    "The rock is $1. What made this shape: $2.",
  );
  out = out.replace(/Listed age:\s*([^.]+)\./gi, (_m, token: string) => {
    const age = sanitizeGeologicAge(String(token));
    return age ? `Age: ${age}.` : "";
  });
  out = out.replace(/\bAge as listed\.?/gi, "");
  out = out.replace(/\bred beds\s+danxia\b/gi, "Danxia red beds");
  out = out.replace(/\bRock:\s*/g, "The rock is ");
  out = out.replace(/\bProcess:\s*/g, "What happened: ");
  out = out.replace(/\bStructure:\s*/g, "How it broke: ");
  out = out.replace(/Rock first, structure next, a surface process last\.?/gi, "Rock, then the cracks, then whatever wore it down.");
  out = out.replace(/Name the rock first, then the process\.?/gi, "Start with the rock, then how it got this shape.");
  out = out.replace(/Name the rock before the landform word\.?/gi, "Say what the rock is before you name the landform.");
  out = out.replace(/The rock you can point to on the path\.?/gi, "Whatever you can point at from the path.");
  out = out.replace(/The silhouette can match a different rock\.?/gi, "The outline can belong to a different rock.");
  out = out.replace(/Name colou?r, grain, bedding or phenocrysts first\.?/gi, "Colour and grain first. Then see if it is layered.");
  out = out.replace(/Confirm mix-ups on the park page\.?/gi, "The easy mix-ups are on the park page.");
  out = out.replace(/\bis built on fossil locality\.?/gi, " is a fossil site.");
  out = out.replace(/Field ID: texture and structure\.\s*/gi, "Texture, and how it breaks. ");
  out = out.replace(/written on /gi, "is what you read at ");
  out = out.replace(/Name the (lithology|rock) first\.\s*/gi, "Start with whatever rock is in front of you. ");
  out = out.replace(/This is a section, not a scenic mountain\.\s*/gi, "You are looking at a section, not a viewpoint. ");
  out = out.replace(/not surveyed by this site\.?\s*/gi, "");
  out = out.replace(/Reference photo[^.]{0,80}\.?\s*/gi, "");
  out = out.replace(/Wikimedia Commons[^.]{0,40}\.?\s*/gi, "");
  out = out.replace(/This guide does not sell tickets\.?\s*/gi, "");
  out = out.replace(/Check the official listing on the day\.?\s*/gi, "");
  out = out.replace(/Look, don[’']t take\.?\s*/gi, "Look. Don't take a piece home. ");
  out = out.replace(/Look, do not take\.?\s*/gi, "Look. Don't take a piece home. ");
  out = out.replace(/Look, do not collect\.?\s*/gi, "Don't collect. ");
  {
    let named = 0;
    out = out.replace(/Name the rock\.?/gi, () => {
      named += 1;
      return named === 1 ? "Name the rock in front of you." : "";
    });
  }
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