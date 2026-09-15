import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deletePack,
  hasPack,
  registerFieldSw,
  savePack,
  type OfflinePackMeta,
} from "@/lib/geo/offline";
import { useT } from "@/lib/i18n";

export function OfflinePackButton({ pack }: { pack: Omit<OfflinePackMeta, "cached_at"> }) {
  const t = useT();
  const [on, setOn] = useState(false);
  const [swOk, setSwOk] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    hasPack(pack.kind, pack.id).then((v) => {
      if (live) setOn(v);
    });
    void registerFieldSw().then((ok) => {
      if (live) setSwOk(ok);
    });
    return () => {
      live = false;
    };
  }, [pack.kind, pack.id]);

  async function toggle() {
    try {
      if (on) {
        await deletePack(pack.kind, pack.id);
        setOn(false);
        return;
      }
      await savePack({
        ...pack,
        cached_at: new Date().toISOString(),
        page_path: typeof window !== "undefined" ? window.location.pathname : pack.page_path,
      });
      setOn(true);
    } catch (err) {
      console.warn("offline pack failed", err);
      setOn(false);
    }
    void registerFieldSw().then(setSwOk);
  }

  return (
    <div className="space-y-1">
      <Button
        variant={on ? "default" : "outline"}
        size="sm"
        type="button"
        data-testid="cache-pack"
        onClick={() => void toggle()}
      >
        {on ? t("cached") : t("cacheThis")}
      </Button>
      <p className="text-[11px] leading-snug text-subtle">
        {swOk === false ? t("offlineSwFail") : t("offlineNote")}
      </p>
    </div>
  );
}
