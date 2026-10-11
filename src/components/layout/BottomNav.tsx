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
      className="bottom-nav no-print fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md sm:hidden"
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
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  on ? "text-moss" : "text-muted",
                )}
                aria-current={on ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
