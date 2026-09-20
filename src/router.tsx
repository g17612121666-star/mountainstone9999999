import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { t } from "@/lib/i18n";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: () => (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <h1 className="font-display text-xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="text-sm text-muted">{t("notFoundBody")}</p>
        <a href="/" className="text-sm text-moss underline">
          {t("backMap")}
        </a>
      </main>
    ),
  });
}