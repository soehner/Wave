"use client";

import { useState, useRef, useEffect } from "react";
import { computeWaveZ, type ReflectionParams } from "@/lib/wave-math";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";

/** Ein einzelner Sondenpunkt */
export interface Probe {
  id: string;
  x: number;
  y: number;
  color: string;
}

/** Datenpunkt im Zeitverlaufsdiagramm */
export interface ProbeDataPoint {
  t: number;
  [key: string]: number; // probe-0, probe-1, probe-2
}

/** Farben fuer bis zu 3 Sonden */
export const PROBE_COLORS = [
  "hsl(50, 100%, 60%)",   // Gelb
  "hsl(180, 100%, 50%)",  // Cyan
  "hsl(300, 100%, 60%)",  // Magenta
];

const BUFFER_SIZE = 150; // ~5 s bei 30 Hz

export interface UseProbeDataOptions {
  probes: Probe[];
  timeRef: React.RefObject<number>;
  waveUniformArrays: WaveUniformArrays | undefined;
  sourceUniforms: SourceUniforms | undefined;
  isPlaying: boolean;
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

export interface UseProbeDataReturn {
  chartData: ProbeDataPoint[];
}

/**
 * Hook fuer die Zeitverlaufsdaten der Punkt-Sonden.
 * Berechnet z(t) fuer jede aktive Sonde per computeWaveZ(),
 * speichert die Werte in einem Ringpuffer (~30 FPS gedrosselt).
 */
export function useProbeData({
  probes,
  timeRef,
  waveUniformArrays,
  sourceUniforms,
  isPlaying,
  reflection,
  mouseTrackingSourceIndex = -1,
  zHistoryBufferRef,
  zHistoryHeadRef,
  zHistoryDt = 0.04,
}: UseProbeDataOptions): UseProbeDataReturn {
  const [chartData, setChartData] = useState<ProbeDataPoint[]>([]);

  // Refs fuer den Animation-Loop
  const probesRef = useRef(probes);
  const waveUniformsRef = useRef(waveUniformArrays);
  const sourceUniformsRef = useRef(sourceUniforms);
  const isPlayingRef = useRef(isPlaying);
  const bufferRef = useRef<ProbeDataPoint[]>([]);

  useEffect(() => { probesRef.current = probes; }, [probes]);
  useEffect(() => { waveUniformsRef.current = waveUniformArrays; }, [waveUniformArrays]);
  useEffect(() => { sourceUniformsRef.current = sourceUniforms; }, [sourceUniforms]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const reflectionRef = useRef(reflection);
  useEffect(() => { reflectionRef.current = reflection; }, [reflection]);

  const mouseTrackingSourceIndexRef = useRef(mouseTrackingSourceIndex);
  useEffect(() => { mouseTrackingSourceIndexRef.current = mouseTrackingSourceIndex; }, [mouseTrackingSourceIndex]);

  // Puffer leeren wenn sich Sonden aendern (neue Sonde / entfernt)
  const probeIds = probes.map((p) => p.id).join(",");
  useEffect(() => {
    bufferRef.current = [];
    setChartData([]);
  }, [probeIds]);

  // Animation-Loop (~30 FPS)
  useEffect(() => {
    if (probes.length === 0) return;

    let animFrameId = 0;
    let lastUpdateTime = 0;
    const TARGET_INTERVAL = 1000 / 30;

    const update = (timestamp: number) => {
      animFrameId = requestAnimationFrame(update);

      if (timestamp - lastUpdateTime < TARGET_INTERVAL) return;
      lastUpdateTime = timestamp;

      if (!isPlayingRef.current) return;
      if (!waveUniformsRef.current || !sourceUniformsRef.current) return;

      const currentProbes = probesRef.current;
      if (currentProbes.length === 0) return;

      const t = timeRef.current ?? 0;

      const point: ProbeDataPoint = { t: Math.round(t * 1000) / 1000 };
      for (const probe of currentProbes) {
        const mIdx = mouseTrackingSourceIndexRef.current;
        const mwh = mIdx >= 0 && zHistoryBufferRef && zHistoryHeadRef
          ? { sourceIndex: mIdx, buffer: zHistoryBufferRef.current, head: zHistoryHeadRef.current, dt: zHistoryDt }
          : undefined;

        point[probe.id] = computeWaveZ(
          probe.x,
          probe.y,
          t,
          waveUniformsRef.current!,
          sourceUniformsRef.current!,
          reflectionRef.current,
          mwh
        );
      }

      const buffer = bufferRef.current;
      buffer.push(point);
      if (buffer.length > BUFFER_SIZE) {
        buffer.splice(0, buffer.length - BUFFER_SIZE);
      }

      setChartData([...buffer]);
    };

    animFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [probes.length, timeRef]);

  return { chartData };
}
