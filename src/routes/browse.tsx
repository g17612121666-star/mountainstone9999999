import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { sites } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isOwnCover } from "@/lib/geo/safety";
import type { LandformType, Site } from "@/lib/geo/types";
import { displayName, landformLabel, useLocale, useT } from "@/lib/i18n";

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
  head: () => ({
    meta: [
      { title: "按过程逛 · 山石志" },
      { name: "description", content: "按喀斯特、丹霞、石英砂岩峰林、花岗岩、火山、金钉子、化石产地浏览名录。" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
});

function BrowsePage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("browse")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("browseLead")}</p>
        <div className="mt-10 space-y-12">
          {BUCKETS.map((b) => {
            const list = sites.filter(b.match);
            if (!list.length) return null;
            return (
              <section key={b.id} id={b.id}>
                <h2 className="font-display text-xl font-semibold">
                  {en ? b.en : b.zh}
                  <span className="ml-2 text-sm font-normal text-muted">{list.length}</span>
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {list.map((s) => (
                    <li key={s.id}>
                      <Link
                        {...siteTo(s)}
                        className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
                      >
                        {isOwnCover(s) ? (
                          <img src={s.cover_image} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                        ) : null}
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{displayName(s, locale)}</span>
                          <span className="block text-xs text-muted">
                            {s.landform_types
                              .slice(0, 2)
                              .map((lf) => landformLabel(lf as LandformType, locale))
                              .join(" · ")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
