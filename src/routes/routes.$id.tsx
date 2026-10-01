import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { OfflinePackButton } from "@/components/geo/OfflinePackButton";
import { ThemeMap } from "@/components/map/ThemeMap";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { MapFrame } from "@/components/site/MapFrame";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { seoHead } from "@/lib/geo/canonical";
import { clipFor, coverFor, getSite, getTheme } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { ageLabel } from "@/lib/geo/age";
import type { Site } from "@/lib/geo/types";
import {
  displayName,
  fossilLaw,
  landformLabel,
  localizeSite,
  themeName,
  themeRole,
  themeTask,
  themeThesis,
  useLocale,
  useT,
} from "@/lib/i18n";

export const Route = createFileRoute("/routes/$id")({
  loader: ({ params }) => {
    const theme = getTheme(params.id);
    if (!theme) throw notFound();
    const points = theme.site_ids.map((id, i) => ({
      site: getSite(id),
      role: theme.site_roles[i] ?? "",
    }));
    return { theme, points };
  },
  component: ThemePage,
  head: ({ loaderData }) =>
    seoHead({
      title: loaderData?.theme.name ?? "线路",
      description: loaderData?.theme.thesis ?? "地质主题线路",
      path: `/routes/${loaderData?.theme.id ?? ""}`,
    }),
});

function ThemePage() {
  const { theme, points } = Route.useLoaderData();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const fossilLine = theme.id === "fossil" || theme.id === "gssp" || theme.id === "jehol-dinosaur";
  const mapped = points.map((p) => p.site).filter((s): s is Site => !!s);
  const task = themeTask(theme, locale);
  const trailFilm = theme.video?.bvid
    ? { video: theme.video, related: false as const }
    : mapped.map((s) => clipFor(s)).find((c) => c) || null;
  const trailCover = mapped.map((s) => coverFor(s)).find((c) => c)?.src;
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-xs tracking-wide text-muted uppercase">{t("themeTrails")}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">{themeName(theme, locale)}</h1>
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold">{t("trailWhy")}</h2>
          <p className="mt-2 text-base leading-relaxed">{themeThesis(theme, locale)}</p>
        </section>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/card/$id" params={{ id: theme.id }}>
              {t("fieldCard")}
            </Link>
          </Button>
        </div>
        {task ? (
          <aside className="mt-6 rounded-lg border border-moss/25 bg-moss/8 p-4 text-sm leading-relaxed">
            <p className="font-medium">{t("trailTask")}</p>
            <p className="mt-1">{task}</p>
          </aside>
        ) : null}
        {fossilLine ? (
          <aside className="mt-6 rounded-lg border border-hematite/30 bg-hematite/8 p-4 text-sm leading-relaxed">
            {fossilLaw(locale)}
          </aside>
        ) : null}
        {trailFilm ? (
          <div className="mt-6">
            {trailFilm.related ? (
              <h2 className="font-display mb-3 text-lg font-semibold">{t("videoRelated")}</h2>
            ) : null}
            <BiliEmbed video={trailFilm.video} poster={trailCover} />
          </div>
        ) : null}
        {theme.article ? (
          <p className="mt-4 text-sm">
            <span className="text-muted">{t("article")} · </span>
            <a
              href={theme.article.url}
              className="text-moss underline"
              target="_blank"
              rel="noreferrer"
            >
              {locale === "en" ? theme.article.title_en || theme.article.title : theme.article.title}
            </a>
          </p>
        ) : null}
        <div className="mt-6">
          <MapFrame>
            <ThemeMap sites={mapped} />
          </MapFrame>
        </div>
        <ol className="mt-8 space-y-4">
          {points.map(({ site }, i) =>
            site ? (
              <li key={site.id} className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
                <div className="p-4 pb-3">
                  <p className="text-xs text-muted">
                    {t("trailStop")} {i + 1}
                    {locale === "zh" ? t("trailStopOf") : ""}
                  </p>
                  <p className="font-display mt-1 text-xl font-semibold">
                    <Link {...siteTo(site)} className="hover:underline">
                      {displayName(site, locale)}
                    </Link>
                  </p>
                  <div className="mt-2">
                    <SiteBadges site={site} compact />
                  </div>
                </div>
                {(() => {
                  const shot = coverFor(site);
                  if (!shot) return null;
                  return (
                    <ClickableImage
                      src={shot.src}
                      alt={displayName(site, locale)}
                      imgClass="h-44 w-full object-cover"
                      className="rounded-none shadow-none"
                    />
                  );
                })()}
                <div className="p-4 pt-3">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{t("proveJob")} · </span>
                    {themeRole(theme, i, locale)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{localizeSite(site, locale).hook}</p>
                  {(() => {
                    const loc = localizeSite(site, locale);
                    const lands = site.landform_types
                      .map((lf) => landformLabel(lf, locale))
                      .filter((label) => label && label !== "其他" && label !== "Other");
                    const age = ageLabel(loc.geologic_age_text || site.geologic_age_text, locale);
                    if (!lands.length && !age) return null;
                    return (
                      <p className="meta-row mt-3">
                        {lands.map((label) => (
                          <span key={label} className="meta-tag">
                            {label}
                          </span>
                        ))}
                        {age ? (
                          <span className="meta-tag">{locale === "en" ? `Age ${age}` : `时代 ${age}`}</span>
                        ) : null}
                      </p>
                    );
                  })()}
                  {site.video?.bvid && site.video.bvid !== trailFilm?.video.bvid ? (
                    <div className="mt-3">
                      <BiliEmbed video={site.video} poster={coverFor(site)?.src} />
                    </div>
                  ) : null}
                </div>
              </li>
            ) : (
              <li key={`missing-${i}`} className="rounded-xl border border-dashed border-border bg-surface-2 p-4">
                <p className="text-xs font-medium text-muted">{t("unlisted")}</p>
                <p className="font-display mt-1 text-lg font-semibold">{theme.site_ids[i]}</p>
                <p className="mt-1 text-sm text-muted">{t("unlistedNote")}</p>
              </li>
            ),
          )}
        </ol>
        <div className="mt-8">
          <OfflinePackButton
            pack={{
              kind: "trail",
              id: theme.id,
              title: theme.name,
              title_en: theme.name_en || theme.name,
              cover: trailCover,
              body_zh: [theme.thesis, theme.task || "", theme.site_roles.join("\n")].join("\n\n"),
              body_en: [
                theme.thesis_en || theme.thesis,
                theme.task_en || "",
                (theme.site_roles_en || []).join("\n"),
              ].join("\n\n"),
            }}
          />
        </div>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
