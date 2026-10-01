import { ExternalLink } from "lucide-react";
import { officialLinks } from "@/lib/geo/official";
import type { Site, VisitInfo } from "@/lib/geo/types";
import { useLocale, useT } from "@/lib/i18n";

export function OfficialBox({ site, visit }: { site: Site; visit?: VisitInfo }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const links = officialLinks(site, visit);
  if (!links.length) return null;
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-lg font-semibold">{t("officialLinks")}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="official-chip"
              target="_blank"
              rel="noreferrer"
            >
              {locale === "en" ? l.en : l.zh}
              <ExternalLink className="size-3.5" />
            </a>
            {l.kind === "gov" ? (
              <span className="mt-1 block px-2 text-[11px] text-muted">{t("govPortal")}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-subtle">{t("ticketOfficial")}</p>
    </section>
  );
}
