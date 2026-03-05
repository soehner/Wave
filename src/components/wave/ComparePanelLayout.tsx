"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWaveAnimation } from "@/hooks/useWaveAnimation";
import { useWaveParams } from "@/hooks/useWaveParams";
import { useWaveSources } from "@/hooks/useWaveSources";
import { usePresets } from "@/hooks/usePresets";
import { useReflection } from "@/hooks/useReflection";
import { ParameterPanel } from "./ParameterPanel";
import { SourcePanel } from "./SourcePanel";
import { CompareDiffTable } from "./CompareDiffTable";
import { TopDownOverlay } from "./TopDownOverlay";
import type { CrossSectionPlane3DConfig } from "@/hooks/useWaveAnimation";
import type { UseWaveParamsReturn } from "@/hooks/useWaveParams";
import type { UseWaveSourcesReturn } from "@/hooks/useWaveSources";
import type { WaveParams } from "@/lib/wave-params";

interface ComparePanelLayoutProps {
  /** Shared time ref from Panel A's animation */
  sharedTimeRef: React.RefObject<number>;
  /** Play state */
  isPlaying: boolean;
  /** Speed multiplier */
  speedMultiplier: number;
  /** View mode */
  is2DView: boolean;
  /** FPS update callback (shared) */
  onFpsUpdate: (fps: number) => void;
  /** Time update callback (from Panel A) */
  onTimeUpdate: (time: number) => void;
  /** Initial params from the single-view mode to copy into Panel A */
  initialParamsHook: UseWaveParamsReturn;
  /** Initial sources from the single-view mode to copy into Panel A */
  initialSourcesHook: UseWaveSourcesReturn;
  /** Low FPS warning threshold */
  fpsWarningThreshold?: number;
}

/**
 * Compare-Modus-Layout: Zwei Wellen-Canvas nebeneinander.
 * Jedes Panel hat seine eigenen Parameter und Quellen.
 * Beide teilen die gleiche Zeitachse.
 */
