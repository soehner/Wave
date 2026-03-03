"use client";

import { useState, useCallback, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ParameterConfig } from "@/lib/wave-params";
import type { ParameterSliderState } from "@/hooks/useWaveParams";

interface ParameterControlProps {
  config: ParameterConfig;
  sliderState: ParameterSliderState;
  effectiveValue: number;
  validationError?: string;
  onSliderChange: (key: ParameterConfig["key"], percent: number) => void;
  onBaseValueChange: (key: ParameterConfig["key"], value: number) => void;
}

/**
 * Einzelner Parameter-Controller mit Label, Slider und Input.
 *
 * Slider: -100% bis +100% des Absolutwerts
 * Input: Absolutwert (numerisch)
 * Bidirektional synchronisiert
 */
export function ParameterControl({
  config,
  sliderState,
  effectiveValue,
  validationError,
  onSliderChange,
  onBaseValueChange,
}: ParameterControlProps) {
  // Lokaler Input-Zustand: nur waehrend Fokus aktiv
  const [editingText, setEditingText] = useState<string | null>(null);
  const throttleRef = useRef<number>(0);

  // Angezeigter Wert: lokaler Text waehrend Fokus, sonst formatierter baseValue
  const displayValue =
    editingText !== null
      ? editingText
      : sliderState.baseValue.toFixed(config.precision);

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const now = performance.now();
      // Throttle auf 16ms (60 FPS)
      if (now - throttleRef.current < 16) return;
      throttleRef.current = now;
      onSliderChange(config.key, values[0]);
    },
    [config.key, onSliderChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setEditingText(raw);

      const parsed = parseFloat(raw);
      // Auch NaN weiterleiten — useWaveParams setzt dann einen Validierungsfehler
      onBaseValueChange(config.key, parsed);
    },
    [config.key, onBaseValueChange]
  );

  const handleInputBlur = useCallback(() => {
    // Bei Blur: lokalen Edit-Zustand beenden -> zeigt wieder baseValue
    setEditingText(null);
  }, []);

  const handleInputFocus = useCallback(() => {
    // Bei Fokus: lokalen Edit-Zustand starten mit aktuellem Wert
    setEditingText(sliderState.baseValue.toFixed(config.precision));
  }, [sliderState.baseValue, config.precision]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const hasError = !!validationError;
  const labelId = `param-${config.key}-label`;
  const inputId = `param-${config.key}-input`;
  const sliderId = `param-${config.key}-slider`;

  return (
    <div className="space-y-2">
      {/* Label-Zeile: Name, Symbol, Einheit und effektiver Wert */}
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId} id={labelId} className="text-sm font-medium">
          {config.label}{" "}
          <span className="font-normal text-muted-foreground">
            {config.symbol} [{config.unit}]
          </span>
        </Label>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-mono tabular-nums text-muted-foreground cursor-default">
                = {effectiveValue.toFixed(config.precision)} {config.unit}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Effektiver Wert (Absolutwert x Slider)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Slider: -100% bis +100% */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">
          {Math.round(sliderState.sliderPercent)}%
        </span>
        <Slider
          id={sliderId}
          aria-labelledby={labelId}
          aria-label={`${config.label} Slider`}
          min={-100}
          max={100}
          step={1}
          value={[sliderState.sliderPercent]}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
      </div>

      {/* Input: Absolutwert */}
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          aria-labelledby={labelId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `param-${config.key}-error` : undefined}
          className={`h-8 text-sm font-mono tabular-nums ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500 text-red-600"
              : ""
          }`}
        />
        <span className="text-xs text-muted-foreground shrink-0 w-8">
          {config.unit}
        </span>
      </div>

      {/* Validierungsfehler */}
      {hasError && (
        <p
          id={`param-${config.key}-error`}
          className="text-xs text-red-500"
          role="alert"
        >
          {validationError}
        </p>
      )}
    </div>
  );
}
