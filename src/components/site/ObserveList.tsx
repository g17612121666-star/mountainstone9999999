import { useEffect, useState } from "react";
import { readObs, toggleObs } from "@/lib/geo/fieldnotes";
import { useT } from "@/lib/i18n";

function bucket(tip: string): "attitude" | "force" | "other" {
  if (/节理|层理|产状|层面|倾向|倾角|褶皱|不整合|joint|bedding/i.test(tip)) return "attitude";
  if (/崩|溶|风|侵蚀|流水|浪|冰|冲|剥|重力|溯源|collapse|dissolv|weather/i.test(tip)) return "force";
  return "other";
}

export function ObserveList({
  siteId,
  rocks,
  tips,
}: {
  siteId: string;
  rocks: string[];
  tips: string[];
}) {
  const t = useT();
  const [done, setDone] = useState<string[]>([]);
  const [shot, setShot] = useState<string | null>(null);
  useEffect(() => {
    setDone(readObs(siteId));
  }, [siteId]);
  useEffect(() => {
    return () => {
      if (shot) URL.revokeObjectURL(shot);
    };
  }, [shot]);

  const groups: { key: string; title: string; items: string[] }[] = [
    { key: "rock", title: t("rockCheck"), items: rocks },
    { key: "attitude", title: t("attitudeCheck"), items: tips.filter((tip) => bucket(tip) === "attitude") },
    { key: "force", title: t("forceCheck"), items: tips.filter((tip) => bucket(tip) === "force") },
    { key: "other", title: t("otherCheck"), items: tips.filter((tip) => bucket(tip) === "other") },
  ].filter((g) => g.items.length > 0);

  if (!groups.length) return null;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t("observeCheck")}</h2>
      <div className="mt-3 space-y-4">
        {groups.map((g) => (
          <div key={g.key}>
            <p className="text-xs font-semibold tracking-wide text-muted">{g.title}</p>
            <ul className="mt-1 space-y-1">
              {g.items.map((item) => {
                const id = `${g.key}:${item}`;
                const on = done.includes(id);
                return (
                  <li key={id}>
                    <label className="flex min-h-11 items-start gap-2 rounded-md px-1 py-1 text-sm leading-relaxed">
                      <input
                        type="checkbox"
                        className="mt-1 size-5 shrink-0 accent-[var(--color-moss)]"
                        checked={on}
                        onChange={() => setDone(toggleObs(siteId, id))}
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center text-sm text-moss underline">
        {t("observePhoto")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (shot) URL.revokeObjectURL(shot);
            setShot(URL.createObjectURL(file));
          }}
        />
      </label>
      <p className="mt-1 text-xs text-muted">{t("observePhotoNote")}</p>
      {shot ? <img src={shot} alt="" className="mt-2 max-h-56 w-full rounded-lg object-cover" /> : null}
    </section>
  );
}
