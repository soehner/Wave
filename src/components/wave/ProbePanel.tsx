"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trash2 } from "lucide-react";
import { ProbeChart } from "./ProbeChart";
import type { Probe, ProbeDataPoint } from "@/hooks/useProbeData";

interface ProbePanelProps {
  probes: Probe[];
  chartData: ProbeDataPoint[];
  onRemoveProbe: (id: string) => void;
  onRemoveAll: () => void;
}

/**
 * Panel fuer die Punkt-Sonden-Analyse.
 * Zeigt Sondenleiste (Koordinaten + Farbe + X-Button) und das Zeitverlaufsdiagramm.
 */
export function ProbePanel({
  probes,
  chartData,
  onRemoveProbe,
  onRemoveAll,
}: ProbePanelProps) {
  return (
    <div
      className="flex flex-col h-full border-t bg-background"
      role="region"
      aria-label="Punkt-Sonden-Analyse"
    >
      {/* Sondenleiste */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Sonden:
        </span>
        {probes.map((probe) => (
          <Badge
            key={probe.id}
            variant="outline"
            className="gap-1.5 pr-1"
            style={{ borderColor: probe.color }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: probe.color }}
            />
            <span className="text-xs font-mono tabular-nums">
              ({probe.x.toFixed(1)}, {probe.y.toFixed(1)})
            </span>
            <button
              onClick={() => onRemoveProbe(probe.id)}
              className="ml-0.5 rounded-sm p-0.5 hover:bg-muted transition-colors"
              aria-label={`Sonde bei (${probe.x.toFixed(1)}, ${probe.y.toFixed(1)}) entfernen`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveAll}
          className="gap-1 ml-auto h-7 text-xs"
        >
          <Trash2 className="h-3 w-3" />
          Alle entfernen
        </Button>
      </div>

      {/* Diagramm */}
      <div className="flex-1 min-h-0 px-2 py-1">
        <ProbeChart data={chartData} probes={probes} />
      </div>
    </div>
  );
}
