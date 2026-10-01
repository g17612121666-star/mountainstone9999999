import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { seoHead } from "@/lib/geo/canonical";
import { clipFor, getSite, themeRoutes } from "@/lib/geo/catalog";
import { isOwnCover } from "@/lib/geo/safety";
import type { LandformType } from "@/lib/geo/types";
import { LANDFORM_LABEL } from "@/lib/geo/types";
import { landformLabel, provinceLabel, themeName, themeThesis, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/routes/")({
  component: RoutesIndex,
  head: () =>
    seoHead({
      title: "主题线路",
      description: "一条线只讲一件事：这块石头是怎么变成这样的。",
      path: "/routes",
    }),
});

const LANDS = (Object.keys(LANDFORM_LABEL) as LandformType[]).filter((k) => k !== "other");

function RoutesIndex() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [landform, setLandform] = useState<LandformType | "">("");
  const [province, setProvince] = useState("");
  const rows = useMemo(() => {
    return themeRoutes
      .map((tr) => {
        const mapped = tr.site_ids.map((id) => getSite(id)).filter((s): s is NonNullable<typeof s> => !!s);
        const thumb = mapped.find((s) => isOwnCover(s));
        const provinces = [...new Set(mapped.map((s) => s.province))];
        const landforms = [...new Set(mapped.flatMap((s) => s.landform_types))];
        return { tr, mapped, thumb, provinces, landforms };
      })
      .filter((row) => {
        if (landform && !row.landforms.includes(landform)) return false;
        if (province && !row.provinces.includes(province)) return false;
        return true;
      });
  }, [landform, province]);
  const allProvinces = [
    ...new Set(
      themeRoutes.flatMap((tr) =>
        tr.site_ids.map((id) => getSite(id)?.province).filter((p): p is string => !!p),
      ),
    ),
  ];
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="display-title">{t("trailsTitle")}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed">{t("trailsLead")}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <select
            className="h-10 rounded-md border border-border-strong bg-surface px-2 text-sm"
            value={landform}
            onChange={(e) => setLandform(e.target.value as LandformType | "")}
            aria-label={t("trailsLandform")}
          >
            <option value="">{t("landformAny")}</option>
            {LANDS.map((l) => (
              <option key={l} value={l}>
                {landformLabel(l, locale)}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-border-strong bg-surface px-2 text-sm"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            aria-label={t("province")}
          >
            <option value="">{t("provinceAny")}</option>
            {allProvinces.map((p) => (
              <option key={p} value={p}>
                {provinceLabel(p, locale)}
              </option>
            ))}
          </select>
        </div>
        <ul className="handbook-grid handbook-grid-2 mt-8">
          {rows.map(({ tr, thumb, provinces, mapped }) => {
            const own = tr.video?.bvid ? tr.video : null;
            const borrowed = own ? null : mapped.map((s) => clipFor(s)).find((c) => !!c) || null;
            const film = own || borrowed?.video || null;
            return (
            <li key={tr.id} className="flex gap-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
              {thumb ? (
                <img
                  src={thumb.cover_image}
                  alt=""
                  className="h-28 w-28 shrink-0 object-cover sm:h-auto sm:w-32"
                />
              ) : null}
              <div className="min-w-0 flex-1 p-4">
                <p className="font-display text-lg font-semibold">
                  <Link to="/routes/$id" params={{ id: tr.id }} className="hover:underline">
                    {themeName(tr, locale)}
                  </Link>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{themeThesis(tr, locale)}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">
                    {tr.site_ids.length} {t("sites")}
                  </span>
                  {provinces.length ? (
                    <span>{provinces.map((p) => provinceLabel(p, locale)).join(" · ")}</span>
                  ) : null}
                </p>
                {film?.bvid ? (
                  <a
                    href={`https://www.bilibili.com/video/${film.bvid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-medium text-moss underline"
                  >
                    {own ? t("video") : t("videoRelated")}
                  </a>
                ) : null}
              </div>
            </li>
            );
          })}
        </ul>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
