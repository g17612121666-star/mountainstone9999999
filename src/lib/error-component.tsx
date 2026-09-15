import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "页面出了问题。试着回到地图。";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-ink">
      <TriangleAlert className="size-10 text-hematite" strokeWidth={1.75} />
      <h1 className="font-display text-lg font-semibold">读层读到断层了</h1>
      <p className="max-w-md text-sm break-words text-muted">{errorMessage(error)}</p>
      <a href="/" className="mt-2 text-sm text-moss underline">
        回到地图
      </a>
    </main>
  );
}
