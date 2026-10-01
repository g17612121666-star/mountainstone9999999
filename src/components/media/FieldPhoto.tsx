import { useState } from "react";
import type { FieldPhoto as FieldPhotoT } from "@/lib/geo/types";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

function quietNote(raw: string): string {
  return raw
    .replace(/资料照片[^。.]*/g, "")
    .replace(/非本站踏勘[。.]?/g, "")
    .replace(/Wikimedia Commons[^。.]*/gi, "")
    .replace(/Reference photo[^。.]*/gi, "")
    .replace(/not surveyed by this site[。.]?/gi, "")
    .replace(/^[·,，\s]+|[·,，\s]+$/g, "")
    .trim();
}

function isCreditLine(s: string): boolean {
  return /资料照片|非本站|Wikimedia|Reference photo|not surveyed|来源与许可/i.test(s);
}

export function FieldPhoto({
  photo,
  alt,
  className,
  imgClass = "h-52 w-full object-cover",
}: {
  photo: FieldPhotoT;
  alt?: string;
  className?: string;
  imgClass?: string;
  role?: "cover" | "stop" | "gallery" | "genesis" | "compare";
}) {
  const locale = useLocale((s) => s.locale);
  const [open, setOpen] = useState(false);
  const rawNote = locale === "en" ? photo.analog_note_en || "" : photo.analog_note_zh || "";
  const note = quietNote(rawNote);
  const caption = quietNote(photo.caption || "");
  const label = alt || caption || note || "";
  return (
    <figure className={cn("overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]", className)}>
      <button type="button" className="relative block w-full" onClick={() => setOpen(true)} aria-label={label || alt || "photo"}>
        <img
          src={photo.src}
          alt={label}
          className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")}
        />
      </button>
      {note || caption ? (
        <figcaption className="px-3 py-2.5 text-sm leading-relaxed text-ink">{note || caption}</figcaption>
      ) : null}
      {open ? <Lightbox src={photo.src} alt={label} caption={note || caption || undefined} onClose={() => setOpen(false)} /> : null}
    </figure>
  );
}

export function ClickableImage({
  src,
  alt,
  caption,
  badge,
  imgClass = "h-40 w-full object-cover",
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
  imgClass?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const cap = caption ? quietNote(caption) : "";
  const mark = badge && !isCreditLine(badge) ? badge : "";
  return (
    <figure className={cn("overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]", className)}>
      <button type="button" className="relative block w-full" onClick={() => setOpen(true)} aria-label={alt}>
        <img src={src} alt={alt} className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")} />
        {mark ? <span className="photo-kind">{mark}</span> : null}
      </button>
      {cap ? <figcaption className="px-3 py-2 text-sm leading-snug text-ink">{cap}</figcaption> : null}
      {open ? <Lightbox src={src} alt={alt} caption={cap || undefined} onClose={() => setOpen(false)} /> : null}
    </figure>
  );
}
