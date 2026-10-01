import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteLinkCard } from "@/components/site/SiteLinkCard";
import { seoHead } from "@/lib/geo/canonical";
import { gsspSites } from "@/lib/geo/catalog";
import { localizeSite, placeLine, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/gssp/")({
  component: GsspIndex,
  head: () =>
    seoHead({
      title: "金钉子",
      description: "中国境内已批准的全球界线层型（金钉子）独立点。煤山一剖两钉，计为一处。",
      path: "/gssp",
    }),
});

function GsspIndex() {
  const list = gsspSites();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("gsspIndex")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("gsspLead")}</p>
        <p className="mt-2 text-xs text-muted">{t("gsspNote")}</p>
        <ul className="handbook-grid handbook-grid-2 mt-8">
          {list.map((s) => {
            const loc = localizeSite(s, locale);
            return (
              <li key={s.id}>
                <SiteLinkCard
                  site={s}
                  meta={
                    <>
                      {placeLine(s, locale)}
                      {loc.gssp?.stage_name ? ` · ${loc.gssp.stage_name}` : ""}
                    </>
                  }
                />
              </li>
            );
          })}
        </ul>
      </main>
      <AppFooter />
    </div>
  );
}
