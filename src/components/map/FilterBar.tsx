import { Link } from "@tanstack/react-router";
import { TimescaleBar } from "@/components/geo/TimescaleBar";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LANDFORM_LABEL, PROVINCES, type LandformType, type SiteType } from "@/lib/geo/types";
import { useMapStore } from "@/lib/geo/store";
import { sites, stats } from "@/lib/geo/catalog";
import { filterSites, suggestSites } from "@/lib/geo/search";
import { cn } from "@/lib/utils";
import { displayName, landformLabel, placeLine, provinceLabel, useLocale, useT, type UiKey } from "@/lib/i18n";

const LEVELS: { id: SiteType; key: UiKey }[] = [
  { id: "world_geopark", key: "world" },
  { id: "national_geopark", key: "national" },
  { id: "national_geopark_candidate", key: "candidate" },
  { id: "gssp", key: "gssp" },
  { id: "urban_geosite", key: "urban" },
  { id: "iugs_geoheritage", key: "iugs" },
];

const LANDS = (Object.keys(LANDFORM_LABEL) as LandformType[]).filter((k) => k !== "other");

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="filter-chip" data-active={active}>
      {children}
    </button>
  );
}

export function FilterBar() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const filters = useMapStore((s) => s.filters);
  const setQuery = useMapStore((s) => s.setQuery);
  const toggleType = useMapStore((s) => s.toggleType);
  const toggleLandform = useMapStore((s) => s.toggleLandform);
  const setProvince = useMapStore((s) => s.setProvince);
  const setTicket = useMapStore((s) => s.setTicket);
  const setAge = useMapStore((s) => s.setAge);
  const reset = useMapStore((s) => s.resetFilters);
  const select = useMapStore((s) => s.select);
  const [open, setOpen] = useState(false);
  const [activeIx, setActiveIx] = useState(0);

  const suggestions = useMemo(
    () => suggestSites(sites, filters.query, 8),
    [filters.query],
  );
  const matched = useMemo(() => filterSites(sites, filters), [filters]);

  function pick(id: string) {
    select(id);
    setQuery("");
    setActiveIx(0);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 pt-3 sm:max-w-sm">
      <div className="pointer-events-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={filters.query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIx((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                const hit = suggestions[activeIx] ?? suggestions[0];
                if (hit) pick(hit.id);
              } else if (e.key === "Escape") {
                setQuery("");
              }
            }}
            placeholder={t("searchPh")}
            className="h-11 border-border bg-surface/95 pl-9 shadow-[var(--shadow-border)]"
            aria-label={t("searchAria")}
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
          />
          {filters.query.trim() ? (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
              {suggestions.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted">{t("searchEmpty")}</p>
              ) : (
                <ul>
                  {suggestions.map((s, i) => {
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm",
                            i === activeIx ? "bg-surface-2" : "hover:bg-surface-2",
                          )}
                          onMouseEnter={() => setActiveIx(i)}
                          onClick={() => pick(s.id)}
                        >
                          <span className="font-medium">{displayName(s, locale)}</span>
                          <span className="text-xs text-muted">{placeLine(s, locale)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </div>
        <Button
          variant={open ? "default" : "outline"}
          size="icon"
          className="shrink-0 bg-surface/95 shadow-[var(--shadow-border)]"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("filter")}
        >
          {open ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
        </Button>
        <Button variant="outline" size="sm" className="shrink-0 bg-surface/95 shadow-[var(--shadow-border)]" asChild>
          <Link to="/nearby">{t("nearby")}</Link>
        </Button>
      </div>
      <div className="pointer-events-none flex flex-wrap items-center gap-1.5 text-xs text-ink">
        <span className="pointer-events-auto rounded-full border border-border bg-bg/90 px-2 py-1">
          {t("onMap")} {matched.length} · {t("world")} {stats.world} · {t("national")} {stats.national}
        </span>
        <Link
          to="/routes"
          className="pointer-events-auto rounded-full border border-border bg-bg/90 px-2 py-1 text-moss underline"
        >
          {t("startTrail")}
        </Link>
      </div>
      {matched.length === 0 ? (
        <div className="pointer-events-auto rounded-xl bg-surface/95 p-4 text-sm shadow-[var(--shadow-border)]">
          <p className="font-medium">{t("filterEmptyTitle")}</p>
          <p className="mt-1 text-muted">{t("filterEmptyBody")}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
            {t("clearFilters")}
          </Button>
        </div>
      ) : null}
      {open ? (
        <div className="pointer-events-auto flex max-h-[48dvh] flex-col overflow-hidden rounded-xl bg-surface/98 shadow-[var(--shadow-border)]">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 pb-2">
            <details open>
              <summary className="cursor-pointer text-xs font-semibold tracking-wide text-ink">
                {t("level")}
              </summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LEVELS.map((l) => (
                  <Chip key={l.id} active={filters.types.includes(l.id)} onClick={() => toggleType(l.id)}>
                    {t(l.key)}
                  </Chip>
                ))}
              </div>
            </details>
            <details>
              <summary className="cursor-pointer text-xs font-semibold tracking-wide text-ink">
                {t("landform")}
              </summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LANDS.map((l) => (
                  <Chip
                    key={l}
                    active={filters.landforms.includes(l)}
                    onClick={() => toggleLandform(l)}
                  >
                    {landformLabel(l, locale)}
                  </Chip>
                ))}
              </div>
            </details>
            <details>
              <summary className="cursor-pointer text-xs font-semibold tracking-wide text-ink">
                {t("filterMore")}
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-xs text-ink">
                  {t("province")}
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-sm text-ink"
                    value={filters.province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">{t("all")}</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {provinceLabel(p, locale)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-ink">
                  {t("ticket")}
                  <select
                    className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-2 text-sm text-ink"
                    value={filters.ticket}
                    onChange={(e) => setTicket(e.target.value as typeof filters.ticket)}
                  >
                    <option value="all">{t("ticketAny")}</option>
                    <option value="yes">{t("ticketYes")}</option>
                    <option value="no">{t("ticketNo")}</option>
                  </select>
                </label>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.ageOn}
                  onChange={(e) => setAge(e.target.checked)}
                />
                {t("ageFilter")}
              </label>
              {filters.ageOn ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-ink">
                  <input
                    type="number"
                    className="h-10 w-20 rounded-md border border-border bg-bg px-2"
                    value={filters.ageStart}
                    onChange={(e) => setAge(true, Number(e.target.value), filters.ageEnd)}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    className="h-10 w-20 rounded-md border border-border bg-bg px-2"
                    value={filters.ageEnd}
                    onChange={(e) => setAge(true, filters.ageStart, Number(e.target.value))}
                  />
                  <span>Ma</span>
                </div>
              ) : null}
              <div className="mt-2">
                <TimescaleBar compact />
              </div>
            </details>
          </div>
          <div className="flex shrink-0 gap-2 border-t border-border bg-surface px-4 py-3">
            <Button size="sm" className="h-11 flex-1" onClick={() => setOpen(false)}>
              {t("applyFilters")}
            </Button>
            <Button variant="outline" size="sm" className="h-11" onClick={reset}>
              {t("clearFilters")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
