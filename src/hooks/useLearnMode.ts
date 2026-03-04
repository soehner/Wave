"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PARAMETER_EXPLANATIONS } from "@/lib/physics-explanations";
import type { WaveParams } from "@/lib/wave-params";

export interface UseLearnModeReturn {
  /** Lernmodus aktiv? */
  isLearnMode: boolean;
  /** Lernmodus ein-/ausschalten */
  toggleLearnMode: () => void;
  /** Hervorgehobener Parameter-Key (fuer Pulse-Animation) */
  highlightedParam: keyof WaveParams | null;
  /** Markiert einen Parameter als hervorgehoben (1s Timeout) */
  highlightParam: (key: keyof WaveParams) => void;
  /** Zeigt Lernmodus-Toast bei Slider-Aenderung (gedrosselt auf 500ms) */
  showSliderToast: (key: keyof WaveParams) => void;
  /** Setzt das Preset-Loading-Flag (unterdrueckt Einzel-Toasts) */
  setPresetLoading: (loading: boolean) => void;
}

/**
 * Hook fuer den Lernmodus (PROJ-13).
 *
 * - Toggle-Zustand fuer Lernmodus
 * - Highlight-Logik mit Auto-Clear (1s)
 * - Toast-Drosselung (max 1 Toast alle 500ms)
 * - Unterdrueckung bei Preset-Wechsel
 */
export function useLearnMode(): UseLearnModeReturn {
  const [isLearnMode, setIsLearnMode] = useState(false);
  const [highlightedParam, setHighlightedParam] = useState<keyof WaveParams | null>(null);
  const lastToastTimeRef = useRef(0);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPresetLoadingRef = useRef(false);

  const toggleLearnMode = useCallback(() => {
    setIsLearnMode((prev) => !prev);
  }, []);

  const highlightParam = useCallback((key: keyof WaveParams) => {
    // Clear vorherigen Timer
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    setHighlightedParam(key);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedParam(null);
      highlightTimerRef.current = null;
    }, 1000);
  }, []);

  const showSliderToast = useCallback(
    (key: keyof WaveParams) => {
      if (!isLearnMode) return;
      if (isPresetLoadingRef.current) return;

      const now = performance.now();
      if (now - lastToastTimeRef.current < 500) return;
      lastToastTimeRef.current = now;

      const explanation = PARAMETER_EXPLANATIONS[key];
      if (!explanation) return;

      toast.info(explanation.effectText, {
        duration: 3000,
        id: `learn-${key}`,
      });
    },
    [isLearnMode]
  );

  const setPresetLoading = useCallback((loading: boolean) => {
    isPresetLoadingRef.current = loading;
  }, []);

  return {
    isLearnMode,
    toggleLearnMode,
    highlightedParam,
    highlightParam,
    showSliderToast,
    setPresetLoading,
  };
}
