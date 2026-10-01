import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, Info, Map, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

export function AppHeader({ dense: _dense = false }: { dense?: boolean }) {
  void _dense;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const links = [
    { to: "/", label: t("navMap"), icon: Map },
    { to: "/catalog", label: t("navCatalog"), icon: BookOpen },
    { to: "/routes", label: t("navRoutes"), icon: Compass },
    { to: "/ask", label: t("navAsk"), icon: MessageCircle },
    { to: "/about", label: t("navAbout"), icon: Info },
  ] as const;
  const tools = [
    { to: "/nearby", label: t("nearby") },
    { to: "/compare", label: t("compare") },
    { to: "/glossary", label: t("glossary") },
    { to: "/browse", label: t("browse") },
    { to: "/offline", label: t("offline") },
    { to: "/gssp", label: t("gssp") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="h-1 bg-moss" />
      <div className="flex h-16 items-center gap-3 px-3">
      <a href="#main" className="skip-link">
        {t("skipContent")}
      </a>
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <span className="flex h-9 w-7 flex-col overflow-hidden rounded-sm shadow-[var(--shadow-border)]">
          <span className="h-1.5 bg-moss" />
          <span className="h-1.5 bg-sand" />
          <span className="h-1.5 bg-hematite" />
          <span className="flex-1 bg-ink" />
        </span>
        <span>
          <span className="font-display block text-lg leading-tight font-semibold tracking-tight">
            {t("appName")}
          </span>
          <span className="hidden text-[11px] leading-tight text-muted sm:block">{t("tagline")}</span>
        </span>
      </Link>
      <nav className="ml-auto flex items-center gap-0.5" aria-label={t("mainNav")}>
        {links.map((l) => {
          const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-label={l.label}
              className={cn(
                "flex h-11 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors duration-150 sm:px-3",
                l.to === "/ask" && "bg-moss text-accent-fg hover:opacity-90",
                l.to !== "/ask" && (active ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"),
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              <span className={l.to === "/ask" ? "inline" : "hidden sm:inline"}>{l.label}</span>
            </Link>
          );
        })}
        <details className="relative">
          <summary
            className={cn(
              "flex h-11 cursor-pointer list-none items-center rounded-md px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink",
              tools.some((x) => pathname.startsWith(x.to)) && "bg-surface-2 text-ink",
            )}
          >
            {t("moreTools")}
          </summary>
          <div className="absolute right-0 z-40 mt-1 min-w-40 rounded-lg bg-surface p-1 shadow-[var(--shadow-border)]">
            {tools.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block rounded-md px-3 py-2 text-sm hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </details>
        <LangSwitch />
      </nav>
      </div>
    </header>
  );
}
