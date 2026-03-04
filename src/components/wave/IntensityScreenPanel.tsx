"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { IntensityChart } from "./IntensityChart";
import type { IntensityPoint } from "@/lib/wave-math";
import type { IntensityMode } from "@/hooks/useIntensityScreen";

interface IntensityScreenPanelProps {
  /** X-Position des Schirms in Metern */
  screenX: number;
  /** Callback zum Aendern der Schirmposition */
  onScreenXChange: (x: number) => void;
  /** Minimale Schirmposition */
  screenXMin: number;
  /** Maximale Schirmposition */
  screenXMax: number;
  /** Intensitaetsmodus */
  intensityMode: IntensityMode;
  /** Callback zum Aendern des Modus */
  onIntensityModeChange: (mode: IntensityMode) => void;
  /** Intensitaetsdaten */
  chartData: IntensityPoint[];
  /** Anzahl der aktiven Wellenquellen */
  sourceCount: number;
}

/**
 * Panel fuer den Intensitaetsschirm (PROJ-9).
 * Enthaelt: Position-Slider, Modus-Toggle (instantan/zeitgemittelt),
 * Intensitaetsdiagramm und optionalen Hinweis bei Einzelquelle.
 */
export function IntensityScreenPanel({
  screenX,
  onScreenXChange,
  screenXMin,
  screenXMax,
  intensityMode,
  onIntensityModeChange,
  chartData,
  sourceCount,
}: IntensityScreenPanelProps) {
  return (
    <div
      className="flex flex-col h-full border-t bg-background"
      role="region"
      aria-label="Intensitaetsschirm"
    >
      {/* Steuerleiste */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-muted/30 flex-wrap">
        {/* Modus-Toggle */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Modus:
          </Label>
          <Tabs
            value={intensityMode}
            onValueChange={(v) => onIntensityModeChange(v as IntensityMode)}
          >
            <TabsList className="h-7">
              <TabsTrigger value="instantaneous" className="px-2 text-xs h-6">
                Instantan
              </TabsTrigger>
              <TabsTrigger value="timeAveraged" className="px-2 text-xs h-6">
                Zeitgemittelt
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Trennlinie */}
        <div className="h-5 w-px bg-border" />

        {/* Positions-Slider */}
        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-sm">
          <Label
            htmlFor="screen-position"
            className="text-xs font-medium text-muted-foreground whitespace-nowrap"
          >
            Schirm x:
          </Label>
          <Slider
            id="screen-position"
            value={[screenX]}
            onValueChange={([v]) => onScreenXChange(v)}
            min={screenXMin}
            max={screenXMax}
            step={0.1}
            className="flex-1"
            aria-label={`Schirmposition: ${screenX.toFixed(1)} m`}
          />
          <span className="text-xs font-mono tabular-nums text-muted-foreground w-14 text-right">
            {screenX.toFixed(1)} m
          </span>
        </div>

        {/* Hinweis bei Einzelquelle */}
        {sourceCount < 2 && (
          <>
            <div className="h-5 w-px bg-border" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Fuer Interferenzmuster: Mindestens 2 Quellen setzen
            </span>
          </>
        )}
      </div>

      {/* Diagramm-Bereich */}
      <div className="flex-1 min-h-0 px-2 py-1">
        <IntensityChart data={chartData} />
      </div>
    </div>
  );
}
