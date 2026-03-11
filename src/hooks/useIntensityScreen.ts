"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  type IntensityPoint,
  type ReflectionParams,
  calculateIntensityProfile,
  calculateTimeAveragedIntensity,
  computeWaveZ,
  FIELD_HALF_SIZE,
} from "@/lib/wave-math";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";

export type IntensityMode = "instantaneous" | "timeAveraged";

export interface UseIntensityScreenOptions {
  /** Ref auf die geteilte Zeit (aus useWaveAnimation) */
  timeRef: React.RefObject<number>;
  /** Aktuelle Wellenparameter-Arrays */
  waveUniformArrays: WaveUniformArrays | undefined;
  /** Aktuelle Quelleninformationen */
  sourceUniforms: SourceUniforms | undefined;
  /** Ob die Animation laeuft */
  isPlaying: boolean;
  /** Ob der Schirm aktiv ist */
  isActive: boolean;
  /** X-Position des Schirms in Metern */
  screenX: number;
  /** Modus: instantan oder zeitgemittelt */
  intensityMode: IntensityMode;
  /** Reflexionsparameter (PROJ-15) */
  reflection?: ReflectionParams;
  /** PROJ-16: Index der mausgesteuerten Quelle (-1 = aus) */
  mouseTrackingSourceIndex?: number;
  /** PROJ-16: Z-History Ringpuffer Ref */
  zHistoryBufferRef?: React.RefObject<Float32Array>;
  /** PROJ-16: Z-History Head-Index Ref */
  zHistoryHeadRef?: React.RefObject<number>;
  /** PROJ-16: Zeitschritt zwischen Z-History Samples */
  zHistoryDt?: number;
}

export interface UseIntensityScreenReturn {
  /** Aktuelle Intensitaetsdaten fuer das Diagramm */
  chartData: IntensityPoint[];
}

const NUM_POINTS = 200;
const BUFFER_SIZE = 30; // 30 Frames fuer Zeitgemittelung
const TARGET_INTERVAL = 1000 / 30; // ~33ms fuer 30 FPS

/**
 * Hook fuer die CPU-seitige Berechnung des Intensitaetsprofils.
 *
 * Analog zu useCrossSection: eigener requestAnimationFrame-Loop,
 * auf ~30 FPS gedrosselt. Unterstuetzt instantanen und zeitgemittelten Modus.
 */
