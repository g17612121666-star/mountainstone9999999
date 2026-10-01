import { Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/geo/canonical";
import { motto, useT } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale";

export function AppFooter() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <footer className="border-t border-border-strong bg-bg-warm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold">{t("appName")}</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink">{motto(locale)}</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label={t("footerNav")}>
          <Link to="/routes" className="text-moss underline">
            {t("navRoutes")}
          </Link>
          <Link to="/catalog" className="text-moss underline">
            {t("navCatalog")}
          </Link>
          <Link to="/nearby" className="text-moss underline">
            {t("nearby")}
          </Link>
          <Link to="/compare" className="text-moss underline">
            {t("compare")}
          </Link>
          <Link to="/glossary" className="text-moss underline">
            {t("glossary")}
          </Link>
          <Link to="/browse" className="text-moss underline">
            {t("browse")}
          </Link>
          <Link to="/offline" className="text-moss underline">
            {t("offline")}
          </Link>
          <Link to="/ask" className="text-moss underline">
            {t("navAsk")}
          </Link>
          <Link to="/about" className="text-moss underline">
            {t("navAbout")}
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-6 text-sm text-ink">
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </footer>
  );
}
