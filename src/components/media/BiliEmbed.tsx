import { useLocale, useT } from "@/lib/i18n";
import type { VideoClip } from "@/lib/geo/types";

export function BiliEmbed({ video }: { video: VideoClip }) {
  const locale = useLocale((s) => s.locale);
  const title = locale === "en" ? video.title_en || video.title : video.title;
  const note = locale === "en" ? video.note_en || video.note : video.note;
  return (
    <figure className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <div className="aspect-video bg-ink">
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${video.bvid}&high_quality=1&danmaku=0`}
          title={title}
          className="h-full w-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <figcaption className="space-y-1 px-4 py-3 text-sm leading-relaxed">
        <p className="font-medium">{title}</p>
        <p className="text-muted">{note}</p>
      </figcaption>
    </figure>
  );
}

export function EmptyVideoSlot() {
  const t = useT();
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t("video")}</h2>
      <p className="mt-3 rounded-xl bg-surface px-4 py-6 text-sm text-muted shadow-[var(--shadow-border)]">
        {t("noVideo")}
      </p>
    </section>
  );
}
