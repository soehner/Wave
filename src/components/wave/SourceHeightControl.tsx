"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mouse, RotateCcw, AlertTriangle } from "lucide-react";

interface SourceHeightControlProps {
  /** Index der aktiven Quelle */
  activeSourceIndex: number;
  /** Anzahl der Quellen */
  sourceCount: number;
  /** Z-Hoehe der aktiven Quelle */
  activeZ: number;
  /** Mausverfolgung aktiv? */
  isMouseTrackingActive: boolean;
  /** Mausverfolgung umschalten */
  onToggleMouseTracking: () => void;
  /** Z-Hoehe der aktiven Quelle zuruecksetzen */
  onResetZ: () => void;
  /** Aktive Quelle wechseln */
  onActiveSourceChange: (index: number) => void;
  /** Top-Down-Ansicht aktiv? (Z-Steuerung nicht sinnvoll) */
  is2DView?: boolean;
}

export function SourceHeightControl({
  activeSourceIndex,
  sourceCount,
  activeZ,
  isMouseTrackingActive,
  onToggleMouseTracking,
  onResetZ,
  onActiveSourceChange,
  is2DView,
}: SourceHeightControlProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quellenhoehe (Z)
        </span>
        <Badge
          variant="secondary"
          className="font-mono text-xs tabular-nums"
          aria-label={`Z-Hoehe: ${activeZ.toFixed(1)} Meter`}
        >
          {activeZ.toFixed(1)} m
        </Badge>
      </div>

      {/* Top-Down-Hinweis */}
      {is2DView && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800">
            Z-Steuerung in Draufsicht nicht verfuegbar
          </p>
        </div>
      )}

      {/* Aktive Quelle waehlen (nur bei mehreren Quellen) */}
      {sourceCount > 1 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Aktive Quelle</span>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: sourceCount }, (_, i) => (
              <Button
                key={i}
                variant={activeSourceIndex === i ? "default" : "outline"}
                size="sm"
                className="h-6 w-6 p-0 text-xs"
                onClick={() => onActiveSourceChange(i)}
                aria-label={`Quelle ${i + 1} auswaehlen`}
                aria-pressed={activeSourceIndex === i}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle + Reset */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMouseTrackingActive ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-1.5 text-xs h-8"
                onClick={onToggleMouseTracking}
                disabled={is2DView}
                aria-label={
                  isMouseTrackingActive
                    ? "Mausverfolgung deaktivieren"
                    : "Mausverfolgung aktivieren"
                }
                aria-pressed={isMouseTrackingActive}
              >
                <Mouse className="h-3.5 w-3.5" />
                {isMouseTrackingActive ? "Maus aktiv" : "Mausverfolgung"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs max-w-[200px]">
                Vertikale Mausbewegung ueber dem 3D-Canvas steuert die Z-Hoehe der aktiven Quelle.
                Kameradrehung wird waehrenddessen deaktiviert.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onResetZ}
                disabled={activeZ === 0}
                aria-label="Z-Hoehe auf 0 zuruecksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Z auf 0 zuruecksetzen
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Aktiver Modus Hinweis */}
      {isMouseTrackingActive && !is2DView && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
          Maus hoch/runter bewegen um Z zu aendern. Kameradrehung ist deaktiviert.
        </p>
      )}
    </div>
  );
}
