"use client";

import { useState, useCallback, useMemo } from "react";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";
import { FIELD_HALF_SIZE, computeWaveZ } from "@/lib/wave-math";

/** Annotations-Konfiguration */
export interface AnnotationsConfig {
  showLambdaArrow: boolean;
  showNodeLines: boolean;
  showWavefronts: boolean;
  showPathDifference: boolean;
}

/** Lambda-Pfeil-Daten fuer die 3D-Darstellung */
export interface LambdaArrowData {
  /** Start-X-Position des Pfeils */
  startX: number;
  /** End-X-Position des Pfeils */
  endX: number;
  /** Y-Position des Pfeils */
  y: number;
  /** Wellenlaenge in Metern */
  lambda: number;
}

/** Knotenlinie = Linie in der XY-Ebene mit z nahe 0 */
export interface NodeLinePoint {
  x: number;
  y: number;
}

/** Wellenfront-Kreis (Isophasenlinie) */
export interface WavefrontCircle {
  /** Quellposition X */
  cx: number;
  /** Quellposition Y */
  cy: number;
  /** Radius des Kreises */
  radius: number;
}

/** Gangunterschied-Daten */
export interface PathDifferenceData {
  /** Erste Quellposition */
  source1: { x: number; y: number };
  /** Zweite Quellposition */
  source2: { x: number; y: number };
  /** Zielpunkt */
  target: { x: number; y: number };
  /** Abstand r1 */
  r1: number;
  /** Abstand r2 */
  r2: number;
  /** Gangunterschied delta_s */
  deltaS: number;
  /** Gangunterschied in Einheiten von lambda */
  deltaSLambda: number;
  /** Wellenlaenge */
  lambda: number;
}

export interface UseAnnotationsReturn {
  config: AnnotationsConfig;
  toggleLambdaArrow: () => void;
  toggleNodeLines: () => void;
  toggleWavefronts: () => void;
  togglePathDifference: () => void;
  /** Lambda-Pfeil-Daten (berechnet aus aktuellen Parametern) */
  lambdaArrowData: LambdaArrowData | null;
  /** Knotenlinien-Punkte (Grid-Scan: Orte mit z nahe 0 bei Mehrfachquellen) */
  nodeLinePoints: NodeLinePoint[];
  /** Wellenfront-Kreise fuer alle Quellen */
  wavefrontCircles: WavefrontCircle[];
  /** Gangunterschied-Daten (nur bei >= 2 Quellen + Zielpunkt) */
  pathDifferenceData: PathDifferenceData | null;
  /** Hinweis-Text (Grenzfaelle) */
  hint: string | null;
}

/**
 * Berechnet Knotenlinien-Punkte durch einen Grid-Scan.
 * Punkte mit |z| < threshold und Vorzeichenwechsel zu Nachbarn werden zurueckgegeben.
 */
function computeNodeLines(
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms,
  resolution: number = 40
): NodeLinePoint[] {
  if (sources.sourceCount < 2) return [];

  const points: NodeLinePoint[] = [];
  const step = (2 * FIELD_HALF_SIZE) / resolution;
  const threshold = 0.08;

  // Grid-basierter Scan: z-Werte berechnen und Nulldurchgaenge finden
  const grid: number[][] = [];
  for (let iy = 0; iy <= resolution; iy++) {
    grid[iy] = [];
    for (let ix = 0; ix <= resolution; ix++) {
      const x = -FIELD_HALF_SIZE + ix * step;
      const y = -FIELD_HALF_SIZE + iy * step;
      grid[iy][ix] = computeWaveZ(x, y, t, uniforms, sources);
    }
  }

  // Nulldurchgaenge finden (wo benachbarte Zellen unterschiedliches Vorzeichen haben)
  for (let iy = 0; iy < resolution; iy++) {
    for (let ix = 0; ix < resolution; ix++) {
      const z00 = grid[iy][ix];
      const z10 = grid[iy][ix + 1];
      const z01 = grid[iy + 1][ix];

      // Horizontaler Nulldurchgang
      if (z00 * z10 < 0) {
        const frac = Math.abs(z00) / (Math.abs(z00) + Math.abs(z10));
        const x = -FIELD_HALF_SIZE + (ix + frac) * step;
        const y = -FIELD_HALF_SIZE + iy * step;
        points.push({ x, y });
      }

      // Vertikaler Nulldurchgang
      if (z00 * z01 < 0) {
        const frac = Math.abs(z00) / (Math.abs(z00) + Math.abs(z01));
        const x = -FIELD_HALF_SIZE + ix * step;
        const y = -FIELD_HALF_SIZE + (iy + frac) * step;
        points.push({ x, y });
      }

      // Kleine Absolutwerte (nahe 0)
      if (Math.abs(z00) < threshold) {
        const x = -FIELD_HALF_SIZE + ix * step;
        const y = -FIELD_HALF_SIZE + iy * step;
        points.push({ x, y });
      }
    }
  }

  return points;
}

/**
 * Berechnet Wellenfront-Kreise (Isophasenlinien).
 * Fuer Punkt-Quellen: konzentrische Kreise im Abstand lambda.
 * Fuer Balken-Quellen: parallele Linien (wird im Rendering behandelt).
 */
function computeWavefrontCircles(
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms,
  maxRadius: number = FIELD_HALF_SIZE * 1.5
): WavefrontCircle[] {
  const circles: WavefrontCircle[] = [];

  for (let i = 0; i < sources.sourceCount; i++) {
    const pos = sources.sourcePositions[i];
    if (!pos) continue;

    const k = uniforms.waveNumbers[i];
    const omega = uniforms.angularFreqs[i];
    if (k <= 0) continue;

    const lambda = (2 * Math.PI) / k;
    const waveSpeed = omega / k;
    const wavefrontMaxR = waveSpeed * t;

    // Kreise bei ganzzahligen Vielfachen von lambda (Wellenberge)
    let r = lambda;
    while (r < Math.min(maxRadius, wavefrontMaxR + lambda)) {
      if (r <= wavefrontMaxR && r > 0) {
        circles.push({ cx: pos.x, cy: pos.y, radius: r });
      }
      r += lambda;
    }
  }

  return circles;
}

