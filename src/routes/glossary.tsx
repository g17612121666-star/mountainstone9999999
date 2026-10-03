import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { Input } from "@/components/ui/input";
import { seoHead } from "@/lib/geo/canonical";
import { getSite } from "@/lib/geo/catalog";
import { GLOSSARY } from "@/lib/geo/glossary";
import { siteTo } from "@/lib/geo/href";
import { displayName, useLocale, useT } from "@/lib/i18n";

type Search = { q?: string };

const GROUPS: { id: string; zh: string; en: string; ids: string[] }[] = [
  {
    id: "landform",
    zh: "地貌",
    en: "Landform",
    ids: [
      "danxia",
      "karst",
      "fenglin",
      "fengcong",
      "karren",
      "tiankeng",
      "maar",
      "caldera",
      "colourhill",
      "yardang",
      "dune",
      "loess",
      "qzpillar",
      "mesa",
      "cave",
      "knick",
      "meander",
      "delta",
      "waveplat",
      "eqlake",
      "slidlake",
      "lavadam",
      "glacier",
      "horn",
      "impact",
    ],
  },
  {
    id: "structure",
    zh: "构造与结构",
    en: "Structure",
    ids: ["joint", "bedding", "unconformity", "planation", "spheroidal", "columnar", "fault", "crossbed"],
  },
  {
    id: "rock",
    zh: "岩石",
    en: "Rock",
    ids: [
      "redbed",
      "dolostone",
      "stromatolite",
      "granite",
      "rhyolite",
      "basalt",
      "trachyte",
      "neck",
      "tuff",
      "limestone",
      "conglomerate",
      "shale",
      "phenocryst",
      "ropelava",
    ],
  },
  {
    id: "time",
    zh: "层型与化石",
    en: "Time and fossils",
    ids: ["gssp", "stratotype", "conodont", "trilobite", "graptolite", "lager", "extinction", "ordohigh", "dinosaur", "marine"],
  },
  {
    id: "ethic",
    zh: "现场与名录",
    en: "Field and lists",
    ids: ["lookdonttake", "coords", "urban", "worldpark", "iugs"],
  },
];

export const Route = createFileRoute("/glossary")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
  component: GlossaryPage,
  head: () =>
    seoHead({
      title: "术语表",
      description: "节理、层理、不整合、丹霞、喀斯特、金钉子——一句人话，加一个能走去看的点。",
      path: "/glossary",
    }),
});

function GlossaryPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const { q } = Route.useSearch();
  const [filter, setFilter] = useState("");
  const en = locale === "en";
  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return GLOSSARY;
    return GLOSSARY.filter((term) =>
      [term.zh, term.en, term.def_zh, term.def_en, term.id].join(" ").toLowerCase().includes(needle),
    );
  }, [filter]);
  const letters = useMemo(() => {
    const first = new Map<string, string>();
    for (const term of filtered) {
      const label = en ? term.en : term.zh;
      const ch = (label.trim()[0] || "").toUpperCase();
      if (ch && !first.has(ch)) first.set(ch, term.id);
    }
    return [...first.entries()].sort((a, b) => a[0].localeCompare(b[0], en ? "en" : "zh-CN"));
  }, [filtered, en]);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("glossary")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("glossaryLead")}</p>
        <Input
          className="mt-5 max-w-md"
          placeholder={en ? "Search a term" : "搜索术语"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <nav className="chip-row mt-6" aria-label={t("glossaryIndex")}>
          {GROUPS.filter((g) => filtered.some((term) => g.ids.includes(term.id))).map((g) => (
            <a key={g.id} href={`#gloss-${g.id}`} className="toc-chip">
              {en ? g.en : g.zh}
            </a>
          ))}
        </nav>
        {en && letters.length > 1 ? (
          <nav className="mt-2 flex flex-wrap gap-1.5" aria-label={en ? "Letter index" : "首字索引"}>
            {letters.map(([ch, id]) => (
              <a key={ch} href={`#${id}`} className="filter-chip">
                {ch}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="mt-8 space-y-10">
          {GROUPS.map((g) => {
            const terms = filtered.filter((term) => g.ids.includes(term.id));
            if (!terms.length) return null;
            return (
              <section key={g.id} id={`gloss-${g.id}`}>
                <h2 className="font-display text-xl font-semibold">{en ? g.en : g.zh}</h2>
                <dl className="handbook-grid handbook-grid-2 handbook-keep-half mt-3">
                  {terms.map((term) => {
                    const site = getSite(term.site_id);
                    const active = q === term.id;
                    return (
                      <div
                        key={term.id}
                        id={term.id}
                        className={
                          active
                            ? "rounded-xl border border-moss/40 bg-moss/8 p-4 shadow-[var(--shadow-border)]"
                            : "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
                        }
                      >
                        <dt className="font-display text-xl font-semibold">{en ? term.en : term.zh}</dt>
                        <dd className="mt-2 text-sm leading-relaxed">{en ? term.def_en : term.def_zh}</dd>
                        {site ? (
                          <p className="mt-3 text-sm">
                            <span className="text-muted">{t("typicalSite")} · </span>
                            <Link {...siteTo(site)} className="text-moss underline">
                              {displayName(site, locale)}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </dl>
              </section>
            );
          })}
        </div>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
