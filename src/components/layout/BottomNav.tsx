import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, Library, Map, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const items = [
    { to: "/", label: t("navBottomMap"), icon: Map, match: (p: string) => p === "/" },
    { to: "/nearby", label: t("navBottomNear"), icon: MapPin, match: (p: string) => p.startsWith("/nearby") },
    { to: "/routes", label: t("navBottomTrail"), icon: Compass, match: (p: string) => p.startsWith("/routes") },
    { to: "/catalog", label: t("navBottomList"), icon: BookOpen, match: (p: string) => p.startsWith("/catalog") },
    { to: "/glossary", label: t("navBottomGloss"), icon: Library, match: (p: string) => p.startsWith("/glossary") },
  ] as const;
  return (
    <nav
      className="bottom-nav no-print fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-border/80 bg-surface/88 shadow-[var(--shadow-border-hover)] backdrop-blur-xl sm:hidden"
      aria-label={t("mainNav")}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const on = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-200",
                  on ? "text-moss" : "text-muted",
                )}
                aria-current={on ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                    on && "scale-105 bg-moss/15",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
