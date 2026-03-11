"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CrossSectionPoint } from "@/lib/wave-math";

/** Schnittlinien-Farbe (Cyan) -- identisch zur 3D-Schnittlinie */
const CROSS_SECTION_COLOR = "hsl(180, 100%, 50%)";
const SOURCE_MARKER_COLOR = "hsl(30, 100%, 50%)";
const WALL_COLOR = "hsl(0, 0%, 60%)";

interface CrossSectionChartProps {
  /** Datenpunkte fuer die Kurve */
  data: CrossSectionPoint[];
  /** Orientierung (fuer Achsenbeschriftung) */
  orientation: "x" | "y";
  /** Quellpositionen entlang der Schnittachse (fuer gestrichelte Linien) */
  sourcePositionsAlongAxis: number[];
  /** Feste Y-Achsen-Grenzen [min, max] -- wenn undefined, automatisch */
  fixedYDomain?: [number, number];
  /** X-Position der Reflexionswand (nur bei Y-Schnitt relevant) */
  reflectionWallX?: number;
}

const chartConfig: ChartConfig = {
  z: {
    label: "z [m]",
    color: CROSS_SECTION_COLOR,
  },
};

/**
 * 2D-Liniendiagramm, das den Wellenquerschnitt darstellt.
 * Verwendet shadcn/ui Chart (Recharts) mit automatisch skalierter Y-Achse.
 */
export function CrossSectionChart({
  data,
  orientation,
  sourcePositionsAlongAxis,
  fixedYDomain,
  reflectionWallX,
}: CrossSectionChartProps) {
  // Y-Achsen-Domain: fixiert oder automatisch berechnet
  const yDomain = useMemo(() => {
    if (fixedYDomain) return fixedYDomain;

    if (data.length === 0) return [-1, 1] as [number, number];

    let min = 0;
    let max = 0;
    for (const point of data) {
      if (point.z < min) min = point.z;
      if (point.z > max) max = point.z;
    }

    // Etwas Puffer hinzufuegen (10%)
    const range = max - min;
    const padding = Math.max(range * 0.1, 0.05);
    return [min - padding, max + padding] as [number, number];
  }, [data, fixedYDomain]);

  // Bei fixierter Z-Achse: feste Tick-Positionen berechnen (5 gleichmaessige Schritte)
  // so dass sich weder Beschriftung noch Skalierung bei neuen Daten aendern
  const yTicks = useMemo(() => {
    if (!fixedYDomain) return undefined;
    const [lo, hi] = fixedYDomain;
    const step = (hi - lo) / 4;
    return [lo, lo + step, lo + 2 * step, lo + 3 * step, hi];
  }, [fixedYDomain]);

  const axisLabel = orientation === "x" ? "y [m]" : "x [m]";

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Keine Schnittdaten verfuegbar
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="coord"
          type="number"
          domain={[-5, 5]}
          tickCount={11}
          tick={{ fontSize: 11 }}
          label={{
            value: axisLabel,
            position: "insideBottomRight",
            offset: -4,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />
        <YAxis
          domain={yDomain}
          allowDataOverflow={!!fixedYDomain}
          ticks={yTicks}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={50}
          label={{
            value: "z [m]",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />

        {/* Nulllinie */}
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />

        {/* Reflexionswand */}
        {reflectionWallX !== undefined && (
          <ReferenceLine
            x={reflectionWallX}
            stroke={WALL_COLOR}
            strokeWidth={2}
            label={{
              value: "Wand",
              position: "top",
              fill: WALL_COLOR,
              fontSize: 10,
            }}
          />
        )}

        {/* Quellpositionen als gestrichelte Linien */}
        {sourcePositionsAlongAxis.map((pos, i) => (
          <ReferenceLine
            key={`source-${i}`}
            x={pos}
            stroke={SOURCE_MARKER_COLOR}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: `Q${i + 1}`,
              position: "top",
              fill: SOURCE_MARKER_COLOR,
              fontSize: 10,
            }}
          />
        ))}

        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => {
                const num = typeof value === "number" ? value : Number(value);
                return `z = ${num.toFixed(4)} m`;
              }}
            />
          }
        />

        <Line
          type="natural"
          dataKey="z"
          stroke={CROSS_SECTION_COLOR}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
