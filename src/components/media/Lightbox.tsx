import { useEffect } from "react";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Lightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-md bg-surface text-ink"
        onClick={onClose}
        aria-label={t("closeLightbox")}
      >
        <X className="size-5" />
      </button>
      <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="max-h-[80dvh] w-full rounded-lg object-contain outline outline-1 -outline-offset-1 outline-black/10"
        />
        {caption ? (
          <figcaption className="mt-3 max-w-prose text-sm leading-relaxed text-primary-fg">{caption}</figcaption>
        ) : null}
      </figure>
    </div>
  );
}
