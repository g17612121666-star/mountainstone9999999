import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { CONTACT_EMAIL, seoHead } from "@/lib/geo/canonical";
import { getSite, stats } from "@/lib/geo/catalog";
import { siteTo } from "@/lib/geo/href";
import { readSaved } from "@/lib/geo/saved";
import { displayName, fossilLaw, fossilLawFor, motto, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    seoHead({
      title: "关于",
      description: "山石志是一张能点进去的中国石头地图。只看不挖。",
      path: "/about",
    }),
});

function AboutPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  const [saved, setSaved] = useState<string[] | null>(null);
  useEffect(() => {
    setSaved(readSaved());
  }, []);
  return (
    <div className="page-shell">
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="text-xs font-semibold tracking-wide text-moss">{t("appName")}</p>
        <h1 className="display-title mt-2">{t("aboutTitle")}</h1>
        <p className="mt-5 font-display text-xl leading-relaxed">{motto(locale)}</p>
        <p className="mt-4 text-base leading-relaxed">
          {en
            ? "A map of rocks in China you can tap. Not a brochure. Open a place and read what the rock is, how it cracked, what to look at first, and what you must not hammer."
            : "这是一张能点进去的中国石头地图。不是风景介绍。点开一个地方，看石头是什么、怎么裂开的、到了先看哪，还有什么不能敲。"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {en
            ? `${stats.total} places so far: parks, golden spikes, and one city rock. Sheshan is the urban site. Shanghai’s national geopark is Chongming Island. Counts as of 2026-10-03.`
            : `眼下写了 ${stats.total} 处：公园、金钉子，还有一处城里的石头。佘山是城市点。上海的国家地质公园是崇明岛。数字截至 2026-10-03。`}
          <Link to="/gssp" className="ml-1 text-moss underline">
            {t("gsspIndex")}
          </Link>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {en
            ? "Huguangyan is in Zhanjiang, Guangdong. Haikou Shishan is in Hainan. Both belong to the Leiqiong UNESCO Global Geopark. They are not two global geoparks."
            : "湖光岩在广东湛江。海口石山在海南。两处都是雷琼世界地质公园的一部分，不另算成两个世界地质公园。"}
        </p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("inclusionH")}</h2>
        <p className="mt-3 text-base leading-relaxed">{t("inclusionBody")}</p>
        <aside className="mt-4 rounded-xl border border-sand/40 bg-sand/10 px-4 py-3 text-sm leading-relaxed">
          {t("provincialCallout")}
        </aside>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("fossilLawH")}</h2>
        <p className="mt-3 text-base leading-relaxed">{fossilLaw(locale)}</p>
        <p className="mt-3 rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-border)]">
          {fossilLawFor("香港", locale)}
        </p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("producer")}</h2>
        <figure className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] sm:flex sm:items-stretch">
          <img
            src="/producer.jpg"
            alt={en ? "Li Zeyu outdoors, geological hammer in hand" : "李泽宇在野外，手里拿着地质锤"}
            className="aspect-[4/5] w-full object-cover object-[50%_18%] sm:aspect-auto sm:w-52 sm:shrink-0"
          />
          <figcaption className="space-y-3 px-5 py-5">
            {en ? (
              <p className="font-display text-2xl leading-snug font-semibold">
                Li Zeyu. He likes rocks. President of the Geography Club of Shanghai Pinghe School.
              </p>
            ) : (
              <p className="font-display text-2xl leading-snug font-semibold">
                李泽宇。喜欢石头的人。上海平和学校地理社社长。
              </p>
            )}
            <p className="text-base leading-relaxed text-ink">
              {en
                ? "A notebook for walking China’s geoparks, golden spikes and city rock. You should be able to check a stop on the ground."
                : "把中国的地质公园、金钉子和城里的石头写成能在现场核对的笔记，不是风景介绍。"}
            </p>
          </figcaption>
        </figure>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("savedList")}</h2>
        {saved === null ? null : saved.length === 0 ? (
          <p className="mt-3 text-base leading-relaxed text-muted">{t("savedEmpty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
            {saved.map((id) => {
              const site = getSite(id);
              if (!site) return null;
              return (
                <li key={id}>
                  <Link {...siteTo(site)} className="block px-4 py-3 text-sm hover:bg-surface-2">
                    {displayName(site, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <h2 className="font-display mt-10 text-xl font-semibold">{t("contact")}</h2>
        <p className="mt-3 text-base leading-relaxed">
          {en ? (
            <>
              Wrong rock, missing stop, or a place that should be here — write to{" "}
              <a className="text-moss underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </>
          ) : (
            <>
              石头写错了、打卡点漏了，或者有个地方该进来，写信到{" "}
              <a className="text-moss underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              。
            </>
          )}
        </p>
      </main>
      <AppFooter />
      <BackToTop />
    </div>
  );
}
