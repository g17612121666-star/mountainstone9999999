import { createFileRoute, Link } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { seoHead } from "@/lib/geo/canonical";
import { clipFor, coverFor, getSite } from "@/lib/geo/catalog";
import { COMPARE } from "@/lib/geo/compare";
import { siteTo } from "@/lib/geo/href";
import { displayName, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () =>
    seoHead({
      title: "容易认错的地貌",
      description: "丹霞、彩丘、砂岩峰林、南北喀斯特、天坑与玛珥、雅丹与丹霞、酸性柱状节理与玄武——现场用一条就能分开。",
      path: "/compare",
    }),
});

function ComparePage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("compareTitle")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{t("compareLead")}</p>
        <ol className="mt-8 space-y-10">
          {COMPARE.map((card) => {
            const sides = card.sides.map((side) => ({ side, site: getSite(side.site_id) }));
            const n = sides.length;
            const grid =
              n === 3 ? "handbook-grid handbook-grid-3" : n <= 1 ? "handbook-grid" : "handbook-grid handbook-grid-2";
            return (
              <li key={card.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
                <h2 className="font-display text-xl font-semibold">{en ? card.title_en : card.title_zh}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-moss/25 bg-moss/8 p-4">
                    <p className="text-xs font-semibold tracking-wide text-moss">{t("looksLike")}</p>
                    <p className="mt-2 text-base leading-relaxed text-ink">{en ? card.alike_en : card.alike_zh}</p>
                  </div>
                  <div className="rounded-lg border border-hematite/25 bg-hematite/8 p-4">
                    <p className="text-xs font-semibold tracking-wide text-hematite">{t("fieldSplit")}</p>
                    <p className="mt-2 text-base leading-relaxed text-ink">{en ? card.split_en : card.split_zh}</p>
                  </div>
                </div>
                <ul className={`mt-4 ${grid}`}>
                  {sides.map(({ side, site }) => {
                    if (!site) {
                      return (
                        <li key={`${card.id}-${side.site_id}`} className="rounded-lg border border-dashed border-border bg-surface-2 p-3">
                          <p className="text-xs font-medium text-muted">{t("unlisted")}</p>
                          <p className="font-display mt-1 text-lg font-semibold">{en ? side.title_en : side.title_zh}</p>
                          <p className="mt-1 text-sm text-muted">{t("unlistedNote")}</p>
                        </li>
                      );
                    }
                    const shot = coverFor(site);
                    const film = site.video?.bvid ? clipFor(site) : null;
                    return (
                      <li key={`${card.id}-${side.site_id}`} className="overflow-hidden rounded-lg border border-border bg-bg">
                        {shot ? (
                          <ClickableImage
                            src={shot.src}
                            alt={en ? side.title_en : side.title_zh}
                            caption={shot.related ? t("relatedPhoto") : undefined}
                            imgClass="h-36 w-full object-cover"
                            className="rounded-none shadow-none"
                          />
                        ) : null}
                        <div className="p-3">
                          <Link {...siteTo(site)} className="font-display text-lg font-semibold hover:underline">
                            {en ? side.title_en : side.title_zh}
                          </Link>
                          <p className="mt-1 text-xs text-muted">{displayName(site, locale)}</p>
                          <p className="mt-2 text-sm leading-relaxed">
                            <span className="font-medium">{t("howFormed")} · </span>
                            {en ? side.formed_en : side.formed_zh}
                          </p>
                          {film && !film.related ? (
                            <div className="mt-3">
                              <BiliEmbed video={film.video} poster={shot?.src} />
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
