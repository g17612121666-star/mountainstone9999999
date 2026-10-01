import { Link } from "@tanstack/react-router";
import { LandformCover } from "@/components/cover/LandformCover";
import { LinkedText } from "@/components/geo/LinkedText";
import { OfflinePackButton } from "@/components/geo/OfflinePackButton";
import { BiliEmbed } from "@/components/media/BiliEmbed";
import { ClickableImage, FieldPhoto } from "@/components/media/FieldPhoto";
import { SiteBadges } from "@/components/site/SiteBadges";
import { SiteLinkCard } from "@/components/site/SiteLinkCard";
import { MapFrame } from "@/components/site/MapFrame";
import { SiteMiniMap } from "@/components/site/SiteMiniMap";
import { BackToTop } from "@/components/layout/BackToTop";
import { Button } from "@/components/ui/button";
import { ageLabel } from "@/lib/geo/age";
import {
  clipFor,
  coverFor,
  getAreas,
  getGeosite,
  getGeosites,
  getRoutes,
  getSite,
  getTheme,
  relatedEntries,
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
  joinNameAge,
  landformLabel,
  localizeArea,
  localizeGeosite,
  localizeRoute,
  localizeSite,
  motto,
  phenomenonLabel,
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
  const areas = getAreas(site.id).map((a) => localizeArea(a, locale));
  const related = relatedEntries(site);
  const shot = coverFor(site);
  const photo = shot?.src;
  const film = clipFor(site);
  const genesisSrc = site.genesis?.src;
  const leftoverPhotos = site.gallery.filter(
    (g) =>
      g.src &&
      g.src !== site.cover_image &&
      g.src !== genesisSrc &&
      isRealPhoto(g.src) &&
      !isDiagramCredit(g.credit || "", g.caption || ""),
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
  const age = ageLabel(s.geologic_age_text || site.geologic_age_text, locale);
  const landBits = site.landform_types
    .map((lf) => landformLabel(lf, locale))
    .filter((label) => label && label !== "其他" && label !== "Other");
  const enSite = localizeSite(site, "en");
  const locateNoteOnce =
    areaOnlyOnce || site.types.includes("gssp") || site.landform_types.includes("fossil");

  const toc: { id: string; label: string }[] = [];
  if (s.gssp) toc.push({ id: "sec-gssp", label: t("gsspFile") });
  if (formation || site.genesis) toc.push({ id: "sec-formation", label: t("formation") });
  if (today) toc.push({ id: "sec-today", label: t("today") });
  if (film) toc.push({ id: "sec-video", label: film.related ? t("videoRelated") : t("video") });
  if (geosites.length > 0) toc.push({ id: "sec-map", label: t("stopMap") });
  if (geosites.length > 0) toc.push({ id: "sec-stops", label: t("fieldStops") });
  if (related.length > 0) toc.push({ id: "sec-related", label: t("related") });

  return (
    <article id="main" className="pb-20">
      {shot ? (
        <div className="relative h-64 overflow-hidden sm:h-80 md:h-[28rem]">
          <LandformCover
            type={site.landform_types[0] ?? "other"}
            label={displayName(s, locale)}
            photo={shot.src}
            overlay
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent px-4 pb-7 pt-28">
            <div className="mx-auto max-w-3xl">
              <p className="text-sm text-primary-fg/90">
                {placeLine(site, locale)}
                {locale === "zh" && site.name_en ? ` · ${site.name_en}` : ""}
              </p>
              <h1 className="font-display mt-1 text-4xl leading-[1.15] font-semibold text-primary-fg drop-shadow-sm sm:text-5xl">
                {displayName(s, locale)}
              </h1>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {!shot ? (
          <div>
            <h1 className="font-display text-4xl leading-tight font-semibold">{displayName(s, locale)}</h1>
            <p className="mt-2 text-sm text-muted">
              {placeLine(site, locale)}
              {locale === "zh" && site.name_en ? ` · ${site.name_en}` : ""}
            </p>
          </div>
        ) : null}
        {toc.length > 2 ? (
          <nav className="chip-row" aria-label={t("pageIndex")}>
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="toc-chip">
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
        <header className="space-y-4">
          <SiteBadges site={site} />
          {site.province === "香港" ? <p className="text-sm text-ink">{t("hkWgs")}</p> : null}
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

        {s.gssp ? (
          <div id="sec-gssp">
            <GsspBlock site={s} original={site} />
          </div>
        ) : null}

        {s.park_structure ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("parkStructure")}</h2>
            <p className="mt-2 text-sm leading-relaxed">{s.park_structure}</p>
          </section>
        ) : null}

        {formation || site.genesis ? (
          <section id="sec-formation">
            <h2 className="font-display text-xl font-semibold">{t("formation")}</h2>
            <div className="mt-4 flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start">
              {site.genesis ? (
                <div className="order-2 md:order-1">
                  <FieldPhoto photo={site.genesis} role="genesis" />
                </div>
              ) : null}
              <div className="order-1 md:order-2">
                {formation ? (
                  <p className="text-sm leading-relaxed">
                    <LinkedText text={formation} />
                  </p>
                ) : null}
                {landBits.length || age ? (
                  <p className="meta-row mt-3">
                    {landBits.map((label) => (
                      <span key={label} className="meta-tag">
                        {label}
                      </span>
                    ))}
                    {age ? (
                      <span className="meta-tag">
                        {locale === "en" ? `Age ${age}` : `时代 ${age}`}
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : age ? (
          <p className="meta-row">
            <span className="meta-tag">{locale === "en" ? `Age ${age}` : `时代 ${age}`}</span>
          </p>
        ) : null}

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
          <section id="sec-today">
            <h2 className="font-display text-xl font-semibold">{t("today")}</h2>
            <p className="mt-2 text-sm leading-relaxed">
              <LinkedText text={today} />
            </p>
            {todayPhoto ? (
              <div className="mt-3">
                <ClickableImage
                  src={todayPhoto.src}
                  alt={displayName(site, locale)}
                  imgClass="h-48 w-full object-cover"
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {extraPhotos.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold">{t("photos")}</h2>
            <ul className="handbook-grid handbook-grid-2 mt-3">
              {extraPhotos.map((g) => (
                <li key={g.src}>
                  <ClickableImage
                    src={g.src}
                    alt={displayName(site, locale)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {film ? (
          <section id="sec-video">
            <h2 className="font-display text-xl font-semibold">
              {film.related ? t("videoRelated") : t("video")}
            </h2>
            <div className="mt-3">
              <BiliEmbed video={film.video} poster={photo} />
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
          <section id="sec-map">
            <h2 className="font-display text-xl font-semibold">{t("stopMap")}</h2>
            <div className="mt-3">
              <MapFrame>
                <SiteMiniMap site={site} geosites={geosites} />
              </MapFrame>
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted">{t("noFakeStops")}</p>
        )}

        {geosites.length > 0 ? (
          <section id="sec-stops">
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
          <section id="sec-related">
            <h2 className="font-display text-xl font-semibold">{t("related")}</h2>
            <ul className="handbook-grid handbook-grid-2 mt-3">
              {related.map((entry) =>
                entry.site ? (
                  <li key={entry.id}>
                    <SiteLinkCard site={entry.site} note={localizeSite(entry.site, locale).hook} />
                  </li>
                ) : (
                  <li key={entry.id} className="rounded-xl border border-dashed border-border bg-surface-2 p-4">
                    <p className="text-xs font-medium tracking-wide text-muted">{t("unlisted")}</p>
                    <p className="font-display mt-1 text-lg font-semibold break-words">{entry.id}</p>
                    <p className="mt-1 text-sm text-ink">{t("unlistedNote")}</p>
                  </li>
                ),
              )}
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

        {site.content_status === "standard" ? (
          <p className="text-sm text-muted">{t("standardNote")}</p>
        ) : null}

        <p className="font-display text-center text-sm text-muted">{motto(locale)}</p>
      </div>
      <BackToTop />
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
      {photo ? (
        <FieldPhoto photo={photo} alt={geosite.name} imgClass="h-40 w-full object-cover" role="stop" />
      ) : null}
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
