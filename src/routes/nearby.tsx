import { createFileRoute } from "@tanstack/react-router";
import { NearbyPanel } from "@/components/geo/NearbyPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/nearby")({
  component: NearbyPage,
  head: () => ({
    meta: [
      { title: "附近的地质点 · 山石志" },
      { name: "description", content: "按定位列出 20 / 50 / 100 公里内的名录点。坐标只用园区中心。" },
    ],
    links: [{ rel: "canonical", href: "/nearby" }],
  }),
});

function NearbyPage() {
  const t = useT();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="font-display mb-4 text-3xl font-semibold">{t("nearbyTitle")}</h1>
        <NearbyPanel />
      </main>
    </div>
  );
}
