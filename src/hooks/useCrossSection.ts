"use client";

import { useState, useRef, useEffect } from "react";
import {
  type CrossSectionPoint,
  computeCrossSectionData,
} from "@/lib/wave-math";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";

export interface UseCrossSectionOptions {
  /** Ref auf die geteilte Zeit (aus useWaveAnimation) */
  timeRef: React.RefObject<number>;
  /** Aktuelle Wellenparameter-Arrays */
  waveUniformArrays: WaveUniformArrays | undefined;
  /** Aktuelle Quelleninformationen */
  sourceUniforms: SourceUniforms | undefined;
  /** Ob die Animation laeuft (fuer Pause-Logik) */
  isPlaying: boolean;
  /** Ob die Schnittebene aktiv ist */
  isActive: boolean;
  /** Orientierung */
  orientation: "x" | "y";
  /** Position der Schnittebene in Metern */
  position: number;
}

export interface UseCrossSectionReturn {
  /** Aktuelle Datenpunkte fuer das Diagramm */
  chartData: CrossSectionPoint[];
}

/**
 * Hook fuer die CPU-seitige Berechnung der Schnittdaten.
 *
 * Der Zustand (isActive, orientation, position) wird von aussen uebergeben,
 * dieser Hook ist nur fuer die Datenberechnung im eigenen
 * requestAnimationFrame-Loop zustaendig (~30 FPS gedrosselt).
 */
export function useCrossSection({
  timeRef,
  waveUniformArrays,
  sourceUniforms,
  isPlaying,
  isActive,
  orientation,
  position,
}: UseCrossSectionOptions): UseCrossSectionReturn {
  const [rawChartData, setRawChartData] = useState<CrossSectionPoint[]>([]);

  // Wenn nicht aktiv, leere Daten zurueckgeben (ohne setState in Effekt)
  const chartData = isActive ? rawChartData : [];

  // Refs fuer den Animation-Loop (vermeidet Re-renders)
  const isActiveRef = useRef(isActive);
  const orientationRef = useRef(orientation);
  const positionRef = useRef(position);
  const waveUniformsRef = useRef(waveUniformArrays);
  const sourceUniformsRef = useRef(sourceUniforms);
  const isPlayingRef = useRef(isPlaying);

  // Refs in useEffect synchron halten (React 19 lint-konform)
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  useEffect(() => {
    waveUniformsRef.current = waveUniformArrays;
  }, [waveUniformArrays]);
  useEffect(() => {
    sourceUniformsRef.current = sourceUniforms;
  }, [sourceUniforms]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Animation-Loop fuer Datenberechnung (~30 FPS)
  useEffect(() => {
    if (!isActive) return;

    let animFrameId = 0;
    let lastUpdateTime = 0;
    const TARGET_INTERVAL = 1000 / 30; // ~33ms fuer 30 FPS

    const update = (timestamp: number) => {
      animFrameId = requestAnimationFrame(update);

      // Auf ~30 FPS drosseln
      if (timestamp - lastUpdateTime < TARGET_INTERVAL) return;
      lastUpdateTime = timestamp;

      if (!isActiveRef.current) return;
      if (!waveUniformsRef.current || !sourceUniformsRef.current) return;

      const t = timeRef.current ?? 0;

      const data = computeCrossSectionData(
        orientationRef.current,
        positionRef.current,
        t,
        waveUniformsRef.current,
        sourceUniformsRef.current
      );

      setRawChartData(data);
    };

    animFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isActive, timeRef]);

  // Beim Aendern von Orientierung/Position/Parametern bei pausierter Animation
  // einmalig neu berechnen (via rAF um synchrones setState im Effekt zu vermeiden)
  useEffect(() => {
    if (!isActive || isPlayingRef.current) return;
    if (!waveUniformArrays || !sourceUniforms) return;

    const id = requestAnimationFrame(() => {
      const t = timeRef.current ?? 0;
      const data = computeCrossSectionData(
        orientation,
        position,
        t,
        waveUniformArrays,
        sourceUniforms
      );
      setRawChartData(data);
    });
    return () => cancelAnimationFrame(id);
  }, [isActive, orientation, position, waveUniformArrays, sourceUniforms, timeRef]);

  return {
    chartData,
  };
}
