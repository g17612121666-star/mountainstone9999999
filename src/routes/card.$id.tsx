import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { seoHead } from "@/lib/geo/canonical";
import { getGeosites, getSite, getTheme } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isFakeGeosite, isGenericGeositeName } from "@/lib/geo/labels";
import { stripLocatePhrase } from "@/lib/geo/look";
import { ClickableImage } from "@/components/media/FieldPhoto";
import { isOwnCover } from "@/lib/geo/safety";
import {
  displayName,
  localizeGeosite,
  localizeSite,
  motto,
  photoCredit,
  themeName,
  themeRole,
  themeTask,
  themeThesis,
  useLocale,
  useT,
} from "@/lib/i18n";

export const Route = createFileRoute("/card/$id")({
  loader: ({ params }) => {
    const site = getSite(params.id);
    if (site) return { kind: "site" as const, site, theme: undefined };
    const theme = getTheme(params.id);
    if (theme) return { kind: "trail" as const, site: undefined, theme };
    throw notFound();
  },
  component: CardPage,
  head: ({ loaderData }) => {
    const name = loaderData?.site?.name ?? loaderData?.theme?.name ?? "观察卡";
    const path = `/card/${loaderData?.site?.id ?? loaderData?.theme?.id ?? ""}`;
    return seoHead({
      title: `${name}`,
      description: "一页能装进口袋的观察卡。只看不挖。",
      path,
    });
  },
});

function cardLook(name: string, look: string): string {
  return stripLocatePhrase(look)
    .replace(new RegExp(`站在开放步道或观景台看「${name}」。?`), "")
    .trim();
}

function CardPage() {
  const data = Route.useLoaderData();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="field-card mx-auto w-full max-w-xl px-4 py-8">
        <p className="text-xs tracking-wide text-muted uppercase">{t("fieldCard")}</p>
        {data.kind === "site" && data.site ? <SiteCardBody /> : <TrailCardBody />}
        <div className="no-print mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            className="h-11 rounded-md bg-sand px-4 text-sm font-medium text-primary-fg"
            onClick={() => window.print()}
          >
            {t("printCard")}
          </button>
          <Link to="/" className="flex h-11 items-center px-3 text-sm text-moss underline">
            {t("backMap")}
          </Link>
        </div>
        <p className="mt-6 text-center font-display text-sm text-muted">{motto(locale)}</p>
      </main>
      <AppFooter />
    </div>
  );
}

function SiteCardBody() {
  const { site } = Route.useLoaderData();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  if (!site) return null;
  const s = localizeSite(site, locale);
  const allStops = getGeosites(site.id).filter((g) => !isFakeGeosite(g) && !isGenericGeositeName(g.name));
  const stops = allStops.map((g) => localizeGeosite(g, locale));
  const own = isOwnCover(site);
  const stopThumbs = allStops
    .filter(
      (g) =>
        g.photo &&
        g.photo !== site.cover_image &&
        g.photo_kind !== "analog" &&
        g.photo_kind !== "satellite" &&
        !g.analog_from_id,
    )
    .slice(0, 4);
  return (
    <>
      <h1 className="font-display mt-1 text-3xl font-semibold">{displayName(site, locale)}</h1>
      {own ? (
        <ClickableImage
          src={site.cover_image}
          alt={displayName(site, locale)}
          caption={photoCredit(site.cover_credit || "", locale)}
          imgClass="h-36 w-full object-cover"
          className="mt-4"
          badge={t("photoKindRef")}
        />
      ) : null}
      {stopThumbs.length ? (
        <ul
          className={
            stopThumbs.length === 3
              ? "handbook-grid handbook-grid-3 mt-3"
              : "handbook-grid handbook-grid-2 mt-3"
          }
        >
          {stopThumbs.map((g) => {
            const loc = localizeGeosite(g, locale);
            return (
              <li key={g.id}>
                <ClickableImage
                  src={g.photo!}
                  alt={loc.name}
                  caption={loc.name}
                  imgClass="h-20 w-full object-cover"
                  badge={t("photoKindField")}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-4 text-base leading-relaxed">{s.hook}</p>
      {stops.length ? (
        <section className="mt-5">
          <h2 className="font-display text-lg font-semibold">
            {t("fieldStops")}
            <span className="ml-2 text-sm font-normal text-muted">{stops.length}</span>
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {stops.map((g) => (
              <li key={g.id}>
                <span className="font-medium">{g.name}</span>
                <span className="mt-0.5 block text-ink">{cardLook(g.name, g.look_here)}</span>
                {!g.photo || g.photo_kind === "analog" || g.photo_kind === "satellite" || g.analog_from_id ? (
                  <span className="mt-1 block text-sm font-medium text-ink">{t("noStopPhoto")}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {s.observation_tips[0] ? (
        <section className="mt-5">
          <h2 className="font-display text-lg font-semibold">{t("trailTask")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{s.observation_tips[0]}</p>
        </section>
      ) : null}
      <aside className="mt-5 rounded-lg border border-hematite/30 p-3 text-sm leading-relaxed">
        <p className="font-medium">{t("lookDontTake")}</p>
      </aside>
      <p className="no-print mt-6 text-sm">
        <Link {...siteTo(site)} className="text-moss underline">
          {t("openGuide")}
        </Link>
      </p>
    </>
  );
}

function TrailCardBody() {
  const { theme } = Route.useLoaderData();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  if (!theme) return null;
  const task = themeTask(theme, locale);
  return (
    <>
      <h1 className="font-display mt-1 text-3xl font-semibold">{themeName(theme, locale)}</h1>
      <p className="mt-4 text-base leading-relaxed">{themeThesis(theme, locale)}</p>
      {task ? (
        <aside className="mt-5 rounded-lg border border-moss/25 p-3 text-sm leading-relaxed">
          <p className="font-medium">{t("trailTask")}</p>
          <p className="mt-1">{task}</p>
        </aside>
      ) : null}
      <ol className="mt-5 space-y-3">
        {theme.site_ids.map((id, i) => {
          const site = getSite(id);
          if (!site) return null;
          const own = isOwnCover(site);
          return (
            <li key={id} className="flex gap-3 text-sm leading-relaxed">
              {own ? (
                <img
                  src={site.cover_image}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded object-cover"
                />
              ) : null}
              <span>
                <span className="block text-xs text-muted">
                  {t("trailStop")} {i + 1}
                  {locale === "zh" ? t("trailStopOf") : ""}
                </span>
                <span className="font-medium">{displayName(site, locale)}</span>
                <span className="mt-0.5 block text-muted">{themeRole(theme, i, locale)}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <aside className="mt-5 rounded-lg border border-hematite/30 p-3 text-sm leading-relaxed">
        <p className="font-medium">{t("lookDontTake")}</p>
      </aside>
      <p className="no-print mt-6 text-sm">
        <Link to="/routes/$id" params={{ id: theme.id }} className="text-moss underline">
          {t("themeTrails")}
        </Link>
      </p>
    </>
  );
}
