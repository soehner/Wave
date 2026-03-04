"use client";

interface TopDownOverlayProps {
  /** Nur sichtbar wenn true */
  visible: boolean;
}

/**
 * CSS-Overlay ueber dem Canvas im 2D-Draufsicht-Modus.
 * Zeigt Achsenbeschriftungen (X, Y) und Feldgrenzen (+/-5 m).
 */
export function TopDownOverlay({ visible }: TopDownOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* X-Achsenbeschriftung (rechter Rand, vertikal zentriert) */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-red-600/80">
        X
      </span>

      {/* Y-Achsenbeschriftung (oberer Rand, horizontal zentriert) */}
      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600/80">
        Y
      </span>

      {/* Feldgrenzen-Markierungen entlang der Achsen */}
      {/* Rechts Mitte: +5 m (X positiv) */}
      <span className="absolute right-3 top-1/2 translate-y-3 text-xs font-mono text-muted-foreground/70">
        +5 m
      </span>
      {/* Links Mitte: -5 m (X negativ) */}
      <span className="absolute left-3 top-1/2 translate-y-3 text-xs font-mono text-muted-foreground/70">
        -5 m
      </span>
      {/* Oben Mitte: +5 m (Y positiv) */}
      <span className="absolute top-3 left-1/2 translate-x-4 text-xs font-mono text-muted-foreground/70">
        +5 m
      </span>
      {/* Unten Mitte: -5 m (Y negativ) */}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground/70">
        -5 m
      </span>

      {/* 2D-Modus-Hinweis */}
      <span className="absolute top-3 left-3 text-xs font-medium text-muted-foreground/60 bg-background/50 px-1.5 py-0.5 rounded">
        2D-Draufsicht
      </span>
    </div>
  );
}
