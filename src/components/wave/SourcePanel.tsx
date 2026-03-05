"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronsLeft, ChevronsRight, RotateCcw, AlertTriangle, Info } from "lucide-react";
import { ReflectionPanel } from "./ReflectionPanel";
import { SOURCE_TYPE_EXPLANATIONS } from "@/lib/physics-explanations";
import type { UseReflectionReturn } from "@/hooks/useReflection";
import {
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS,
  SOURCE_COUNT_MIN,
  SOURCE_COUNT_MAX,
  SOURCE_SPACING_MIN,
  SOURCE_SPACING_MAX,
  type SourceType,
} from "@/lib/wave-sources";
import type { UseWaveSourcesReturn } from "@/hooks/useWaveSources";

const SOURCE_DESCRIPTIONS: Record<SourceType, string> = {
  POINT: "Einzelne Punktquelle (Stein ins Wasser)",
  CIRCLE: "Ringfoermige Quelle (kreisfoermige Membran)",
  BAR: "Linienquelle fuer ebene Wellenfronten",
  TRIANGLE: "Dreieckige Quellform (abstraktes Experiment)",
};

interface SourcePanelProps {
  sourceHook: UseWaveSourcesReturn;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lernmodus aktiv? Zeigt zusaetzliche Info-Icons (PROJ-13) */
  isLearnMode?: boolean;
  /** Reflexions-Hook (PROJ-15) */
  reflectionHook?: UseReflectionReturn;
}

export function SourcePanel({
  sourceHook,
  isOpen,
  onOpenChange,
  isLearnMode,
  reflectionHook,
}: SourcePanelProps) {
  const {
    config,
    setSourceType,
    setSourceCount,
    setSourceSpacing,
    resetSources,
    isClipped,
  } = sourceHook;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      {/* Toggle-Button: immer sichtbar, links */}
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-r-md rounded-l-none border border-l-0 bg-background/90 backdrop-blur-sm hover:bg-accent"
          aria-label={isOpen ? "Quellen-Panel schliessen" : "Quellen-Panel oeffnen"}
        >
          {isOpen ? (
            <ChevronsLeft className="h-4 w-4" />
          ) : (
            <ChevronsRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
        <aside
          className="w-72 xl:w-80 h-full border-r bg-background overflow-y-auto"
          aria-label="Wellenquellen"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
            <h2 className="text-sm font-semibold">Wellenquellen</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSources}
              className="gap-1.5 h-7 text-xs"
              aria-label="Quellenparameter auf Standardwerte zuruecksetzen"
            >
              <RotateCcw className="h-3 w-3" />
              Zuruecksetzen
            </Button>
          </div>

          <div className="px-4 py-3 space-y-5">
            {/* Quellenform */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quellenform
              </Label>
              <TooltipProvider>
                <Select
                  value={config.type}
                  onValueChange={(val) => setSourceType(val as SourceType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((type) => (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <SelectItem value={type}>
                            {SOURCE_TYPE_LABELS[type]}
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {SOURCE_DESCRIPTIONS[type]}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">
                {SOURCE_DESCRIPTIONS[config.type]}
              </p>

              {/* Im Lernmodus: zusaetzliche Physik-Erklaerung */}
              {isLearnMode && (
                <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50/50 px-2.5 py-1.5 mt-1">
                  <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    {SOURCE_TYPE_EXPLANATIONS[config.type]?.tooltip}
                  </p>
                </div>
              )}
            </div>

            {/* Quellenanzahl */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Anzahl der Quellen
                </Label>
                <Badge variant="secondary" className="font-mono text-xs">
                  {config.count}
                </Badge>
              </div>
              <Slider
                value={[config.count]}
                onValueChange={([val]) => setSourceCount(val)}
                min={SOURCE_COUNT_MIN}
                max={SOURCE_COUNT_MAX}
                step={1}
                aria-label="Anzahl der Quellen"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{SOURCE_COUNT_MIN}</span>
                <span>{SOURCE_COUNT_MAX}</span>
              </div>
            </div>

            {/* Quellenabstand (nur bei >= 2 Quellen) */}
            {config.count >= 2 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Abstand zwischen Quellen
                  </Label>
                  <span className="text-sm font-mono tabular-nums font-medium">
                    {config.spacing.toFixed(1)}{" "}
                    <span className="text-xs text-muted-foreground font-normal">m</span>
                  </span>
                </div>
                <Slider
                  value={[config.spacing]}
                  onValueChange={([val]) => setSourceSpacing(val)}
                  min={SOURCE_SPACING_MIN}
                  max={SOURCE_SPACING_MAX}
                  step={0.1}
                  aria-label="Abstand zwischen Quellen in Metern"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{SOURCE_SPACING_MIN} m</span>
                  <span>{SOURCE_SPACING_MAX} m</span>
                </div>
              </div>
            )}

            {/* Clipping-Warnung */}
            {isClipped && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-800">
                  Einige Quellen liegen ausserhalb des Simulationsfeldes und werden an den Rand geclippt.
                </p>
              </div>
            )}

            {/* Reflexion (PROJ-15) */}
            {reflectionHook && (
              <div className="pt-3 border-t">
                <ReflectionPanel reflectionHook={reflectionHook} />
              </div>
            )}
          </div>
        </aside>
      </CollapsibleContent>
    </Collapsible>
  );
}
