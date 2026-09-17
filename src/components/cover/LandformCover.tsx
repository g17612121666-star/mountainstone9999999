import type { LandformType } from "@/lib/geo/types";
import { photoCredit, useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LandformCover({
  type: _type,
  className,
  label,
  photo,
  credit,
  decorative = false,
}: {
  type: LandformType;
  className?: string;
  label?: string;
  photo?: string;
  credit?: string;
  decorative?: boolean;
}) {
  void _type;
  void label;
  void decorative;
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const creditLine = photoCredit(credit || "", locale);
  if (photo) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <img src={photo} alt={decorative ? "" : creditLine} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
        {decorative ? null : (
          <p className="absolute right-3 bottom-2 left-3 text-[11px] leading-snug text-primary-fg/90">
            {creditLine}
          </p>
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden bg-surface-2",
        className,
      )}
    >
      <p className="px-2 py-1.5 text-[10px] leading-snug text-muted">{t("noPhoto")}</p>
    </div>
  );
}
