# PROJ-9: Intensitätsschirm

## Status: In Review
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Three.js-Szene
- Benötigt: PROJ-4 (Schnittebenen-Analyse) — wave-math.ts und Schnittlinien-Konzept
- Empfohlen: PROJ-3 (Wellenquellen-Konfiguration) — Doppelspalt-Szenario als Hauptanwendungsfall

## User Stories
- Als Physiklehrkraft möchte ich einen virtuellen Schirm am Rand des Wellenfeldes platzieren, der die Intensitätsverteilung I(x) = A²(x) zeigt, damit ich die Verbindung zum realen Doppelspaltexperiment im Labor herstellen kann.
- Als Schülerin möchte ich sehen, wie sich die Intensitätsmaxima und -minima auf dem Schirm mit dem Quellenabstand verändern, damit ich das Prinzip der konstruktiven und destruktiven Interferenz verstehe.
- Als Lehrkraft möchte ich die Position des Schirms im Wellenfeld verschieben, damit ich zeigen kann, dass das Muster sich mit dem Abstand zur Quelle ändert.
- Als Benutzer möchte ich den Schirm ein- und ausblenden, damit er die Hauptvisualisierung nicht dauerhaft überlagert.
- Als Lehrkraft möchte ich die Maxima-Positionen auf dem Schirm abgelesen bekommen, damit ich sie mit der theoretischen Formel Δy = λ·L/d vergleichen kann.

## Akzeptanzkriterien
- [ ] Ein Toggle-Button "Schirm" ist in der ControlBar verfügbar
- [ ] Bei aktiviertem Schirm erscheint eine vertikale Linie (der Schirm) am rechten Rand des Wellenfeldes (Standard: x = +4.5 m)
- [ ] Neben dem 3D-Canvas oder als überlagerndes Panel zeigt ein Balkendiagramm / Linienprofil die Intensität I(y) = A²(y) entlang der Schirmlinie
- [ ] Die Intensitätskurve zeigt deutlich sichtbare Maxima und Minima bei aktiviertem Doppelspalt-Szenario
- [ ] Ein Slider erlaubt das Verschieben des Schirms entlang der X-Achse (von -4 m bis +4.5 m)
- [ ] Die Intensitätskurve aktualisiert sich in Echtzeit (~30 FPS) synchron mit der Animation
- [ ] Die Y-Achse des Schirm-Diagramms zeigt die Position y in Metern; X-Achse zeigt die relative Intensität (0 bis 1, normiert auf Maximum)
- [ ] Maxima-Positionen werden als gestrichelte Linien oder Punkte auf dem Diagramm markiert und mit Koordinaten beschriftet
- [ ] Der Schirm ist im 2D-Modus (PROJ-7) als vertikale Linie im Wellenfeld sichtbar
- [ ] Bei einer Einzelquelle (keine Interferenz) zeigt der Schirm ein unimodales Maximum in der Mitte (radialsymmetrisch)

## Grenzfälle
- **Schirm außerhalb des sichtbaren Wellenfeldes (> ±5 m):** Slider ist auf ±4.5 m begrenzt; keine Extrapolation.
- **Schirm aktiviert bei laufender Animation mit hoher Frequenz:** Zeitgemittelte Intensität (I = ½·A²) wird gezeigt, nicht die instantane — für stationäres Muster. Toggle zwischen "instantan" und "zeitgemittelt" optional.
- **Quellenanzahl = 1 (keine Interferenz):** Schirm zeigt trotzdem korrektes Profil; ein informativer Hinweis "Für Interferenzmuster: Mindestens 2 Quellen setzen" erscheint.
- **Schirm und Schnittebene (PROJ-4) gleichzeitig aktiv:** Beide sind unabhängig bedienbar; Schnittebene zeigt z(x) oder z(y), Schirm zeigt I(y) — keine Konflikte.
- **Dämpfung > 0:** Intensität fällt mit Entfernung ab; Normierung auf lokales Maximum statt globales Maximum für bessere Sichtbarkeit.

## Physikalischer Hintergrund (für Akzeptanzkriterien)
- Intensität: I ∝ A² (zeitgemittelt: I = ½·A²_max)
- Doppelspalt-Maxima: sin(θ_m) = m·λ/d (m = 0, ±1, ±2, ...)
- Schirmabstand L, Streifenabstand Δy ≈ λ·L/d (für kleine Winkel)

