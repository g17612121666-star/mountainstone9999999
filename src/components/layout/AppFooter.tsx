import { Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/geo/canonical";
import { motto, useT } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale";

export function AppFooter() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  return (
    <footer className="mt-auto bg-ink text-primary-fg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold">{t("appName")}</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-primary-fg/80">{motto(locale)}</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label={t("footerNav")}>
          <Link to="/routes" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("navRoutes")}
          </Link>
          <Link to="/catalog" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("navCatalog")}
          </Link>
          <Link to="/nearby" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("nearby")}
          </Link>
          <Link to="/compare" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("compare")}
          </Link>
          <Link to="/glossary" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("glossary")}
          </Link>
          <Link to="/browse" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("browse")}
          </Link>
          <Link to="/offline" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("offline")}
          </Link>
          <Link to="/ask" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("navAsk")}
          </Link>
          <Link to="/about" className="underline decoration-primary-fg/40 underline-offset-4">
            {t("navAbout")}
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-8 text-sm text-primary-fg/80">
        <a className="underline decoration-primary-fg/40 underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </footer>
  );
}
