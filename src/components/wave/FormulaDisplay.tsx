"use client";

import type { WaveParams, DerivedWaveValues } from "@/lib/wave-params";

interface FormulaDisplayProps {
  params: WaveParams;
  derived: DerivedWaveValues;
}

/**
 * Zeigt die aktuelle Wellengleichung mit eingesetzten Zahlenwerten an.
 *
 * Format: z = A * exp(-d*r) * sin(k*r - omega*t + phi)
 * Bei Daempfung = 0 wird der exp-Term weggelassen.
 */
export function FormulaDisplay({ params, derived }: FormulaDisplayProps) {
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

  return (
    <div
      className="rounded-md border bg-muted/50 px-3 py-2"
      role="math"
      aria-label="Aktuelle Wellengleichung"
    >
      <p className="text-xs text-muted-foreground mb-1">Aktuelle Gleichung:</p>
      <p className="text-sm font-mono tabular-nums leading-relaxed break-all">
        <span className="text-foreground">z = </span>
        <span className="text-red-600 font-semibold">{A}</span>
        {hasDamping && (
          <>
            <span className="text-foreground"> · exp(</span>
            <span className="text-orange-600 font-semibold">-{d}</span>
            <span className="text-foreground">·r)</span>
          </>
        )}
        <span className="text-foreground"> · sin(</span>
        <span className="text-blue-600 font-semibold">{k}</span>
        <span className="text-foreground">·r - </span>
        <span className="text-purple-600 font-semibold">{omega}</span>
        <span className="text-foreground">·t</span>
        {phaseStr && (
          <span className="text-green-600 font-semibold">{phaseStr}</span>
        )}
        <span className="text-foreground">)</span>
      </p>
    </div>
  );
}
