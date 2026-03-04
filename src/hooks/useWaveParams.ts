"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type WaveParams,
  type WaveUniformArrays,
  DEFAULT_WAVE_PARAMS,
  PARAMETER_CONFIGS,
  computeDerivedValues,
  paramsArrayToUniforms,
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

function sliderStatesToParams(states: SliderStates): WaveParams {
  const result: Record<string, number> = {};
  for (const config of PARAMETER_CONFIGS) {
    const state = states[config.key];
    result[config.key] = computeEffectiveValue(
      state.baseValue,
      state.sliderPercent,
      config
    );
  }
  return result as unknown as WaveParams;
}

export interface UseWaveParamsReturn {
  /** Effektive Parameter der aktuell angezeigten Quelle (oder Quelle 0 bei "Alle") */
  params: WaveParams;
  /** Slider-Zustaende der aktuell angezeigten Quelle */
  sliderStates: SliderStates;
  /** Abgeleitete Werte der aktuell angezeigten Quelle */
  derived: ReturnType<typeof computeDerivedValues>;
  /** Array-Uniforms fuer den Shader (alle Quellen) */
  uniformArrays: WaveUniformArrays;
  /** Aktiver Quellenindex (null = "Alle"-Modus) */
  activeSourceIndex: number | null;
  /** Aktiven Quellenindex setzen */
  setActiveSourceIndex: (index: number | null) => void;
  /** Slider-Position aendern */
  setSliderPercent: (key: keyof WaveParams, percent: number) => void;
  /** Absolut-Wert im Input aendern (setzt Slider auf 0%) */
  setBaseValue: (key: keyof WaveParams, value: number) => void;
  /** Alle Parameter auf Defaults zuruecksetzen */
  resetAll: () => void;
  /** Alle Quellen atomar auf gegebene Parameter setzen (fuer Presets) */
  applyParams: (params: WaveParams, perSourceParams?: WaveParams[]) => void;
  /** Validierungsfehler pro Parameter (leer = kein Fehler) */
  validationErrors: Partial<Record<keyof WaveParams, string>>;
  /** Validiert einen Wert und gibt einen Fehlerstring zurueck (oder null) */
  validateValue: (key: keyof WaveParams, value: number) => string | null;
}

export function useWaveParams(sourceCount: number): UseWaveParamsReturn {
  const [allSliderStates, setAllSliderStates] = useState<SliderStates[]>([
    createInitialSliderStates(),
  ]);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof WaveParams, string>>
  >({});

  // Array-Groesse an sourceCount anpassen (synchron waehrend Render)
  const [prevSourceCount, setPrevSourceCount] = useState(sourceCount);
  if (sourceCount !== prevSourceCount) {
    setPrevSourceCount(sourceCount);
    if (allSliderStates.length < sourceCount) {
      const extended = [...allSliderStates];
      while (extended.length < sourceCount) {
        extended.push(createInitialSliderStates());
      }
      setAllSliderStates(extended);
    } else if (allSliderStates.length > sourceCount) {
      setAllSliderStates(allSliderStates.slice(0, sourceCount));
    }
    if (activeSourceIndex !== null && activeSourceIndex >= sourceCount) {
      setActiveSourceIndex(null);
    }
  }

  // Alle Quellen als WaveParams berechnen
  const allSourceParams = useMemo<WaveParams[]>(
    () => allSliderStates.map(sliderStatesToParams),
    [allSliderStates]
  );

  // Aktive Quelle: Index oder 0 bei "Alle"
  const displayIndex = activeSourceIndex ?? 0;
  const sliderStates = allSliderStates[displayIndex] ?? createInitialSliderStates();
  const params = allSourceParams[displayIndex] ?? DEFAULT_WAVE_PARAMS;
  const derived = useMemo(() => computeDerivedValues(params), [params]);

  // Array-Uniforms fuer den Shader
  const uniformArrays = useMemo(
    () => paramsArrayToUniforms(allSourceParams),
    [allSourceParams]
  );

  const validateValue = useCallback(
    (key: keyof WaveParams, value: number): string | null => {
      const config = PARAMETER_CONFIGS.find((c) => c.key === key);
      if (!config) return null;

      if (isNaN(value)) {
        return "Ungueltige Eingabe";
      }

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
      setAllSliderStates((prev) =>
        prev.map((states, i) => {
          // "Alle"-Modus: alle aendern; Einzelmodus: nur aktive Quelle
          if (activeSourceIndex !== null && i !== activeSourceIndex) return states;
          return {
            ...states,
            [key]: {
              ...states[key],
              sliderPercent: clampedPercent,
            },
          };
        })
      );
      setValidationErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [activeSourceIndex]
  );

  const setBaseValue = useCallback(
    (key: keyof WaveParams, value: number) => {
      const error = validateValue(key, value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [key]: error }));
        return;
      }

      setAllSliderStates((prev) =>
        prev.map((states, i) => {
          if (activeSourceIndex !== null && i !== activeSourceIndex) return states;
          return {
            ...states,
            [key]: {
              baseValue: value,
              sliderPercent: 0,
            },
          };
        })
      );

      setValidationErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [activeSourceIndex, validateValue]
  );

  const resetAll = useCallback(() => {
    setAllSliderStates((prev) =>
      prev.map((_, i) => {
        if (activeSourceIndex !== null && i !== activeSourceIndex) return prev[i];
        return createInitialSliderStates();
      })
    );
    setValidationErrors({});
  }, [activeSourceIndex]);

  const applyParams = useCallback((newParams: WaveParams, perSourceParams?: WaveParams[]) => {
    const toSliderStates = (p: WaveParams): SliderStates => ({
      amplitude: { baseValue: p.amplitude, sliderPercent: 0 },
      frequency: { baseValue: p.frequency, sliderPercent: 0 },
      wavelength: { baseValue: p.wavelength, sliderPercent: 0 },
      phase: { baseValue: p.phase, sliderPercent: 0 },
      damping: { baseValue: p.damping, sliderPercent: 0 },
    });
    const defaultState = toSliderStates(newParams);
    setAllSliderStates((prev) =>
      prev.map((_, i) =>
        perSourceParams && perSourceParams[i]
          ? toSliderStates(perSourceParams[i])
          : defaultState
      )
    );
    setActiveSourceIndex(null);
    setValidationErrors({});
  }, []);

  return {
    params,
    sliderStates,
    derived,
    uniformArrays,
    activeSourceIndex,
    setActiveSourceIndex,
    setSliderPercent,
    setBaseValue,
    resetAll,
    applyParams,
    validationErrors,
    validateValue,
  };
}
