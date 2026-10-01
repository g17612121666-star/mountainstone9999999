import { ExternalLink, Play } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n";
import type { VideoClip } from "@/lib/geo/types";

export function BiliEmbed({
  video,
  poster,
}: {
  video: VideoClip;
  poster?: string;
}) {
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const title = locale === "en" ? video.title_en || video.title : video.title;
  const note = locale === "en" ? video.note_en || video.note : video.note;
  const href = `https://www.bilibili.com/video/${video.bvid}`;
  return (
    <figure className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-video overflow-hidden video-slot-cover"
        aria-label={`${t("openVideo")} · ${title}`}
      >
        {poster ? <img src={poster} alt="" className="h-full w-full object-cover" /> : null}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
          <span className="flex size-14 items-center justify-center rounded-full bg-moss text-accent-fg shadow-[var(--shadow-border)]">
            <Play className="size-6" fill="currentColor" />
          </span>
        </span>
      </a>
      <figcaption className="space-y-3 px-4 py-3">
        <p className="font-display text-base font-semibold text-ink text-balance">{title}</p>
        <p className="text-sm leading-relaxed text-ink">{note}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-medium text-accent-fg"
        >
          <Play className="size-4" fill="currentColor" />
          {t("openVideo")}
          <ExternalLink className="size-3.5 opacity-80" />
        </a>
        <p className="text-xs text-muted">{t("videoOnBili")}</p>
      </figcaption>
    </figure>
  );
}

export function EmptyVideoSlot({ poster }: { poster?: string }) {
  const t = useT();
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t("video")}</h2>
      <figure className="mt-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <div className="relative aspect-video overflow-hidden video-slot-cover">
          {poster ? (
            <img src={poster} alt="" className="h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-border-strong bg-surface text-muted">
              <Play className="size-6" />
            </span>
          </div>
        </div>
        <figcaption className="space-y-3 px-4 py-3">
          <p className="font-display text-base font-semibold text-ink">{t("noVideo")}</p>
          <p className="text-sm leading-relaxed text-ink">{t("videoEmptyHint")}</p>
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-2 px-4 text-sm font-medium text-muted">
            <Play className="size-4" />
            {t("openVideo")}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
