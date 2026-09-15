import { Link } from "@tanstack/react-router";
import { LandformCover } from "@/components/cover/LandformCover";
import { LinkedText } from "@/components/geo/LinkedText";
import { OfficialBox } from "@/components/geo/OfficialBox";
import { OfflinePackButton } from "@/components/geo/OfflinePackButton";
import { BiliEmbed, EmptyVideoSlot } from "@/components/media/BiliEmbed";
import { SiteBadges } from "@/components/site/SiteBadges";
import { SiteMiniMap } from "@/components/site/SiteMiniMap";
import { VisitCard } from "@/components/site/VisitCard";
import { Button } from "@/components/ui/button";
import {
  getAreas,
  getGeosites,
  getRoutes,
  getSite,
  getTheme,
  getVisit,
  relatedSites,
  STOP_PHOTOS,
  VIDEO_SLOT_SITES,
} from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { isFakeGeosite, isGenericGeositeName } from "@/lib/geo/labels";
import { GENERIC_DO_NOT, isOwnCover, isRealPhoto } from "@/lib/geo/safety";
import type { Geosite, Site } from "@/lib/geo/types";
import {
  displayName,
  fossilLaw,
  landformLabel,
  localizeArea,
  localizeGeosite,
  localizeRoute,
  localizeSite,
  motto,
  phenomenonLabel,
  photoCredit,
  placeLine,
  themeName,
  themeThesis,
  useLocale,
  useT,
} from "@/lib/i18n";

