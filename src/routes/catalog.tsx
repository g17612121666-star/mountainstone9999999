import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NearbyPanel } from "@/components/geo/NearbyPanel";
import { RecentlyWritten } from "@/components/geo/RecentlyWritten";
import { TimescaleBar } from "@/components/geo/TimescaleBar";
import { AppHeader } from "@/components/layout/AppHeader";
import { LandformCover } from "@/components/cover/LandformCover";
import { SiteBadges } from "@/components/site/SiteBadges";
import { Input } from "@/components/ui/input";
import { getVisit, nationalGeoparks, sites, stats } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { haystack } from "@/lib/geo/search";
import { useMapStore } from "@/lib/geo/store";
import { isOwnCover } from "@/lib/geo/safety";
import {
  LANDFORM_LABEL,
  PROVINCES,
  type LandformType,
  type Site,
  type SiteType,
} from "@/lib/geo/types";
import {
  displayName,
  landformLabel,
  localizeSite,
  photoCredit,
  provinceLabel,
  typeLabel,
  useLocale,
  useT,
} from "@/lib/i18n";

export const Route = createFileRoute("/catalog")({
  component: CatalogPage,
  head: () => ({
    meta: [
      { title: "目录 · 山石志" },
      {
        name: "description",
        content: "中国世界地质公园、国家地质公园、金钉子与城市地质点名录。",
      },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
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
  const [ticket, setTicket] = useState<"all" | "yes" | "no">("all");
  const [level, setLevel] = useState<SiteType | "">("");
  const ageOn = useMapStore((s) => s.filters.ageOn);
  const ageStart = useMapStore((s) => s.filters.ageStart);
  const ageEnd = useMapStore((s) => s.filters.ageEnd);

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
      if (ticket !== "all") {
        const v = getVisit(s.id);
        if (ticket === "yes" && v?.is_ticketed !== true) return false;
        if (ticket === "no" && v?.is_ticketed !== false) return false;
      }
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
  }, [q, tab, landform, province, worldOnly, status, ticket, level, ageOn, ageStart, ageEnd]);
  const grouped = groupByProvince(list);

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">{t("catalogTitle")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {locale === "en"
            ? `${stats.total} geosites: ${stats.national} named national geoparks, ${stats.candidate} qualifying, ${stats.world} UNESCO Global (incl. Hong Kong), ${stats.gssp} independent GSSPs, ${stats.urban} urban. ${stats.complete} full pages · ${stats.standard} field cards. Cutoff 2026-04.`
            : `库内地质点 ${stats.total}：国家地质公园已命名 ${stats.national} 处，资格 ${stats.candidate} 处，世界级 ${stats.world} 处（含香港），金钉子独立点 ${stats.gssp} 处，城市地质 ${stats.urban} 处。深页 ${stats.complete} · 简卡 ${stats.standard}${stats.placeholder ? ` · 未写 ${stats.placeholder}` : ""}。截止日期 2026-04。`}
          <Link to="/gssp" className="ml-1 text-moss underline">
            {t("gsspIndex")}
          </Link>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
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
              className={
                tab === id
                  ? "h-10 rounded-full bg-sand px-4 text-sm text-primary-fg"
                  : "h-10 rounded-full bg-surface-2 px-4 text-sm text-muted"
              }
            >
              {label}
            </button>
          ))}
          <Link
            to="/gssp"
            className="flex h-10 items-center rounded-full bg-surface-2 px-4 text-sm text-muted"
          >
            {t("gssp")}
          </Link>
        </div>
        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span className="text-xs text-muted">{t("tools")}</span>
          <Link to="/nearby" className="text-moss underline">
            {t("nearby")}
          </Link>
          <Link to="/compare" className="text-moss underline">
            {t("compare")}
          </Link>
          <Link to="/glossary" className="text-moss underline">
            {t("glossary")}
          </Link>
          <Link to="/browse" className="text-moss underline">
            {t("browse")}
          </Link>
          <Link to="/offline" className="text-moss underline">
            {t("offline")}
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
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
            className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
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
            className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="all">{t("statusAny")}</option>
            <option value="deep">{t("deepPage")}</option>
            <option value="standard">{t("standardCard")}</option>
          </select>
          <select
            className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
            value={ticket}
            onChange={(e) => setTicket(e.target.value as typeof ticket)}
          >
            <option value="all">{t("ticketAnyLong")}</option>
            <option value="yes">{t("ticketYes")}</option>
            <option value="no">{t("freeOpen")}</option>
          </select>
          <button
            type="button"
            onClick={() => setWorldOnly((v) => !v)}
            className={
              worldOnly
                ? "h-10 rounded-full bg-sand px-3 text-sm text-primary-fg"
                : "h-10 rounded-full bg-surface-2 px-3 text-sm text-muted"
            }
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
              className={
                level === id
                  ? "h-10 rounded-full bg-sand px-3 text-sm text-primary-fg"
                  : "h-10 rounded-full bg-surface-2 px-3 text-sm text-muted"
              }
            >
              {t(key)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-subtle">
          {t("catalogNow")} {list.length} · {t("catalogTotal")} {stats.total}
        </p>
        <div className="mt-5 space-y-6">
          <TimescaleBar
            onPick={(start, end) => {
              setStatus("all");
              void start;
              void end;
            }}
          />
          <RecentlyWritten />
          <NearbyPanel />
        </div>
        <Input
          className="mt-6 max-w-md"
          placeholder={t("catalogSearchPh")}
          aria-label={t("searchAria")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-8 space-y-10">
          {grouped.length === 0 ? (
            <p className="rounded-xl bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">
              {t("catalogEmpty")}
            </p>
          ) : null}
          {grouped.map(([provinceName, items]) => (
            <section key={provinceName}>
              <h2 className="font-display text-xl font-semibold">
                {provinceLabel(provinceName, locale)}
                <span className="ml-2 text-sm font-normal text-muted">{items.length}</span>
              </h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
                {items.map((s) => {
                  const own = isOwnCover(s);
                  const loc = localizeSite(s, locale);
                  const sketch =
                    !own &&
                    (s.types.includes("world_geopark") ||
                      s.types.includes("gssp") ||
                      s.types.includes("iugs_geoheritage") ||
                      s.content_status === "complete");
                  return (
                    <li key={s.id}>
                      <Link
                        {...siteTo(s)}
                        className="flex items-center gap-3 px-3 py-3 hover:bg-surface-2 sm:px-4"
                      >
                        {own ? (
                          <img
                            src={s.cover_image}
                            alt={photoCredit(s.cover_credit || "", locale)}
                            className="h-16 w-20 shrink-0 rounded-md object-cover"
                          />
                        ) : sketch ? (
                          <span className="h-16 w-20 shrink-0 overflow-hidden rounded-md">
                            <LandformCover
                              type={s.landform_types[0] ?? "other"}
                              label={displayName(s, locale)}
                            />
                          </span>
                        ) : (
                          <span className="hidden h-16 w-0 sm:block" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{displayName(s, locale)}</p>
                          <p className="text-xs text-muted">
                            {loc.city || provinceLabel(s.province, locale)} · {typeLabel(s.types[0], locale)} · {loc.geologic_age_text}
                          </p>
                        </div>
                        <SiteBadges site={s} compact />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
