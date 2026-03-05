"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Pause, RotateCcw, SkipBack, Scissors, Layers, Monitor, GraduationCap, Columns2 } from "lucide-react";
import { PresetSelector } from "./PresetSelector";
import { SpeedControl } from "./SpeedControl";
import { AnnotationPanel } from "./AnnotationPanel";
import type { AnnotationsConfig } from "@/hooks/useAnnotations";

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestartWave: () => void;
  onResetCamera: () => void;
  fps?: number;
  isCrossSectionActive?: boolean;
  onToggleCrossSection?: () => void;
  activePresetId?: string | null;
  isPresetDirty?: boolean;
  onLoadPreset?: (id: string) => void;
  onResetToPreset?: () => void;
  speedMultiplier?: number;
  onSpeedChange?: (speed: number) => void;
  currentTime?: number;
  onStepFrame?: (direction: 1 | -1) => void;
  is2DView?: boolean;
  onToggleViewMode?: () => void;
  isScreenActive?: boolean;
  onToggleScreen?: () => void;
  // Annotations (PROJ-10)
  annotationsConfig?: AnnotationsConfig;
  onToggleLambdaArrow?: () => void;
  onToggleNodeLines?: () => void;
  onToggleWavefronts?: () => void;
  onTogglePathDifference?: () => void;
  annotationHint?: string | null;
  annotationSourceCount?: number;
  annotationHasProbeTarget?: boolean;
  annotationLambda?: number;
  annotationDeltaS?: number;
  annotationDeltaSLambda?: number;
  // Lernmodus (PROJ-13)
  isLearnMode?: boolean;
  onToggleLearnMode?: () => void;
  // Vergleichsmodus (PROJ-14)
  isCompareMode?: boolean;
  onToggleCompareMode?: () => void;
}

