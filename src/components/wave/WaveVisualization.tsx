"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useWaveAnimation } from "@/hooks/useWaveAnimation";
import { useWaveParams } from "@/hooks/useWaveParams";
import { useWaveSources } from "@/hooks/useWaveSources";
import { useCrossSection } from "@/hooks/useCrossSection";
import { useIntensityScreen, type IntensityMode } from "@/hooks/useIntensityScreen";
import { useProbeData, PROBE_COLORS } from "@/hooks/useProbeData";
import type { Probe } from "@/hooks/useProbeData";
import { usePresets } from "@/hooks/usePresets";
import { useAnnotations } from "@/hooks/useAnnotations";
import { useLearnMode } from "@/hooks/useLearnMode";
import { useReflection } from "@/hooks/useReflection";
import { ControlBar } from "./ControlBar";
import { AnnotationPanel } from "./AnnotationPanel";
import { ReflectionPanel } from "./ReflectionPanel";
import { ParameterPanel } from "./ParameterPanel";
import { SourcePanel } from "./SourcePanel";
import { CrossSectionPanel } from "./CrossSectionPanel";
import { IntensityScreenPanel } from "./IntensityScreenPanel";
import { ProbePanel } from "./ProbePanel";
import { TopDownOverlay } from "./TopDownOverlay";
import { ComparePanelLayout } from "./ComparePanelLayout";
import { FIELD_HALF_SIZE, type ReflectionParams } from "@/lib/wave-math";
import type { CrossSectionPlane3DConfig } from "@/hooks/useWaveAnimation";
import type { UseWaveParamsReturn } from "@/hooks/useWaveParams";
import type { UseWaveSourcesReturn } from "@/hooks/useWaveSources";

