import { createFileRoute } from "@tanstack/react-router";
import { NearbyPanel } from "@/components/geo/NearbyPanel";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { seoHead } from "@/lib/geo/canonical";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/nearby")({
  component: NearbyPage,
  head: () =>
    seoHead({
      title: "附近的地质点",
      description: "按定位、城市或地名列出附近的名录点。坐标只用园区中心。",
      path: "/nearby",
    }),
});

function NearbyPage() {
  const t = useT();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="font-display mb-4 text-3xl font-semibold">{t("nearbyTitle")}</h1>
        <NearbyPanel hideTitle />
      </main>
      <AppFooter />
    </div>
  );
}
