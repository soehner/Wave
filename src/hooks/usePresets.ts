"use client";

import { useState, useCallback } from "react";
import { WAVE_PRESETS, getPresetById } from "@/lib/wave-presets";
import type { WaveParams } from "@/lib/wave-params";
import type { SourceConfig } from "@/lib/wave-sources";

export interface UsePresetsReturn {
  /** ID des aktuell aktiven Presets (null = Benutzerdefiniert) */
  activePresetId: string | null;
  /** true sobald nach Preset-Load ein Parameter manuell geaendert wurde */
  isDirty: boolean;
  /** Preset laden: setzt alle Parameter und Quellenkonfiguration */
  loadPreset: (id: string) => void;
  /** Aktives Preset zuruecksetzen (noop falls kein Preset aktiv) */
  resetToPreset: () => void;
  /** Als "manuell veraendert" markieren */
  markDirty: () => void;
}

export function usePresets(
  applyParams: (params: WaveParams, perSourceParams?: WaveParams[]) => void,
  applyConfig: (config: SourceConfig) => void
): UsePresetsReturn {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const loadPreset = useCallback(
    (id: string) => {
      const preset = getPresetById(id);
      if (!preset) {
        console.error(`Preset "${id}" nicht gefunden`);
        return;
      }
      applyConfig(preset.sourceConfig);
      applyParams(preset.params, preset.perSourceParams);
      setActivePresetId(id);
      setIsDirty(false);
    },
    [applyParams, applyConfig]
  );

  const resetToPreset = useCallback(() => {
    if (!activePresetId) return;
    const preset = getPresetById(activePresetId);
    if (!preset) return;
    applyConfig(preset.sourceConfig);
    applyParams(preset.params, preset.perSourceParams);
    setIsDirty(false);
  }, [activePresetId, applyParams, applyConfig]);

  const markDirty = useCallback(() => {
    if (activePresetId && !isDirty) {
      setIsDirty(true);
    }
  }, [activePresetId, isDirty]);

  return {
    activePresetId,
    isDirty,
    loadPreset,
    resetToPreset,
    markDirty,
  };
}

export { WAVE_PRESETS };
