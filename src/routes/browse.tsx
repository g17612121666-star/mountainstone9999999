import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { SiteRowLink } from "@/components/site/SiteLinkCard";
import { seoHead } from "@/lib/geo/canonical";
import { sites } from "@/lib/geo/catalog";
import type { LandformType, Site } from "@/lib/geo/types";
import { landformLabel, useLocale, useT } from "@/lib/i18n";

type Bucket = {
  id: string;
  zh: string;
  en: string;
  match: (s: Site) => boolean;
};

const BUCKETS: Bucket[] = [
  { id: "danxia", zh: "红层与丹霞", en: "Red beds & Danxia", match: (s) => s.landform_types.includes("danxia") },
  { id: "karst", zh: "喀斯特", en: "Karst", match: (s) => s.landform_types.includes("karst") },
  {
    id: "sandstone",
    zh: "石英砂岩峰林",
    en: "Quartz-sandstone peaks",
    match: (s) => s.landform_types.includes("zhangjiajie_sandstone"),
  },
  { id: "granite", zh: "花岗岩", en: "Granite", match: (s) => s.landform_types.includes("granite_peak") },
  { id: "volcano", zh: "火山", en: "Volcano", match: (s) => s.landform_types.includes("volcano") },
  { id: "wind", zh: "风蚀与沙", en: "Wind and sand", match: (s) => s.landform_types.includes("yardang") },
  { id: "ice", zh: "冰川与极高山", en: "Ice and extreme mountains", match: (s) => s.landform_types.includes("glacier") },
  { id: "coast", zh: "海岸", en: "Coast", match: (s) => s.landform_types.includes("coast") },
  { id: "gssp", zh: "金钉子", en: "GSSP", match: (s) => s.types.includes("gssp") },
  { id: "fossil", zh: "化石产地（只看不挖）", en: "Fossil sites (look, don’t take)", match: (s) => s.landform_types.includes("fossil") },
  { id: "loess", zh: "黄土与河流", en: "Loess and rivers", match: (s) => s.landform_types.includes("loess") },
];

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
  head: () =>
    seoHead({
      title: "按过程逛",
      description: "按喀斯特、丹霞、石英砂岩峰林、花岗岩、火山、金钉子、化石产地浏览名录。",
      path: "/browse",
    }),
});

function BrowsePage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  const filled = BUCKETS.map((b) => ({ ...b, list: sites.filter(b.match) })).filter((b) => b.list.length);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("browse")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("browseLead")}</p>
        <nav className="chip-row mt-6" aria-label={t("browseIndex")}>
          {filled.map((b) => (
            <a key={b.id} href={`#${b.id}`} className="toc-chip">
              {en ? b.en : b.zh}
              <span className="ml-1 text-muted">{b.list.length}</span>
            </a>
          ))}
        </nav>
        <div className="mt-8 space-y-12">
          {filled.map((b) => {
            const title = en ? b.en : b.zh;
            return (
              <section key={b.id} id={b.id}>
                <h2 className="font-display flex flex-wrap items-baseline gap-2 text-xl font-semibold">
                  <span>{title}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-sm font-normal text-muted">
                    {b.list.length}
                  </span>
                </h2>
                <ul className="handbook-grid handbook-grid-2 mt-3">
                  {b.list.map((s) => (
                    <li key={s.id} className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
                      <SiteRowLink
                        site={s}
                        sub={s.landform_types
                          .slice(0, 2)
                          .map((lf) => landformLabel(lf as LandformType, locale))
                          .join(" · ")}
                      />
                    </li>
                  ))}
                </ul>
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
