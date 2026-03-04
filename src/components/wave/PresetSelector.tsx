"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";
import { WAVE_PRESETS } from "@/lib/wave-presets";

interface PresetSelectorProps {
  activePresetId: string | null;
  isDirty: boolean;
  onLoadPreset: (id: string) => void;
  onResetToPreset: () => void;
}

export function PresetSelector({
  activePresetId,
  isDirty,
  onLoadPreset,
  onResetToPreset,
}: PresetSelectorProps) {
  const displayValue = activePresetId && !isDirty ? activePresetId : undefined;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Szenarien:</span>
      <Select
        value={displayValue ?? ""}
        onValueChange={(value) => {
          if (value) onLoadPreset(value);
        }}
      >
        <SelectTrigger className="w-[200px] h-8 text-sm">
          <SelectValue
            placeholder={isDirty ? "Benutzerdefiniert" : "Szenario waehlen..."}
          />
        </SelectTrigger>
        <SelectContent>
          {WAVE_PRESETS.map((preset) => (
            <TooltipProvider key={preset.id} delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectItem value={preset.id}>{preset.name}</SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs max-w-[200px]">{preset.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </SelectContent>
      </Select>
      {activePresetId && isDirty && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetToPreset}
                className="h-8 w-8 p-0"
                aria-label="Preset zuruecksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Preset zuruecksetzen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
