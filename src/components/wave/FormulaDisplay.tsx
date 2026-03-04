"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FORMULA_SYMBOLS } from "@/lib/physics-explanations";
import type { WaveParams, DerivedWaveValues } from "@/lib/wave-params";

interface FormulaDisplayProps {
  params: WaveParams;
  derived: DerivedWaveValues;
  /** Callback wenn ein Formel-Symbol geklickt wird (hebt zugehoerigen Slider hervor) */
  onSymbolClick?: (paramKey: keyof WaveParams) => void;
}

/**
 * Zeigt die aktuelle Wellengleichung mit eingesetzten Zahlenwerten an.
 *
 * Format: z = A * exp(-d*r) * sin(k*r - omega*t + phi)
 * Bei Daempfung = 0 wird der exp-Term weggelassen.
 */
export function FormulaDisplay({ params, derived, onSymbolClick }: FormulaDisplayProps) {
  const A = params.amplitude.toFixed(2);
  const k = derived.waveNumber.toFixed(2);
  const omega = derived.angularFrequency.toFixed(2);
  const phi = params.phase.toFixed(2);
  const d = params.damping.toFixed(2);

  const hasDamping = params.damping > 0;

  // Phasen-Vorzeichen korrekt darstellen
  let phaseStr: string;
  if (params.phase === 0) {
    phaseStr = "";
  } else if (params.phase > 0) {
    phaseStr = ` + ${phi}`;
  } else {
    phaseStr = ` - ${Math.abs(params.phase).toFixed(2)}`;
  }

  const handleSymbolClick = (symbolKey: string) => {
    const info = FORMULA_SYMBOLS[symbolKey];
    if (info?.paramKey && onSymbolClick) {
      onSymbolClick(info.paramKey);
    }
  };

  const ClickableSymbol = ({
    symbolKey,
    displayValue,
    colorClass,
  }: {
    symbolKey: string;
    displayValue: string;
    colorClass: string;
  }) => {
    const info = FORMULA_SYMBOLS[symbolKey];
    if (!info) {
      return <span className={`${colorClass} font-semibold`}>{displayValue}</span>;
    }

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleSymbolClick(symbolKey)}
              className={`${colorClass} font-semibold cursor-pointer hover:underline decoration-dotted underline-offset-2 rounded px-0.5 hover:bg-muted transition-colors`}
              aria-label={`${info.label}: ${displayValue}`}
            >
              {displayValue}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="text-xs">{info.tooltip}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aktueller Wert: {displayValue}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div
      className="rounded-md border bg-muted/50 px-3 py-2"
      role="math"
      aria-label="Aktuelle Wellengleichung"
    >
      <p className="text-xs text-muted-foreground mb-1">
        Aktuelle Gleichung{onSymbolClick ? " (Symbole klickbar)" : ""}:
      </p>
      <p className="text-sm font-mono tabular-nums leading-relaxed break-all flex flex-wrap items-center gap-0">
        <span className="text-foreground">z =&nbsp;</span>
        <ClickableSymbol symbolKey="A" displayValue={A} colorClass="text-red-600" />
        {hasDamping && (
          <>
            <span className="text-foreground">&nbsp;· exp(</span>
            <ClickableSymbol symbolKey="d" displayValue={`-${d}`} colorClass="text-orange-600" />
            <span className="text-foreground">·r)</span>
          </>
        )}
        <span className="text-foreground">&nbsp;· sin(</span>
        <ClickableSymbol symbolKey="k" displayValue={k} colorClass="text-blue-600" />
        <span className="text-foreground">·r -&nbsp;</span>
        <ClickableSymbol symbolKey="\u03C9" displayValue={omega} colorClass="text-purple-600" />
        <span className="text-foreground">·t</span>
        {phaseStr && (
          <ClickableSymbol symbolKey="\u03C6" displayValue={phaseStr} colorClass="text-green-600" />
        )}
        <span className="text-foreground">)</span>
      </p>
    </div>
  );
}
