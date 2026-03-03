"use client";

import dynamic from "next/dynamic";

const WaveVisualization = dynamic(
  () =>
    import("@/components/wave/WaveVisualization").then((m) => ({
      default: m.WaveVisualization,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Lade 3D-Visualisierung...</p>
      </div>
    ),
  }
);

export default function Home() {
  return <WaveVisualization />;
}
