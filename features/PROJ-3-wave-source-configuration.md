# PROJ-3: Wellenquellen-Konfiguration

## Status: Geplant
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Quellen definieren, wo Wellen entstehen
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Quellen teilen dieselben Wellenparameter

## Beschreibung
Konfiguration der Wellenquellen in der 3D-Szene. Eine Wellenquelle ist der Ursprungspunkt (oder die Ursprungslinie/-fläche), von dem aus sich die Welle ausbreitet. Der Benutzer kann:
1. **Form** der Quelle wählen: Kreis, Balken (Linie), Dreieck, Punkt (und weitere)
2. **Anzahl** der Quellen einstellen (1–8)
3. **Abstand** zwischen mehreren Quellen konfigurieren

Jede Quellenform erzeugt ein charakteristisches Welleninterferenzmuster.

## Quellenformen und ihre Physik

| Form | Beschreibung | Physikalisches Beispiel |
|------|-------------|------------------------|
| Punkt | Einzelne Punktquelle | Stein ins Wasser |
| Kreis | Runder Ring als Quelle | Kreisförmige Lautsprecher-Membran |
| Balken (Linie) | Linienquelle (1D) | Ebene Wellenfront, Ultraschallkopf |
| Dreieck | Dreieckige Quellform | Abstraktes Experiment |
| Mehrteilig | N Punktquellen im Abstand d | Doppelspalt, Phased Array |

## User Stories

- Als Lehrkraft möchte ich zwischen Punkt-, Kreis- und Balkenquelle wählen können, damit ich verschiedene Wellenformen (kugelig, eben, kreisförmig) demonstrieren kann.
- Als Schüler möchte ich zwei Quellen im Abstand d platzieren, damit ich Interferenzeffekte (konstruktiv/destruktiv) beobachten kann.
- Als Lehrkraft möchte ich die Quellenform in der 3D-Szene visuell hervorgehoben sehen, damit klar ist, wo die Welle entsteht.
- Als Benutzer möchte ich den Abstand zwischen mehreren Quellen per Slider einstellen, damit ich sehe, wie sich das Interferenzmuster verändert.
- Als Lehrkraft möchte ich die Anzahl der Quellen von 1 auf bis zu 8 erhöhen, damit ich Mehrfachspalt-Experimente simulieren kann.

## Akzeptanzkriterien

- [ ] Ein Dropdown oder Icon-Auswahl ermöglicht die Wahl der Quellenform: Punkt, Kreis, Balken, Dreieck
- [ ] Die gewählte Quellenform ist in der 3D-Szene visuell hervorgehoben (leuchtendes Marker-Element)
- [ ] Ein Slider "Anzahl der Quellen" erlaubt 1–8 Quellen
- [ ] Bei ≥ 2 Quellen erscheint ein Slider "Abstand zwischen Quellen [m]" (Bereich: 0.5–10 m)
- [ ] Mehrere Quellen werden symmetrisch entlang der X-Achse angeordnet
- [ ] Die Wellengleichungen aller Quellen überlagern sich (Superpositionsprinzip)
- [ ] Interferenzmuster (konstruktiv / destruktiv) sind in der 3D-Visualisierung sichtbar
- [ ] Beim Wechsel der Quellenform wird die Visualisierung sofort aktualisiert
- [ ] Quellenparameter können unabhängig von Wellenparametern (PROJ-2) zurückgesetzt werden

## Grenzfälle

- **1 Punktquelle + Form "Balken":** Die Balkenquelle überschreibt die Einzelpunkt-Logik; kein Widerspruch.
- **8 Quellen bei sehr kleinem Abstand (< 0.5 m):** Minimaler Abstand wird erzwungen, Slider-Untergrenze 0.5 m.
- **Form "Dreieck" mit 5 Quellen:** Quellen werden als 5 Punkte interpretiert, die entlang der Dreieck-Kontur verteilt sind.
- **Quellenabstand > Simulationsfeld:** Die außerhalb liegenden Quellen werden an den Rand geclippt, ein Hinweis erscheint.
- **Übergang von N auf 1 Quelle:** Alle Zusatz-Quellen werden entfernt, die Visualisierung kehrt zur Einzelquell-Darstellung zurück.

