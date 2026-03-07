/**
 * CPU-seitige Wellenformel -- Nachbau des GLSL-Vertex-Shaders in TypeScript.
 *
 * Berechnet z(x, y, t) fuer beliebige Raumpunkte, damit das 2D-Schnittdiagramm
 * Datenpunkte erzeugen kann, ohne die GPU auslesen zu muessen.
 *
 * Die Physik ist identisch zum Shader:
 *   z_i(x,y,t) = A_i * exp(-d_i * r) * sin(k_i * r - omega_i * t + phi_i)
 *   z_total = sum_i z_i
 */

import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";

// Quellenform-Konstanten (identisch zum Shader)
const CIRCLE_RADIUS = 1.0;
const BAR_HALF_LENGTH = 2.0;
const TRI_SIZE = 1.5;

/** Abstand eines Punktes p zu einer Strecke a-b */
function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const dot = abx * abx + aby * aby;
  if (dot === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / dot));
  const projX = ax + t * abx;
  const projY = ay + t * aby;
  return Math.hypot(px - projX, py - projY);
}

/** Berechnet den Abstand r eines Punktes (px, py) zur Quelle, abhaengig vom Quellentyp. */
function distanceToSource(
  px: number,
  py: number,
  srcX: number,
  srcY: number,
  sourceType: number
): number {
  const relX = px - srcX;
  const relY = py - srcY;

  if (sourceType === 0) {
    // POINT
    return Math.hypot(relX, relY);
  } else if (sourceType === 1) {
    // CIRCLE
    return Math.abs(Math.hypot(relX, relY) - CIRCLE_RADIUS);
  } else if (sourceType === 2) {
    // BAR (vertikale Linienstrecke)
    const clampedY = Math.max(-BAR_HALF_LENGTH, Math.min(BAR_HALF_LENGTH, relY));
    return Math.hypot(relX, relY - clampedY);
  } else {
    // TRIANGLE (gleichseitig)
    const ax = srcX;
    const ay = srcY + TRI_SIZE;
    const bx = srcX - TRI_SIZE * 0.866;
    const by = srcY - TRI_SIZE * 0.5;
    const cx = srcX + TRI_SIZE * 0.866;
    const cy = srcY - TRI_SIZE * 0.5;
    const d1 = distToSegment(px, py, ax, ay, bx, by);
    const d2 = distToSegment(px, py, bx, by, cx, cy);
    const d3 = distToSegment(px, py, cx, cy, ax, ay);
    return Math.min(d1, d2, d3);
  }
}

/** Z-History fuer mausgesteuerte Wellenausbreitung (PROJ-16, CPU-seitig) */
export interface MouseWaveHistory {
  /** Index der mausgesteuerten Quelle (0..7) */
  sourceIndex: number;
  /** Ringpuffer der letzten 256 Z-Werte */
  buffer: Float32Array;
  /** Index des juengsten Samples im Ringpuffer */
  head: number;
  /** Zeitintervall zwischen Samples in Sekunden */
  dt: number;
}

/** Reflexions-Parameter fuer CPU-seitige Berechnung */
export interface ReflectionParams {
  isActive: boolean;
  wallX: number;
  endType: "fixed" | "free";
  displayMode: "total" | "incident" | "reflected";
}

/**
 * Berechnet die Wellenauslenkung z an einem einzelnen Punkt (x, y) zum Zeitpunkt t.
 *
 * @param x           X-Koordinate in Metern
 * @param y           Y-Koordinate in Metern
 * @param t           Zeit in Sekunden
 * @param uniforms    Wellenparameter-Arrays (Laenge 16)
 * @param sources     Quelleninformationen (Typ, Anzahl, Positionen)
 * @param reflection  Optionale Reflexionsparameter (PROJ-15)
 * @returns           Auslenkung z in Metern
 */