export function SiteDetail({ site }: { site: Site }) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const s = localizeSite(site, locale);
  const geosites = getGeosites(site.id)
    .filter((g) => !isFakeGeosite(g) && !isGenericGeositeName(g.name))
    .map((g) => localizeGeosite(g, locale));
  const routes = getRoutes(site.id)
    .filter((r) => r.name !== "半日地质步道")
    .map((r) => localizeRoute(r, locale));
  const visit = getVisit(site.id);
  const areas = getAreas(site.id).map((a) => localizeArea(a, locale));
  const related = relatedSites(site);
  const photo = isRealPhoto(site.cover_image) ? site.cover_image : undefined;
  const stopSrcs = new Set(geosites.map((g) => g.photo).filter(Boolean));
  const leftoverPhotos = site.gallery.filter(
    (g) => g.src && g.src !== site.cover_image && !stopSrcs.has(g.src) && isRealPhoto(g.src),
  );
  const todayPhoto = leftoverPhotos[0];
  const extraPhotos = leftoverPhotos.slice(1);
  const legalAlreadyHasFossil =
    s.legal_notes.includes("古生物化石保护条例") || s.legal_notes.includes("state property");
  const fossilRelated =
    !legalAlreadyHasFossil &&
    (site.types.includes("gssp") ||
      site.landform_types.includes("fossil") ||
      s.legal_notes.includes("化石") ||
      s.legal_notes.includes("Fossil") ||
      site.theme_route_ids.includes("fossil"));

  return (
    <article className="pb-16">
      <div className="relative h-44 overflow-hidden sm:h-56">
        <LandformCover
          type={site.landform_types[0] ?? "other"}
          label={displayName(s, locale)}
          photo={photo}
          credit={site.cover_credit}
        />
      </div>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <header className="space-y-3">
          <SiteBadges site={site} />
          <h1 className="font-display text-3xl leading-tight font-semibold">{displayName(s, locale)}</h1>
          <p className="text-sm text-muted">
            {placeLine(site, locale)}
            {locale === "zh" && site.name_en ? ` · ${site.name_en}` : ""}
          </p>
          <p className="text-lg leading-relaxed">{s.hook}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" search={{ focus: site.id }}>
                {t("locate")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/card/$id" params={{ id: site.id }}>
                {t("fieldCard")}
              </Link>
            </Button>
          </div>
          <OfflinePackButton
            pack={{
              kind: "site",
              id: site.id,
              title: site.name,
              title_en: site.name_en || site.name,
              cover: photo,
              body_zh: [site.hook, site.formation_short, site.what_you_see_today, site.legal_notes]
                .filter(Boolean)
                .join("\n\n"),
              body_en: [s.hook, s.formation_short, s.what_you_see_today, s.legal_notes]
                .filter(Boolean)
                .join("\n\n"),
            }}
          />
        </header>

        {s.corrections?.length ? (
          <aside className="rounded-lg border border-hematite/30 bg-hematite/8 px-4 py-3 text-sm leading-relaxed">
            <p className="font-medium text-hematite">{t("correction")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {s.corrections.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </aside>
        ) : null}

        {s.gssp ? <GsspBlock site={s} original={site} /> : null}

        {s.park_structure ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("parkStructure")}</h2>
            <p className="mt-2 text-sm leading-relaxed">{s.park_structure}</p>
          </section>
        ) : null}

        <section>
          <h2 className="font-display text-xl font-semibold">{t("formation")}</h2>
          <p className="mt-2 text-sm leading-relaxed">
            <LinkedText text={s.formation_short} />
          </p>
          <p className="mt-2 text-xs text-subtle">
            {t("landformColon")}
            {site.landform_types.map((lf) => landformLabel(lf, locale)).join(" · ")}
            {s.geologic_age_text ? ` · ${t("age")} ${s.geologic_age_text}` : ""}
          </p>
        </section>

        {s.formation_timeline.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("timeline")}</h2>
            <ol className="mt-3 space-y-3">
              {s.formation_timeline.map((st, i) => (
                <li key={`${st.name}-${i}`} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sand text-xs text-primary-fg">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {st.name.replace(/^\d+[\.\s、．]+/, "")}
                      <span className="ml-2 text-xs font-normal text-muted">{st.age}</span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{st.what}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {s.evolution_sequence ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("sequence")}</h2>
            <p className="mt-2 font-display text-base leading-relaxed">
              <LinkedText text={s.evolution_sequence} />
            </p>
          </section>
        ) : null}

        {s.what_you_see_today ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("today")}</h2>
            <p className="mt-2 text-sm leading-relaxed">
              <LinkedText text={s.what_you_see_today} />
            </p>
            {todayPhoto ? (
              <figure className="mt-3 overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
                <img
                  src={todayPhoto.src}
                  alt={todayPhoto.caption || todayPhoto.credit}
                  className="h-48 w-full object-cover"
                />
                <figcaption className="px-3 py-2 text-[11px] leading-snug text-muted">
                  {photoCredit(todayPhoto.credit, locale)}
                  {locale === "zh" && todayPhoto.caption && todayPhoto.caption !== "资料照片，非本站踏勘"
                    ? ` · ${todayPhoto.caption}`
                    : ""}
                </figcaption>
              </figure>
            ) : null}
          </section>
        ) : null}

        {extraPhotos.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("photos")}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {extraPhotos.map((g) => (
                <li key={g.src} className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
                  <img src={g.src} alt={g.caption || g.credit} className="h-40 w-full object-cover" />
                  <p className="px-3 py-2 text-[11px] leading-snug text-muted">
                    {photoCredit(g.credit, locale)}
                    {locale === "zh" && g.caption && g.caption !== "资料照片，非本站踏勘"
                      ? ` · ${g.caption}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {site.video ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("video")}</h2>
            <div className="mt-3">
              <BiliEmbed video={site.video} />
            </div>
          </section>
        ) : VIDEO_SLOT_SITES.has(site.id) ? (
          <EmptyVideoSlot />
        ) : null}

        {areas.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("areas")}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {areas.map((a) => (
                <li key={a.id} className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
                  <p className="font-medium">{a.name}</p>
                  <p className="mt-1 text-sm text-muted">{a.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {geosites.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("stopMap")}</h2>
            <p className="mt-1 text-xs text-subtle">{t("stopMapNote")}</p>
            <div className="mt-3 overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
              <SiteMiniMap site={site} geosites={geosites} />
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted">{t("noFakeStops")}</p>
        )}

        {geosites.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">
              {t("fieldStops")}
              <span className="ml-2 text-sm font-normal text-muted">{geosites.length}</span>
            </h2>
            <ul className="mt-3 space-y-3">
              {geosites.map((g) => (
                <GeositeItem key={g.id} geosite={g} parkCover={site.cover_image} />
              ))}
            </ul>
          </section>
        ) : null}

        {routes.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("walking")}</h2>
            <ul className="mt-3 space-y-4">
              {routes.map((r) => (
                <li key={r.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                  <p className="font-display text-lg font-semibold">{r.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {r.duration} · {r.difficulty}
                    {r.distance_km != null ? ` · ${r.distance_km} ${t("km")}` : ""}
                    {r.elevation_m != null ? ` · ${t("relief")} ${r.elevation_m} m` : ""}
                  </p>
                  <p className="mt-2 text-sm">{r.how_to_go}</p>
                  <p className="mt-1 text-sm text-muted">{r.notes}</p>
                  {r.stop_geosite_ids.length > 0 ? (
                    <p className="mt-2 text-xs text-subtle">
                      {t("via")}
                      {r.stop_geosite_ids
                        .map((id) => geosites.find((g) => g.id === id)?.name ?? id)
                        .join(" → ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {s.observation_tips.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("handbook")}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {s.observation_tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {s.visible_rocks_minerals_fossils.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("treasures")}</h2>
            <ul className="mt-3 space-y-2">
              {s.visible_rocks_minerals_fossils.map((v, i) => (
                <li key={`${v.name}-${i}`} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
                  <p className="font-medium">{v.name}</p>
                  <p className="mt-1 text-sm text-muted">{v.how_to_recognize}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {visit ? <VisitCard visit={visit} officialWebsite={site.official_website} /> : null}

        <OfficialBox site={site} visit={visit} />

        {s.safety_notes.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("safety")}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {s.safety_notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="font-display text-xl font-semibold">{t("law")}</h2>
          <p className="mt-2 text-sm leading-relaxed">{s.legal_notes}</p>
          {fossilRelated ? (
            <p className="mt-3 rounded-lg border border-hematite/30 bg-hematite/8 p-3 text-sm leading-relaxed">
              {fossilLaw(locale)}
            </p>
          ) : null}
        </section>

        {related.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("related")}</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => {
                const lr = localizeSite(r, locale);
                return (
                  <li key={r.id}>
                    <Link
                      {...siteTo(r)}
                      className="flex items-center gap-3 rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]"
                    >
                      {isOwnCover(r) ? (
                        <img
                          src={r.cover_image}
                          alt={displayName(r, locale)}
                          className="h-14 w-20 shrink-0 rounded-md object-cover"
                        />
                      ) : null}
                      <span className="min-w-0">
                        <p className="font-medium">{displayName(r, locale)}</p>
                        <p className="mt-1 text-sm text-muted">{lr.hook}</p>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {site.theme_route_ids.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("themeTrails")}</h2>
            <ul className="mt-3 space-y-2">
              {site.theme_route_ids.map((id) => {
                const tr = getTheme(id);
                if (!tr) return null;
                return (
                  <li key={id}>
                    <Link
                      to="/routes/$id"
                      params={{ id }}
                      className="block rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
                    >
                      <p className="font-medium">{themeName(tr, locale)}</p>
                      <p className="mt-1 text-sm text-muted">{themeThesis(tr, locale)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {s.sources.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("sources")}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-subtle">
              {s.sources.map((src) => (
                <li key={src}>{src}</li>
              ))}
            </ul>
            {site.official_website ? (
              <p className="mt-2 text-sm">
                <a
                  className="text-moss underline"
                  href={site.official_website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("officialSite")}
                </a>
              </p>
            ) : null}
          </section>
        ) : null}

        {site.content_status === "standard" ? (
          <p className="text-xs text-subtle">{t("standardNote")}</p>
        ) : null}

        <p className="font-display text-center text-sm text-muted">{motto(locale)}</p>
      </div>
    </article>
  );
}

function GsspBlock({ site, original }: { site: Site; original: Site }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const g = site.gssp;
  if (!g) return null;
  const host =
    original.host_park_id != null && original.host_park_id !== ""
      ? getSite(original.host_park_id)
      : undefined;
  const rows: [string, string][] = [
    [t("stage"), g.stage_name],
    [t("boundary"), g.boundary_defined],
    [t("indexFossil"), g.index_fossil],
    [t("ratified"), String(g.ratified_year)],
    [t("section"), g.section_name],
    [t("visitPossible"), g.visit_possible],
    [t("protect"), g.protection_rule],
  ];
  return (
    <section className="rounded-xl border border-hematite/25 bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-xl font-semibold text-hematite">{t("gsspFile")}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2">
            <dt className="text-muted">{k}</dt>
            <dd className="leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
      {host ? (
        <p className="mt-3 text-sm">
          {t("hostPark")}
          <Link {...siteTo(host)} className="text-moss underline">
            {displayName(host, locale)}
          </Link>
        </p>
      ) : original.id === "meishan" ? (
        <p className="mt-3 text-sm text-muted">{t("meishanIndependent")}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">{t("independentGssp")}</p>
      )}
    </section>
  );
}

function GeositeItem({ geosite, parkCover }: { geosite: Geosite; parkCover?: string }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const extra = geosite.do_not.filter((d) => !GENERIC_DO_NOT.has(d));
  const photo = isRealPhoto(geosite.photo) ? geosite.photo : undefined;
  const reused = photo && parkCover && photo === parkCover;
  const show = photo && !reused;
  return (
    <li id={geosite.id} className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {show ? (
        <img src={photo} alt={geosite.name} className="h-40 w-full object-cover" />
      ) : null}
      <div className="p-4">
        {show ? (
          <p className="mb-2 text-[11px] text-muted">
            {photoCredit(STOP_PHOTOS[geosite.id]?.credit || "", locale)}
          </p>
        ) : null}
        <p className="text-xs text-muted">{phenomenonLabel(geosite.phenomenon_type, locale)}</p>
        <p className="font-display mt-0.5 text-lg font-semibold">{geosite.name}</p>
        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-medium">{t("lookHere")}</span>
          {geosite.look_here}
        </p>
        {geosite.public_precision === "area_only" ? (
          <p className="mt-1 text-xs text-subtle">{t("areaOnly")}</p>
        ) : null}
        {extra.length > 0 ? (
          <p className="mt-2 text-xs text-hematite">{extra.join(" · ")}</p>
        ) : null}
      </div>
    </li>
  );
}
