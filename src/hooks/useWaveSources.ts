"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type SourceConfig,
  type SourceType,
  DEFAULT_SOURCE_CONFIG,
  SOURCE_COUNT_MIN,
  SOURCE_COUNT_MAX,
  SOURCE_SPACING_MIN,
  SOURCE_SPACING_MAX,
  sourceConfigToUniforms,
  hasClippedSources,
} from "@/lib/wave-sources";

/** Z-Hoehe Grenzen (PROJ-16) */
export const SOURCE_Z_MIN = -5.0;
export const SOURCE_Z_MAX = 5.0;

export interface UseWaveSourcesReturn {
  config: SourceConfig;
  setSourceType: (type: SourceType) => void;
  setSourceCount: (count: number) => void;
  setSourceSpacing: (spacing: number) => void;
  resetSources: () => void;
  /** Gesamte Quellenkonfiguration atomar setzen (fuer Presets) */
  applyConfig: (config: SourceConfig) => void;
  sourceUniforms: ReturnType<typeof sourceConfigToUniforms>;
  isClipped: boolean;
  /** Z-Hoehe jeder Quelle (PROJ-16) */
  sourceZ: number[];
  /** Index der aktiven Quelle (PROJ-16) */
  activeSourceIndex: number;
  /** Setzt die Z-Hoehe einer einzelnen Quelle (PROJ-16) */
  setSourceZ: (index: number, z: number) => void;
  /** Setzt die aktive Quelle (PROJ-16) */
  setActiveSourceIndex: (index: number) => void;
  /** Setzt die Z-Hoehe einer Quelle auf 0 zurueck (PROJ-16) */
  resetSourceZ: (index: number) => void;
  /** Setzt alle Z-Hoehen auf 0 zurueck (PROJ-16) */
  resetAllSourceZ: () => void;
}

export function useWaveSources(): UseWaveSourcesReturn {
  const [config, setConfig] = useState<SourceConfig>(DEFAULT_SOURCE_CONFIG);
  const [sourceZ, setSourceZState] = useState<number[]>(() => new Array(SOURCE_COUNT_MAX).fill(0));
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  const setSourceType = useCallback((type: SourceType) => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const setSourceCount = useCallback((count: number) => {
    const clamped = Math.max(SOURCE_COUNT_MIN, Math.min(SOURCE_COUNT_MAX, Math.round(count)));
    setConfig((prev) => ({ ...prev, count: clamped }));
    // activeSourceIndex anpassen falls noetig
    setActiveSourceIndex((prev) => (prev >= clamped ? 0 : prev));
  }, []);

  const setSourceSpacing = useCallback((spacing: number) => {
    const clamped = Math.max(SOURCE_SPACING_MIN, Math.min(SOURCE_SPACING_MAX, spacing));
    setConfig((prev) => ({ ...prev, spacing: clamped }));
  }, []);

  const resetSources = useCallback(() => {
    setConfig(DEFAULT_SOURCE_CONFIG);
    setSourceZState(new Array(SOURCE_COUNT_MAX).fill(0));
    setActiveSourceIndex(0);
  }, []);

  const applyConfig = useCallback((newConfig: SourceConfig) => {
    setConfig(newConfig);
    // Preset-Wechsel: alle Z-Hoehen zuruecksetzen (PROJ-16 Spec)
    setSourceZState(new Array(SOURCE_COUNT_MAX).fill(0));
    setActiveSourceIndex(0);
  }, []);

  const setSourceZ = useCallback((index: number, z: number) => {
    const clamped = Math.max(SOURCE_Z_MIN, Math.min(SOURCE_Z_MAX, z));
    setSourceZState((prev) => {
      const next = [...prev];
      next[index] = clamped;
      return next;
    });
  }, []);

  const resetSourceZ = useCallback((index: number) => {
    setSourceZState((prev) => {
      const next = [...prev];
      next[index] = 0;
      return next;
    });
  }, []);

  const resetAllSourceZ = useCallback(() => {
    setSourceZState(new Array(SOURCE_COUNT_MAX).fill(0));
  }, []);

  const sourceUniforms = useMemo(() => sourceConfigToUniforms(config, sourceZ), [config, sourceZ]);
  const isClipped = useMemo(
    () => hasClippedSources(config.count, config.spacing),
    [config.count, config.spacing]
  );

  return {
    config,
    setSourceType,
    setSourceCount,
    setSourceSpacing,
    resetSources,
    applyConfig,
    sourceUniforms,
    isClipped,
    sourceZ,
    activeSourceIndex,
    setSourceZ,
    setActiveSourceIndex,
    resetSourceZ,
    resetAllSourceZ,
  };
}