export function useIntensityScreen({
  timeRef,
  waveUniformArrays,
  sourceUniforms,
  isPlaying,
  isActive,
  screenX,
  intensityMode,
  reflection,
  mouseTrackingSourceIndex = -1,
  zHistoryBufferRef,
  zHistoryHeadRef,
  zHistoryDt = 0.04,
}: UseIntensityScreenOptions): UseIntensityScreenReturn {
  const [rawChartData, setRawChartData] = useState<IntensityPoint[]>([]);

  // Wenn nicht aktiv, leere Daten zurueckgeben
  const chartData = isActive ? rawChartData : [];

  // Refs fuer den Animation-Loop
  const isActiveRef = useRef(isActive);
  const screenXRef = useRef(screenX);
  const intensityModeRef = useRef(intensityMode);
  const waveUniformsRef = useRef(waveUniformArrays);
  const sourceUniformsRef = useRef(sourceUniforms);
  const isPlayingRef = useRef(isPlaying);

  // Ringpuffer fuer zeitgemittelte Intensitaet
  const ringBufferRef = useRef<number[][]>([]);
  const bufferIndexRef = useRef(0);

  // Refs synchron halten
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { screenXRef.current = screenX; }, [screenX]);
  useEffect(() => { intensityModeRef.current = intensityMode; }, [intensityMode]);
  useEffect(() => { waveUniformsRef.current = waveUniformArrays; }, [waveUniformArrays]);
  useEffect(() => { sourceUniformsRef.current = sourceUniforms; }, [sourceUniforms]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const reflectionRef = useRef(reflection);
  useEffect(() => { reflectionRef.current = reflection; }, [reflection]);

  const mouseTrackingSourceIndexRef = useRef(mouseTrackingSourceIndex);
  useEffect(() => { mouseTrackingSourceIndexRef.current = mouseTrackingSourceIndex; }, [mouseTrackingSourceIndex]);

  // Ringpuffer leeren wenn Modus wechselt oder Schirm de-/aktiviert wird
  useEffect(() => {
    ringBufferRef.current = [];
    bufferIndexRef.current = 0;
  }, [isActive, intensityMode]);

  // Animation-Loop fuer Datenberechnung (~30 FPS)
  useEffect(() => {
    if (!isActive) return;

    let animFrameId = 0;
    let lastUpdateTime = 0;

    const update = (timestamp: number) => {
      animFrameId = requestAnimationFrame(update);

      // Auf ~30 FPS drosseln
      if (timestamp - lastUpdateTime < TARGET_INTERVAL) return;
      lastUpdateTime = timestamp;

      if (!isActiveRef.current) return;
      if (!waveUniformsRef.current || !sourceUniformsRef.current) return;

      const t = timeRef.current ?? 0;
      const sx = screenXRef.current;
      const uniforms = waveUniformsRef.current;
      const sources = sourceUniformsRef.current;

      const mIdx = mouseTrackingSourceIndexRef.current;
      const mwh = mIdx >= 0 && zHistoryBufferRef && zHistoryHeadRef
        ? { sourceIndex: mIdx, buffer: zHistoryBufferRef.current, head: zHistoryHeadRef.current, dt: zHistoryDt }
        : undefined;

      if (intensityModeRef.current === "instantaneous") {
        // Instantaner Modus: direkte Berechnung
        const data = calculateIntensityProfile(sx, t, uniforms, sources, NUM_POINTS, reflectionRef.current, mwh);
        setRawChartData(data);
      } else {
        // Zeitgemittelter Modus: z^2-Werte in Ringpuffer sammeln
        const step = (2 * FIELD_HALF_SIZE) / (NUM_POINTS - 1);
        const frameData: number[] = [];
        for (let i = 0; i < NUM_POINTS; i++) {
          const y = -FIELD_HALF_SIZE + i * step;
          const z = computeWaveZ(sx, y, t, uniforms, sources, reflectionRef.current, mwh);
          frameData.push(z * z);
        }

        // In Ringpuffer einfuegen
        const buffer = ringBufferRef.current;
        if (buffer.length < BUFFER_SIZE) {
          buffer.push(frameData);
        } else {
          buffer[bufferIndexRef.current % BUFFER_SIZE] = frameData;
        }
        bufferIndexRef.current++;

        // Zeitgemittelte Intensitaet berechnen
        const data = calculateTimeAveragedIntensity(buffer, NUM_POINTS, sx);
        setRawChartData(data);
      }
    };

    animFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isActive, timeRef]);

  // Bei Aenderung von Position/Parametern bei pausierter Animation einmalig berechnen
  useEffect(() => {
    if (!isActive || isPlayingRef.current) return;
    if (!waveUniformArrays || !sourceUniforms) return;

    const id = requestAnimationFrame(() => {
      const t = timeRef.current ?? 0;
      if (intensityModeRef.current === "instantaneous") {
        const mIdx2 = mouseTrackingSourceIndexRef.current;
        const mwh2 = mIdx2 >= 0 && zHistoryBufferRef && zHistoryHeadRef
          ? { sourceIndex: mIdx2, buffer: zHistoryBufferRef.current, head: zHistoryHeadRef.current, dt: zHistoryDt }
          : undefined;

        const data = calculateIntensityProfile(screenX, t, waveUniformArrays, sourceUniforms, NUM_POINTS, reflection, mwh2);
        setRawChartData(data);
      } else {
        // Bei Pause im zeitgemittelten Modus: zeige vorhandene Daten oder berechne instantan
        if (ringBufferRef.current.length > 0) {
          const data = calculateTimeAveragedIntensity(ringBufferRef.current, NUM_POINTS, screenX);
          setRawChartData(data);
        } else {
          const mIdx3 = mouseTrackingSourceIndexRef.current;
          const mwh3 = mIdx3 >= 0 && zHistoryBufferRef && zHistoryHeadRef
            ? { sourceIndex: mIdx3, buffer: zHistoryBufferRef.current, head: zHistoryHeadRef.current, dt: zHistoryDt }
            : undefined;
          const data = calculateIntensityProfile(screenX, t, waveUniformArrays, sourceUniforms, NUM_POINTS, reflection, mwh3);
          setRawChartData(data);
        }
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isActive, screenX, waveUniformArrays, sourceUniforms, timeRef, intensityMode, reflection]);

  return { chartData };
}
