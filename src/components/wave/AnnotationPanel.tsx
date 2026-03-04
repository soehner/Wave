"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { AnnotationsConfig } from "@/hooks/useAnnotations";

interface AnnotationPanelProps {
  config: AnnotationsConfig;
  onToggleLambdaArrow: () => void;
  onToggleNodeLines: () => void;
  onToggleWavefronts: () => void;
  onTogglePathDifference: () => void;
  hint: string | null;
  sourceCount: number;
  hasProbeTarget: boolean;
  /** Aktuelle Wellenlaenge in Metern (fuer Label-Anzeige) */
  lambda?: number;
  /** Gangunterschied in Metern */
  deltaS?: number;
  /** Gangunterschied in Vielfachen von lambda */
  deltaSLambda?: number;
}

export function AnnotationPanel({
  config,
  onToggleLambdaArrow,
  onToggleNodeLines,
  onToggleWavefronts,
  onTogglePathDifference,
  hint,
  sourceCount,
  hasProbeTarget,
  lambda,
  deltaS,
  deltaSLambda,
}: AnnotationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const anyActive =
    config.showLambdaArrow ||
    config.showNodeLines ||
    config.showWavefronts ||
    config.showPathDifference;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant={anyActive ? "default" : "outline"}
          size="sm"
          className="gap-2"
          aria-label="Annotationen ein-/ausblenden"
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden sm:inline">Annotationen</span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border bg-background p-4 shadow-lg z-50">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Visuelle Annotationen</h3>

          {/* Toggle 1: Wellenlaenge lambda */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Label
                htmlFor="toggle-lambda"
                className="text-sm font-medium cursor-pointer"
              >
                <span className="text-blue-600 font-mono">lambda</span>{" "}
                Wellenlaenge
              </Label>
              {config.showLambdaArrow && lambda !== undefined && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  lambda = {lambda.toFixed(2)} m
                </p>
              )}
            </div>
            <Switch
              id="toggle-lambda"
              checked={config.showLambdaArrow}
              onCheckedChange={onToggleLambdaArrow}
              aria-label="Wellenlaenge-Pfeil einblenden"
            />
          </div>

          {/* Toggle 2: Knotenlinien */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Label
                htmlFor="toggle-nodelines"
                className="text-sm font-medium cursor-pointer"
              >
                Knotenlinien
              </Label>
              {config.showNodeLines && sourceCount < 2 && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Nur bei 2+ Quellen sichtbar
                </p>
              )}
            </div>
            <Switch
              id="toggle-nodelines"
              checked={config.showNodeLines}
              onCheckedChange={onToggleNodeLines}
              aria-label="Knotenlinien einblenden"
            />
          </div>

          {/* Toggle 3: Wellenfronten */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Label
                htmlFor="toggle-wavefronts"
                className="text-sm font-medium cursor-pointer"
              >
                Wellenfronten
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Isophasenlinien (Abstand = lambda)
              </p>
            </div>
            <Switch
              id="toggle-wavefronts"
              checked={config.showWavefronts}
              onCheckedChange={onToggleWavefronts}
              aria-label="Wellenfront-Kreise einblenden"
            />
          </div>

          {/* Toggle 4: Gangunterschied */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <Label
                htmlFor="toggle-pathdiff"
                className="text-sm font-medium cursor-pointer"
              >
                <span className="font-mono">Delta s</span> Gangunterschied
              </Label>
              {config.showPathDifference && sourceCount < 2 && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Nur bei 2+ Quellen moeglich
                </p>
              )}
              {config.showPathDifference &&
                sourceCount >= 2 &&
                !hasProbeTarget && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Klick auf Wellenfeld fuer Sondenpunkt
                  </p>
                )}
              {config.showPathDifference &&
                sourceCount >= 2 &&
                hasProbeTarget &&
                deltaS !== undefined &&
                deltaSLambda !== undefined && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Delta s = {deltaS.toFixed(2)} m = {deltaSLambda.toFixed(2)}{" "}
                    lambda
                  </p>
                )}
            </div>
            <Switch
              id="toggle-pathdiff"
              checked={config.showPathDifference}
              onCheckedChange={onTogglePathDifference}
              aria-label="Gangunterschied einblenden"
            />
          </div>

          {/* Hinweis-Text */}
          {hint && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs text-amber-800">{hint}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
