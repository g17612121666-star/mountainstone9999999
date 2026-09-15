import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteDetail } from "@/components/site/SiteDetail";
import { getSite } from "@/lib/geo/catalog";
import { pageUrl, publicGsspId, publicSiteId, siteTo } from "@/lib/geo/href";
import { displayName } from "@/lib/geo/labels";
import { SITE_PUBLIC_ID } from "@/lib/geo/patches";

export const Route = createFileRoute("/sites/$id")({
  loader: ({ params }) => {
    if (SITE_PUBLIC_ID[params.id]) {
      throw redirect({ to: "/sites/$id", params: { id: SITE_PUBLIC_ID[params.id] } });
    }
    const site = getSite(params.id);
    if (!site) throw notFound();
    if (site.types.includes("gssp")) {
      throw redirect({ to: "/gssp/$id", params: { id: publicGsspId(site.id) } });
    }
    if (publicSiteId(site.id) !== params.id) {
      throw redirect({ ...siteTo(site) });
    }
    return { site };
  },
  component: SitePage,
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = `${site ? displayName(site) : "地质点"} · 山石志`;
    const desc = site?.hook ?? "";
    const path = site ? pageUrl(site) : "/catalog";
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

function SitePage() {
  const { site } = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <SiteDetail site={site} />
    </div>
  );
}
