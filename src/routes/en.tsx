import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { seoHead } from "@/lib/geo/canonical";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/en")({
  component: EnLocalePage,
  head: () =>
    seoHead({
      title: "English",
      description: "Shanshizhi is a bilingual field guide. This is not a separate English site — switch language in the header.",
      path: "/en",
    }),
});

function EnLocalePage() {
  const setLocale = useLocale((s) => s.setLocale);
  useEffect(() => {
    setLocale("en");
  }, [setLocale]);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">English is a language switch, not a second site</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          There is no standalone English edition at this address. Use the language toggle in the header.
          Where an English paragraph is not ready, the page keeps the original wording.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          这里不是独立英文站。请用顶栏切换语言。未人工质检的正文仍显示中文，并在页面上标明。
        </p>
        <p className="mt-6 text-sm">
          <Link to="/" className="text-moss underline">
            Back to the map
          </Link>
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
