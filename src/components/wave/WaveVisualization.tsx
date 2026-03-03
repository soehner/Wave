"use client";

import { useState, useCallback, useEffect } from "react";
import { useWaveAnimation } from "@/hooks/useWaveAnimation";
import { useWaveParams } from "@/hooks/useWaveParams";
import { useWaveSources } from "@/hooks/useWaveSources";
import { ControlBar } from "./ControlBar";
import { ParameterPanel } from "./ParameterPanel";
import { SourcePanel } from "./SourcePanel";

export function WaveVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState<number | undefined>();
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );

  const waveSourcesHook = useWaveSources();
  const waveParamsHook = useWaveParams(waveSourcesHook.config.count);

  useEffect(() => {
    const check = () => setIsSmallViewport(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  const { containerRef, resetCamera, resetTime, webglSupported } = useWaveAnimation({
    isPlaying,
    onFpsUpdate: handleFpsUpdate,
    waveUniformArrays: waveParamsHook.uniformArrays,
    sourceUniforms: waveSourcesHook.sourceUniforms,
  });

  if (!webglSupported) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl" aria-hidden="true">!</div>
          <h2 className="text-xl font-semibold">WebGL nicht verfuegbar</h2>
          <p className="text-muted-foreground">
            Dein Browser unterstuetzt WebGL nicht oder es ist deaktiviert. Bitte
            verwende einen aktuellen Browser (Chrome, Firefox oder Safari) um
            die 3D-Wellenvisualisierung zu nutzen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b">
        <h1 className="text-lg font-semibold tracking-tight">
          WavePhysics
        </h1>
        <p className="text-sm text-muted-foreground hidden md:block font-mono">
          z = A·sin(k·r - ω·t + φ)
        </p>
      </header>
      {isSmallViewport && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
          Fuer die beste Darstellung empfehlen wir eine Bildschirmbreite von mindestens 1024 px.
        </div>
      )}
      {/* Hauptbereich: SourcePanel (links) + 3D-Canvas + ParameterPanel (rechts) */}
      <div className="flex flex-1 min-h-0 relative">
        <SourcePanel
          sourceHook={waveSourcesHook}
          isOpen={isSourcePanelOpen}
          onOpenChange={setIsSourcePanelOpen}
        />
        <div ref={containerRef} className="flex-1 min-h-0" />
        <ParameterPanel
          waveParamsHook={waveParamsHook}
          sourceCount={waveSourcesHook.config.count}
          isOpen={isPanelOpen}
          onOpenChange={setIsPanelOpen}
        />
      </div>
      <ControlBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onRestartWave={resetTime}
        onResetCamera={resetCamera}
        fps={fps}
      />
    </div>
  );
}
