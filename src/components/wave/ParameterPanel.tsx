"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsRight, ChevronsLeft, RotateCcw } from "lucide-react";
import { PARAMETER_CONFIGS } from "@/lib/wave-params";
import type { UseWaveParamsReturn } from "@/hooks/useWaveParams";
import { ParameterControl } from "./ParameterControl";
import { FormulaDisplay } from "./FormulaDisplay";

import type { WaveParams } from "@/lib/wave-params";

interface ParameterPanelProps {
  waveParamsHook: UseWaveParamsReturn;
  sourceCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Welcher Parameter gerade hervorgehoben ist (Pulse-Animation, PROJ-13) */
  highlightedParam?: keyof WaveParams | null;
  /** Callback wenn ein Formel-Symbol geklickt wird (PROJ-13) */
  onFormulaSymbolClick?: (paramKey: keyof WaveParams) => void;
  /** Callback fuer Lernmodus-Toast bei Slider-Aenderung (PROJ-13) */
  onLearnSliderChange?: (key: keyof WaveParams) => void;
}

/**
 * Kollabierbare Seitenleiste mit allen Wellenparametern.
 *
 * Enthaelt:
 * - Einstellbare Parameter (Amplitude, Frequenz, Wellenlaenge, Phase, Daempfung)
 * - Abgeleitete Groessen (omega, k, v) als read-only
 * - Formelanzeige mit eingesetzten Werten
 * - Reset-Button
 */
export function ParameterPanel({
  waveParamsHook,
  sourceCount,
  isOpen,
  onOpenChange,
  highlightedParam,
  onFormulaSymbolClick,
  onLearnSliderChange,
}: ParameterPanelProps) {
  const {
    params,
    sliderStates,
    derived,
    activeSourceIndex,
    setActiveSourceIndex,
    setSliderPercent,
    setBaseValue,
    resetAll,
    validationErrors,
  } = waveParamsHook;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      {/* Toggle-Button: immer sichtbar */}
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-l-md rounded-r-none border border-r-0 bg-background/90 backdrop-blur-sm hover:bg-accent"
          aria-label={isOpen ? "Parameter-Panel schliessen" : "Parameter-Panel oeffnen"}
        >
          {isOpen ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="absolute md:relative right-0 top-0 z-20 h-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
        <aside
          className="w-64 sm:w-72 xl:w-80 h-full border-l bg-background overflow-y-auto shadow-lg md:shadow-none"
          aria-label="Wellenparameter"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
            <h2 className="text-sm font-semibold">
              {activeSourceIndex === null
                ? "Wellenparameter"
                : `Parameter Quelle ${activeSourceIndex + 1}`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="gap-1.5 h-7 text-xs"
              aria-label={
                activeSourceIndex === null
                  ? "Alle Parameter auf Standardwerte zuruecksetzen"
                  : `Parameter von Quelle ${activeSourceIndex + 1} zuruecksetzen`
              }
            >
              <RotateCcw className="h-3 w-3" />
              Zuruecksetzen
            </Button>
          </div>

          {/* Quellen-Tabs (nur bei >= 2 Quellen) */}
          {sourceCount >= 2 && (
            <div className="px-4 pt-3">
              <Tabs
                value={activeSourceIndex === null ? "all" : String(activeSourceIndex)}
                onValueChange={(val) => {
                  setActiveSourceIndex(val === "all" ? null : parseInt(val, 10));
                }}
              >
                <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="all" className="text-xs flex-shrink-0">
                    Alle
                  </TabsTrigger>
                  {Array.from({ length: sourceCount }, (_, i) => (
                    <TabsTrigger key={i} value={String(i)} className="text-xs flex-shrink-0">
                      Q{i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="px-4 py-3 space-y-5">
            {/* Einstellbare Parameter */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Einstellbar
              </p>
              {PARAMETER_CONFIGS.map((config) => (
                <ParameterControl
                  key={config.key}
                  config={config}
                  sliderState={sliderStates[config.key]}
                  effectiveValue={params[config.key]}
                  validationError={validationErrors[config.key]}
                  onSliderChange={setSliderPercent}
                  onBaseValueChange={setBaseValue}
                  isHighlighted={highlightedParam === config.key}
                  onLearnSliderChange={onLearnSliderChange}
                />
              ))}
            </div>

            {/* Abgeleitete Groessen */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Abgeleitet (read-only)
              </p>
              <div className="grid gap-2">
                <DerivedField
                  label="Kreisfrequenz"
                  symbol="\u03C9"
                  value={derived.angularFrequency}
                  unit="rad/s"
                  formula="2\u03C0\u00B7f"
                />
                <DerivedField
                  label="Wellenzahl"
                  symbol="k"
                  value={derived.waveNumber}
                  unit="1/m"
                  formula="2\u03C0/\u03BB"
                />
                <DerivedField
                  label="Wellengeschwindigkeit"
                  symbol="v"
                  value={derived.waveSpeed}
                  unit="m/s"
                  formula="f\u00B7\u03BB"
                />
              </div>
            </div>

            {/* Formelanzeige */}
            <FormulaDisplay params={params} derived={derived} onSymbolClick={onFormulaSymbolClick} />
          </div>
        </aside>
      </CollapsibleContent>
    </Collapsible>
  );
}

// --- Hilfskomponente: Read-only abgeleiteter Wert ---

interface DerivedFieldProps {
  label: string;
  symbol: string;
  value: number;
  unit: string;
  formula: string;
}

function DerivedField({ label, symbol, value, unit, formula }: DerivedFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {symbol} = {formula}
        </span>
      </div>
      <span className="text-sm font-mono tabular-nums font-medium">
        {value.toFixed(2)}{" "}
        <span className="text-xs text-muted-foreground font-normal">{unit}</span>
      </span>
    </div>
  );
}
