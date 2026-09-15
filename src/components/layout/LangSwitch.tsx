import { useEffect } from "react";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch() {
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  }, [locale]);

  return (
    <div className="relative z-40 flex h-9 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
      <button
        type="button"
        className={cn(
          "h-9 min-w-9 px-2 text-xs font-medium",
          locale === "zh" ? "bg-sand text-primary-fg" : "text-muted hover:text-ink",
        )}
        aria-pressed={locale === "zh"}
        onClick={() => setLocale("zh")}
      >
        中
      </button>
      <button
        type="button"
        className={cn(
          "h-9 min-w-9 px-2 text-xs font-medium",
          locale === "en" ? "bg-sand text-primary-fg" : "text-muted hover:text-ink",
        )}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
