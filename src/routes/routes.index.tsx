import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { themeRoutes } from "@/lib/geo/catalog";
import { isOwnCover } from "@/lib/geo/safety";
import { getSite } from "@/lib/geo/catalog";
import { themeName, themeThesis, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/routes/")({
  component: RoutesIndex,
  head: () => ({ meta: [{ title: "主题线路 · 山石志" }] }),
});

function RoutesIndex() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("trailsTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("trailsLead")}</p>
        <ul className="mt-8 space-y-4">
          {themeRoutes.map((tr) => {
            const thumb = tr.site_ids.map((id) => getSite(id)).find((s) => s && isOwnCover(s));
            return (
              <li key={tr.id}>
                <Link
                  to="/routes/$id"
                  params={{ id: tr.id }}
                  className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {thumb ? (
                    <img
                      src={thumb.cover_image}
                      alt=""
                      className="h-28 w-28 shrink-0 object-cover sm:h-auto sm:w-36"
                    />
                  ) : null}
                  <span className="block p-4">
                    <p className="font-display text-lg font-semibold">{themeName(tr, locale)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{themeThesis(tr, locale)}</p>
                    <p className="mt-2 text-xs text-subtle">
                      {tr.site_ids.length} {t("sites")}
                    </p>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