## Technische Anforderungen

- **UI-Komponenten:** shadcn/ui `Select`, `Slider`, `Card`, `Badge` für Quellenanzahl-Anzeige
- **Quellentypen als Enum:** `POINT | CIRCLE | BAR | TRIANGLE`
- **Superposition:** Z-Werte aller Quellen werden per Vertex-Shader addiert
- **Quellenmarkierung:** Three.js `Mesh` mit eigenem Material (leuchtendes Highlight)
- **Performance:** Bei 8 Quellen + 128×128 Grid bleibt FPS ≥ 30

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Übersicht

PROJ-3 erweitert die bestehende Rendering-Engine (PROJ-1) und die Parameter-Steuerung (PROJ-2) um Quellenformen, Quellenanzahl und Quellenabstand. Die gesamte Logik bleibt **reine Frontend-Applikation** — kein Backend, kein Server.

---

### A) Komponentenstruktur (visueller Baum)

```
WaveVisualization (Orchestrierung — bestehend, wird erweitert)
├── Header (unverändert)
├── 3D-Canvas (bestehend — erhält neue Quellenmarkierungen)
│   └── Wellenoberfläche (bestehend — Shader wird erweitert)
│       └── Quellenmarker-Meshes (NEU — leuchtende 3D-Objekte)
├── SourcePanel (NEU — zweites Seitenleisten-Panel)
│   ├── SourceTypeSelector (NEU — Icon-Auswahl: Punkt / Kreis / Balken / Dreieck)
│   ├── SourceCountControl (NEU — Slider 1–8 Quellen + Badge-Anzeige)
│   └── SourceSpacingControl (NEU — Slider 0.5–10 m, nur sichtbar bei ≥ 2 Quellen)
├── ParameterPanel (unverändert — Wellenparameter PROJ-2)
└── ControlBar (unverändert)
```

---

### B) Datenmodell (Klartext)

**Quellenparameter (neu, gespeichert im Browser-Speicher — kein Server nötig):**

```
Quellenform: Punkt | Kreis | Balken | Dreieck
  → bestimmt, wie der Abstand vom Vertex zur Quelle berechnet wird

Quellenanzahl: 1 bis 8 (ganze Zahl)
  → bei mehr als 1 Quelle werden alle Quellen symmetrisch
    entlang der X-Achse verteilt (z. B. 2 Quellen: −d/2 und +d/2)

Quellenabstand (d): 0,5 bis 10 m
  → nur relevant und sichtbar wenn Quellenanzahl ≥ 2
  → bei 8 Quellen und d = 10 m: Quellen bei −35 m bis +35 m,
    Quellen außerhalb des 10×10-m-Feldes werden an den Rand geclippt
    und ein Hinweis erscheint in der UI
```

**Superpositionsprinzip:**

Jeder Vertex auf der Wellenoberfläche berechnet seine Höhe z als Summe der Beiträge aller Quellen:

```
z_gesamt = z_Quelle1 + z_Quelle2 + ... + z_QuelleN
```

Dabei gilt für jede Quelle dieselbe Wellengleichung wie in PROJ-1, nur mit dem Abstand `r` zur jeweiligen Quelle (statt zum Ursprung).

**Abstandsberechnung je Quellenform:**

```
PUNKT   → r = Abstand vom Vertex zum Quellpunkt (wie bisher)
KREIS   → r = |Abstand vom Vertex zum Kreismittelpunkt − Kreisradius|
           (Minimum-Abstand zur Kreislinie)
BALKEN  → r = kürzester Abstand vom Vertex zur Linienstrecke (Balken)
DREIECK → r = kürzester Abstand vom Vertex zur Dreiecks-Kontur
           (bei N Quellen: Punkte werden entlang der Kontur verteilt)
```

---

### C) Technische Entscheidungen (Begründung)

**Warum der Shader erweitert wird (statt JavaScript):**