export function computeWaveZ(
  x: number,
  y: number,
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms,
  reflection?: ReflectionParams,
  mouseWaveHistory?: MouseWaveHistory
): number {
  let z = 0;

  // Einfallende Welle berechnen
  if (!reflection?.isActive || reflection.displayMode !== "reflected") {
    for (let i = 0; i < sources.sourceCount; i++) {
      // PROJ-16: Sinuswelle fuer mausgesteuerte Quelle ueberspringen
      if (mouseWaveHistory && i === mouseWaveHistory.sourceIndex) continue;

      const pos = sources.sourcePositions[i];
      if (!pos) continue;

      // BUG-3 Fix: Wand-Clipping -- einfallende Welle nur auf Quellenseite
      if (reflection?.isActive) {
        const sourceIsLeft = pos.x < reflection.wallX;
        const pointIsLeft = x < reflection.wallX;
        if (sourceIsLeft !== pointIsLeft) continue;
      }

      const r2d = distanceToSource(x, y, pos.x, pos.y, sources.sourceType);
      const r = r2d;
      const envelope = Math.exp(-uniforms.dampings[i] * r);

      const waveSpeed = uniforms.angularFreqs[i] / Math.max(uniforms.waveNumbers[i], 0.001);
      const wavefrontR = waveSpeed * t;
      const smoothstepVal = r <= wavefrontR - 0.3 ? 0 : r >= wavefrontR + 0.1 ? 1 : (() => {
        const t2 = (r - (wavefrontR - 0.3)) / 0.4;
        return t2 * t2 * (3 - 2 * t2);
      })();
      const mask = 1 - smoothstepVal;

      z +=
        uniforms.amplitudes[i] *
        envelope *
        Math.sin(
          uniforms.waveNumbers[i] * r -
            uniforms.angularFreqs[i] * t +
            uniforms.phases[i]
        ) *
        mask;
    }
  }

  // Reflektierte Welle berechnen (Spiegelquellen-Methode)
  if (reflection?.isActive && reflection.displayMode !== "incident") {
    const phaseShift = reflection.endType === "fixed" ? Math.PI : 0;

    for (let i = 0; i < sources.sourceCount; i++) {
      // PROJ-16: Sinuswelle fuer mausgesteuerte Quelle ueberspringen (History behandelt Reflexion)
      if (mouseWaveHistory && i === mouseWaveHistory.sourceIndex) continue;

      const pos = sources.sourcePositions[i];
      if (!pos) continue;

      // Spiegelposition
      const mirrorX = 2 * reflection.wallX - pos.x;
      const mirrorY = pos.y;

      // BUG-3 Fix: Wand-Clipping -- reflektierte Welle nur auf Originalquellenseite
      // Spiegelquelle ist auf der Gegenseite -> reflektierte Welle auf der Originalseite
      const mirrorIsLeft = mirrorX < reflection.wallX;
      const pointIsLeft = x < reflection.wallX;
      if (mirrorIsLeft === pointIsLeft) continue;

      const r2dMirror = distanceToSource(x, y, mirrorX, mirrorY, sources.sourceType);
      const r = r2dMirror;
      const envelope = Math.exp(-uniforms.dampings[i] * r);

      const waveSpeed = uniforms.angularFreqs[i] / Math.max(uniforms.waveNumbers[i], 0.001);
      const wavefrontR = waveSpeed * t;
      const smoothstepVal = r <= wavefrontR - 0.3 ? 0 : r >= wavefrontR + 0.1 ? 1 : (() => {
        const t2 = (r - (wavefrontR - 0.3)) / 0.4;
        return t2 * t2 * (3 - 2 * t2);
      })();
      const mask = 1 - smoothstepVal;

      z +=
        uniforms.amplitudes[i] *
        envelope *
        Math.sin(
          uniforms.waveNumbers[i] * r -
            uniforms.angularFreqs[i] * t +
            uniforms.phases[i] + phaseShift
        ) *
        mask;
    }
  }

  // PROJ-16: Direkte Oberflaechendeformation durch Quellenhoehe (Gauss-Bump)
  const bumpWidth = 0.8;
  const bumpFactor = 1 / (2 * bumpWidth * bumpWidth);
  for (let i = 0; i < sources.sourceCount; i++) {
    // Gauss-Bump fuer mausgesteuerte Quelle ueberspringen (History ersetzt ihn)
    if (mouseWaveHistory && i === mouseWaveHistory.sourceIndex) continue;
    const sz = sources.sourceZ?.[i] ?? 0;
    if (Math.abs(sz) > 0.01) {
      const pos = sources.sourcePositions[i];
      if (!pos) continue;
      const rd = distanceToSource(x, y, pos.x, pos.y, sources.sourceType);
      z += sz * Math.exp(-rd * rd * bumpFactor);
    }
  }

  // PROJ-16: Mausgesteuerte Wellenausbreitung aus Z-History-Ringpuffer
  // (einfallende + reflektierte Welle)
  if (mouseWaveHistory) {
    const srcIdx = mouseWaveHistory.sourceIndex;
    const pos = sources.sourcePositions[srcIdx];
    if (pos) {
      const trackWaveSpeed = (uniforms.angularFreqs[srcIdx] ?? 1) / Math.max(uniforms.waveNumbers[srcIdx] ?? 1, 0.001);

      // Hilfsfunktion: Z-History mit linearer Interpolation abtasten
      // Bei Ueberschreitung des Puffers: aeltesten Wert verwenden (kein Abriss)
      const sampleHistory = (dist: number): number => {
        const travelTime = dist / Math.max(trackWaveSpeed, 0.1);
        const samplesBackF = travelTime / Math.max(mouseWaveHistory.dt, 0.0001);
        // Auf Pufferbereich begrenzen -- entfernte Punkte erhalten den aeltesten Wert
        const clampedF = Math.min(Math.max(samplesBackF, 0), 255);
        const s0 = Math.floor(clampedF);
        const frac = clampedF - s0;
        if (s0 >= 255) {
          // Aeltester Wert im Puffer
          let idx = mouseWaveHistory.head - 255;
          if (idx < 0) idx += 256;
          return mouseWaveHistory.buffer[idx] ?? 0;
        }
        let idx0 = mouseWaveHistory.head - s0;
        if (idx0 < 0) idx0 += 256;
        let idx1 = mouseWaveHistory.head - (s0 + 1);
        if (idx1 < 0) idx1 += 256;
        const z0 = mouseWaveHistory.buffer[idx0] ?? 0;
        const z1 = mouseWaveHistory.buffer[idx1] ?? 0;
        return z0 + frac * (z1 - z0);
      };

      // Einfallende History-Welle
      if (!reflection?.isActive || reflection.displayMode !== "reflected") {
        const doEmit = !reflection?.isActive || (() => {
          const sourceIsLeft = pos.x < reflection!.wallX;
          const pointIsLeft = x < reflection!.wallX;
          return sourceIsLeft === pointIsLeft;
        })();
        if (doEmit) {
          const r = distanceToSource(x, y, pos.x, pos.y, sources.sourceType);
          const historicZ = sampleHistory(r);
          z += historicZ;
        }
      }

      // Reflektierte History-Welle (Spiegelquellen-Methode)
      if (reflection?.isActive && reflection.displayMode !== "incident") {
        const mirrorX = 2 * reflection.wallX - pos.x;
        const mirrorY = pos.y;
        const mirrorIsLeft = mirrorX < reflection.wallX;
        const pointIsLeft = x < reflection.wallX;
        if (mirrorIsLeft !== pointIsLeft) {
          const rMirror = distanceToSource(x, y, mirrorX, mirrorY, sources.sourceType);
          const historicZ = sampleHistory(rMirror);
          const sign = reflection.endType === "fixed" ? -1 : 1;
          z += sign * historicZ;
        }
      }
    }
  }

  return z;
}

