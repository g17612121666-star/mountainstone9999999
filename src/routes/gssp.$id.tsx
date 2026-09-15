import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteDetail } from "@/components/site/SiteDetail";
import { GSSP_ALIASES, getSite } from "@/lib/geo/catalog";
import { pageUrl, publicGsspId } from "@/lib/geo/href";
import { displayName } from "@/lib/geo/labels";

export const Route = createFileRoute("/gssp/$id")({
  loader: ({ params }) => {
    const site = getSite(params.id) ?? getSite(GSSP_ALIASES[params.id] ?? params.id);
    if (!site || !site.types.includes("gssp")) throw notFound();
    const canonical = publicGsspId(site.id);
    if (params.id !== canonical) {
      throw redirect({ to: "/gssp/$id", params: { id: canonical } });
    }
    return { site };
  },
  component: GsspPage,
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = `${site ? displayName(site) : "金钉子"} · 山石志`;
    const desc = site?.hook ?? "";
    const path = site ? pageUrl(site) : "/gssp";
    const img = site?.cover_image?.match(/\.(jpe?g|png|webp)$/i)
      ? site.cover_image
      : "/og.jpg";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: path },
        { property: "og:locale", content: "zh_CN" },
        { property: "og:image", content: img },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: img },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: site
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Place",
                name: site.name,
                description: site.hook,
                geo: {
                  "@type": "GeoCoordinates",
                  longitude: site.coordinates[0],
                  latitude: site.coordinates[1],
                },
              }),
            },
          ]
        : [],
    };
  },
});

function GsspPage() {
  const { site } = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <SiteDetail site={site} />
    </div>
  );
}
