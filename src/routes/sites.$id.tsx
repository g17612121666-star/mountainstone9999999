import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteDetail } from "@/components/site/SiteDetail";
import { absUrl, seoHead } from "@/lib/geo/canonical";
import { getSite } from "@/lib/geo/catalog";
import { pageUrl, publicGsspId, publicSiteId, siteTo } from "@/lib/geo/href";
import { displayName } from "@/lib/geo/labels";
import { SITE_PUBLIC_ID, SITE_REDIRECTS } from "@/lib/geo/patches";

export const Route = createFileRoute("/sites/$id")({
  loader: ({ params }) => {
    const alias = SITE_REDIRECTS[params.id];
    if (alias) {
      throw redirect({ to: "/sites/$id", params: { id: alias }, statusCode: 301 });
    }
    if (SITE_PUBLIC_ID[params.id]) {
      throw redirect({
        to: "/sites/$id",
        params: { id: SITE_PUBLIC_ID[params.id] },
        statusCode: 301,
      });
    }
    const site = getSite(params.id);
    if (!site) throw notFound();
    if (site.types.includes("gssp")) {
      throw redirect({ to: "/gssp/$id", params: { id: publicGsspId(site.id) }, statusCode: 301 });
    }
    if (publicSiteId(site.id) !== params.id) {
      throw redirect({ ...siteTo(site), statusCode: 301 });
    }
    return { site };
  },
  component: SitePage,
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = site ? displayName(site) : "地质点";
    const desc = site?.hook ?? "";
    const path = site ? pageUrl(site) : "/catalog";
    const img = site?.cover_image?.match(/\.(jpe?g|png|webp)$/i) ? site.cover_image : "/og.jpg";
    const head = seoHead({ title, description: desc, path, image: img });
    return {
      ...head,
      scripts: site
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Place",
                name: site.name,
                description: site.hook,
                url: absUrl(path),
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
      <AppFooter />
    </div>
  );
}
