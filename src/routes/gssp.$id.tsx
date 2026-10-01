import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteDetail } from "@/components/site/SiteDetail";
import { absUrl, seoHead } from "@/lib/geo/canonical";
import { GSSP_ALIASES, getSite } from "@/lib/geo/catalog";
import { pageUrl, publicGsspId } from "@/lib/geo/href";
import { displayName } from "@/lib/geo/labels";

export const Route = createFileRoute("/gssp/$id")({
  loader: ({ params }) => {
    const site = getSite(params.id) ?? getSite(GSSP_ALIASES[params.id] ?? params.id);
    if (!site || !site.types.includes("gssp")) throw notFound();
    const canonical = publicGsspId(site.id);
    if (params.id !== canonical) {
      throw redirect({ to: "/gssp/$id", params: { id: canonical }, statusCode: 301 });
    }
    return { site };
  },
  component: GsspPage,
  head: ({ loaderData }) => {
    const site = loaderData?.site;
    const title = site ? displayName(site) : "金钉子";
    const desc = site?.hook ?? "";
    const path = site ? pageUrl(site) : "/gssp";
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

function GsspPage() {
  const { site } = Route.useLoaderData();
  return (
    <div className="page-shell">
      <AppHeader />
      <SiteDetail site={site} />
      <AppFooter />
    </div>
  );
}
