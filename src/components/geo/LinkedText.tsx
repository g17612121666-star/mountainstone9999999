import { Link } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { GLOSSARY } from "@/lib/geo/glossary";
import { useLocale } from "@/lib/i18n";

/** Link each glossary term at most once per text block. */
export function LinkedText({ text }: { text: string }) {
  const locale = useLocale((s) => s.locale);
  const words = GLOSSARY.map((t) => ({
    id: t.id,
    word: locale === "en" ? t.en : t.zh,
  })).sort((a, b) => b.word.length - a.word.length);

  const nodes: ReactNode[] = [];
  const used = new Set<string>();
  let rest = text;
  let key = 0;
  while (rest.length) {
    let hit: { id: string; word: string; at: number } | null = null;
    for (const w of words) {
      if (used.has(w.id)) continue;
      const at = rest.indexOf(w.word);
      if (at >= 0 && (!hit || at < hit.at || (at === hit.at && w.word.length > hit.word.length))) {
        hit = { ...w, at };
      }
    }
    if (!hit) {
      nodes.push(<Fragment key={key++}>{rest}</Fragment>);
      break;
    }
    if (hit.at > 0) {
      nodes.push(<Fragment key={key++}>{rest.slice(0, hit.at)}</Fragment>);
    }
    used.add(hit.id);
    nodes.push(
      <Link
        key={key++}
        to="/glossary"
        search={{ q: hit.id }}
        className="text-moss underline decoration-moss/40 underline-offset-2"
      >
        {hit.word}
      </Link>,
    );
    rest = rest.slice(hit.at + hit.word.length);
  }
  return <>{nodes}</>;
}
