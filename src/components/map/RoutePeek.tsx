import { Link } from "@tanstack/react-router";
import { getSite, getTheme } from "@/lib/geo/catalog";
import { useMapStore } from "@/lib/geo/store";
import { displayName, themeName, themeThesis, useLocale, useT } from "@/lib/i18n";

export function RoutePeek() {
  const id = useMapStore((s) => s.activeRouteId);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const select = useMapStore((s) => s.select);
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const theme = id ? getTheme(id) : undefined;
  if (!theme) return null;
  return (
    <article className="max-h-[40dvh] overflow-y-auto rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">{t("routeOnMap")}</p>
      <h2 className="font-display text-xl font-semibold">{themeName(theme, locale)}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink">{themeThesis(theme, locale)}</p>
      <ol className="mt-3 space-y-1">
        {theme.site_ids.map((sid, i) => {
          const site = getSite(sid);
          if (!site) return null;
          return (
            <li key={sid}>
              <button
                type="button"
                className="flex w-full items-baseline gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-surface-2"
                onClick={() => select(site.id)}
              >
                <span className="text-xs text-muted">{i + 1}</span>
                <span className="font-medium">{displayName(site, locale)}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex gap-2">
        <Link to="/routes/$id" params={{ id: theme.id }} className="filter-chip">
          {t("openGuide")}
        </Link>
        <button type="button" className="filter-chip" onClick={() => setActiveRoute(null)}>
          {t("close")}
        </button>
      </div>
    </article>
  );
}
