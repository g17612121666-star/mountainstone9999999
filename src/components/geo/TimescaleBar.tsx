import { TIMESCALE } from "@/lib/geo/timescale";
import { useMapStore } from "@/lib/geo/store";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";

export function TimescaleBar({
  onPick,
  compact = false,
  ageOn: ageOnProp,
  ageStart: ageStartProp,
  ageEnd: ageEndProp,
  onAgeChange,
}: {
  onPick?: (start: number, end: number) => void;
  compact?: boolean;
  ageOn?: boolean;
  ageStart?: number;
  ageEnd?: number;
  onAgeChange?: (on: boolean, start?: number, end?: number) => void;
}) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const storeAgeOn = useMapStore((s) => s.filters.ageOn);
  const storeAgeStart = useMapStore((s) => s.filters.ageStart);
  const storeAgeEnd = useMapStore((s) => s.filters.ageEnd);
  const setAge = useMapStore((s) => s.setAge);
  const controlled = onAgeChange != null;
  const ageOn = controlled ? Boolean(ageOnProp) : storeAgeOn;
  const ageStart = controlled ? (ageStartProp ?? 0) : storeAgeStart;
  const ageEnd = controlled ? (ageEndProp ?? 0) : storeAgeEnd;

  function pick(start: number, end: number) {
    const active = ageOn && ageStart === start && ageEnd === end;
    if (controlled) {
      onAgeChange(!active, start, end);
    } else if (active) {
      setAge(false);
    } else {
      setAge(true, start, end);
    }
    onPick?.(start, end);
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted">{t("timescale")}</p>
      <div className={cn("mt-1.5 flex flex-wrap gap-1", compact && "max-h-24 overflow-y-auto")}>
        {TIMESCALE.map((e) => {
          const active = ageOn && ageStart === e.start && ageEnd === e.end;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => pick(e.start, e.end)}
              className={cn(
                "h-8 rounded-full px-2.5 text-[11px] font-medium",
                active ? "bg-sand text-primary-fg" : "bg-surface-2 text-muted hover:text-ink",
              )}
            >
              {locale === "en" ? e.en : e.zh}
            </button>
          );
        })}
      </div>
    </div>
  );
}