/** Feld-Grenzen (identisch zu PLANE_SIZE in useWaveAnimation) */
export const FIELD_HALF_SIZE = 5;

// --- Intensitaetsschirm (PROJ-9) ---

/** Datenpunkt im Intensitaetsschirm-Diagramm */
export interface IntensityPoint {
  /** Y-Position auf dem Schirm in Metern */
  y: number;
  /** Normierte Intensitaet (0 bis 1) */
  intensity: number;
  /** Ob dieser Punkt ein lokales Maximum ist */
  isMaximum: boolean;
}

/**
 * Berechnet das Intensitaetsprofil entlang einer vertikalen Schirmlinie
 * bei einer gegebenen X-Position.
 *
 * @param screenX    X-Position des Schirms in Metern
 * @param t          Aktuelle Zeit in Sekunden
 * @param uniforms   Wellenparameter-Arrays
 * @param sources    Quelleninformationen
 * @param numPoints  Anzahl der Stuetzstellen (Default: 200)
 * @returns          Array von Intensitaetspunkten mit Maxima-Markierungen
 */
export function calculateIntensityProfile(
  screenX: number,
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms,
  numPoints: number = 200,
  reflection?: ReflectionParams,
  mouseWaveHistory?: MouseWaveHistory
): IntensityPoint[] {
  const step = (2 * FIELD_HALF_SIZE) / (numPoints - 1);

  // 1. z-Werte berechnen und instantane Intensitaet: I = z^2
  const rawIntensities: number[] = [];
  const yPositions: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const y = -FIELD_HALF_SIZE + i * step;
    const z = computeWaveZ(screenX, y, t, uniforms, sources, reflection, mouseWaveHistory);
    yPositions.push(y);
    rawIntensities.push(z * z);
  }

  // 2. Normierung auf Maximum
  let maxIntensity = 0;
  for (const val of rawIntensities) {
    if (val > maxIntensity) maxIntensity = val;
  }
  const normFactor = maxIntensity > 1e-10 ? 1 / maxIntensity : 0;

  // 3. Normierte Werte und Maxima bestimmen
  const points: IntensityPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const intensity = rawIntensities[i] * normFactor;

    // Lokales Maximum: hoeher als beide Nachbarn und ueber Schwellwert
    let isMaximum = false;
    if (i > 0 && i < numPoints - 1 && intensity > 0.1) {
      const prev = rawIntensities[i - 1] * normFactor;
      const next = rawIntensities[i + 1] * normFactor;
      if (intensity > prev && intensity > next) {
        isMaximum = true;
      }
    }

    points.push({
      y: yPositions[i],
      intensity,
      isMaximum,
    });
  }

  // 4. Maxima aufsduennen: nur echte Hauptmaxima behalten (Mindestabstand 5 Punkte)
  const maxima = points.filter((p) => p.isMaximum);
  if (maxima.length > 20) {
    // Zu viele Maxima -> nur die staerksten behalten
    const sorted = [...maxima].sort((a, b) => b.intensity - a.intensity);
    const topMaxima = new Set(sorted.slice(0, 15).map((p) => p.y));
    for (const point of points) {
      if (point.isMaximum && !topMaxima.has(point.y)) {
        point.isMaximum = false;
      }
    }
  }

  return points;
}

