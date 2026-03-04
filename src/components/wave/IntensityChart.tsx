"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
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
import type { IntensityPoint } from "@/lib/wave-math";

/** Farbe fuer die Intensitaetskurve (Orange-Rot, passend zum Physik-Kontext) */
const INTENSITY_COLOR = "hsl(20, 90%, 55%)";
const MAXIMA_COLOR = "hsl(45, 100%, 50%)";

interface IntensityChartProps {
  /** Datenpunkte fuer die Kurve */
  data: IntensityPoint[];
}

const chartConfig: ChartConfig = {
  intensity: {
    label: "I (normiert)",
    color: INTENSITY_COLOR,
  },
};

/**
 * Flaechendiagramm fuer das Intensitaetsprofil entlang des Schirms.
 * Y-Achse: Position y in Metern, X-Achse: normierte Intensitaet (0 bis 1).
 *
 * Da Recharts standardmaessig horizontal ist, nutzen wir ein Layout
 * mit "y" als XAxis (horizontal) und "intensity" als YAxis (vertikal).
 * So sieht der Benutzer die Intensitaet von links nach rechts aufgetragen.
 */
export function IntensityChart({ data }: IntensityChartProps) {
  // Maxima aus den Daten extrahieren
  const maxima = useMemo(() => {
    return data.filter((p) => p.isMaximum);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Keine Intensitaetsdaten verfuegbar
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
      >
        <defs>
          <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INTENSITY_COLOR} stopOpacity={0.6} />
            <stop offset="100%" stopColor={INTENSITY_COLOR} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

        <XAxis
          dataKey="y"
          type="number"
          domain={[-5, 5]}
          tickCount={11}
          tick={{ fontSize: 11 }}
          label={{
            value: "y [m]",
            position: "insideBottomRight",
            offset: -4,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />

        <YAxis
          domain={[0, 1.05]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(1)}
          width={40}
          label={{
            value: "I (norm.)",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />

        {/* Maxima als gestrichelte Linien mit Koordinaten-Beschriftung */}
        {maxima.map((m, i) => (
          <ReferenceLine
            key={`max-${i}`}
            x={m.y}
            stroke={MAXIMA_COLOR}
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{
              value: `${m.y.toFixed(1)} m`,
              position: "top",
              fill: MAXIMA_COLOR,
              fontSize: 9,
            }}
          />
        ))}

        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => {
                if (name === "intensity") {
                  const num = typeof value === "number" ? value : Number(value);
                  return `I = ${num.toFixed(3)}`;
                }
                return String(value);
              }}
            />
          }
        />

        <Area
          type="monotone"
          dataKey="intensity"
          stroke={INTENSITY_COLOR}
          strokeWidth={2}
          fill="url(#intensityGradient)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
