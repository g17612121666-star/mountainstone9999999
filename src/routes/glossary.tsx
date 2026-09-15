import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { getSite } from "@/lib/geo/catalog";
import { GLOSSARY } from "@/lib/geo/glossary";
import { siteTo } from "@/lib/geo/href";
import { displayName, useLocale, useT } from "@/lib/i18n";

type Search = { q?: string };

export const Route = createFileRoute("/glossary")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
  component: GlossaryPage,
  head: () => ({
    meta: [
      { title: "术语表 · 山石志" },
      { name: "description", content: "节理、层理、不整合、丹霞、喀斯特、金钉子——一句人话，加一个能走去看的点。" },
    ],
    links: [{ rel: "canonical", href: "/glossary" }],
  }),
});

function GlossaryPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const { q } = Route.useSearch();
  const en = locale === "en";
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("glossary")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("glossaryLead")}</p>
        <dl className="mt-8 space-y-4">
          {GLOSSARY.map((term) => {
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
      </main>
    </div>
  );
}
