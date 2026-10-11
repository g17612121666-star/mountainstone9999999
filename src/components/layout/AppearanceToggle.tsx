import { useEffect, useState } from "react";
import { Contrast, Moon, SunMedium, Type } from "lucide-react";
import { applyAppearance, readLargeType, readTheme, writeLargeType, writeTheme, type PaperTheme } from "@/lib/geo/appearance";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppearanceToggle() {
  const t = useT();
  const [theme, setTheme] = useState<PaperTheme>("paper");
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const next = readTheme();
    const big = readLargeType();
    setTheme(next);
    setLarge(big);
    applyAppearance(next, big);
  }, []);

  function pick(next: PaperTheme) {
    setTheme(next);
    writeTheme(next);
  }

  const items: { id: PaperTheme; label: string; icon: typeof SunMedium }[] = [
    { id: "paper", label: t("themePaper"), icon: SunMedium },
    { id: "night", label: t("themeNight"), icon: Moon },
    { id: "contrast", label: t("themeContrast"), icon: Contrast },
  ];

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={t("themePaper")}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={theme === item.id}
            aria-label={item.label}
            title={item.label}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink",
              theme === item.id && "bg-surface-2 text-ink",
            )}
            onClick={() => pick(item.id)}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </button>
        );
      })}
      <button
        type="button"
        aria-pressed={large}
        aria-label={t("typeLarge")}
        title={t("typeLarge")}
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink",
          large && "bg-surface-2 text-ink",
        )}
        onClick={() => {
          const next = !large;
          setLarge(next);
          writeLargeType(next);
        }}
      >
        <Type className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
