import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { displayName, useLocale, useT } from "@/lib/i18n";
import { publicPathFor, suggestSitesBySlug, TOOL_PATHS } from "@/lib/geo/slug";
import appCss from "../styles.css?url";

const APP_NAME = "山石志";
const CANONICAL_ORIGIN = "https://mountainstone.grok.me";

function AliasRedirect() {
  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    if (host === "shanshizhi.grok.me" || host === "www.mountainstone.grok.me") {
      window.location.replace(CANONICAL_ORIGIN + window.location.pathname + window.location.search);
    }
  }, []);
  return null;
}

function NotFound() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  const head = parts[0] || "";
  const slug = parts[1] || "";
  const isSiteish = head === "sites" || head === "gssp" || head === "card";
  const isUnknownTool = head && !TOOL_PATHS.has(head) && head !== "routes";
  const hits = slug ? suggestSitesBySlug(slug) : [];
  const title = t("notFoundTitle");
  const body = isSiteish ? t("notFoundSite") : isUnknownTool ? t("notFoundFeature") : slug ? t("notFoundSlug") : t("notFoundBody");
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted">{body}</p>
        {hits.length ? (
          <ul className="mt-4 w-full space-y-2 text-left">
            {hits.map((s) => {
              const { href } = publicPathFor(s);
              return (
                <li key={s.id}>
                  <a href={href} className="block rounded-lg bg-surface px-3 py-2 text-sm shadow-[var(--shadow-border)]">
                    {displayName(s, locale)}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
        <Link to="/" className="mt-4 text-sm text-moss underline">
          {t("backMap")}
        </Link>
      </main>
      <AppFooter />
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "随身地质向导。一张可缩放的中国地质点地图：成因、打卡点、路线、观察与购票。",
      },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#6B5344" },
    ],
    links: [
      { rel: "canonical", href: CANONICAL_ORIGIN + "/" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="zh-CN" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-ink">
        <AliasRedirect />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
