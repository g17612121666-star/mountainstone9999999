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
  overlay = false,
}: {
  type: LandformType;
  className?: string;
  label?: string;
  photo?: string;
  credit?: string;
  decorative?: boolean;
  overlay?: boolean;
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
        <img
          src={photo}
          alt={decorative ? "" : creditLine}
          className="h-full w-full object-cover object-center outline outline-1 -outline-offset-1 outline-black/10"
        />
        <div
          className={
            overlay
              ? "absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent"
              : "absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent"
          }
        />
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
