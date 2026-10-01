import { useState } from "react";
import type { FieldPhoto as FieldPhotoT } from "@/lib/geo/types";
import { mediaKindFor, mediaKindUiKey } from "@/lib/geo/photos";
import { photoCredit, useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

export function KindBadge({
  kind,
  credit,
  caption,
  role,
}: {
  kind?: string;
  credit?: string;
  caption?: string;
  role?: "cover" | "stop" | "gallery" | "genesis" | "compare";
}) {
  const t = useT();
  const key = mediaKindUiKey(mediaKindFor({ kind, credit, caption, role }));
  return <span className="photo-kind">{t(key)}</span>;
}

export function FieldPhoto({
  photo,
  alt,
  className,
  imgClass = "h-52 w-full object-cover",
  role = "gallery",
}: {
  photo: FieldPhotoT;
  alt?: string;
  className?: string;
  imgClass?: string;
  role?: "cover" | "stop" | "gallery" | "genesis" | "compare";
}) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const [open, setOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const analog = photo.kind === "analog";
  const sat = photo.kind === "satellite";
  const note = locale === "en" ? photo.analog_note_en : photo.analog_note_zh;
  const credit = photoCredit(photo.credit || "", locale);
  const label = alt || photo.caption || credit;
  return (
    <figure className={cn("overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]", className)}>
      <button
        type="button"
        className="relative block w-full"
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <img
          src={photo.src}
          alt={label}
          className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")}
        />
        <KindBadge kind={photo.kind} credit={photo.credit} caption={photo.caption} role={role} />
      </button>
      <figcaption className="space-y-1.5 px-3 py-2.5">
        {note ? <p className="text-sm leading-relaxed text-ink">{note}</p> : null}
        {photo.kind === "own" && photo.caption && photo.caption !== "资料照片，非本站踏勘" ? (
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-medium text-ink">{t("genesisLook")} · </span>
            {photo.caption}
          </p>
        ) : null}
        {sat && !note ? <p className="text-sm leading-relaxed text-muted">{t("satBadge")}</p> : null}
        {analog && !note ? <p className="text-sm leading-relaxed text-muted">{t("analogBadge")}</p> : null}
        <button
          type="button"
          className="block max-w-full truncate text-left text-xs leading-snug text-muted hover:text-ink"
          onClick={() => setCreditOpen((v) => !v)}
        >
          {creditOpen ? credit : `${t("creditExpand")} · ${credit}`}
        </button>
      </figcaption>
      {open ? (
        <Lightbox src={photo.src} alt={label} caption={credit} onClose={() => setOpen(false)} />
      ) : null}
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
  return (
    <figure className={cn("overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]", className)}>
      <button type="button" className="relative block w-full" onClick={() => setOpen(true)} aria-label={alt}>
        <img src={src} alt={alt} className={cn(imgClass, "outline outline-1 -outline-offset-1 outline-black/10")} />
        {badge ? <span className="photo-kind">{badge}</span> : null}
      </button>
      {caption ? (
        <figcaption className="px-3 py-2 text-xs leading-snug text-muted">{caption}</figcaption>
      ) : null}
      {open ? <Lightbox src={src} alt={alt} caption={caption} onClose={() => setOpen(false)} /> : null}
    </figure>
  );
}
