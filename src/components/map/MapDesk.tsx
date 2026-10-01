import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSite } from "@/lib/geo/catalog";
import { isRealPhoto } from "@/lib/geo/safety";
import { useMapStore } from "@/lib/geo/store";
import { displayName, useLocale, useT } from "@/lib/i18n";

const STARTERS = ["danxiashan", "zhangjiajie", "huangshan", "meishan"] as const;
const DESK_KEY = "shanshizhi-desk-session";

export function MapDesk() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const select = useMapStore((s) => s.select);
  const [mode, setMode] = useState<"wait" | "open" | "shut">("wait");

  useEffect(() => {
    try {
      setMode(sessionStorage.getItem(DESK_KEY) === "1" ? "shut" : "open");
    } catch {
      setMode("open");
    }
  }, []);

  function dismiss() {
    setMode("shut");
    try {
      sessionStorage.setItem(DESK_KEY, "1");
    } catch {
      /* private mode */
    }
  }

  function reopen() {
    setMode("open");
    try {
      sessionStorage.removeItem(DESK_KEY);
    } catch {
      /* private mode */
    }
  }

  if (mode === "wait") return null;
  if (mode === "shut") {
    return (
      <button
        type="button"
        onClick={reopen}
        className="pointer-events-auto rounded-full border border-border bg-surface/95 px-3 py-2 text-sm font-medium shadow-[var(--shadow-border)]"
      >
        {t("deskShow")}
      </button>
    );
  }

  const picks = STARTERS.map((id) => getSite(id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <aside className="pointer-events-auto w-full overflow-hidden rounded-2xl bg-surface/95 shadow-[var(--shadow-border-hover)]">
      <div className="h-1 bg-moss" />
      <div className="p-3">
      <div className="mb-2 flex items-start gap-2">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight">{t("deskTitle")}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted">{t("deskLead")}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="ml-auto shrink-0 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink"
        >
          {t("deskDismiss")}
        </button>
      </div>
      <ul className="grid grid-cols-4 gap-1.5">
        {picks.map((site) => {
          const photo = isRealPhoto(site.cover_image) ? site.cover_image : undefined;
          return (
            <li key={site.id}>
              <button
                type="button"
                onClick={() => select(site.id)}
                className="flex w-full flex-col overflow-hidden rounded-lg bg-bg text-left hover:bg-surface-2"
              >
                <span className="block h-12 overflow-hidden bg-surface-2 sm:h-16">
                  {photo ? (
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="line-clamp-2 px-1.5 py-1 text-xs font-medium leading-snug">
                  {displayName(site, locale)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link to="/routes/$id" params={{ id: "danxia" }} className="mt-2 inline-flex text-sm text-moss underline">
        {t("deskTrail")}
      </Link>
      </div>
    </aside>
  );
}