export function ComparePanelLayout({
  sharedTimeRef,
  isPlaying,
  speedMultiplier,
  is2DView,
  onFpsUpdate,
  onTimeUpdate,
  initialParamsHook,
  initialSourcesHook,
  fpsWarningThreshold = 20,
}: ComparePanelLayoutProps) {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  const [lowFpsWarning, setLowFpsWarning] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true);

  // Panel A hooks
  const sourceHookA = useWaveSources();
  const paramsHookA = useWaveParams(sourceHookA.config.count);
  const presetsHookA = usePresets(paramsHookA.applyParams, sourceHookA.applyConfig);
  const reflectionHookA = useReflection(sourceHookA.sourceUniforms);

  // Panel B hooks
  const sourceHookB = useWaveSources();
  const paramsHookB = useWaveParams(sourceHookB.config.count);
  const presetsHookB = usePresets(paramsHookB.applyParams, sourceHookB.applyConfig);
  const reflectionHookB = useReflection(sourceHookB.sourceUniforms);

  // Copy initial params on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Copy current params to both panels
      paramsHookA.applyParams(initialParamsHook.params);
      paramsHookB.applyParams(initialParamsHook.params);
      // Copy source config
      sourceHookA.applyConfig(initialSourcesHook.config);
      sourceHookB.applyConfig(initialSourcesHook.config);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped hooks for marking presets dirty
  const wrappedParamsA: UseWaveParamsReturn = useMemo(() => ({
    ...paramsHookA,
    setSliderPercent: (key: keyof WaveParams, percent: number) => { paramsHookA.setSliderPercent(key, percent); presetsHookA.markDirty(); },
    setBaseValue: (key: keyof WaveParams, value: number) => { paramsHookA.setBaseValue(key, value); presetsHookA.markDirty(); },
    resetAll: () => { paramsHookA.resetAll(); presetsHookA.markDirty(); },
  }), [paramsHookA, presetsHookA]);

  const wrappedParamsB: UseWaveParamsReturn = useMemo(() => ({
    ...paramsHookB,
    setSliderPercent: (key: keyof WaveParams, percent: number) => { paramsHookB.setSliderPercent(key, percent); presetsHookB.markDirty(); },
    setBaseValue: (key: keyof WaveParams, value: number) => { paramsHookB.setBaseValue(key, value); presetsHookB.markDirty(); },
    resetAll: () => { paramsHookB.resetAll(); presetsHookB.markDirty(); },
  }), [paramsHookB, presetsHookB]);

  const wrappedSourcesA: UseWaveSourcesReturn = useMemo(() => ({
    ...sourceHookA,
    setSourceType: (type: Parameters<typeof sourceHookA.setSourceType>[0]) => { sourceHookA.setSourceType(type); presetsHookA.markDirty(); },
    setSourceCount: (count: number) => { sourceHookA.setSourceCount(count); presetsHookA.markDirty(); },
    setSourceSpacing: (spacing: number) => { sourceHookA.setSourceSpacing(spacing); presetsHookA.markDirty(); },
    resetSources: () => { sourceHookA.resetSources(); presetsHookA.markDirty(); },
  }), [sourceHookA, presetsHookA]);

  const wrappedSourcesB: UseWaveSourcesReturn = useMemo(() => ({
    ...sourceHookB,
    setSourceType: (type: Parameters<typeof sourceHookB.setSourceType>[0]) => { sourceHookB.setSourceType(type); presetsHookB.markDirty(); },
    setSourceCount: (count: number) => { sourceHookB.setSourceCount(count); presetsHookB.markDirty(); },
    setSourceSpacing: (spacing: number) => { sourceHookB.setSourceSpacing(spacing); presetsHookB.markDirty(); },
    resetSources: () => { sourceHookB.resetSources(); presetsHookB.markDirty(); },
  }), [sourceHookB, presetsHookB]);

  // Cross section config (disabled in compare mode per spec)
  const emptyCrossSection = useMemo<CrossSectionPlane3DConfig>(() => ({
    isActive: false,
    orientation: "x",
    position: 0,
  }), []);

  // FPS tracking for low-fps warning
  const handleFpsUpdateA = useCallback((fps: number) => {
    onFpsUpdate(fps);
    setLowFpsWarning(fps < fpsWarningThreshold);
  }, [onFpsUpdate, fpsWarningThreshold]);

  const handleFpsUpdateB = useCallback(() => {
    // Only Panel A reports FPS to the parent
  }, []);

  // Panel A animation
  const animationA = useWaveAnimation({
    isPlaying,
    onFpsUpdate: handleFpsUpdateA,
    onTimeUpdate,
    speedMultiplier,
    waveUniformArrays: paramsHookA.uniformArrays,
    sourceUniforms: sourceHookA.sourceUniforms,
    crossSectionConfig: emptyCrossSection,
    viewMode: is2DView ? "2d" : "3d",
    reflectionConfig: reflectionHookA.config,
    mirrorSources: reflectionHookA.mirrorSources,
  });

  // Panel B animation -- uses shared time ref from Panel A
  const animationB = useWaveAnimation({
    isPlaying,
    onFpsUpdate: handleFpsUpdateB,
    speedMultiplier,
    waveUniformArrays: paramsHookB.uniformArrays,
    sourceUniforms: sourceHookB.sourceUniforms,
    crossSectionConfig: emptyCrossSection,
    viewMode: is2DView ? "2d" : "3d",
    reflectionConfig: reflectionHookB.config,
    mirrorSources: reflectionHookB.mirrorSources,
  });

  // Sync Panel B time to Panel A time
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationA.timeRef.current !== undefined && animationB.timeRef.current !== undefined) {
        // Keep B in sync with A (they both run independently but we sync)
        // This is handled at the animation loop level but we do a periodic correction
        const drift = Math.abs(animationA.timeRef.current - animationB.timeRef.current);
        if (drift > 0.02) {
          animationB.timeRef.current = animationA.timeRef.current;
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [animationA.timeRef, animationB.timeRef]);

  const activeParamsHook = activeTab === "A" ? wrappedParamsA : wrappedParamsB;
  const activeSourcesHook = activeTab === "A" ? wrappedSourcesA : wrappedSourcesB;
  const activeReflectionHook = activeTab === "A" ? reflectionHookA : reflectionHookB;

  return (
    <div className="flex flex-1 min-h-0 relative">
      {/* Source panel (fuer aktives Tab) */}
      <div className="relative">
        <SourcePanel
          sourceHook={activeSourcesHook}
          isOpen={isSourcePanelOpen}
          onOpenChange={setIsSourcePanelOpen}
          reflectionHook={activeReflectionHook}
        />
      </div>

      {/* Mitte: Zwei Canvas + DiffTable */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Canvas-Row */}
        <div className="flex flex-1 min-h-0">
          {/* Panel A */}
          <div className="flex-1 min-h-0 relative border-r">
            <div
              ref={animationA.containerRef}
              className="absolute inset-0"
              aria-label="Wellenfeld Panel A"
            />
            <TopDownOverlay visible={is2DView} />
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                A
              </span>
            </div>
          </div>

          {/* Panel B */}
          <div className="flex-1 min-h-0 relative">
            <div
              ref={animationB.containerRef}
              className="absolute inset-0"
              aria-label="Wellenfeld Panel B"
            />
            <TopDownOverlay visible={is2DView} />
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-600 text-white text-xs font-bold shadow-md">
                B
              </span>
            </div>
          </div>
        </div>

        {/* Low FPS warning */}
        {lowFpsWarning && (
          <div className="px-4 py-1.5 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800">
            Geringe Bildrate im Vergleichsmodus. Reduziere die Quellenanzahl fuer bessere Performance.
          </div>
        )}

        {/* Diff Table */}
        <CompareDiffTable
          paramsA={paramsHookA.params}
          paramsB={paramsHookB.params}
          sourceConfigA={sourceHookA.config}
          sourceConfigB={sourceHookB.config}
        />
      </div>

      {/* Parameter panel (rechts) mit Tabs A/B */}
      <div className="relative">
        <div className="w-72 xl:w-80 h-full border-l bg-background overflow-y-auto">
          {/* Tab-Umschalter */}
          <div className="px-4 pt-3 pb-2 border-b sticky top-0 bg-background z-10">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "A" | "B")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="A" className="flex-1 gap-1.5">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    A
                  </span>
                  Panel A
                </TabsTrigger>
                <TabsTrigger value="B" className="flex-1 gap-1.5">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                    B
                  </span>
                  Panel B
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Parameter-Inhalt: Inline statt in ParameterPanel-Collapsible, da wir das Tab-Layout steuern */}
          <ParameterPanel
            waveParamsHook={activeParamsHook}
            sourceCount={activeTab === "A" ? sourceHookA.config.count : sourceHookB.config.count}
            isOpen={isPanelOpen}
            onOpenChange={setIsPanelOpen}
          />
        </div>
      </div>
    </div>
  );
}
