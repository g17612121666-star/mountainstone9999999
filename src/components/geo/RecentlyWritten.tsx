import { Link } from "@tanstack/react-router";
import { LandformCover } from "@/components/cover/LandformCover";
import { getSite } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { RECENT_IDS } from "@/lib/geo/recent";
import { isOwnCover } from "@/lib/geo/safety";
import { displayName, useLocale, useT } from "@/lib/i18n";

export function RecentlyWritten() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const list = RECENT_IDS.map((id) => getSite(id)).filter((s): s is NonNullable<typeof s> => !!s);
  if (!list.length) return null;
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t("recentlyWritten")}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s.id}>
            <Link
              {...siteTo(s)}
              className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
            >
              {isOwnCover(s) ? (
                <img src={s.cover_image} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
              ) : (
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded">
                  <LandformCover
                    type={s.landform_types[0] ?? "other"}
                    label={displayName(s, locale)}
                  />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{displayName(s, locale)}</span>
                <span className="block text-xs text-muted">{t("deepPage")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
