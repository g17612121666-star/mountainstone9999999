import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/lib/i18n";

export function BackToTop() {
  const t = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="fixed right-4 bottom-5 z-40 flex h-11 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-medium text-primary-fg shadow-[var(--shadow-border)]"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp className="size-4" />
      {t("backToTop")}
    </button>
  );
}
