"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useWaveAnimation } from "@/hooks/useWaveAnimation";
import { useWaveParams } from "@/hooks/useWaveParams";
import { useWaveSources } from "@/hooks/useWaveSources";
import { useCrossSection } from "@/hooks/useCrossSection";
import { ControlBar } from "./ControlBar";
import { ParameterPanel } from "./ParameterPanel";
import { SourcePanel } from "./SourcePanel";
import { CrossSectionPanel } from "./CrossSectionPanel";
import { FIELD_HALF_SIZE } from "@/lib/wave-math";
import type { CrossSectionPlane3DConfig } from "@/hooks/useWaveAnimation";

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

  // Schnittebenen-Zustand (lebt hier, wird an beide Hooks weitergegeben)
  const [csIsActive, setCsIsActive] = useState(false);
  const [csOrientation, setCsOrientation] = useState<"x" | "y">("x");
  const [csPosition, setCsPosition] = useState(0);

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

  const crossSectionConfig = useMemo<CrossSectionPlane3DConfig>(
    () => ({
      isActive: csIsActive,
      orientation: csOrientation,
      position: csPosition,
    }),
    [csIsActive, csOrientation, csPosition]
  );

  const { containerRef, resetCamera, resetTime, webglSupported, timeRef } =
    useWaveAnimation({
      isPlaying,
      onFpsUpdate: handleFpsUpdate,
      waveUniformArrays: waveParamsHook.uniformArrays,
      sourceUniforms: waveSourcesHook.sourceUniforms,
      crossSectionConfig,
    });

  const { chartData } = useCrossSection({
    timeRef,
    waveUniformArrays: waveParamsHook.uniformArrays,
    sourceUniforms: waveSourcesHook.sourceUniforms,
    isPlaying,
    isActive: csIsActive,
    orientation: csOrientation,
    position: csPosition,
  });

  const toggleCrossSection = useCallback(() => {
    setCsIsActive((prev) => !prev);
  }, []);

  const handleSetCsPosition = useCallback((p: number) => {
    setCsPosition(Math.max(-FIELD_HALF_SIZE, Math.min(FIELD_HALF_SIZE, p)));
  }, []);

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
        {/* Mittlerer Bereich: 3D-Canvas + optionales Schnittdiagramm */}
        <div className="flex flex-col flex-1 min-h-0">
          <div
            ref={containerRef}
            className={csIsActive ? "flex-[2] min-h-0" : "flex-1 min-h-0"}
          />
          {csIsActive && (
            <div className="flex-[1] min-h-0" style={{ minHeight: "180px" }}>
              <CrossSectionPanel
                isActive={csIsActive}
                orientation={csOrientation}
                onOrientationChange={setCsOrientation}
                position={csPosition}
                onPositionChange={handleSetCsPosition}
                positionMin={-FIELD_HALF_SIZE}
                positionMax={FIELD_HALF_SIZE}
                chartData={chartData}
                sourceUniforms={waveSourcesHook.sourceUniforms}
              />
            </div>
          )}
        </div>
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
        onRestartWave={() => {
          resetTime();
          setIsPlaying(false);
        }}
        onResetCamera={resetCamera}
        fps={fps}
        isCrossSectionActive={csIsActive}
        onToggleCrossSection={toggleCrossSection}
      />
    </div>
  );
}
