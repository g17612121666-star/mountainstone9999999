import { LocateFixed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sites } from "@/lib/geo/catalog";
import { mapPair } from "@/lib/geo/coords";
import { nearestSites } from "@/lib/geo/distance";
import { useMapStore } from "@/lib/geo/store";
import { useLocale, useT } from "@/lib/i18n";

const RADIUS_KM = 120;

export function LocateButton() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const openPile = useMapStore((s) => s.openPile);
  const requestFly = useMapStore((s) => s.requestFly);
  const setUserAt = useMapStore((s) => s.setUserAt);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function locate() {
    setNote(null);
    if (!navigator.geolocation) {
      setNote(t("nearbyDenied"));
      return;
    }
    setPending(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPending(false);
        const wgs: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const hits = nearestSites(wgs, sites, RADIUS_KM, 8);
        const [lng, lat] = mapPair(wgs, undefined, locale);
        setUserAt(wgs);
        openPile({
          kind: "nearby",
          ids: hits.map((h) => h.site.id),
          at: [lat, lng],
        });
        requestFly(lat, lng, hits.length ? 8 : 5);
        if (!hits.length) setNote(t("pileEmpty"));
      },
      () => {
        setPending(false);
        setNote(t("nearbyDenied"));
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="pointer-events-auto">
      <Button
        variant="outline"
        size="sm"
        className="h-11 bg-surface/95 shadow-[var(--shadow-border)]"
        onClick={locate}
        disabled={pending}
        aria-label={t("locateMap")}
      >
        <LocateFixed className="size-4" />
        <span className="hidden sm:inline">{t("locateMap")}</span>
      </Button>
      {note ? <p className="mt-1 max-w-40 text-xs text-muted">{note}</p> : null}
    </div>
  );
}
