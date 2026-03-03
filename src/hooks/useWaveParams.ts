"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type WaveParams,
  DEFAULT_WAVE_PARAMS,
  PARAMETER_CONFIGS,
  computeDerivedValues,
  paramsToUniforms,
  waveParamsSchema,
  type ParameterConfig,
} from "@/lib/wave-params";

/**
 * Slider-Zustand fuer einen einzelnen Parameter.
 *
 * Das Dual-Control-Konzept:
 * - baseValue: Der Absolutwert, den der Benutzer im Input-Feld eingibt
 * - sliderPercent: Position des Sliders (-100 bis +100)
 * - effectiveValue: Der tatsaechlich verwendete Wert
 *
 * Mapping:
 *   sliderPercent = 0%   -> effectiveValue = baseValue
 *   sliderPercent = -100% -> effectiveValue = 0 (oder min)
 *   sliderPercent = +100% -> effectiveValue = 2 * baseValue
 */
export interface ParameterSliderState {
  baseValue: number;
  sliderPercent: number;
}

export type SliderStates = Record<keyof WaveParams, ParameterSliderState>;

/**
 * Berechnet den effektiven Wert aus baseValue und sliderPercent.
 * - Bei 0%: baseValue
 * - Bei -100%: 0 (geclampt auf config.min falls 0 nicht erlaubt)
 * - Bei +100%: 2 * baseValue (geclampt auf config.max)
 */
function computeEffectiveValue(
  baseValue: number,
  sliderPercent: number,
  config: ParameterConfig
): number {
  // Lineare Interpolation: -100% → 0, 0% → baseValue, +100% → 2×baseValue
  const value = baseValue * (1 + sliderPercent / 100);

  // Clamp auf erlaubten Bereich
  return Math.max(config.min, Math.min(config.max, value));
}

function createInitialSliderStates(): SliderStates {
  return {
    amplitude: { baseValue: DEFAULT_WAVE_PARAMS.amplitude, sliderPercent: 0 },
    frequency: { baseValue: DEFAULT_WAVE_PARAMS.frequency, sliderPercent: 0 },
    wavelength: { baseValue: DEFAULT_WAVE_PARAMS.wavelength, sliderPercent: 0 },
    phase: { baseValue: DEFAULT_WAVE_PARAMS.phase, sliderPercent: 0 },
    damping: { baseValue: DEFAULT_WAVE_PARAMS.damping, sliderPercent: 0 },
  };
}

export interface UseWaveParamsReturn {
  /** Die aktuellen effektiven Parameterwerte */
  params: WaveParams;
  /** Slider-Zustaende fuer alle Parameter */
  sliderStates: SliderStates;
  /** Abgeleitete Werte (omega, k, v) */
  derived: ReturnType<typeof computeDerivedValues>;
  /** Uniform-Werte fuer den Three.js-Shader */
  uniforms: ReturnType<typeof paramsToUniforms>;
  /** Slider-Position aendern (throttled via Aufrufer) */
  setSliderPercent: (key: keyof WaveParams, percent: number) => void;
  /** Absolut-Wert im Input aendern (setzt Slider auf 0%) */
  setBaseValue: (key: keyof WaveParams, value: number) => void;
  /** Alle Parameter auf Defaults zuruecksetzen */
  resetAll: () => void;
  /** Validierungsfehler pro Parameter (leer = kein Fehler) */
  validationErrors: Partial<Record<keyof WaveParams, string>>;
  /** Validiert einen Wert und gibt einen Fehlerstring zurueck (oder null) */
  validateValue: (key: keyof WaveParams, value: number) => string | null;
}

export function useWaveParams(): UseWaveParamsReturn {
  const [sliderStates, setSliderStates] = useState<SliderStates>(
    createInitialSliderStates
  );
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof WaveParams, string>>
  >({});

  // Berechne effektive Parameter aus den Slider-States
  const params = useMemo<WaveParams>(() => {
    const result: Record<string, number> = {};
    for (const config of PARAMETER_CONFIGS) {
      const state = sliderStates[config.key];
      result[config.key] = computeEffectiveValue(
        state.baseValue,
        state.sliderPercent,
        config
      );
    }
    return result as unknown as WaveParams;
  }, [sliderStates]);

  const derived = useMemo(() => computeDerivedValues(params), [params]);
  const uniforms = useMemo(() => paramsToUniforms(params), [params]);

  const validateValue = useCallback(
    (key: keyof WaveParams, value: number): string | null => {
      const config = PARAMETER_CONFIGS.find((c) => c.key === key);
      if (!config) return null;

      if (isNaN(value)) {
        return "Ungueltige Eingabe";
      }

      // Zod-Validierung fuer den einzelnen Parameter
      const testParams = { ...DEFAULT_WAVE_PARAMS, [key]: value };
      const result = waveParamsSchema.safeParse(testParams);
      if (!result.success) {
        const fieldError = result.error.issues.find(
          (issue) => issue.path[0] === key
        );
        if (fieldError) {
          if (value < config.min) {
            return `Minimum: ${config.min} ${config.unit}`;
          }
          if (value > config.max) {
            return `Maximum: ${config.max} ${config.unit}`;
          }
          return fieldError.message;
        }
      }

      return null;
    },
    []
  );

  const setSliderPercent = useCallback(
    (key: keyof WaveParams, percent: number) => {
      const clampedPercent = Math.max(-100, Math.min(100, percent));
      setSliderStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          sliderPercent: clampedPercent,
        },
      }));
      // Slider-Aenderung entfernt Validierungsfehler
      setValidationErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    []
  );

  const setBaseValue = useCallback(
    (key: keyof WaveParams, value: number) => {
      const error = validateValue(key, value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [key]: error }));
        return;
      }

      setSliderStates((prev) => ({
        ...prev,
        [key]: {
          baseValue: value,
          // Slider auf 0% setzen wenn der Benutzer den Absolutwert aendert
          sliderPercent: 0,
        },
      }));

      setValidationErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [validateValue]
  );

  const resetAll = useCallback(() => {
    setSliderStates(createInitialSliderStates());
    setValidationErrors({});
  }, []);

  return {
    params,
    sliderStates,
    derived,
    uniforms,
    setSliderPercent,
    setBaseValue,
    resetAll,
    validationErrors,
    validateValue,
  };
}
