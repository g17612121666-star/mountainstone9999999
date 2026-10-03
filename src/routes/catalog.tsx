import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RecentlyWritten } from "@/components/geo/RecentlyWritten";
import { TimescaleBar } from "@/components/geo/TimescaleBar";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { SiteBadges } from "@/components/site/SiteBadges";
import { SiteRowLink } from "@/components/site/SiteLinkCard";
import { Input } from "@/components/ui/input";
import { ageLabel } from "@/lib/geo/age";
import { seoHead } from "@/lib/geo/canonical";
import { nationalGeoparks, sites, stats } from "@/lib/geo/catalog";
import { haystack } from "@/lib/geo/search";
import {
  LANDFORM_LABEL,
  PROVINCES,
  type LandformType,
  type Site,
  type SiteType,
} from "@/lib/geo/types";
import {
  landformLabel,
  localizeSite,
  provinceLabel,
  typeLabel,
  useLocale,
  useT,
} from "@/lib/i18n";

export const Route = createFileRoute("/catalog")({
  component: CatalogPage,
  head: () =>
    seoHead({
      title: "目录",
      description: "中国世界地质公园、国家地质公园、金钉子与城市地质点名录。",
      path: "/catalog",
    }),
});

function groupByProvince(list: Site[]) {
  const map = new Map<string, Site[]>();
  for (const s of list) {
    const arr = map.get(s.province) ?? [];
    arr.push(s);
    map.set(s.province, arr);
  }
  return PROVINCES.filter((p) => map.has(p)).map((p) => [p, map.get(p)!] as const);
}

const LANDS = (Object.keys(LANDFORM_LABEL) as LandformType[]).filter((k) => k !== "other");

function CatalogPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"national" | "all">("all");
  const [landform, setLandform] = useState<LandformType | "">("");
  const [province, setProvince] = useState("");
  const [worldOnly, setWorldOnly] = useState(false);
  const [status, setStatus] = useState<"all" | "deep" | "standard">("all");
  const [level, setLevel] = useState<SiteType | "">("");
  const [ageOn, setAgeOn] = useState(false);
  const [ageStart, setAgeStart] = useState(0);
  const [ageEnd, setAgeEnd] = useState(0);
  const [openProvinces, setOpenProvinces] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    const base = tab === "national" ? nationalGeoparks() : sites;
    const qq = q.trim().toLowerCase();
    return base.filter((s) => {
      if (qq && !haystack(s).includes(qq)) return false;
      if (landform && !s.landform_types.includes(landform)) return false;
      if (province && s.province !== province) return false;
      if (worldOnly && !s.types.includes("world_geopark")) return false;
      if (level && !s.types.includes(level)) return false;
      if (status === "deep" && s.content_status !== "complete") return false;
      if (status === "standard" && s.content_status !== "standard") return false;
      if (ageOn) {
        const a = s.geologic_age_start_ma;
        const b = s.geologic_age_end_ma;
        if (a == null || b == null) return false;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        if (hi < ageStart || lo > ageEnd) return false;
      }
      return true;
    });
  }, [q, tab, landform, province, worldOnly, status, level, ageOn, ageStart, ageEnd]);
  const grouped = groupByProvince(list);

  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="display-title">{t("catalogTitle")}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink">
          {locale === "en"
            ? `${stats.total} places in the list. ${stats.national} named national geoparks, ${stats.candidate} still qualifying, ${stats.world} UNESCO Global (Hong Kong included), ${stats.gssp} golden spikes on their own, ${stats.urban} city rock. ${stats.complete} long pages, ${stats.standard} still short cards.`
            : `名录里现在有 ${stats.total} 处。国家地质公园写全的 ${stats.national} 处，还在资格名单上的 ${stats.candidate} 处，世界地质公园 ${stats.world} 处（香港算在里面），单独的金钉子 ${stats.gssp} 处，城里的石头 ${stats.urban} 处。写长了的 ${stats.complete} 页，还是短卡的 ${stats.standard} 页。`}
          <Link to="/gssp" className="ml-1 text-moss underline">
            {t("gsspIndex")}
          </Link>
        </p>
        <p className="mt-1 text-xs text-muted">{t("gsspNote")}</p>
        <Input
          className="mt-5 max-w-md"
          placeholder={t("catalogSearchPh")}
          aria-label={t("searchAria")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-5 space-y-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <details open>
            <summary className="cursor-pointer text-sm font-semibold">{t("filterBasic")}</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["national", t("nationalParks")],
                  ["all", t("allSites")],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className="filter-chip"
                  data-active={tab === id}
                >
                  {label}
                </button>
              ))}
              <Link to="/gssp" className="filter-chip">
                {t("gssp")}
              </Link>
              <select
                className="h-9 rounded-full border border-border-strong bg-surface px-3 text-sm"
                value={landform}
                onChange={(e) => setLandform(e.target.value as LandformType | "")}
              >
                <option value="">{t("landformAny")}</option>
                {LANDS.map((l) => (
                  <option key={l} value={l}>
                    {landformLabel(l, locale)}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-full border border-border-strong bg-surface px-3 text-sm"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">{t("provinceAny")}</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {provinceLabel(p, locale)}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-full border border-border-strong bg-surface px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                <option value="all">{t("statusAny")}</option>
                <option value="deep">{t("deepPage")}</option>
                <option value="standard">{t("standardCard")}</option>
              </select>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <span className="text-xs text-muted">{t("tools")}</span>
              <Link to="/ask" className="text-moss underline">{t("navAsk")}</Link>
              <Link to="/nearby" className="text-moss underline">{t("nearby")}</Link>
              <Link to="/compare" className="text-moss underline">{t("compare")}</Link>
              <Link to="/glossary" className="text-moss underline">{t("glossary")}</Link>
              <Link to="/browse" className="text-moss underline">{t("browse")}</Link>
              <Link to="/offline" className="text-moss underline">{t("offline")}</Link>
            </p>
          </details>
          <details>
            <summary className="cursor-pointer text-sm font-semibold">{t("level")}</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setWorldOnly((v) => !v)}
                className="filter-chip"
                data-active={worldOnly}
              >
                {t("world")}
              </button>
              {(
                [
                  ["national_geopark", "national"],
                  ["national_geopark_candidate", "candidate"],
                  ["gssp", "gssp"],
                  ["iugs_geoheritage", "iugs"],
                  ["urban_geosite", "urban"],
                ] as const
              ).map(([id, key]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLevel((v) => (v === id ? "" : id))}
                  className="filter-chip"
                  data-active={level === id}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </details>
          <details>
            <summary className="cursor-pointer text-sm font-semibold">{t("timescale")}</summary>
            <div className="mt-3">
              <TimescaleBar
                ageOn={ageOn}
                ageStart={ageStart}
                ageEnd={ageEnd}
                onAgeChange={(on, start, end) => {
                  setAgeOn(on);
                  if (on && start != null && end != null) {
                    setAgeStart(start);
                    setAgeEnd(end);
                  }
                }}
              />
            </div>
          </details>
        </div>
        <p className="mt-3 text-sm text-muted">
          {t("catalogNow")} {list.length} · {t("catalogTotal")} {stats.total}
        </p>
        <div className="mt-5">
          <RecentlyWritten />
        </div>
        {grouped.length > 0 ? (
          <nav className="chip-row mt-8" aria-label={t("jumpProvince")}>
            {grouped.map(([provinceName, items]) => (
              <a key={provinceName} href={`#prov-${provinceName}`} className="toc-chip">
                {provinceLabel(provinceName, locale)}
                <span className="ml-1 text-muted">{items.length}</span>
              </a>
            ))}
          </nav>
        ) : null}
        <div className="mt-8 space-y-10">
          {grouped.length === 0 ? (
            <p className="rounded-xl bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">
              {t("catalogEmpty")}
            </p>
          ) : null}
          {grouped.map(([provinceName, items]) => {
            const open = Boolean(province) || openProvinces[provinceName];
            const shown = open ? items : items.slice(0, 8);
            const rest = items.length - shown.length;
            return (
            <section key={provinceName} id={`prov-${provinceName}`}>
              <h2 className="font-display flex flex-wrap items-baseline gap-2 text-xl font-semibold">
                <span>{provinceLabel(provinceName, locale)}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-sm font-normal text-muted">
                  {items.length}
                </span>
              </h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
                {shown.map((s) => {
                  const loc = localizeSite(s, locale);
                  return (
                    <li key={s.id}>
                      <SiteRowLink
                        site={s}
                        sub={
                          <>
                            {loc.city || provinceLabel(s.province, locale)} · {typeLabel(s.types[0], locale)}
                            {ageLabel(loc.geologic_age_text, locale)
                              ? ` · ${ageLabel(loc.geologic_age_text, locale)}`
                              : ""}
                          </>
                        }
                        end={
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <SiteBadges site={s} compact />
                          </span>
                        }
                      />
                    </li>
                  );
                })}
                {rest > 0 ? (
                  <li>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-moss"
                      onClick={() => setOpenProvinces((prev) => ({ ...prev, [provinceName]: true }))}
                    >
                      {locale === "en" ? `${rest} more in this province` : `这一省还有 ${rest} 处`}
                    </button>
                  </li>
                ) : null}
              </ul>
            </section>
            );
          })}
        </div>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
