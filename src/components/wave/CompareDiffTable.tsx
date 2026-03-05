"use client";

import { Badge } from "@/components/ui/badge";
import { PARAMETER_CONFIGS } from "@/lib/wave-params";
import type { WaveParams } from "@/lib/wave-params";
import type { SourceConfig } from "@/lib/wave-sources";
import { SOURCE_TYPE_LABELS } from "@/lib/wave-sources";

interface CompareDiffTableProps {
  paramsA: WaveParams;
  paramsB: WaveParams;
  sourceConfigA: SourceConfig;
  sourceConfigB: SourceConfig;
}

/**
 * Parameterdifferenz-Tabelle fuer den Vergleichsmodus.
 * Zeigt alle Parameter beider Panels und hebt Unterschiede farblich hervor.
 */
export function CompareDiffTable({
  paramsA,
  paramsB,
  sourceConfigA,
  sourceConfigB,
}: CompareDiffTableProps) {
  const rows: Array<{
    label: string;
    unit: string;
    valueA: string;
    valueB: string;
    isDifferent: boolean;
  }> = [];

  // Wellenparameter
  for (const config of PARAMETER_CONFIGS) {
    const valA = paramsA[config.key];
    const valB = paramsB[config.key];
    const isDifferent = Math.abs(valA - valB) > 1e-6;
    rows.push({
      label: `${config.label} (${config.symbol})`,
      unit: config.unit,
      valueA: valA.toFixed(config.precision),
      valueB: valB.toFixed(config.precision),
      isDifferent,
    });
  }

  // Quellenparameter
  const sourceTypeDiff = sourceConfigA.type !== sourceConfigB.type;
  rows.push({
    label: "Quellenform",
    unit: "",
    valueA: SOURCE_TYPE_LABELS[sourceConfigA.type],
    valueB: SOURCE_TYPE_LABELS[sourceConfigB.type],
    isDifferent: sourceTypeDiff,
  });

  const sourceCountDiff = sourceConfigA.count !== sourceConfigB.count;
  rows.push({
    label: "Quellenanzahl",
    unit: "",
    valueA: String(sourceConfigA.count),
    valueB: String(sourceConfigB.count),
    isDifferent: sourceCountDiff,
  });

  const spacingDiff = Math.abs(sourceConfigA.spacing - sourceConfigB.spacing) > 0.01;
  rows.push({
    label: "Quellenabstand",
    unit: "m",
    valueA: sourceConfigA.spacing.toFixed(1),
    valueB: sourceConfigB.spacing.toFixed(1),
    isDifferent: spacingDiff,
  });

  const hasDifferences = rows.some((r) => r.isDifferent);

  return (
    <div className="border-t bg-background px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Parametervergleich
        </h3>
        {!hasDifferences && (
          <span className="text-xs text-muted-foreground">Identisch</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" aria-label="Parametervergleich zwischen Panel A und Panel B">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-3 font-medium text-muted-foreground">Parameter</th>
              <th className="text-right py-1 px-3 font-medium text-muted-foreground">Panel A</th>
              <th className="text-right py-1 pl-3 font-medium text-muted-foreground">Panel B</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={row.isDifferent ? "bg-amber-50/50" : ""}
              >
                <td className="py-1 pr-3 font-medium">{row.label}</td>
                <td className="text-right py-1 px-3 font-mono tabular-nums">
                  {row.isDifferent ? (
                    <Badge variant="outline" className="font-mono text-xs px-1.5 py-0 border-blue-300 text-blue-700">
                      {row.valueA}{row.unit ? ` ${row.unit}` : ""}
                    </Badge>
                  ) : (
                    <span>{row.valueA}{row.unit ? ` ${row.unit}` : ""}</span>
                  )}
                </td>
                <td className="text-right py-1 pl-3 font-mono tabular-nums">
                  {row.isDifferent ? (
                    <Badge variant="outline" className="font-mono text-xs px-1.5 py-0 border-orange-300 text-orange-700">
                      {row.valueB}{row.unit ? ` ${row.unit}` : ""}
                    </Badge>
                  ) : (
                    <span>{row.valueB}{row.unit ? ` ${row.unit}` : ""}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
