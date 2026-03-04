"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SkipBack, SkipForward } from "lucide-react";

/** Diskrete Geschwindigkeitsstufen (paedagogisch sinnvoll) */
const SPEED_STEPS = [0.1, 0.25, 0.5, 1.0, 2.0, 5.0] as const;

/** Index der Standardgeschwindigkeit (1x) */
const DEFAULT_SPEED_INDEX = 3;

interface SpeedControlProps {
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  isPlaying: boolean;
  onStepFrame: (direction: 1 | -1) => void;
}

export function SpeedControl({
  speedMultiplier,
  onSpeedChange,
  isPlaying,
  onStepFrame,
}: SpeedControlProps) {
  // Aktuellen Speed-Index aus dem Wert ableiten
  const currentIndex = SPEED_STEPS.indexOf(
    speedMultiplier as (typeof SPEED_STEPS)[number]
  );
  const sliderValue = currentIndex >= 0 ? currentIndex : DEFAULT_SPEED_INDEX;

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const index = value[0];
      if (index >= 0 && index < SPEED_STEPS.length) {
        onSpeedChange(SPEED_STEPS[index]);
      }
    },
    [onSpeedChange]
  );

  const handleDoubleClick = useCallback(() => {
    onSpeedChange(SPEED_STEPS[DEFAULT_SPEED_INDEX]);
  }, [onSpeedChange]);

  const showAliasingWarning = speedMultiplier >= 5.0;

  return (
    <div className="flex items-center gap-1.5">
      {/* Einzelbild zurueck */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onStepFrame(-1)}
              disabled={isPlaying}
              aria-label="Einzelbild zurueck"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying
              ? "Pause druecken fuer Einzelbild-Steuerung"
              : "Einzelbild zurueck (1/60 s)"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Geschwindigkeits-Slider */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="w-24 flex items-center"
              onDoubleClick={handleDoubleClick}
              role="group"
              aria-label="Geschwindigkeitsregler"
            >
              <Slider
                min={0}
                max={SPEED_STEPS.length - 1}
                step={1}
                value={[sliderValue]}
                onValueChange={handleSliderChange}
                aria-label="Animationsgeschwindigkeit"
                className="w-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {showAliasingWarning
              ? "Bei hoher Geschwindigkeit + hoher Frequenz kann die Visualisierung unscharf wirken."
              : "Geschwindigkeit (Doppelklick fuer 1x)"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Geschwindigkeitsanzeige */}
      <span
        className="text-xs font-mono tabular-nums text-muted-foreground min-w-[3ch] text-center select-none"
        aria-live="polite"
        aria-label={`Geschwindigkeit: ${speedMultiplier}x`}
      >
        {speedMultiplier}x
      </span>

      {/* Einzelbild vor */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onStepFrame(1)}
              disabled={isPlaying}
              aria-label="Einzelbild vor"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying
              ? "Pause druecken fuer Einzelbild-Steuerung"
              : "Einzelbild vor (1/60 s)"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