export function useAnnotations(
  waveUniformArrays: WaveUniformArrays | undefined,
  sourceUniforms: SourceUniforms | undefined,
  currentTime: number,
  probeTarget?: { x: number; y: number } | null,
): UseAnnotationsReturn {
  const [config, setConfig] = useState<AnnotationsConfig>({
    showLambdaArrow: false,
    showNodeLines: false,
    showWavefronts: false,
    showPathDifference: false,
  });

  const toggleLambdaArrow = useCallback(() => {
    setConfig((prev) => ({ ...prev, showLambdaArrow: !prev.showLambdaArrow }));
  }, []);

  const toggleNodeLines = useCallback(() => {
    setConfig((prev) => ({ ...prev, showNodeLines: !prev.showNodeLines }));
  }, []);

  const toggleWavefronts = useCallback(() => {
    setConfig((prev) => ({ ...prev, showWavefronts: !prev.showWavefronts }));
  }, []);

  const togglePathDifference = useCallback(() => {
    setConfig((prev) => ({ ...prev, showPathDifference: !prev.showPathDifference }));
  }, []);

  // Lambda-Pfeil-Daten
  const lambdaArrowData = useMemo<LambdaArrowData | null>(() => {
    if (!config.showLambdaArrow || !waveUniformArrays) return null;

    const k = waveUniformArrays.waveNumbers[0];
    if (k <= 0) return null;

    const lambda = (2 * Math.PI) / k;
    // Pfeil auf der X-Achse bei y = 0, von x = 0 bis x = lambda
    const startX = 0;
    const endX = Math.min(lambda, FIELD_HALF_SIZE);

    return {
      startX,
      endX,
      y: 0,
      lambda,
    };
  }, [config.showLambdaArrow, waveUniformArrays]);

  // Knotenlinien (nur bei aktiver Annotation, > 1 Quelle, und nur bei Parameteraenderung berechnen)
  const nodeLinePoints = useMemo<NodeLinePoint[]>(() => {
    if (!config.showNodeLines || !waveUniformArrays || !sourceUniforms) return [];
    if (sourceUniforms.sourceCount < 2) return [];

    return computeNodeLines(currentTime, waveUniformArrays, sourceUniforms, 50);
  }, [config.showNodeLines, waveUniformArrays, sourceUniforms, currentTime]);

  // Wellenfront-Kreise
  const wavefrontCircles = useMemo<WavefrontCircle[]>(() => {
    if (!config.showWavefronts || !waveUniformArrays || !sourceUniforms) return [];

    return computeWavefrontCircles(currentTime, waveUniformArrays, sourceUniforms);
  }, [config.showWavefronts, waveUniformArrays, sourceUniforms, currentTime]);

  // Gangunterschied
  const pathDifferenceData = useMemo<PathDifferenceData | null>(() => {
    if (!config.showPathDifference || !waveUniformArrays || !sourceUniforms) return null;
    if (sourceUniforms.sourceCount < 2) return null;
    if (!probeTarget) return null;

    const s1 = sourceUniforms.sourcePositions[0];
    const s2 = sourceUniforms.sourcePositions[1];
    if (!s1 || !s2) return null;

    const r1 = Math.hypot(probeTarget.x - s1.x, probeTarget.y - s1.y);
    const r2 = Math.hypot(probeTarget.x - s2.x, probeTarget.y - s2.y);
    const deltaS = Math.abs(r1 - r2);

    const k = waveUniformArrays.waveNumbers[0];
    const lambda = k > 0 ? (2 * Math.PI) / k : 1;

    return {
      source1: { x: s1.x, y: s1.y },
      source2: { x: s2.x, y: s2.y },
      target: { x: probeTarget.x, y: probeTarget.y },
      r1,
      r2,
      deltaS,
      deltaSLambda: deltaS / lambda,
      lambda,
    };
  }, [config.showPathDifference, waveUniformArrays, sourceUniforms, probeTarget]);

  // Hinweis-Text fuer Grenzfaelle
  const hint = useMemo<string | null>(() => {
    const hints: string[] = [];

    if (config.showNodeLines && sourceUniforms && sourceUniforms.sourceCount < 2) {
      hints.push("Knotenlinien nur bei 2 oder mehr Quellen sichtbar.");
    }

    if (config.showPathDifference) {
      if (sourceUniforms && sourceUniforms.sourceCount < 2) {
        hints.push("Gangunterschied nur bei 2 oder mehr Quellen moeglich.");
      } else if (!probeTarget) {
        hints.push("Setze zuerst einen Sondenpunkt (Klick auf Wellenfeld).");
      }
    }

    const activeCount = [
      config.showLambdaArrow,
      config.showNodeLines,
      config.showWavefronts,
      config.showPathDifference,
    ].filter(Boolean).length;

    if (activeCount >= 4) {
      hints.push("Tipp: Nicht alle Annotationen gleichzeitig aktivieren.");
    }

    return hints.length > 0 ? hints.join(" ") : null;
  }, [config, sourceUniforms, probeTarget]);

  return {
    config,
    toggleLambdaArrow,
    toggleNodeLines,
    toggleWavefronts,
    togglePathDifference,
    lambdaArrowData,
    nodeLinePoints,
    wavefrontCircles,
    pathDifferenceData,
    hint,
  };
}
