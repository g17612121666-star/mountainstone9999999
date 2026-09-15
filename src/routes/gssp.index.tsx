import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { LandformCover } from "@/components/cover/LandformCover";
import { SiteBadges } from "@/components/site/SiteBadges";
import { gsspSites } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isOwnCover } from "@/lib/geo/safety";
import { displayName, localizeSite, photoCredit, placeLine, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/gssp/")({
  component: GsspIndex,
  head: () => ({
    meta: [
      { title: "金钉子 · 山石志" },
      {
        name: "description",
        content: "中国境内已批准的全球界线层型（金钉子）独立点。煤山一剖两钉，计为一处。",
      },
    ],
    links: [{ rel: "canonical", href: "/gssp" }],
  }),
});

function GsspIndex() {
  const list = gsspSites();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("gsspIndex")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("gsspLead")}</p>
        <ul className="mt-8 space-y-3">
          {list.map((s) => {
            const loc = localizeSite(s, locale);
            return (
              <li key={s.id}>
                <Link
                  {...siteTo(s)}
                  className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
                >
                  {isOwnCover(s) ? (
                    <img
                      src={s.cover_image}
                      alt={photoCredit(s.cover_credit || "", locale)}
                      className="h-24 w-28 shrink-0 object-cover"
                    />
                  ) : (
                    <span className="h-24 w-28 shrink-0 overflow-hidden">
                      <LandformCover
                        type={s.landform_types[0] ?? "stratigraphy"}
                        label={displayName(s, locale)}
                      />
                    </span>
                  )}
                  <span className="block p-4">
                    <SiteBadges site={s} compact />
                    <p className="font-display mt-2 text-xl font-semibold">{displayName(s, locale)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {placeLine(s, locale)}
                      {loc.gssp?.stage_name ? ` · ${loc.gssp.stage_name}` : ` · ${loc.hook}`}
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
