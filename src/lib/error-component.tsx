import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { t, useLocale } from "@/lib/i18n";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return t("errorBody");
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  useLocale((s) => s.locale);
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-ink">
      <TriangleAlert className="size-10 text-hematite" strokeWidth={1.75} />
      <h1 className="font-display text-lg font-semibold">{t("errorTitle")}</h1>
      <p className="max-w-md text-sm break-words text-muted">{errorMessage(error)}</p>
      <a href="/" className="mt-2 text-sm text-moss underline">
        {t("backMap")}
      </a>
    </main>
  );
}