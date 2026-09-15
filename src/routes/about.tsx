import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { bundleMeta, stats } from "@/lib/geo/catalog";
import { fossilLaw, motto, useLocale, useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "关于 · 山石志" },
      {
        name: "description",
        content: "山石志是随身地质向导。名录来源、化石法律、票价免责与勘误入口。",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const en = locale === "en";
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{t("aboutTitle")}</h1>
        <p className="mt-4 text-lg leading-relaxed">{motto(locale)}</p>
        <p className="mt-4 text-sm leading-relaxed">
          {en
            ? "This is a zoomable map of geosites in China. It is not a scenic brochure, not a booking site, not a government geology portal, and not a social network. Zoom in, tap a point, and read why the place formed, which field stops sit in the park, how to walk, what to look at, what not to hammer, and whether a ticket is needed."
            : "这是一张可缩放的中国地质点地图，不是景区介绍合集，不是携程，不是地质云，也不是社交产品。放大、点进去，读这个地方为什么形成、园里有哪些地质打卡点、怎么走、到了看什么、观察时注意什么、可能见到哪些岩石矿物化石（只看不挖），以及是否需要买票。"}
        </p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("sourcesH")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {en
            ? `Catalog cutoff: ${bundleMeta.sources_cutoff}. Compiled from the National Forestry and Grassland Administration list of UNESCO Global Geoparks (March 2024, plus Kanbula and Yunyang in 2025 and Changshan and Siguniangshan in 2026 — 51 parks), publicly circulated national geopark lists, ICS GSSP lists, and the IUGS geoheritage list. Coordinates are park centres in WGS84. On the map, mainland China is shifted to GCJ-02 to match Gaode tiles; Hong Kong and similar places are not offset.`
            : `名录截止日期：${bundleMeta.sources_cutoff}。综合国家林草局公布的世界地质公园名录（2024-03，并补入 2025 年坎布拉、云阳与 2026 年常山、四姑娘山，合计 51 处）、公开转载的国家地质公园名录、ICS / 国际地层委员会金钉子名录，以及 IUGS 地质遗产地公开名单。坐标取公开资料中的园区中心，WGS84 存储；中国大陆地图显示时转为 GCJ-02 以匹配高德底图，香港等地不偏移。`}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>
            {en
              ? `${stats.total} geosites (parks, GSSPs, IUGS, urban)`
              : `库内地质点 ${stats.total}（含公园、金钉子、IUGS、城市地质等）`}
          </li>
          <li>
            {en ? `${stats.national} named national geoparks` : `已命名国家地质公园 ${stats.national}`}
          </li>
          <li>{en ? `${stats.candidate} qualifying parks` : `资格园 ${stats.candidate}`}</li>
          <li>{en ? `${stats.world} UNESCO Global Geoparks` : `世界级 ${stats.world}`}</li>
          <li>
            {en
              ? `${stats.gssp} independent GSSP sites (Meishan holds two spikes on one section).`
              : `金钉子独立点 ${stats.gssp}（煤山一剖两钉，计为 1 个点、2 颗钉子）。`}
            <Link to="/gssp" className="ml-1 text-moss underline">
              {t("gsspIndex")}
            </Link>
          </li>
          <li>
            {en
              ? `${stats.urban} urban geosite (Sheshan). Shanghai’s national geopark is Chongming Island.`
              : `城市地质 ${stats.urban}（佘山；上海的国家地质公园是崇明岛）`}
          </li>
          <li>
            {en
              ? `Depth: ${stats.complete} full pages · ${stats.standard} field cards`
              : `内容完成度（按 JSON 实时统计）：深页 ${stats.complete} · 简卡 ${stats.standard}`}
            {stats.placeholder ? (en ? ` · ${stats.placeholder} unwritten` : ` · 未写 ${stats.placeholder}`) : ""}
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          {en
            ? "Provincial geoparks are not in this edition. Qualifying parks sit with named parks. Do not label Sheshan a national geopark — Shanghai’s national geopark is Chongming Island."
            : "省级地质公园未收入本期。资格园与已命名园一并收录。禁止把佘山标成国家地质公园——上海的国家地质公园是崇明岛。"}
        </p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("fossilLawH")}</h2>
        <p className="mt-2 text-sm leading-relaxed">{fossilLaw(locale)}</p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("ticketH")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {en
            ? "Prices and hours change. Every visit card says “check the official listing on the day” and carries an update date. If we cannot verify a ticket deep-link we only give the official site. This guide does not sell tickets and has no checkout."
            : "票价、开放时间会变。每张游览信息都标注「以官方当日为准」和更新日期。找不到官方购票链接时只放官网，不伪造深链，不把过期票价写成实时价。本站不售票、不提供站内支付。"}
        </p>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("producer")}</h2>
        <figure className="mt-4 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <img
            src="/producer.jpg"
            alt="Li Zeyu / 李泽宇 in the field, geological hammer in hand"
            className="aspect-[4/5] w-full object-cover object-[50%_18%] sm:aspect-[5/4]"
          />
          <figcaption className="space-y-2 px-4 py-4 text-sm leading-relaxed">
            <p>网站制作：李泽宇。地质爱好者。上海平和学校地质社社长。</p>
            <p>
              Website Producer: Li Zeyu. A Geoscience Lover. The President of Geoscience Club of
              Shanghai Pinghe School.
            </p>
            <p className="text-muted">
              {en
                ? "A field notebook for walking China’s geoparks, GSSPs and urban rock — written so a stop can be checked on the ground, not sold as scenery."
                : "把中国的地质公园、金钉子和城市里的石头写成可现场核对的手册，而不是风景介绍。"}
            </p>
          </figcaption>
        </figure>

        <h2 className="font-display mt-10 text-xl font-semibold">{t("contact")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {en ? (
            <>
              For questions, corrections, or additions, contact the webmaster at{" "}
              <a className="text-moss underline" href="mailto:g17612121666@gmail.com">
                g17612121666@gmail.com
              </a>
              .
            </>
          ) : (
            <>
              如有问题、纠错或补充，请联系站长邮箱{" "}
              <a className="text-moss underline" href="mailto:g17612121666@gmail.com">
                g17612121666@gmail.com
              </a>
              。
            </>
          )}
        </p>
      </main>
    </div>
  );
}
