import { useState } from "react";
import type { FieldPhoto as FieldPhotoT } from "@/lib/geo/types";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

function quietNote(raw: string): string {
  const s = raw
    .replace(/卫星资料照片[^。.]*/g, "")
    .replace(/资料照片[^。.]*/g, "")
    .replace(/非本站踏勘[。.]?/g, "")
    .replace(/非地面实拍[。.]?/g, "")
    .replace(/Wikimedia Commons[^。.]*/gi, "")
    .replace(/Reference photo[^。.]*/gi, "")
    .replace(/not surveyed by this site[。.]?/gi, "")
    .replace(/下图为[^。]*。/g, "")
    .replace(/Analog from [^.]+\./gi, "")
    .replace(/不是本园[^。]*。/g, "")
    .replace(/^[·,，\s]+|[·,，\s]+$/g, "")
    .trim();
  if (!s || s === "卫星" || isCreditLine(s)) return "";
  return s;
}

function creditLine(raw: string): string {
  const s = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/资料照片[·,，]?\s*/g, "")
    .replace(/非本站踏勘/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || /^wikimedia commons$/i.test(s)) return "";
  return s;
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
  const credit = creditLine(photo.credit || "");
  const label = alt || caption || note || "";
  return (
    <figure className={cn("overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]", className)}>
      <button type="button" className="relative block w-full" onClick={() => setOpen(true)} aria-label={label || alt || "photo"}>
        <img
          src={photo.src}
          alt={label || alt || "照片"}
          loading="lazy"
          decoding="async"
          className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")}
        />
      </button>
      {note || caption || credit ? (
        <figcaption className="px-3 py-2.5 text-sm leading-relaxed text-ink">
          {note || caption ? <p>{note || caption}</p> : null}
          {credit ? <p className="mt-1 text-xs text-muted">{credit}</p> : null}
        </figcaption>
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
        <img src={src} alt={alt} loading="lazy" decoding="async" className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")} />
        {mark ? <span className="photo-kind">{mark}</span> : null}
      </button>
      {cap ? <figcaption className="px-3 py-2 text-sm leading-snug text-ink">{cap}</figcaption> : null}
      {open ? <Lightbox src={src} alt={alt} caption={cap || undefined} onClose={() => setOpen(false)} /> : null}
    </figure>
  );
}
