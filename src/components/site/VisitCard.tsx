import { ExternalLink } from "lucide-react";
import { isGenericTransport, isPlaceholderCopy, isTicketDisclaimer } from "@/lib/geo/copy";
import type { VisitInfo } from "@/lib/geo/types";
import { localizeVisit, useLocale, useT } from "@/lib/i18n";

export function VisitCard({
  visit,
  officialWebsite,
}: {
  visit: VisitInfo;
  officialWebsite?: string;
}) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const v = localizeVisit(visit, locale);
  const ticket =
    v.is_ticketed === true
      ? t("ticketYes")
      : v.is_ticketed === false
        ? t("ticketNo")
        : t("ticketUnknown");
  const ticketHref = v.official_ticket_url || officialWebsite || "";
  const price = isPlaceholderCopy(v.price_note) || isTicketDisclaimer(v.price_note) ? "" : v.price_note;
  const transport = isGenericTransport(v.transport) || isPlaceholderCopy(v.transport) ? "" : v.transport;
  const season = isPlaceholderCopy(v.best_season) ? "" : v.best_season;
  const hours = isPlaceholderCopy(v.opening_hours) ? "" : v.opening_hours;
  const peak = isPlaceholderCopy(v.peak_season) ? "" : v.peak_season;
  const free = isPlaceholderCopy(v.free_policy) ? "" : v.free_policy;
  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-lg font-semibold">{t("visit")}</h2>
      <p className="mt-2 text-sm">
        <span className="font-medium">{ticket}</span>
        {price ? <span className="text-muted"> · {price}</span> : null}
      </p>
      <dl className="mt-3 space-y-1.5 text-sm">
        {hours ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">{t("openHours")}</dt>
            <dd>{hours}</dd>
          </div>
        ) : null}
        {peak ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">{t("peak")}</dt>
            <dd>{peak}</dd>
          </div>
        ) : null}
        {transport ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">{t("transport")}</dt>
            <dd>{transport}</dd>
          </div>
        ) : null}
        {season ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">{t("season")}</dt>
            <dd>{season}</dd>
          </div>
        ) : null}
        {free ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">{t("concession")}</dt>
            <dd>{free}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-3 flex flex-col gap-2">
        {ticketHref ? (
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sand text-sm font-medium text-primary-fg"
            href={ticketHref}
            target="_blank"
            rel="noreferrer"
          >
            {v.official_ticket_url ? t("officialTicket") : t("officialSite")}
            <ExternalLink className="size-4" />
          </a>
        ) : (
          <p className="text-sm text-muted">{t("noTicketLink")}</p>
        )}
        {v.backup_ticket_urls.map((b) => (
          <a key={b.url} href={b.url} className="text-sm text-moss underline" target="_blank" rel="noreferrer">
            {b.label}
            {t("thirdParty")}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">
        {t("ticketFoot")} {t("updatedOn")} {v.info_updated_on}.
      </p>
    </section>
  );
}
