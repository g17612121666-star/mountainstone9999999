import { useState } from "react";
import type { FieldPhoto as FieldPhotoT } from "@/lib/geo/types";
import { photoCredit, useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
}) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const [open, setOpen] = useState(false);
  const analog = photo.kind === "analog";
  const sat = photo.kind === "satellite";
  const note = locale === "en" ? photo.analog_note_en : photo.analog_note_zh;
  const credit = photoCredit(photo.credit || "", locale);
  const badge = analog ? t("analogBadge") : sat ? t("satBadge") : null;
  return (
    <figure className={cn("overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]", className)}>
      <div className="relative">
        <img src={photo.src} alt={alt || photo.caption || credit} className={imgClass} />
        {badge ? (
          <p className="absolute top-2 left-2 max-w-[90%] rounded-sm bg-ink/80 px-2 py-1 text-[11px] font-medium tracking-wide text-primary-fg">
            {badge}
          </p>
        ) : null}
      </div>
      <figcaption className="space-y-1.5 px-3 py-2.5">
        {note ? <p className="text-xs leading-relaxed text-ink">{note}</p> : null}
        {photo.kind === "own" && photo.caption && photo.caption !== "资料照片，非本站踏勘" ? (
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-medium text-ink">{t("genesisLook")} · </span>
            {photo.caption}
          </p>
        ) : null}
        {sat && !note ? <p className="text-xs leading-relaxed text-muted">{t("satBadge")}</p> : null}
        <button
          type="button"
          className="block max-w-full truncate text-left text-[11px] leading-snug text-subtle hover:text-muted"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? credit : `${t("creditExpand")} · ${credit}`}
        </button>
      </figcaption>
    </figure>
  );
}
