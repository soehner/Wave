/**
 * Vorgefertigte Szenarien (Presets) fuer die Wellenvisualisierung.
 *
 * Jedes Preset definiert eine vollstaendige Konfiguration aus
 * Wellenparametern und Quelleneinstellungen.
 */

import type { WaveParams } from "./wave-params";
import type { SourceConfig, SourceType } from "./wave-sources";

export interface WavePreset {
  id: string;
  name: string;
  description: string;
  params: WaveParams;
  /** Optionale per-Quelle-Parameter (ueberschreibt params fuer einzelne Quellen) */
  perSourceParams?: WaveParams[];
  sourceConfig: SourceConfig;
}

export const WAVE_PRESETS: WavePreset[] = [
  {
    id: "single-wave",
    name: "Einzelwelle",
    description: "Einfache Kreisringwelle von einer Punktquelle",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    sourceConfig: { type: "POINT" as SourceType, count: 1, spacing: 2.0 },
  },
  {
    id: "double-slit",
    name: "Doppelspalt-Interferenz",
    description: "Zwei kohaerente Quellen erzeugen ein Interferenzmuster",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    sourceConfig: { type: "POINT" as SourceType, count: 2, spacing: 2.0 },
  },
  {
    id: "standing-wave",
    name: "Stehende Welle",
    description: "Zwei Quellen mit Phasenversatz \u03C0 erzeugen eine stehende Welle",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    perSourceParams: [
      { amplitude: 1.0, frequency: 1.0, wavelength: 2.0, phase: 0, damping: 0.0 },
      { amplitude: 1.0, frequency: 1.0, wavelength: 2.0, phase: 180, damping: 0.0 },
    ],
    sourceConfig: { type: "POINT" as SourceType, count: 2, spacing: 4.0 },
  },
  {
    id: "plane-wave",
    name: "Ebene Welle",
    description: "Linienquelle erzeugt parallele Wellenfronten",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    sourceConfig: { type: "BAR" as SourceType, count: 1, spacing: 2.0 },
  },
  {
    id: "damping-effect",
    name: "Daempfungseffekt",
    description: "Sichtbarer Amplitudenabfall mit zunehmender Entfernung",
    params: {
      amplitude: 2.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.4,
    },
    sourceConfig: { type: "POINT" as SourceType, count: 1, spacing: 2.0 },
  },
  {
    id: "beat-frequency",
    name: "Schwebung",
    description: "Zwei Quellen mit leicht unterschiedlicher Frequenz erzeugen Schwebung",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    perSourceParams: [
      { amplitude: 1.0, frequency: 1.0, wavelength: 2.0, phase: 0, damping: 0.0 },
      { amplitude: 1.0, frequency: 1.2, wavelength: 1.67, phase: 0, damping: 0.0 },
    ],
    sourceConfig: { type: "POINT" as SourceType, count: 2, spacing: 2.0 },
  },
  {
    id: "four-source-array",
    name: "Vier-Quellen-Array",
    description: "Komplexes Interferenzmuster einer Array-Antenne",
    params: {
      amplitude: 1.0,
      frequency: 1.0,
      wavelength: 2.0,
      phase: 0,
      damping: 0.0,
    },
    sourceConfig: { type: "POINT" as SourceType, count: 4, spacing: 1.5 },
  },
];

export function getPresetById(id: string): WavePreset | undefined {
  return WAVE_PRESETS.find((p) => p.id === id);
}
