import { SiteRowLink } from "@/components/site/SiteLinkCard";
import { getSite } from "@/lib/geo/catalog";
import { RECENT_IDS } from "@/lib/geo/recent";
import { useT } from "@/lib/i18n";

export function RecentlyWritten() {
  const t = useT();
  const list = RECENT_IDS.map((id) => getSite(id)).filter((s): s is NonNullable<typeof s> => !!s);
  if (!list.length) return null;
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t("recentlyWritten")}</h2>
      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] sm:grid sm:grid-cols-2 sm:divide-y-0 sm:gap-px sm:bg-transparent sm:shadow-none">
        {list.map((s) => (
          <li key={s.id} className="sm:overflow-hidden sm:rounded-lg sm:bg-surface sm:shadow-[var(--shadow-border)]">
            <SiteRowLink site={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}
