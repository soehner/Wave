"use client";

import { useState, useCallback } from "react";
import { SOURCE_Z_MIN, SOURCE_Z_MAX } from "@/hooks/useWaveSources";

// Hinweis: Dieses Feature nutzt mousemove/movementY und ist auf Touch-Geraeten
// nicht verfuegbar. Laut PRD ist Mobile/Touch nicht im Scope (Desktop-only).

/** Sensitivitaetsfaktor: wie viel Z-Aenderung pro Pixel Mausbewegung */
const SENSITIVITY = 0.02;

export interface UseMouseTrackingReturn {
  /** Mausverfolgung aktiv? */
  isActive: boolean;
  /** Mausverfolgung umschalten */
  toggle: () => void;
  /** Mausverfolgung deaktivieren */
  deactivate: () => void;
  /** mousemove-Handler: gibt neuen Z-Wert zurueck basierend auf movementY */
  handleMouseMove: (movementY: number, currentZ: number) => number;
}

export function useMouseTracking(): UseMouseTrackingReturn {
  const [isActive, setIsActive] = useState(false);
  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleMouseMove = useCallback(
    (movementY: number, currentZ: number): number => {
      // Maus nach oben -> movementY negativ -> Z soll steigen
      const delta = -movementY * SENSITIVITY;
      const newZ = Math.max(SOURCE_Z_MIN, Math.min(SOURCE_Z_MAX, currentZ + delta));
      return Math.round(newZ * 10) / 10; // 1 Nachkommastelle
    },
    []
  );

  return {
    isActive,
    toggle,
    deactivate,
    handleMouseMove,
  };
}
