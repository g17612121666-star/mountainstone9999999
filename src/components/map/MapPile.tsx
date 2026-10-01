import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSite } from "@/lib/geo/catalog";
import { isRealPhoto } from "@/lib/geo/safety";
import { useMapStore } from "@/lib/geo/store";
import { displayName, placeLine, typeBadge, useLocale, useT } from "@/lib/i18n";

export function MapPile() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const pile = useMapStore((s) => s.pile);
  const clearPile = useMapStore((s) => s.clearPile);
  const select = useMapStore((s) => s.select);
  const requestFly = useMapStore((s) => s.requestFly);
  if (!pile) return null;

  const rows = pile.ids
    .map((id) => getSite(id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const title = pile.kind === "nearby" ? t("pileNearby") : t("pileCluster");

  return (
    <section className="flex max-h-[70dvh] flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="font-display text-lg font-semibold">
          {title}
          {rows.length ? <span className="ml-1 text-sm font-normal text-muted">{rows.length}</span> : null}
        </h2>
        <div className="ml-auto flex items-center gap-1">
          {pile.at ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => requestFly(pile.at![0], pile.at![1], pile.kind === "nearby" ? 9 : 8)}
            >
              {t("pileZoom")}
            </Button>
          ) : null}
          <Button variant="ghost" size="icon-sm" onClick={clearPile} aria-label={t("close")}>
            <X className="size-4" />
          </Button>
        </div>
      </header>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted">{t("pileEmpty")}</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {rows.map((site) => {
            const photo = isRealPhoto(site.cover_image) ? site.cover_image : undefined;
            return (
              <li key={site.id} className="border-b border-border last:border-0">
                <button
                  type="button"
                  onClick={() => select(site.id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2"
                >
                  <span className="size-11 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    {photo ? <img src={photo} alt="" className="size-full object-cover" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{displayName(site, locale)}</span>
                    <span className="block truncate text-xs text-muted">
                      {typeBadge(site, locale)} · {placeLine(site, locale)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
