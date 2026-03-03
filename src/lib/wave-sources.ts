/**
 * Wellenquellen: Typen, Defaults und Positionsberechnung
 *
 * Eine Wellenquelle ist der Ursprungspunkt/-form, von dem sich die Welle ausbreitet.
 * Mehrere Quellen erzeugen Interferenzmuster (Superpositionsprinzip).
 */

export const SOURCE_TYPES = ["POINT", "CIRCLE", "BAR", "TRIANGLE"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  POINT: "Punkt",
  CIRCLE: "Kreis",
  BAR: "Balken",
  TRIANGLE: "Dreieck",
};

export const SOURCE_TYPE_INT: Record<SourceType, number> = {
  POINT: 0,
  CIRCLE: 1,
  BAR: 2,
  TRIANGLE: 3,
};

export interface SourceConfig {
  type: SourceType;
  count: number;
  spacing: number;
}

export const DEFAULT_SOURCE_CONFIG: SourceConfig = {
  type: "POINT",
  count: 1,
  spacing: 2.0,
};

export const SOURCE_COUNT_MIN = 1;
export const SOURCE_COUNT_MAX = 8;
export const SOURCE_SPACING_MIN = 0.5;
export const SOURCE_SPACING_MAX = 10.0;

/** Plane-Groesse muss mit useWaveAnimation uebereinstimmen */
const PLANE_SIZE = 10;

/**
 * Berechnet die X-Positionen der Quellen (symmetrisch um 0).
 * Bei 1 Quelle: [0]
 * Bei 2 Quellen mit spacing d: [-d/2, +d/2]
 * Bei N Quellen mit spacing d: gleichmaessig verteilt, zentriert auf 0
 */
export function computeSourcePositions(
  count: number,
  spacing: number
): Array<{ x: number; y: number }> {
  if (count <= 1) return [{ x: 0, y: 0 }];

  const halfExtent = PLANE_SIZE / 2;
  const positions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * spacing;
    // Clamp auf Simulationsfeld
    positions.push({ x: Math.max(-halfExtent, Math.min(halfExtent, x)), y: 0 });
  }

  return positions;
}

/**
 * Prueft ob Quellen ausserhalb des Simulationsfeldes liegen.
 */
export function hasClippedSources(count: number, spacing: number): boolean {
  if (count <= 1) return false;
  const maxOffset = ((count - 1) / 2) * spacing;
  return maxOffset > PLANE_SIZE / 2;
}

export interface SourceUniforms {
  sourceType: number;
  sourceCount: number;
  sourcePositions: Array<{ x: number; y: number }>;
}

export function sourceConfigToUniforms(config: SourceConfig): SourceUniforms {
  return {
    sourceType: SOURCE_TYPE_INT[config.type],
    sourceCount: config.count,
    sourcePositions: computeSourcePositions(config.count, config.spacing),
  };
}