/**
 * Berechnet zeitgemittelte Intensitaet aus einem Ringpuffer von z^2-Werten.
 *
 * @param buffer     Ringpuffer: Array von Arrays (pro Frame je numPoints z^2-Werte)
 * @param numPoints  Anzahl der Stuetzstellen
 * @param screenX    Aktuelle Schirmposition (fuer y-Koordinaten)
 * @returns          Array von Intensitaetspunkten (zeitgemittelt)
 */
export function calculateTimeAveragedIntensity(
  buffer: number[][],
  numPoints: number,
  screenX: number
): IntensityPoint[] {
  if (buffer.length === 0) return [];

  const step = (2 * FIELD_HALF_SIZE) / (numPoints - 1);
  const avgIntensities: number[] = new Array(numPoints).fill(0);

  // Durchschnitt ueber alle Frames im Puffer
  for (const frame of buffer) {
    for (let i = 0; i < numPoints; i++) {
      avgIntensities[i] += (frame[i] ?? 0);
    }
  }
  const frameCount = buffer.length;
  for (let i = 0; i < numPoints; i++) {
    avgIntensities[i] /= frameCount;
  }

  // Normierung auf Maximum
  let maxVal = 0;
  for (const val of avgIntensities) {
    if (val > maxVal) maxVal = val;
  }
  const normFactor = maxVal > 1e-10 ? 1 / maxVal : 0;

  const points: IntensityPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const y = -FIELD_HALF_SIZE + i * step;
    const intensity = avgIntensities[i] * normFactor;

    let isMaximum = false;
    if (i > 0 && i < numPoints - 1 && intensity > 0.1) {
      const prev = avgIntensities[i - 1] * normFactor;
      const next = avgIntensities[i + 1] * normFactor;
      if (intensity > prev && intensity > next) {
        isMaximum = true;
      }
    }

    points.push({ y, intensity, isMaximum });
  }

  // Maxima aufsduennen
  const maxima = points.filter((p) => p.isMaximum);
  if (maxima.length > 20) {
    const sorted = [...maxima].sort((a, b) => b.intensity - a.intensity);
    const topMaxima = new Set(sorted.slice(0, 15).map((p) => p.y));
    for (const point of points) {
      if (point.isMaximum && !topMaxima.has(point.y)) {
        point.isMaximum = false;
      }
    }
  }

  return points;
}

/** Datenpunkt im Schnittdiagramm */
export interface CrossSectionPoint {
  coord: number;
  z: number;
}

/**
 * Erzeugt ein Array von Datenpunkten entlang einer Schnittlinie.
 *
 * @param orientation  'x' = Schnitt senkrecht zur X-Achse (variiert y), 'y' = senkrecht zur Y-Achse (variiert x)
 * @param position     Position der Ebene in Metern (wo die Ebene die Normalenachse schneidet)
 * @param t            Aktuelle Zeit
 * @param uniforms     Wellenparameter
 * @param sources      Quellenparameter
 * @param numPoints    Anzahl der Datenpunkte (Default: 200)
 */
export function computeCrossSectionData(
  orientation: "x" | "y",
  position: number,
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms,
  numPoints: number = 400,
  reflection?: ReflectionParams,
  mouseWaveHistory?: MouseWaveHistory
): CrossSectionPoint[] {
  const points: CrossSectionPoint[] = [];
  const step = (2 * FIELD_HALF_SIZE) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const coord = -FIELD_HALF_SIZE + i * step;

    // Bei X-Schnitt: Ebene senkrecht zur X-Achse bei x=position, wir variieren y
    // Bei Y-Schnitt: Ebene senkrecht zur Y-Achse bei y=position, wir variieren x
    const x = orientation === "x" ? position : coord;
    const y = orientation === "x" ? coord : position;

    points.push({
      coord,
      z: computeWaveZ(x, y, t, uniforms, sources, reflection, mouseWaveHistory),
    });
  }

  return points;
}
