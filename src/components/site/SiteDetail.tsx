import { Link } from "@tanstack/react-router";
import { LandformCover } from "@/components/cover/LandformCover";
import { LinkedText } from "@/components/geo/LinkedText";
import { OfficialBox } from "@/components/geo/OfficialBox";
import { OfflinePackButton } from "@/components/geo/OfflinePackButton";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { FieldPhoto } from "@/components/media/FieldPhoto";
import { SiteBadges } from "@/components/site/SiteBadges";
import { SiteLinkCard } from "@/components/site/SiteLinkCard";
import { SiteMiniMap } from "@/components/site/SiteMiniMap";
import { VisitCard } from "@/components/site/VisitCard";
import { Button } from "@/components/ui/button";
import { ageLabel } from "@/lib/geo/age";
import {
  getAreas,
  getGeosite,
  getGeosites,
  getRoutes,
  getSite,
  getTheme,
  getVisit,
  relatedSites,
} from "@/lib/geo/catalog";
import { isPlaceholderCopy, visibleCopy } from "@/lib/geo/copy";
import { siteTo } from "@/lib/geo/href";
import { isFakeGeosite, isGenericGeositeName } from "@/lib/geo/labels";
import { GENERIC_DO_NOT, isDiagramCredit, isRealPhoto } from "@/lib/geo/safety";
import { fieldPhotoFromGeosite } from "@/lib/geo/photos";
import { stripLocatePhrase } from "@/lib/geo/look";
import type { Geosite, Site } from "@/lib/geo/types";
import {
  displayName,
  fossilLawFor,
  hasQualifiedEn,
  joinNameAge,
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
  const standard = site.content_status === "standard";
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
  const genesisSrc = site.genesis?.src;
  const leftoverPhotos = site.gallery.filter(
    (g) =>
      g.src &&
      g.src !== site.cover_image &&
      g.src !== genesisSrc &&
      isRealPhoto(g.src) &&
      !isDiagramCredit(g.credit || "", g.caption || ""),
  );
  const diagramPhotos = site.gallery.filter(
    (g) => g.src && isDiagramCredit(g.credit || "", g.caption || ""),
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
  const areaOnlyOnce = geosites.some((g) => g.public_precision === "area_only");
  const formation = visibleCopy(s.formation_short);
  const today = visibleCopy(s.what_you_see_today);
  const tips = (s.observation_tips || []).map(visibleCopy).filter(Boolean);
  const rocks = (s.visible_rocks_minerals_fossils || []).filter((v) => !isPlaceholderCopy(v.name));
  const safety = (s.safety_notes || []).map(visibleCopy).filter(Boolean);
  const legal = visibleCopy(s.legal_notes);
  const showEnPending = locale === "en" && !hasQualifiedEn(site.id);
  const age = ageLabel(s.geologic_age_text || site.geologic_age_text, locale);
  const enSite = localizeSite(site, "en");
  const locateNoteOnce =
    areaOnlyOnce || site.types.includes("gssp") || site.landform_types.includes("fossil");

  return (
    <article className="pb-20">
      <div className="relative h-56 overflow-hidden sm:h-72 md:h-96">
        <LandformCover
          type={site.landform_types[0] ?? "other"}
          label={displayName(s, locale)}
          photo={photo}
          credit={site.cover_credit}
          overlay
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-5 pt-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl leading-tight font-semibold text-primary-fg sm:text-4xl">
              {displayName(s, locale)}
            </h1>
            <p className="mt-1.5 text-sm text-primary-fg/85">
              {placeLine(site, locale)}
              {locale === "zh" && site.name_en ? ` · ${site.name_en}` : ""}
            </p>
            {photo ? (
              <p className="mt-2 max-w-xl truncate text-[11px] text-primary-fg/70">
                {photoCredit(site.cover_credit || "", locale)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <header className="space-y-4">
          <SiteBadges site={site} />
          {site.province === "香港" ? <p className="text-xs text-subtle">{t("hkWgs")}</p> : null}
          {showEnPending ? (
            <p className="rounded-md bg-surface-2 px-3 py-2 text-sm text-muted">{t("enBodyPending")}</p>
          ) : null}
          <p className="text-lg leading-relaxed text-ink">{s.hook}</p>
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
        </header>

        {s.corrections?.length ? (
          <aside className="border-l-2 border-hematite bg-hematite/6 px-4 py-3 text-sm leading-relaxed">
            <p className="font-medium tracking-wide text-hematite">{t("correction")}</p>
            <ul className="mt-2 space-y-1.5">
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

        {formation || site.genesis ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("formation")}</h2>
            <div className="mt-4 flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start">
              {site.genesis ? (
                <div className="order-2 md:order-1">
                  <FieldPhoto photo={site.genesis} />
                </div>
              ) : null}
              <div className="order-1 md:order-2">
                {formation ? (
                  <p className="text-sm leading-relaxed">
                    <LinkedText text={formation} />
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-subtle">
                  {t("landformColon")}
                  {site.landform_types.map((lf) => landformLabel(lf, locale)).join(" · ")}
                  <span className="mx-1">·</span>
                  {t("age")} {age}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <p className="text-xs text-subtle">
            {t("age")} {age}
          </p>
        )}

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
                    <p className="font-medium">{joinNameAge(st.name, st.age, locale)}</p>
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

        {today ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("today")}</h2>
            <p className="mt-2 text-sm leading-relaxed">
              <LinkedText text={today} />
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

        {diagramPhotos.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("diagramAppendix")}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {diagramPhotos.map((g) => (
                <li key={g.src} className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
                  <img src={g.src} alt={g.caption || g.credit} className="h-40 w-full object-contain bg-surface-2" />
                  <p className="px-3 py-2 text-[11px] leading-snug text-hematite">
                    {g.caption || t("diagramAppendix")}
                    {g.credit ? ` · ${photoCredit(g.credit, locale)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {site.video?.bvid ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("video")}</h2>
            <div className="mt-3">
              <BiliEmbed video={site.video} />
            </div>
          </section>
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
            {locateNoteOnce ? <p className="mt-1 text-xs text-subtle">{t("areaOnly")}</p> : null}
            <ul className="mt-3 space-y-3">
              {geosites.map((g) => (
                <GeositeItem key={g.id} geosite={g} />
              ))}
            </ul>
          </section>
        ) : null}

        {routes.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("walking")}</h2>
            <ul className="mt-3 space-y-4">
              {routes.map((r) => {
                const via = r.stop_geosite_ids
                  .map((id) => {
                    const fromPage = geosites.find((g) => g.id === id);
                    if (fromPage) return fromPage.name;
                    const raw = getGeosite(id);
                    return raw && !isGenericGeositeName(raw.name) ? raw.name : "";
                  })
                  .filter(Boolean);
                return (
                  <li key={r.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                    <p className="font-display text-lg font-semibold">{r.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {r.duration} · {r.difficulty}
                      {r.distance_km != null ? ` · ${r.distance_km} ${t("km")}` : ""}
                      {r.elevation_m != null ? ` · ${t("relief")} ${r.elevation_m} m` : ""}
                    </p>
                    {visibleCopy(r.how_to_go) ? <p className="mt-2 text-sm">{r.how_to_go}</p> : null}
                    {visibleCopy(r.notes) ? <p className="mt-1 text-sm text-muted">{r.notes}</p> : null}
                    {via.length > 0 ? (
                      <p className="mt-2 text-xs text-subtle">
                        {t("via")}
                        {via.join(" → ")}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {tips.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("handbook")}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {rocks.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("treasures")}</h2>
            <ul className="mt-3 space-y-2">
              {rocks.map((v, i) => (
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

        {safety.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("safety")}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {safety.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="font-display text-xl font-semibold">{t("law")}</h2>
          {legal ? <p className="mt-2 text-sm leading-relaxed">{legal}</p> : null}
          {fossilRelated ? (
            <p className="mt-3 rounded-lg border border-hematite/30 bg-hematite/8 p-3 text-sm leading-relaxed">
              {fossilLawFor(site.province, locale)}
            </p>
          ) : null}
        </section>

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
            body_en: [enSite.hook, enSite.formation_short, enSite.what_you_see_today, enSite.legal_notes]
              .filter(Boolean)
              .join("\n\n"),
          }}
        />

        {related.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("related")}</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <SiteLinkCard site={r} note={localizeSite(r, locale).hook} />
                </li>
              ))}
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
                  <li key={id} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
                    <p className="font-medium">
                      <Link to="/routes/$id" params={{ id }} className="hover:underline">
                        {themeName(tr, locale)}
                      </Link>
                    </p>
                    <p className="mt-1 text-sm text-muted">{themeThesis(tr, locale)}</p>
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

function GeositeItem({ geosite }: { geosite: Geosite }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const extra = geosite.do_not.filter((d) => !GENERIC_DO_NOT.has(d));
  const photo = fieldPhotoFromGeosite(geosite);
  return (
    <li id={geosite.id} className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {photo ? <FieldPhoto photo={photo} alt={geosite.name} imgClass="h-40 w-full object-cover" /> : (
        <p className="px-4 pt-4 text-xs text-muted">{t("noStopPhoto")}</p>
      )}
      <div className="p-4">
        <p className="text-xs text-muted">{phenomenonLabel(geosite.phenomenon_type, locale)}</p>
        <p className="font-display mt-0.5 text-lg font-semibold">{geosite.name}</p>
        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-medium">{t("lookHere")}</span>
          {stripLocatePhrase(geosite.look_here)}
        </p>
        {extra.length > 0 ? (
          <p className="mt-2 text-xs text-hematite">{extra.join(" · ")}</p>
        ) : null}
      </div>
    </li>
  );
}