export function WaveVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState<number | undefined>();
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [is2DView, setIs2DView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );

  // Vergleichsmodus (PROJ-14)
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Schnittebenen-Zustand (lebt hier, wird an beide Hooks weitergegeben)
  const [csIsActive, setCsIsActive] = useState(false);
  const [csOrientation, setCsOrientation] = useState<"x" | "y">("x");
  const [csPosition, setCsPosition] = useState(0);

  // Intensitaetsschirm-Zustand (PROJ-9)
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [screenX, setScreenX] = useState(4.5);
  const [intensityMode, setIntensityMode] = useState<IntensityMode>("instantaneous");

  // Sonden-Zustand
  const [probes, setProbes] = useState<Probe[]>([]);
  const probeCounterRef = useRef(0);

  const waveSourcesHook = useWaveSources();
  const waveParamsHook = useWaveParams(waveSourcesHook.config.count);
  const presetsHook = usePresets(waveParamsHook.applyParams, waveSourcesHook.applyConfig);
  const reflectionHook = useReflection(waveSourcesHook.sourceUniforms);

  // Wrapped Hooks: markDirty bei manuellen Aenderungen
  const wrappedParamsHook: UseWaveParamsReturn = {
    ...waveParamsHook,
    setSliderPercent: (key, percent) => { waveParamsHook.setSliderPercent(key, percent); presetsHook.markDirty(); },
    setBaseValue: (key, value) => { waveParamsHook.setBaseValue(key, value); presetsHook.markDirty(); },
    resetAll: () => { waveParamsHook.resetAll(); presetsHook.markDirty(); },
  };
  const wrappedSourcesHook: UseWaveSourcesReturn = {
    ...waveSourcesHook,
    setSourceType: (type) => { waveSourcesHook.setSourceType(type); presetsHook.markDirty(); },
    setSourceCount: (count) => { waveSourcesHook.setSourceCount(count); presetsHook.markDirty(); },
    setSourceSpacing: (spacing) => { waveSourcesHook.setSourceSpacing(spacing); presetsHook.markDirty(); },
    resetSources: () => { waveSourcesHook.resetSources(); presetsHook.markDirty(); },
  };

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Panels auf mobilen Geraeten automatisch schliessen
      if (mobile) {
        setIsPanelOpen(false);
        setIsSourcePanelOpen(false);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleWaveClick = useCallback((x: number, y: number) => {
    setProbes((prev) => {
      const id = `probe-${probeCounterRef.current++}`;
      const colorIndex = prev.length < 3 ? prev.length : 0;
      const newProbe: Probe = {
        id,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        color: PROBE_COLORS[colorIndex],
      };
      if (prev.length >= 3) {
        // Aelteste Sonde ersetzen
        return [...prev.slice(1), newProbe];
      }
      return [...prev, newProbe];
    });
  }, []);

  const handleRemoveProbe = useCallback((id: string) => {
    setProbes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleRemoveAllProbes = useCallback(() => {
    setProbes([]);
  }, []);

  // Lernmodus-Hook (PROJ-13)
  const learnMode = useLearnMode();

  // Annotations-Hook (PROJ-10)
  const probeTarget = probes.length > 0 ? { x: probes[0].x, y: probes[0].y } : null;
  const annotationsHook = useAnnotations(
    waveParamsHook.uniformArrays,
    waveSourcesHook.sourceUniforms,
    currentTime,
    probeTarget,
  );

  // Reflexionsparameter fuer CPU-seitige Berechnungen (PROJ-15)
  const reflectionParams = useMemo<ReflectionParams | undefined>(
    () =>
      reflectionHook.config.isActive
        ? {
            isActive: true,
            wallX: reflectionHook.config.wallX,
            endType: reflectionHook.config.endType,
            displayMode: reflectionHook.config.displayMode,
          }
        : undefined,
    [reflectionHook.config.isActive, reflectionHook.config.wallX, reflectionHook.config.endType, reflectionHook.config.displayMode]
  );

  const crossSectionConfig = useMemo<CrossSectionPlane3DConfig>(
    () => ({
      isActive: csIsActive,
      orientation: csOrientation,
      position: csPosition,
    }),
    [csIsActive, csOrientation, csPosition]
  );

  const { containerRef, resetCamera, resetTime, stepFrame, webglSupported, timeRef } =
    useWaveAnimation({
      isPlaying,
      onFpsUpdate: handleFpsUpdate,
      onTimeUpdate: handleTimeUpdate,
      speedMultiplier,
      waveUniformArrays: waveParamsHook.uniformArrays,
      sourceUniforms: waveSourcesHook.sourceUniforms,
      crossSectionConfig,
      viewMode: is2DView ? "2d" : "3d",
      onWaveClick: handleWaveClick,
      probes,
      annotationsConfig: annotationsHook.config,
      lambdaArrowData: annotationsHook.lambdaArrowData,
      nodeLinePoints: annotationsHook.nodeLinePoints,
      wavefrontCircles: annotationsHook.wavefrontCircles,
      pathDifferenceData: annotationsHook.pathDifferenceData,
      reflectionConfig: reflectionHook.config,
      mirrorSources: reflectionHook.mirrorSources,
    });

  // Sonden-Zeitverlaufsdaten
  const { chartData: probeChartData } = useProbeData({
    probes,
    timeRef,
    waveUniformArrays: waveParamsHook.uniformArrays,
    sourceUniforms: waveSourcesHook.sourceUniforms,
    isPlaying,
    reflection: reflectionParams,
  });

  // Preset-Laden soll auch die Zeit zuruecksetzen (Spezifikation: "nur Parameter und Zeit werden zurueckgesetzt")
  const handleLoadPreset = useCallback((id: string) => {
    learnMode.setPresetLoading(true);
    presetsHook.loadPreset(id);
    resetTime();
    setCurrentTime(0);
    // Sonden bleiben, aber Puffer wird geleert (probeIds aendern sich nicht -> manuell triggern)
    setProbes((prev) => prev.map((p) => ({ ...p, id: `probe-${probeCounterRef.current++}` })));
    // Preset-Loading-Flag nach kurzer Verzoegerung zuruecksetzen
    setTimeout(() => learnMode.setPresetLoading(false), 100);
  }, [presetsHook, resetTime, learnMode]);

  const handleResetToPreset = useCallback(() => {
    learnMode.setPresetLoading(true);
    presetsHook.resetToPreset();
    resetTime();
    setCurrentTime(0);
    setProbes((prev) => prev.map((p) => ({ ...p, id: `probe-${probeCounterRef.current++}` })));
    setTimeout(() => learnMode.setPresetLoading(false), 100);
  }, [presetsHook, resetTime, learnMode]);

  const { chartData } = useCrossSection({
    timeRef,
    waveUniformArrays: waveParamsHook.uniformArrays,
    sourceUniforms: waveSourcesHook.sourceUniforms,
    isPlaying,
    isActive: csIsActive,
    orientation: csOrientation,
    position: csPosition,
    reflection: reflectionParams,
  });

  // Intensitaetsschirm-Daten (PROJ-9)
  const { chartData: intensityChartData } = useIntensityScreen({
    timeRef,
    waveUniformArrays: waveParamsHook.uniformArrays,
    sourceUniforms: waveSourcesHook.sourceUniforms,
    isPlaying,
    isActive: isScreenActive,
    screenX,
    intensityMode,
    reflection: reflectionParams,
  });

  const toggleScreen = useCallback(() => {
    setIsScreenActive((prev) => !prev);
  }, []);

  const handleSetScreenX = useCallback((x: number) => {
    setScreenX(Math.max(-FIELD_HALF_SIZE + 0.5, Math.min(FIELD_HALF_SIZE - 0.5, x)));
  }, []);

  // Formel-Symbol-Klick: Panel oeffnen + Parameter hervorheben (PROJ-13)
  const handleFormulaSymbolClick = useCallback((paramKey: keyof import("@/lib/wave-params").WaveParams) => {
    // Panel oeffnen falls geschlossen
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
    learnMode.highlightParam(paramKey);
  }, [isPanelOpen, learnMode]);

  const toggleCrossSection = useCallback(() => {
    setCsIsActive((prev) => !prev);
  }, []);

  const toggleViewMode = useCallback(() => {
    setIs2DView((prev) => !prev);
  }, []);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => !prev);
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
      <header className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight">
          WavePhysics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block font-mono">
          z = A·sin(k·r - ω·t + φ)
        </p>
      </header>
      {/* Hauptbereich: Einzelmodus oder Vergleichsmodus */}
      {isCompareMode ? (
        <ComparePanelLayout
          sharedTimeRef={timeRef}
          isPlaying={isPlaying}
          speedMultiplier={speedMultiplier}
          is2DView={is2DView}
          onFpsUpdate={handleFpsUpdate}
          onTimeUpdate={handleTimeUpdate}
          initialParamsHook={waveParamsHook}
          initialSourcesHook={waveSourcesHook}
        />
      ) : (
        <div className="flex flex-1 min-h-0 relative">
          <SourcePanel
            sourceHook={wrappedSourcesHook}
            isOpen={isSourcePanelOpen}
            onOpenChange={(open) => {
              setIsSourcePanelOpen(open);
              if (open && isMobile) setIsPanelOpen(false);
            }}
            isLearnMode={learnMode.isLearnMode}
            reflectionHook={reflectionHook}
          />
          {/* Mittlerer Bereich: 3D-Canvas + optionales Schnittdiagramm */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className={(csIsActive || probes.length > 0 || isScreenActive) ? "flex-[2] min-h-0 relative" : "flex-1 min-h-0 relative"}>
              <div
                ref={containerRef}
                className="absolute inset-0"
              />
              <TopDownOverlay visible={is2DView} />
            </div>
            {probes.length > 0 && (
              <div className="flex-[1] min-h-[140px] sm:min-h-[180px]">
                <ProbePanel
                  probes={probes}
                  chartData={probeChartData}
                  onRemoveProbe={handleRemoveProbe}
                  onRemoveAll={handleRemoveAllProbes}
                />
              </div>
            )}
            {isScreenActive && (
              <div className="flex-[1] min-h-[140px] sm:min-h-[180px]">
                <IntensityScreenPanel
                  screenX={screenX}
                  onScreenXChange={handleSetScreenX}
                  screenXMin={-FIELD_HALF_SIZE + 0.5}
                  screenXMax={FIELD_HALF_SIZE - 0.5}
                  intensityMode={intensityMode}
                  onIntensityModeChange={setIntensityMode}
                  chartData={intensityChartData}
                  sourceCount={waveSourcesHook.config.count}
                />
              </div>
            )}
            {csIsActive && (
              <div className="flex-[1] min-h-[140px] sm:min-h-[180px]">
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
            waveParamsHook={wrappedParamsHook}
            sourceCount={waveSourcesHook.config.count}
            isOpen={isPanelOpen}
            onOpenChange={(open) => {
              setIsPanelOpen(open);
              if (open && isMobile) setIsSourcePanelOpen(false);
            }}
            highlightedParam={learnMode.highlightedParam}
            onFormulaSymbolClick={handleFormulaSymbolClick}
            onLearnSliderChange={learnMode.showSliderToast}
          />
        </div>
      )}
      <ControlBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onRestartWave={() => {
          resetTime();
          setCurrentTime(0);
          setIsPlaying(false);
        }}
        onResetCamera={resetCamera}
        fps={fps}
        isCrossSectionActive={csIsActive}
        onToggleCrossSection={toggleCrossSection}
        activePresetId={presetsHook.activePresetId}
        isPresetDirty={presetsHook.isDirty}
        onLoadPreset={handleLoadPreset}
        onResetToPreset={handleResetToPreset}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        currentTime={currentTime}
        onStepFrame={stepFrame}
        is2DView={is2DView}
        onToggleViewMode={toggleViewMode}
        isScreenActive={isScreenActive}
        onToggleScreen={toggleScreen}
        annotationsConfig={annotationsHook.config}
        onToggleLambdaArrow={annotationsHook.toggleLambdaArrow}
        onToggleNodeLines={annotationsHook.toggleNodeLines}
        onToggleWavefronts={annotationsHook.toggleWavefronts}
        onTogglePathDifference={annotationsHook.togglePathDifference}
        annotationHint={annotationsHook.hint}
        annotationSourceCount={waveSourcesHook.config.count}
        annotationHasProbeTarget={probes.length > 0}
        annotationLambda={annotationsHook.lambdaArrowData?.lambda}
        annotationDeltaS={annotationsHook.pathDifferenceData?.deltaS}
        annotationDeltaSLambda={annotationsHook.pathDifferenceData?.deltaSLambda}
        isLearnMode={learnMode.isLearnMode}
        onToggleLearnMode={learnMode.toggleLearnMode}
        isCompareMode={isCompareMode}
        onToggleCompareMode={toggleCompareMode}
      />
    </div>
  );
}
