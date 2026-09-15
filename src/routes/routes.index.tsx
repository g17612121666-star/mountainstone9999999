import { createFileRoute, Link } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { seoHead } from "@/lib/geo/canonical";
import { getSite, themeRoutes } from "@/lib/geo/catalog";
import { isOwnCover } from "@/lib/geo/safety";
import { themeName, themeThesis, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/routes/")({
  component: RoutesIndex,
  head: () =>
    seoHead({
      title: "主题线路",
      description: "每条线只讲一个地质过程。点在线上负责证明什么，写在各自的角色里。",
      path: "/routes",
    }),
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
            const provinces = [
              ...new Set(
                tr.site_ids
                  .map((id) => getSite(id)?.province)
                  .filter((p): p is string => !!p),
              ),
            ].slice(0, 4);
            return (
              <li key={tr.id} className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
                {thumb ? (
                  <img
                    src={thumb.cover_image}
                    alt=""
                    className="h-28 w-28 shrink-0 object-cover sm:h-auto sm:w-36"
                  />
                ) : null}
                <div className="min-w-0 flex-1 p-4">
                  <p className="font-display text-lg font-semibold">
                    <Link
                      to="/routes/$id"
                      params={{ id: tr.id }}
                      className="hover:underline"
                    >
                      {themeName(tr, locale)}
                    </Link>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{themeThesis(tr, locale)}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5">
                      {tr.site_ids.length} {t("sites")}
                    </span>
                    {provinces.length ? <span>{provinces.join(" · ")}</span> : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <AppFooter />
    </div>
  );
}
