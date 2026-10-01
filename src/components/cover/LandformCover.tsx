import type { LandformType } from "@/lib/geo/types";
import { cn } from "@/lib/utils";

export function LandformCover({
  type: _type,
  className,
  label,
  photo,
  credit: _credit,
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
  void _credit;
  if (!photo) return null;
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <img
        src={photo}
        alt={decorative ? "" : label || ""}
        className="h-full w-full object-cover object-center outline outline-1 -outline-offset-1 outline-black/10"
      />
      <div
        className={
          overlay
            ? "absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10"
            : "absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent"
        }
      />
    </div>
  );
}
