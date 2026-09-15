import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: () => (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <h1 className="font-display text-xl font-semibold">这一层还没有出露</h1>
        <p className="text-sm text-muted">找不到这个地质点。回到地图再找一次。</p>
        <a href="/" className="text-sm text-moss underline">
          回到地图
        </a>
      </main>
    ),
  });
}
