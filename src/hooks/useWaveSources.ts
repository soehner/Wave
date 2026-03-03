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

export interface UseWaveSourcesReturn {
  config: SourceConfig;
  setSourceType: (type: SourceType) => void;
  setSourceCount: (count: number) => void;
  setSourceSpacing: (spacing: number) => void;
  resetSources: () => void;
  sourceUniforms: ReturnType<typeof sourceConfigToUniforms>;
  isClipped: boolean;
}

export function useWaveSources(): UseWaveSourcesReturn {
  const [config, setConfig] = useState<SourceConfig>(DEFAULT_SOURCE_CONFIG);

  const setSourceType = useCallback((type: SourceType) => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const setSourceCount = useCallback((count: number) => {
    const clamped = Math.max(SOURCE_COUNT_MIN, Math.min(SOURCE_COUNT_MAX, Math.round(count)));
    setConfig((prev) => ({ ...prev, count: clamped }));
  }, []);

  const setSourceSpacing = useCallback((spacing: number) => {
    const clamped = Math.max(SOURCE_SPACING_MIN, Math.min(SOURCE_SPACING_MAX, spacing));
    setConfig((prev) => ({ ...prev, spacing: clamped }));
  }, []);

  const resetSources = useCallback(() => {
    setConfig(DEFAULT_SOURCE_CONFIG);
  }, []);

  const sourceUniforms = useMemo(() => sourceConfigToUniforms(config), [config]);
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
    sourceUniforms,
    isClipped,
  };
}