## Technische Anforderungen
- CPU-seitige Berechnung von ~200 Punkten entlang der Schirmlinie pro Frame via `wave-math.ts`
- Zeitgemittelte Intensität als Option: I_avg = Mittelwert von z²(y,t) über letzte N Frames
- Recharts `AreaChart` oder `BarChart` für Intensitätsprofil
- Performance-Budget: Schirm-Berechnung ≤ 3 ms pro Frame
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Komponentenstruktur

```
WaveVisualization (bestehend)
+-- ControlBar (bestehend — Toggle "Schirm" hinzufügen)
+-- IntensityScreenPanel (NEU — neben dem 3D-Canvas)
|   +-- Header mit Ein/Aus-Status + "instantan/zeitgemittelt"-Toggle
|   +-- ScreenPositionSlider (x-Position: -4.5 m bis +4.5 m)
|   +-- IntensityChart (NEU — Recharts AreaChart)
|   |   +-- Linienprofil mit Intensitätskurve I(y)
|   |   +-- Maxima-Markierungen (gestrichelte Linien + y-Koordinaten)
|   +-- InfoHinweis (optional: "Mindestens 2 Quellen für Interferenz")
+-- WaveCanvas (bestehend — Schirmlinie als Three.js Line überlagern)
+-- TopDownOverlay (PROJ-7 — Schirmlinie als vertikale Linie übergeben)
```

### Datenmodell

```
Schirm-Konfiguration (State in WaveVisualization):
- isScreenActive: true/false
- screenX: Zahl (-4.5 bis +4.5) — Position auf X-Achse in Metern
- intensityMode: "instantaneous" | "timeAveraged"

Schirm-Datenpunkte (berechnet pro Frame in useIntensityScreen):
- Jeder Punkt hat:
  • y: Position auf dem Schirm (in Metern, ~200 Stützstellen)
  • intensity: normierte Intensität (0 bis 1)
  • isMaximum: true/false (für Beschriftungen)

Zeitgemittelter Puffer:
- Ringpuffer der letzten 30 Frames
- I_avg(y) = Durchschnitt von z²(y,t) über alle Puffer-Frames
- Normierung auf lokales Maximum (korrekt bei Dämpfung > 0)
```

### Neue Dateien

```
src/hooks/useIntensityScreen.ts          — Berechnungslogik + State-Management
src/components/wave/IntensityScreenPanel.tsx  — UI-Panel (Slider + Toggle)
src/components/wave/IntensityChart.tsx        — Recharts AreaChart-Diagramm
```

### Änderungen an bestehenden Dateien

```
src/lib/wave-math.ts                     — calculateIntensityProfile() hinzufügen
src/components/wave/ControlBar.tsx       — Toggle-Button "Schirm" ergänzen
src/components/wave/WaveVisualization.tsx — Hook + Panel + Schirmlinie im Canvas einbinden
```

### Technische Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| **Diagramm-Bibliothek** | Recharts `AreaChart` via `shadcn/ui chart.tsx` | Bereits vorhanden — kein neues Paket nötig, konsistent mit CrossSectionChart |
| **Berechnung** | CPU-seitig in `wave-math.ts` (~200 Punkte) | GPU-Shader liefert nur 3D-Rendering; Intensitätsprofil braucht gezielte Linienabfrage |
| **Hook-Muster** | `useIntensityScreen` (analog zu `useCrossSection`) | Konsistente Architektur, wiederverwendbares Muster |
| **Schirmlinie** | Three.js `Line`-Objekt im WaveCanvas | Minimaler Eingriff, analog zur bestehenden Schnittebenen-Linie |
| **Zeitgemittelung** | Ringpuffer (30 Frames) im Hook | Stationäres Interferenzmuster trotz laufender Animation; ≤ 3 ms Budget |

### Keine neuen Abhängigkeiten

Recharts ist bereits über `shadcn/ui chart.tsx` eingebunden — **0 neue npm-Pakete** erforderlich.

### Integration PROJ-7 (Top-Down-Ansicht)

`TopDownOverlay` erhält optional `screenX`-Prop und zeichnet eine vertikale Linie im 2D-Modus.

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
