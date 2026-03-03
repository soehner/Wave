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

/**
 * Berechnet die Wellenauslenkung z an einem einzelnen Punkt (x, y) zum Zeitpunkt t.
 *
 * @param x         X-Koordinate in Metern
 * @param y         Y-Koordinate in Metern
 * @param t         Zeit in Sekunden
 * @param uniforms  Wellenparameter-Arrays (Laenge 8)
 * @param sources   Quelleninformationen (Typ, Anzahl, Positionen)
 * @returns         Auslenkung z in Metern
 */
export function computeWaveZ(
  x: number,
  y: number,
  t: number,
  uniforms: WaveUniformArrays,
  sources: SourceUniforms
): number {
  let z = 0;

  for (let i = 0; i < sources.sourceCount; i++) {
    const pos = sources.sourcePositions[i];
    if (!pos) continue;

    const r = distanceToSource(x, y, pos.x, pos.y, sources.sourceType);
    const envelope = Math.exp(-uniforms.dampings[i] * r);

    // Wellenfront: Welle breitet sich mit v = omega/k aus
    const waveSpeed = uniforms.angularFreqs[i] / Math.max(uniforms.waveNumbers[i], 0.001);
    const wavefrontR = waveSpeed * t;
    // smoothstep(edge0, edge1, x): 0 wenn x < edge0, 1 wenn x > edge1
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

  return z;
}

/** Feld-Grenzen (identisch zu PLANE_SIZE in useWaveAnimation) */
export const FIELD_HALF_SIZE = 5;

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
  numPoints: number = 200
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
      z: computeWaveZ(x, y, t, uniforms, sources),
    });
  }

  return points;
}
