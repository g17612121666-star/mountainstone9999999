import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deletePack,
  hasPack,
  registerFieldSw,
  savePack,
  type OfflinePackMeta,
} from "@/lib/geo/offline";
import { useLocale, useT } from "@/lib/i18n";

export function OfflinePackButton({ pack }: { pack: Omit<OfflinePackMeta, "cached_at" | "locale"> }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [on, setOn] = useState(false);
  const [swOk, setSwOk] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    let live = true;
    hasPack(pack.kind, pack.id, locale).then((v) => {
      if (live) setOn(v);
    });
    void registerFieldSw().then((ok) => {
      if (live) setSwOk(ok);
    });
    return () => {
      live = false;
    };
  }, [pack.kind, pack.id, locale]);

  async function toggle() {
    try {
      if (on) {
        await deletePack(pack.kind, pack.id, locale);
        setOn(false);
        setHint(false);
        return;
      }
      await savePack({
        ...pack,
        locale,
        cached_at: new Date().toISOString(),
        page_path: typeof window !== "undefined" ? window.location.pathname : pack.page_path,
      });
      setOn(true);
      setHint(true);
    } catch (err) {
      console.warn("offline pack failed", err);
      setOn(false);
    }
    void registerFieldSw().then(setSwOk);
  }

  const blocked = swOk === false;
  return (
    <div className="space-y-1">
      <Button
        variant={on ? "default" : "outline"}
        size="sm"
        type="button"
        data-testid="cache-pack"
        disabled={blocked}
        onClick={() => void toggle()}
      >
        {on ? t("cached") : t("cacheThis")}
      </Button>
      {blocked ? <p className="text-[11px] leading-snug text-subtle">{t("swDisabled")}</p> : null}
      {hint && on && !blocked ? (
        <p className="text-[11px] leading-snug text-subtle">{t("cachedHint")}</p>
      ) : null}
    </div>
  );
}
