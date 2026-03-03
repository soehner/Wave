"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipBack } from "lucide-react";

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestartWave: () => void;
  onResetCamera: () => void;
  fps?: number;
}

export function ControlBar({
  isPlaying,
  onTogglePlay,
  onRestartWave,
  onResetCamera,
  fps,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePlay}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Abspielen</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRestartWave}
          className="gap-2"
        >
          <SkipBack className="h-4 w-4" />
          <span className="hidden sm:inline">Neu starten</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetCamera}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Kamera zurücksetzen</span>
        </Button>
      </div>
      {fps !== undefined && (
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {fps} FPS
        </span>
      )}
    </div>
  );
}
