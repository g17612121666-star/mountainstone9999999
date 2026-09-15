import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
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
    ids: ["danxia", "karst", "fenglin", "fengcong", "karren", "tiankeng", "maar", "caldera"],
  },
  {
    id: "structure",
    zh: "构造与结构",
    en: "Structure",
    ids: ["joint", "bedding", "unconformity", "planation", "spheroidal", "columnar"],
  },
  {
    id: "rock",
    zh: "岩石",
    en: "Rock",
    ids: ["redbed", "dolostone", "stromatolite"],
  },
  {
    id: "time",
    zh: "层型",
    en: "Stratotype",
    ids: ["gssp", "stratotype"],
  },
  {
    id: "ethic",
    zh: "现场伦理",
    en: "Field ethic",
    ids: ["lookdonttake"],
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
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("glossary")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("glossaryLead")}</p>
        <Input
          className="mt-5 max-w-md"
          placeholder={en ? "Search a term" : "搜索术语"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="mt-8 space-y-10">
          {GROUPS.map((g) => {
            const terms = filtered.filter((term) => g.ids.includes(term.id));
            if (!terms.length) return null;
            return (
              <section key={g.id}>
                <h2 className="font-display text-xl font-semibold">{en ? g.en : g.zh}</h2>
                <dl className="mt-3 space-y-4">
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
    </div>
  );
}