export function ControlBar({
  isPlaying,
  onTogglePlay,
  onRestartWave,
  onResetCamera,
  fps,
  isCrossSectionActive,
  onToggleCrossSection,
  activePresetId,
  isPresetDirty,
  onLoadPreset,
  onResetToPreset,
  speedMultiplier,
  onSpeedChange,
  currentTime,
  onStepFrame,
  is2DView,
  onToggleViewMode,
  isScreenActive,
  onToggleScreen,
  annotationsConfig,
  onToggleLambdaArrow,
  onToggleNodeLines,
  onToggleWavefronts,
  onTogglePathDifference,
  annotationHint,
  annotationSourceCount,
  annotationHasProbeTarget,
  annotationLambda,
  annotationDeltaS,
  annotationDeltaSLambda,
  isLearnMode,
  onToggleLearnMode,
  isCompareMode,
  onToggleCompareMode,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-t bg-background/80 backdrop-blur-sm overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePlay}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Abspielen</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRestartWave}
          className="gap-2"
        >
          <SkipBack className="h-4 w-4" />
          <span className="hidden sm:inline">Neu starten</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetCamera}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Kamera zurücksetzen</span>
        </Button>

        {/* Trennlinie */}
        <div className="h-5 w-px bg-border" />

        {onLoadPreset && onResetToPreset && (
          <>
            <PresetSelector
              activePresetId={activePresetId ?? null}
              isDirty={isPresetDirty ?? false}
              onLoadPreset={onLoadPreset}
              onResetToPreset={onResetToPreset}
            />
          </>
        )}

        {onToggleCrossSection && (
          <>
          <div className="h-5 w-px bg-border" />
          <Button
            variant={isCrossSectionActive ? "default" : "outline"}
            size="sm"
            onClick={onToggleCrossSection}
            className="gap-2"
            aria-label="Schnittebene ein-/ausschalten"
            aria-pressed={isCrossSectionActive}
          >
            <Scissors className="h-4 w-4" />
            <span className="hidden sm:inline">Schnittebene</span>
          </Button>
          </>
        )}

        {/* 2D/3D-Ansichtsumschalter */}
        {onToggleViewMode && (
          <>
            <div className="h-5 w-px bg-border" />
            <Button
              variant={is2DView ? "default" : "outline"}
              size="sm"
              onClick={onToggleViewMode}
              className="gap-2"
              aria-label="Zwischen 3D- und 2D-Ansicht wechseln"
              aria-pressed={is2DView}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">{is2DView ? "2D" : "3D"}</span>
            </Button>
          </>
        )}

        {/* Intensitaetsschirm-Toggle */}
        {onToggleScreen && (
          <>
            <div className="h-5 w-px bg-border" />
            <Button
              variant={isScreenActive ? "default" : "outline"}
              size="sm"
              onClick={onToggleScreen}
              className="gap-2"
              aria-label="Intensitaetsschirm ein-/ausschalten"
              aria-pressed={isScreenActive}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Schirm</span>
            </Button>
          </>
        )}

        {/* Annotations-Panel (PROJ-10) */}
        {annotationsConfig && onToggleLambdaArrow && onToggleNodeLines && onToggleWavefronts && onTogglePathDifference && (
          <>
            <div className="h-5 w-px bg-border" />
            <div className="relative">
              <AnnotationPanel
                config={annotationsConfig}
                onToggleLambdaArrow={onToggleLambdaArrow}
                onToggleNodeLines={onToggleNodeLines}
                onToggleWavefronts={onToggleWavefronts}
                onTogglePathDifference={onTogglePathDifference}
                hint={annotationHint ?? null}
                sourceCount={annotationSourceCount ?? 1}
                hasProbeTarget={annotationHasProbeTarget ?? false}
                lambda={annotationLambda}
                deltaS={annotationDeltaS}
                deltaSLambda={annotationDeltaSLambda}
              />
            </div>
          </>
        )}

        {/* Lernmodus-Toggle (PROJ-13) */}
        {onToggleLearnMode && (
          <>
            <div className="h-5 w-px bg-border" />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isLearnMode ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleLearnMode}
                    className="gap-2"
                    aria-label="Lernmodus ein-/ausschalten"
                    aria-pressed={isLearnMode}
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Lernmodus</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isLearnMode
                      ? "Lernmodus aktiv: Erklaerungen werden bei Slider-Aenderungen angezeigt"
                      : "Lernmodus aktivieren fuer physikalische Erklaerungen"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {/* Vergleichsmodus-Toggle (PROJ-14) */}
        {onToggleCompareMode && (
          <>
            <div className="h-5 w-px bg-border" />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isCompareMode ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleCompareMode}
                    className="gap-2"
                    aria-label="Vergleichsmodus ein-/ausschalten"
                    aria-pressed={isCompareMode}
                  >
                    <Columns2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Vergleich</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isCompareMode
                      ? "Vergleichsmodus aktiv: Zwei Wellenfelder nebeneinander"
                      : "Vergleichsmodus: Zwei Wellenfelder mit unterschiedlichen Parametern vergleichen"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {/* Geschwindigkeitsregler */}
        {onSpeedChange && onStepFrame && speedMultiplier !== undefined && (
          <>
            <div className="h-5 w-px bg-border" />
            <SpeedControl
              speedMultiplier={speedMultiplier}
              onSpeedChange={onSpeedChange}
              isPlaying={isPlaying}
              onStepFrame={onStepFrame}
            />
          </>
        )}
      </div>

      {/* Rechte Seite: Zeitanzeige + FPS */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {currentTime !== undefined && (
          <span
            className="text-xs text-muted-foreground font-mono tabular-nums"
            aria-live="polite"
            aria-label={`Simulierte Zeit: ${currentTime.toFixed(2)} Sekunden`}
          >
            t = {currentTime.toFixed(2)} s
          </span>
        )}
        {fps !== undefined && (
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {fps} FPS
          </span>
        )}
      </div>
    </div>
  );
}
