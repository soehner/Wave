"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import type {
  UseReflectionReturn,
  ReflectionEndType,
  ReflectionDisplayMode,
} from "@/hooks/useReflection";
import { WALL_X_MIN, WALL_X_MAX } from "@/hooks/useReflection";

interface ReflectionPanelProps {
  reflectionHook: UseReflectionReturn;
}

const END_TYPE_LABELS: Record<ReflectionEndType, string> = {
  fixed: "Festes Ende",
  free: "Loses Ende",
};

const END_TYPE_DESCRIPTIONS: Record<ReflectionEndType, string> = {
  fixed: "Phasenumkehr um 180\u00B0, Knoten an der Wand \u2014 wie eine eingespannte Saite",
  free: "Keine Phasenumkehr, Bauch an der Wand \u2014 wie ein freies Seilende",
};

const DISPLAY_MODE_LABELS: Record<ReflectionDisplayMode, string> = {
  total: "Beide (Superposition)",
  incident: "Nur einfallende Welle",
  reflected: "Nur reflektierte Welle",
};

export function ReflectionPanel({ reflectionHook }: ReflectionPanelProps) {
  const {
    config,
    setIsActive,
    setWallX,
    setEndType,
    setDisplayMode,
    wallOverlapsSource,
  } = reflectionHook;

  return (
    <div className="space-y-4">
      {/* Aktivierung */}
      <div className="flex items-center justify-between">
        <Label htmlFor="reflection-toggle" className="text-sm font-medium">
          Reflexionswand
        </Label>
        <Switch
          id="reflection-toggle"
          checked={config.isActive}
          onCheckedChange={setIsActive}
          aria-label="Reflexionswand aktivieren"
        />
      </div>

      {config.isActive && (
        <>
          {/* Wandposition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wandposition (x)
              </Label>
              <span className="text-sm font-mono tabular-nums font-medium">
                {config.wallX.toFixed(1)}{" "}
                <span className="text-xs text-muted-foreground font-normal">m</span>
              </span>
            </div>
            <Slider
              value={[config.wallX]}
              onValueChange={([val]) => setWallX(val)}
              min={WALL_X_MIN}
              max={WALL_X_MAX}
              step={0.1}
              aria-label="Wandposition in Metern"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{WALL_X_MIN} m</span>
              <span>{WALL_X_MAX} m</span>
            </div>
          </div>

          {/* Endtyp */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Endtyp
            </Label>
            <Select
              value={config.endType}
              onValueChange={(val) => setEndType(val as ReflectionEndType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(END_TYPE_LABELS) as ReflectionEndType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {END_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {END_TYPE_DESCRIPTIONS[config.endType]}
            </p>
          </div>

          {/* Anzeigemodus */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Anzeige
            </Label>
            <Select
              value={config.displayMode}
              onValueChange={(val) => setDisplayMode(val as ReflectionDisplayMode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DISPLAY_MODE_LABELS) as ReflectionDisplayMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {DISPLAY_MODE_LABELS[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wand-Overlap-Warnung */}
          {wallOverlapsSource && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800">
                Wand ueberlappt Quelle &mdash; physikalisch nicht sinnvoll.
              </p>
            </div>
          )}

          {/* Spiegelquellen-Info */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {reflectionHook.mirrorSources.length} Spiegelquelle{reflectionHook.mirrorSources.length !== 1 ? "n" : ""}
            </Badge>
          </div>
        </>
      )}
    </div>
  );
}
