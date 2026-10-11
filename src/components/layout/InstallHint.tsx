import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };

export function InstallHint() {
  const t = useT();
  const [ev, setEv] = useState<PromptEvent | null>(null);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("shanshizhi-install-dismiss") === "1") {
      return;
    }
    const on = (e: Event) => {
      e.preventDefault();
      setEv(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", on);
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);

  if (!ev) return null;
  return (
    <div className="no-print fixed right-3 bottom-20 z-40 flex max-w-xs items-center gap-2 rounded-xl bg-surface px-3 py-2 shadow-[var(--shadow-border)] sm:bottom-4">
      <Button
        size="sm"
        type="button"
        onClick={() => {
          void ev.prompt();
          setEv(null);
        }}
      >
        {t("installApp")}
      </Button>
      <button
        type="button"
        className="text-xs text-muted"
        onClick={() => {
          try {
            sessionStorage.setItem("shanshizhi-install-dismiss", "1");
          } catch {
            /* ignore */
          }
          setEv(null);
        }}
      >
        {t("installDismiss")}
      </button>
    </div>
  );
}
