/**
 * Statische Physik-Erklaerungstexte fuer PROJ-13: In-App Physik-Erklaerungen.
 *
 * Alle Texte sind direkt im Code hinterlegt (kein CMS noetig).
 * Max. 200 Zeichen pro Tooltip-Text.
 */

import type { WaveParams } from "@/lib/wave-params";
import type { SourceType } from "@/lib/wave-sources";

// --- Parameter-Erklaerungen ---

export interface ParameterExplanation {
  /** Physikalische Bedeutung (2-3 Saetze, max ~200 Zeichen) */
  tooltip: string;
  /** Formelzeichen */
  symbol: string;
  /** Einheit */
  unit: string;
  /** Beispieltext fuer Slider-Aenderung im Lernmodus */
  effectText: string;
}

export const PARAMETER_EXPLANATIONS: Record<keyof WaveParams, ParameterExplanation> = {
  amplitude: {
    tooltip:
      "Die Amplitude gibt die maximale Auslenkung einer Welle an. Groessere Amplitude = mehr Energie, hoehere Wellenberge.",
    symbol: "A",
    unit: "Meter (m)",
    effectText: "Groessere Amplitude = mehr Energie, hoehere Wellenberge",
  },
  frequency: {
    tooltip:
      "Die Frequenz gibt an, wie viele Schwingungen pro Sekunde stattfinden. Hoehere Frequenz = kuerzere Periode.",
    symbol: "f",
    unit: "Hertz (Hz)",
    effectText: "Hoehere Frequenz = schnellere Schwingung, kuerzere Periode",
  },
  wavelength: {
    tooltip:
      "Die Wellenlaenge ist der Abstand zwischen zwei Wellenbergen. Zusammen mit f bestimmt sie die Geschwindigkeit: v = f * lambda.",
    symbol: "\u03BB",
    unit: "Meter (m)",
    effectText: "Groessere Wellenlaenge = weiter auseinander liegende Wellenberge",
  },
  phase: {
    tooltip:
      "Die Anfangsphase gibt den Startzustand der Schwingung bei t = 0 an. 180 Grad Versatz = destruktive Interferenz.",
    symbol: "\u03C6",
    unit: "Grad (\u00B0)",
    effectText: "Phasenversatz verschiebt den Startzeitpunkt der Schwingung",
  },
  damping: {
    tooltip:
      "Die Daempfung beschreibt den Amplitudenabfall mit zunehmender Entfernung. Modelliert Energieverlust durch Reibung.",
    symbol: "d",
    unit: "1/m",
    effectText: "Staerkere Daempfung = schnellerer Energieverlust mit Entfernung",
  },
};

// --- Quellentyp-Erklaerungen ---

export interface SourceTypeExplanation {
  /** Kurztext fuer Tooltip / Lernmodus */
  tooltip: string;
  /** Beschreibender Kurzname */
  label: string;
}

export const SOURCE_TYPE_EXPLANATIONS: Record<SourceType, SourceTypeExplanation> = {
  POINT: {
    tooltip: "Punktquelle: Welle breitet sich kreisfoermig vom Zentrum aus (z.B. Stein ins Wasser).",
    label: "Punktquelle",
  },
  CIRCLE: {
    tooltip: "Ringquelle: Welle entsteht entlang eines Kreises (z.B. kreisfoermige Membran).",
    label: "Ringquelle",
  },
  BAR: {
    tooltip: "Linienquelle: Erzeugt ebene Wellenfronten (z.B. langer Stab im Wasser).",
    label: "Linienquelle",
  },
  TRIANGLE: {
    tooltip: "Dreieckquelle: Abstrakte Quellform fuer experimentelle Wellenfelder.",
    label: "Dreieckquelle",
  },
};

// --- Formel-Symbol-Mapping ---

/** Mapping von Formel-Symbolen auf WaveParams-Keys und abgeleitete Werte */
export interface FormulaSymbolInfo {
  /** Zugehoeriger Parameter-Key (oder null fuer abgeleitete) */
  paramKey: keyof WaveParams | null;
  /** Anzeigename */
  label: string;
  /** Tooltip-Text im Hover */
  tooltip: string;
}

export const FORMULA_SYMBOLS: Record<string, FormulaSymbolInfo> = {
  A: {
    paramKey: "amplitude",
    label: "Amplitude",
    tooltip: "Amplitude A: maximale Auslenkung der Welle",
  },
  k: {
    paramKey: "wavelength",
    label: "Wellenzahl",
    tooltip: "Wellenzahl k = 2\u03C0/\u03BB: raeuml. Frequenz der Welle",
  },
  "\u03C9": {
    paramKey: "frequency",
    label: "Kreisfrequenz",
    tooltip: "Kreisfrequenz \u03C9 = 2\u03C0\u00B7f: zeitl. Schwingungsrate",
  },
  "\u03C6": {
    paramKey: "phase",
    label: "Anfangsphase",
    tooltip: "Phase \u03C6: Startzustand der Schwingung bei t = 0",
  },
  d: {
    paramKey: "damping",
    label: "Daempfung",
    tooltip: "Daempfung d: exponentieller Amplitudenabfall",
  },
};
