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
  type ChartConfig,
} from "@/components/ui/chart";
import type { Probe, ProbeDataPoint } from "@/hooks/useProbeData";
import { PROBE_COLORS } from "@/hooks/useProbeData";

interface ProbeChartProps {
  data: ProbeDataPoint[];
  probes: Probe[];
}

/**
 * Recharts LineChart fuer den Zeitverlauf z(t) der Punkt-Sonden.
 * Zeigt bis zu 3 farbige Linien (eine pro Sonde).
 */
export function ProbeChart({ data, probes }: ProbeChartProps) {
  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    for (const probe of probes) {
      config[probe.id] = {
        label: `(${probe.x.toFixed(1)}, ${probe.y.toFixed(1)})`,
        color: probe.color,
      };
    }
    return config;
  }, [probes]);

  // Y-Achsen-Domain automatisch berechnen
  const yDomain = useMemo(() => {
    if (data.length === 0) return [-1, 1] as [number, number];

    let min = 0;
    let max = 0;
    for (const point of data) {
      for (const probe of probes) {
        const val = point[probe.id];
        if (typeof val === "number") {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    const range = max - min;
    const padding = Math.max(range * 0.1, 0.05);
    return [min - padding, max + padding] as [number, number];
  }, [data, probes]);

  // X-Achsen-Domain (rollendes Fenster)
  const xDomain = useMemo(() => {
    if (data.length === 0) return [0, 5] as [number, number];
    const lastT = data[data.length - 1].t;
    const startT = Math.max(0, lastT - 5);
    return [startT, Math.max(startT + 5, lastT)] as [number, number];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Warte auf Daten...
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
          dataKey="t"
          type="number"
          domain={xDomain}
          tickCount={6}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(1)}
          label={{
            value: "t [s]",
            position: "insideBottomRight",
            offset: -4,
            style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
          }}
        />
        <YAxis
          domain={yDomain}
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

        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />

        {probes.map((probe, i) => (
          <Line
            key={probe.id}
            type="monotone"
            dataKey={probe.id}
            stroke={PROBE_COLORS[i] || probe.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
