"use client";

import { useState, useMemo, useCallback } from "react";
import type { SourceUniforms } from "@/lib/wave-sources";

export type ReflectionEndType = "fixed" | "free";
export type ReflectionDisplayMode = "total" | "incident" | "reflected";

export interface ReflectionConfig {
  isActive: boolean;
  wallX: number;
  endType: ReflectionEndType;
  displayMode: ReflectionDisplayMode;
}

export interface UseReflectionReturn {
  config: ReflectionConfig;
  setIsActive: (active: boolean) => void;
  setWallX: (x: number) => void;
  setEndType: (type: ReflectionEndType) => void;
  setDisplayMode: (mode: ReflectionDisplayMode) => void;
  reset: () => void;
  /** Ob die Wand eine Quelle ueberlappt */
  wallOverlapsSource: boolean;
  /** Spiegelquellen-Positionen und Phasenverschiebung */
  mirrorSources: Array<{ x: number; y: number; phaseShift: number }>;
}

const DEFAULT_CONFIG: ReflectionConfig = {
  isActive: false,
  wallX: 3.0,
  endType: "fixed",
  displayMode: "total",
};

export const WALL_X_MIN = -4.5;
export const WALL_X_MAX = 4.5;

export function useReflection(sourceUniforms?: SourceUniforms): UseReflectionReturn {
  const [config, setConfig] = useState<ReflectionConfig>(DEFAULT_CONFIG);

  const setIsActive = useCallback((active: boolean) => {
    setConfig((prev) => ({ ...prev, isActive: active }));
  }, []);

  const setWallX = useCallback((x: number) => {
    setConfig((prev) => ({ ...prev, wallX: x }));
  }, []);

  const setEndType = useCallback((type: ReflectionEndType) => {
    setConfig((prev) => ({ ...prev, endType: type }));
  }, []);

  const setDisplayMode = useCallback((mode: ReflectionDisplayMode) => {
    setConfig((prev) => ({ ...prev, displayMode: mode }));
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Spiegelquellen berechnen
  const mirrorSources = useMemo(() => {
    if (!config.isActive || !sourceUniforms) return [];

    const phaseShift = config.endType === "fixed" ? Math.PI : 0;

    return sourceUniforms.sourcePositions
      .slice(0, sourceUniforms.sourceCount)
      .map((pos) => ({
        x: 2 * config.wallX - pos.x,
        y: pos.y,
        phaseShift,
      }));
  }, [config.isActive, config.wallX, config.endType, sourceUniforms]);

  // Pruefe ob eine Quelle die Wand ueberlappt (Abstand < 0.1 m)
  const wallOverlapsSource = useMemo(() => {
    if (!config.isActive || !sourceUniforms) return false;
    return sourceUniforms.sourcePositions
      .slice(0, sourceUniforms.sourceCount)
      .some((pos) => Math.abs(pos.x - config.wallX) < 0.1);
  }, [config.isActive, config.wallX, sourceUniforms]);

  return {
    config,
    setIsActive,
    setWallX,
    setEndType,
    setDisplayMode,
    reset,
    wallOverlapsSource,
    mirrorSources,
  };
}
