/**
 * Wellenparameter: Typen, Defaults, Validierung und Ableitungen
 *
 * Wellengleichung: z(x,y,t) = A * exp(-d*r) * sin(k*r - omega*t + phi)
 * mit r = sqrt(x^2 + y^2)
 *
 * Beziehungen:
 *   omega = 2*pi*f
 *   k = 2*pi/lambda
 *   v = f * lambda  (Wellengeschwindigkeit, read-only)
 */

import { z } from "zod";

// --- Zod-Validierungsschema ---

export const waveParamsSchema = z.object({
  amplitude: z.number().min(0).max(5),
  frequency: z.number().min(0).max(10),
  wavelength: z.number().min(0.1).max(20),
  phase: z.number().min(-180).max(180),
  damping: z.number().min(0).max(1),
});

export type WaveParams = z.infer<typeof waveParamsSchema>;

// --- Standardwerte ---

export const DEFAULT_WAVE_PARAMS: WaveParams = {
  amplitude: 1.0,
  frequency: 1.0,
  wavelength: 2.0,
  phase: 0.0,
  damping: 0.0,
};

// --- Abgeleitete Groessen ---

export interface DerivedWaveValues {
  angularFrequency: number; // omega = 2*pi*f
  waveNumber: number; // k = 2*pi/lambda
  waveSpeed: number; // v = f * lambda
}

export function computeDerivedValues(params: WaveParams): DerivedWaveValues {
  return {
    angularFrequency: 2 * Math.PI * params.frequency,
    waveNumber: (2 * Math.PI) / params.wavelength,
    waveSpeed: params.frequency * params.wavelength,
  };
}

// --- Uniform-Werte fuer Three.js Shader ---

export interface WaveUniforms {
  amplitude: number;
  waveNumber: number;
  angularFreq: number;
  phase: number;
  damping: number;
}

export function paramsToUniforms(params: WaveParams): WaveUniforms {
  const derived = computeDerivedValues(params);
  return {
    amplitude: params.amplitude,
    waveNumber: derived.waveNumber,
    angularFreq: derived.angularFrequency,
    phase: params.phase * (Math.PI / 180),
    damping: params.damping,
  };
}

// --- Array-basierte Uniforms fuer Per-Source-Parameter ---

export interface WaveUniformArrays {
  amplitudes: number[];    // Laenge 8
  waveNumbers: number[];   // Laenge 8
  angularFreqs: number[];  // Laenge 8
  phases: number[];        // Laenge 8
  dampings: number[];      // Laenge 8
}

export function paramsArrayToUniforms(sources: WaveParams[]): WaveUniformArrays {
  const pad = (arr: number[]): number[] => {
    const result = [...arr];
    while (result.length < 8) result.push(0);
    return result;
  };
  return {
    amplitudes: pad(sources.map((s) => s.amplitude)),
    waveNumbers: pad(sources.map((s) => (2 * Math.PI) / s.wavelength)),
    angularFreqs: pad(sources.map((s) => 2 * Math.PI * s.frequency)),
    phases: pad(sources.map((s) => s.phase * (Math.PI / 180))),
    dampings: pad(sources.map((s) => s.damping)),
  };
}

// --- Parameter-Metadaten fuer die UI ---

export interface ParameterConfig {
  key: keyof WaveParams;
  label: string;
  symbol: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  precision: number;
}

export const PARAMETER_CONFIGS: ParameterConfig[] = [
  {
    key: "amplitude",
    label: "Amplitude",
    symbol: "A",
    unit: "m",
    defaultValue: DEFAULT_WAVE_PARAMS.amplitude,
    min: 0,
    max: 5.0,
    step: 0.01,
    precision: 2,
  },
  {
    key: "frequency",
    label: "Frequenz",
    symbol: "f",
    unit: "Hz",
    defaultValue: DEFAULT_WAVE_PARAMS.frequency,
    min: 0,
    max: 10.0,
    step: 0.01,
    precision: 2,
  },
  {
    key: "wavelength",
    label: "Wellenlänge",
    symbol: "λ",
    unit: "m",
    defaultValue: DEFAULT_WAVE_PARAMS.wavelength,
    min: 0.1,
    max: 20.0,
    step: 0.01,
    precision: 2,
  },
  {
    key: "phase",
    label: "Anfangsphase",
    symbol: "φ",
    unit: "°",
    defaultValue: DEFAULT_WAVE_PARAMS.phase,
    min: -180,
    max: 180,
    step: 1,
    precision: 0,
  },
  {
    key: "damping",
    label: "Dämpfung",
    symbol: "d",
    unit: "1/m",
    defaultValue: DEFAULT_WAVE_PARAMS.damping,
    min: 0,
    max: 1.0,
    step: 0.01,
    precision: 2,
  },
];
