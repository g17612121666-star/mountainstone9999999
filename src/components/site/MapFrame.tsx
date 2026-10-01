import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MapFrame({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]", className)}>
      {title ? (
        <figcaption className="border-b border-border px-4 py-2.5 font-display text-sm font-semibold">{title}</figcaption>
      ) : null}
      <div className="h-64 w-full sm:h-72">{children}</div>
    </figure>
  );
}