Die Wellenberechnung läuft bereits vollständig auf der GPU im Vertex Shader (PROJ-1). Das Superpositionsprinzip für N Quellen wird ebenfalls im Shader berechnet — das ist die einzig performante Lösung für ≥ 30 FPS bei 128×128 Vertices und bis zu 8 Quellen.

Der Shader erhält folgende neue Informationen:
- Anzahl der aktiven Quellen (Zahl 1–8)
- Position jeder Quelle auf dem Simulationsfeld (X-/Y-Koordinaten)
- Quellentyp (Nummer, die dem Enum Punkt/Kreis/Balken/Dreieck entspricht)

**Warum ein eigener Hook `useWaveSources`:**

Analog zu `useWaveParams` kapselt ein eigener Hook alle Quellenparameter. Das hält die Verantwortlichkeiten klar getrennt: Wellenphysik (PROJ-2) und Quellengeometrie (PROJ-3) sind unabhängig zurücksetzbar — wie im Akzeptanzkriterium gefordert.

**Warum ein separates `SourcePanel` (kein Einbetten in `ParameterPanel`):**

Das `ParameterPanel` aus PROJ-2 ist bereits gut gefüllt. Ein eigenes Panel auf der linken Seite des Canvas vermeidet Überfüllung und macht die logische Trennung sichtbar: rechts = Wellenphysik, links = Quellengeometrie.

**Warum leuchtende Marker-Meshes in der 3D-Szene:**

Das Akzeptanzkriterium verlangt, dass die gewählte Quellenform in der 3D-Szene hervorgehoben ist. Three.js-Objekte mit eigenem leuchtendem Material (Emissive Color) werden bei jeder Parameteränderung dynamisch neu erzeugt. Die Quellenformen (Punkt = kleine Kugel, Kreis = Ring-Linie, Balken = Liniensegment, Dreieck = drei Kanten) werden direkt als Three.js-Geometrien dargestellt.

---

### D) Abhängigkeiten

| Paket / Komponente | Zweck | Status |
|--------------------|-------|--------|
| `three` (Three.js) | 3D-Rendering, Quellenmarker-Geometrien | Bereits vorhanden |
| `shadcn/ui: Select` | Dropdown für Quellenform-Auswahl | Muss installiert werden |
| `shadcn/ui: Slider` | Quellenanzahl und -abstand | Bereits vorhanden |
| `shadcn/ui: Badge` | Anzeige der aktiven Quellenanzahl | Bereits vorhanden (card.tsx) |
| `shadcn/ui: Card` | Panel-Container | Bereits vorhanden |
| `shadcn/ui: Tooltip` | Erklärungen bei Hover auf Quellenform | Bereits vorhanden |

**Einzige neue Installation:** `npx shadcn@latest add select --yes`

---

### E) Änderungen an bestehenden Dateien

| Datei | Art der Änderung |
|-------|-----------------|
| `src/lib/wave-shader.ts` | Shader erweitern: Quellenarray, Quellentyp, Superposition |
| `src/hooks/useWaveAnimation.ts` | Neue Source-Uniforms empfangen + Marker-Meshes verwalten |
| `src/components/wave/WaveVisualization.tsx` | `useWaveSources`-Hook einbinden, `SourcePanel` einbetten |

**Neue Dateien:**

| Datei | Inhalt |
|-------|--------|
| `src/lib/wave-sources.ts` | Quellentyp-Enum, Defaults, Positions-Berechnung |
| `src/hooks/useWaveSources.ts` | State-Management für alle Quellenparameter |
| `src/components/wave/SourcePanel.tsx` | UI-Panel mit SourceTypeSelector + Slidern |

---

### F) Performance-Garantie

Bei 8 Quellen + 128×128 Grid = 16.641 Vertices berechnet der GPU-Shader je Vertex eine Schleife über 8 Quellen. Dies entspricht ca. 133.000 Berechnungen pro Frame — für moderne GPUs (auch Schulrechner) problemlos unter 33 ms (= 30 FPS).

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
