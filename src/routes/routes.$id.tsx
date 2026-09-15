import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { OfflinePackButton } from "@/components/geo/OfflinePackButton";
import { ThemeMap } from "@/components/map/ThemeMap";
import { BiliEmbed, EmptyVideoSlot } from "@/components/media/BiliEmbed";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Button } from "@/components/ui/button";
import { getSite, getTheme, VIDEO_SLOT_ROUTES } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isOwnCover } from "@/lib/geo/safety";
import type { Site } from "@/lib/geo/types";
import {
  displayName,
  fossilLaw,
  localizeSite,
  photoCredit,
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
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.theme.name ?? "线路"} · 山石志` },
      {
        name: "description",
        content: loaderData?.theme.thesis ?? "地质主题线路",
      },
    ],
    links: [{ rel: "canonical", href: `/routes/${loaderData?.theme.id ?? ""}` }],
  }),
});

function ThemePage() {
  const { theme, points } = Route.useLoaderData();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const fossilLine = theme.id === "fossil" || theme.id === "gssp" || theme.id === "jehol-dinosaur";
  const mapped = points.map((p) => p.site).filter((s): s is Site => !!s);
  const task = themeTask(theme, locale);
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs tracking-wide text-muted uppercase">{t("themeTrails")}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">{themeName(theme, locale)}</h1>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/card/$id" params={{ id: theme.id }}>
              {t("fieldCard")}
            </Link>
          </Button>
          <OfflinePackButton
            pack={{
              kind: "trail",
              id: theme.id,
              title: theme.name,
              title_en: theme.name_en || theme.name,
              cover: mapped.find((s) => isOwnCover(s))?.cover_image,
              body_zh: [theme.thesis, theme.task || "", theme.site_roles.join("\n")].join("\n\n"),
              body_en: [theme.thesis_en || theme.thesis, theme.task_en || "", (theme.site_roles_en || []).join("\n")].join(
                "\n\n",
              ),
            }}
          />
        </div>
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold">{t("trailWhy")}</h2>
          <p className="mt-2 text-base leading-relaxed">{themeThesis(theme, locale)}</p>
        </section>
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
        {theme.video ? (
          <div className="mt-6">
            <BiliEmbed video={theme.video} />
          </div>
        ) : VIDEO_SLOT_ROUTES.has(theme.id) ? (
          <div className="mt-6">
            <EmptyVideoSlot />
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
        <div className="mt-6 overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
          <ThemeMap sites={mapped} />
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
                  <Link {...siteTo(site)} className="font-display mt-1 block text-xl font-semibold">
                    {displayName(site, locale)}
                  </Link>
                  <div className="mt-2">
                    <SiteBadges site={site} compact />
                  </div>
                </div>
                {isOwnCover(site) ? (
                  <>
                    <img
                      src={site.cover_image}
                      alt={photoCredit(site.cover_credit || "", locale)}
                      className="h-40 w-full object-cover"
                    />
                    <p className="px-4 pt-2 text-[11px] leading-snug text-muted">
                      {photoCredit(site.cover_credit || "", locale)}
                    </p>
                  </>
                ) : null}
                <div className="p-4 pt-3">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{t("proveJob")} · </span>
                    {themeRole(theme, i, locale)}
                  </p>
                  <p className="mt-2 text-sm text-muted">{localizeSite(site, locale).hook}</p>
                </div>
              </li>
            ) : null,
          )}
        </ol>
      </main>
    </div>
  );
}
