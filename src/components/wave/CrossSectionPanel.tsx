"use client";

import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CrossSectionChart } from "./CrossSectionChart";
import type { CrossSectionPoint } from "@/lib/wave-math";
import type { SourceUniforms } from "@/lib/wave-sources";

interface CrossSectionPanelProps {
  isActive: boolean;
  orientation: "x" | "y";
  onOrientationChange: (o: "x" | "y") => void;
  position: number;
  onPositionChange: (p: number) => void;
  positionMin: number;
  positionMax: number;
  chartData: CrossSectionPoint[];
  sourceUniforms: SourceUniforms | undefined;
}

/**
 * Panel fuer die Schnittebenen-Analyse.
 * Enthaelt die Steuerleiste (X/Y-Toggle + Positions-Slider)
 * und das 2D-Liniendiagramm.
 */
export function CrossSectionPanel({
  orientation,
  onOrientationChange,
  position,
  onPositionChange,
  positionMin,
  positionMax,
  chartData,
  sourceUniforms,
}: CrossSectionPanelProps) {
  // Quellpositionen entlang der Schnittachse berechnen
  // Bei X-Schnitt (senkrecht zu X, variiert y): relevante Achse ist y
  // Bei Y-Schnitt (senkrecht zu Y, variiert x): relevante Achse ist x
  const sourcePositionsAlongAxis = useMemo(() => {
    if (!sourceUniforms) return [];
    return sourceUniforms.sourcePositions
      .slice(0, sourceUniforms.sourceCount)
      .map((pos) => (orientation === "x" ? pos.y : pos.x));
  }, [sourceUniforms, orientation]);

  return (
    <div
      className="flex flex-col h-full border-t bg-background"
      role="region"
      aria-label="Schnittebenen-Analyse"
    >
      {/* Steuerleiste */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-muted/30">
        {/* X/Y-Orientierung Toggle */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Richtung:
          </Label>
          <Tabs
            value={orientation}
            onValueChange={(v) => onOrientationChange(v as "x" | "y")}
          >
            <TabsList className="h-7">
              <TabsTrigger value="x" className="px-3 text-xs h-6">
                X-Schnitt
              </TabsTrigger>
              <TabsTrigger value="y" className="px-3 text-xs h-6">
                Y-Schnitt
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Trennlinie */}
        <div className="h-5 w-px bg-border" />

        {/* Positions-Slider */}
        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-sm">
          <Label
            htmlFor="cross-section-position"
            className="text-xs font-medium text-muted-foreground whitespace-nowrap"
          >
            Position:
          </Label>
          <Slider
            id="cross-section-position"
            value={[position]}
            onValueChange={([v]) => onPositionChange(v)}
            min={positionMin}
            max={positionMax}
            step={0.1}
            className="flex-1"
            aria-label={`Schnittposition: ${position.toFixed(1)} m`}
          />
          <span className="text-xs font-mono tabular-nums text-muted-foreground w-12 text-right">
            {position.toFixed(1)} m
          </span>
        </div>
      </div>

      {/* Diagramm-Bereich */}
      <div className="flex-1 min-h-0 px-2 py-1">
        <CrossSectionChart
          data={chartData}
          orientation={orientation}
          sourcePositionsAlongAxis={sourcePositionsAlongAxis}
        />
      </div>
    </div>
  );
}
