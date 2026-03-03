# PROJ-4: Schnittebenen-Analyse

## Status: Geplant
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Schnittebene liegt in der 3D-Szene
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Querschnitt spiegelt aktuelle Parameter wider
- Optional: PROJ-3 (Wellenquellen-Konfiguration) — Bei mehreren Quellen zeigt der Schnitt Interferenz

## Beschreibung

Eine interaktive Schnittebene, die durch die 3D-Wellenvisualisierung gelegt werden kann. Der Schnittpfad der Ebene mit der Wellenoberfläche wird in einem **separaten 2D-Liniendiagramm unterhalb der 3D-Ansicht** angezeigt. Die Schnittebene kann entlang ihrer Normalenachse verschoben werden. Die Orientierung ist auf **zwei Richtungen** beschränkt: parallel zur X-Achse oder parallel zur Y-Achse.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [SourcePanel]   3D-Wellenbild (WebGL)   [ParameterPanel] │
│                  (mit eingeblendeter Schnittebene)        │
│                                                           │
├─────────────────────────────────────────────────────────┤
│             2D-Schnittdiagramm (Liniendiagramm)           │
│   z [m]  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿                   │
│          ─────────────────────────────  x/y [m]           │
└─────────────────────────────────────────────────────────┘
│  ControlBar (Abspielen / Neu starten / Kamera)            │
└─────────────────────────────────────────────────────────┘
```

Das 2D-Diagramm erscheint nur, wenn die Schnittebene aktiviert ist. Es teilt sich die verfügbare Höhe mit der 3D-Ansicht (ca. 30–35 % Höhe).

## User Stories

- Als Lehrkraft möchte ich eine vertikale Schnittebene durch die 3D-Welle legen, damit ich den Schülern zeigen kann, wie ein 2D-Querschnitt der Welle aussieht.
- Als Schüler möchte ich die Schnittebene verschieben, damit ich sehe, wie sich das Wellenprofil an verschiedenen Positionen unterscheidet.
- Als Lehrkraft möchte ich das 2D-Schnittdiagramm unterhalb der 3D-Ansicht sehen, damit ich beide Darstellungen gleichzeitig erklären kann.
- Als Benutzer möchte ich die Schnittebene ein- und ausblenden können, damit die 3D-Ansicht nicht dauerhaft verdeckt wird.
- Als Schüler möchte ich im 2D-Diagramm die Achsenbeschriftungen mit physikalischen Einheiten sehen, damit ich den Bezug zur Wellengleichung herstellen kann.
- Als Lehrkraft möchte ich zwischen X-Schnitt und Y-Schnitt wählen können, damit ich verschiedene Schnittrichtungen demonstrieren kann.
- Als Schüler möchte ich bei mehreren Wellenquellen das überlagerte Interferenzmuster im 2D-Diagramm sehen, damit ich Superposition besser verstehe.

## Akzeptanzkriterien

### Schnittebene aktivieren / deaktivieren
- [ ] In der ControlBar gibt es einen Toggle-Button "Schnittebene" (Icon: Scissors oder ähnlich)
- [ ] Beim Aktivieren erscheint die Schnittebene in der 3D-Szene als halbtransparente farbige Ebene (Opacity ca. 0.25)
- [ ] Beim Aktivieren erscheint das 2D-Diagramm unterhalb der 3D-Ansicht
- [ ] Beim Deaktivieren verschwinden beide (Ebene + Diagramm); die 3D-Ansicht füllt wieder den gesamten Bereich

### Schnittposition und -orientierung
- [ ] Ein Slider "Position" im Schnitt-Bereich verschiebt die Ebene entlang ihrer Normalenachse (gesamtes Simulationsfeld, z. B. –5 m bis +5 m)
- [ ] Zwei Buttons / ein Toggle wählen die Orientierung: "X-Schnitt" (Ebene senkrecht zur X-Achse) oder "Y-Schnitt" (Ebene senkrecht zur Y-Achse)
- [ ] Die Schnittlinie in der 3D-Ansicht (Schnittebene trifft Wellenoberfläche) hat eine kontrastreiche Farbe (z. B. Gelb oder Cyan)

### 2D-Diagramm
- [ ] Das 2D-Diagramm zeigt das Wellenprofil z(x) bei festem y (X-Schnitt) bzw. z(y) bei festem x (Y-Schnitt)
- [ ] Die horizontale Achse zeigt die Raumkoordinate in Meter [m], die vertikale Achse die Auslenkung z in Meter [m]
- [ ] Die Kurve im Diagramm hat dieselbe Farbe wie die Schnittlinie in der 3D-Ansicht
- [ ] Das Diagramm aktualisiert sich in Echtzeit synchron mit dem 3D-Render-Loop (kein wahrnehmbares Lag)
- [ ] Die Y-Achse (Auslenkung) skaliert automatisch auf den sichtbaren Wertebereich (auto-skaliert, kein manueller Zoom)
- [ ] Quellenposition(en) werden im 2D-Diagramm als vertikale gestrichelte Linie(n) markiert
- [ ] Bei mehreren Quellen (PROJ-3) zeigt das Diagramm die superponierte (summierte) Auslenkung

### Verhalten bei Animation
- [ ] Während die Animation läuft, aktualisiert sich die Kurve im Diagramm flüssig (≥ 30 FPS)
- [ ] Bei pausierter Animation (Abspielen-Button) bleibt der Schnitt sichtbar und eingefroren

## Grenzfälle

- **Schnittebene außerhalb des Simulationsfeldes:** Slider-Grenzen entsprechen den Feldgrenzen; kein Overflow, kein leeres Diagramm.
- **Schnitt exakt durch eine Quelle:** Quellposition als vertikale gestrichelte Linie im 2D-Diagramm — keine Division durch null im Shader.
- **Sehr hohe Frequenz (viele Perioden sichtbar):** Y-Achse auto-skaliert; X-Achse bleibt konstant (gesamte Breite des Feldes).
- **Sehr kleine Amplitude (fast flache Kurve):** Y-Achse skaliert auf kleinen Bereich — Nulllinie bleibt immer sichtbar.
- **Fenster zu schmal (< 1024 px):** Der bestehende Hinweis "Empfehlen wir min. 1024 px" greift; Schnittfeature ist bei < 1024 px nicht optimiert.
- **Mehrere Quellen mit Interferenz:** Das Diagramm zeigt die Superposition (Summe aller Quell-Beiträge) — keine Einzelkurven.
- **Schnittebene + Parameter gleichzeitig ändern:** Diagramm aktualisiert sich sofort, kein Race Condition zwischen Slider-Update und Render.

## Out of Scope (MVP)

- Kein gleichzeitiger X- und Y-Schnitt (nur einer aktiv)
- Keine frei rotierbaren Schnittebenen (nur achsenparallel)
- Kein manueller Zoom / Scroll im 2D-Diagramm
- Kein Exportieren des Diagramms als Bild/CSV

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Kernprinzip: CPU-seitige Wellenberechnung

Die 3D-Wellenoberfläche wird vollständig auf der Grafikkarte (GPU) berechnet — der Browser-Code hat keinen direkten Zugriff auf diese Werte. Für das 2D-Diagramm wird deshalb **dieselbe physikalische Formel ein zweites Mal in TypeScript (CPU) nachgebaut**. Da alle Parameter (Amplitude, Frequenz usw.) bereits als JavaScript-Werte vorliegen, ist das rechentechnisch sehr günstig (~100 Datenpunkte pro Frame).

---

### Komponentenstruktur (Baumansicht)

```
WaveVisualization (bestehend, Wurzel-Komponente)
  ├── SourcePanel (bestehend, links) — keine Änderung
  │
  ├── [Hauptbereich, flex-col wenn Schnitt aktiv]
  │     │
  │     ├── [3D-Canvas-Bereich] — bleibt flex-1
  │     │     useWaveAnimation (bestehend) ← erhält geteilte Zeit-Referenz
  │     │     + THREE.Plane (halbtransparente Schnittebene, 3D) — NEU
  │     │     + THREE.Line  (Schnittkurve in 3D, farbig)       — NEU
  │     │
  │     └── CrossSectionPanel (NEU) ← nur sichtbar wenn Schnitt aktiv
  │           ├── [Steuerleiste]
  │           │     ├── X/Y-Toggle (shadcn Tabs)
  │           │     └── Positions-Slider (shadcn Slider, –5 m bis +5 m)
  │           └── CrossSectionChart (NEU)
  │                 └── shadcn/ui Chart (Recharts LineChart)
  │                       ← Quellenmarkierungen als gestrichelte Linien (ReferenceLine)
  │
  ├── ParameterPanel (bestehend, rechts) — keine Änderung
  │
  └── ControlBar (bestehend) ← + Toggle-Button "Schnittebene"
```

---

### Datenmodell

**Zustand in `useCrossSection` (neuer Hook):**
```
isActive:    boolean       — Schnitt ein/aus
orientation: 'x' | 'y'   — Schnitt senkrecht zur X- oder Y-Achse
position:    number        — Position der Ebene in Meter (–5 bis +5)
chartData:   Punkt[]       — { coord: number; z: number }[] (ca. 200 Punkte)
```

**Geteilte Zeit-Referenz:**
```
timeRef: MutableRefObject<number>   — vom WaveVisualization nach außen gehoben
                                       beide Hooks lesen dieselbe Zeit
```

Gespeichert in: React-Arbeitsspeicher (kein localStorage, kein Server).

---

### Technische Entscheidungen (Begründungen)

| Entscheidung | Alternative | Warum diese Wahl |
|---|---|---|
| **CPU-Wellenformel in TypeScript** | GPU-Auslesefunktion (readRenderTargetPixels) | GPU-Auslesen ist langsam und komplex; CPU mit ~200 Punkten ist bei Weitem schnell genug |
| **shadcn/ui Chart (Recharts)** | Chart.js, D3.js, reine Canvas-Zeichnung | shadcn/ui Chart passt nahtlos ins bestehende Design; Recharts ist bereits indirekt vorhanden; Achsenbeschriftungen und Referenzlinien out-of-the-box |
| **Geteilte Zeit-Referenz (`useRef`)** | onTimeUpdate-Callback (jedes Frame) | Callback würde React bei jedem Frame neu rendern; Ref ist zustandslos und verursacht keine Re-renders |
| **Eigener `requestAnimationFrame`-Loop im Chart-Hook** | Am Three.js-Loop hängen | Entkoppelt Diagramm von 3D-Szene; Diagramm kann auf 30 FPS gedrosselt werden ohne 3D zu beeinflussen |
| **3D-Schnittebene als THREE.Plane-Mesh** | Nur 2D-Indikator | Zeigt Lehrkräften visuell, wo geschnitten wird — wichtig für Erklärung |

---

### Neue Dateien

| Datei | Aufgabe |
|---|---|
| `src/lib/wave-math.ts` | TypeScript-Nachbau der GLSL-Wellenformel; berechnet z(x, y, t) für beliebige Punkte |
| `src/hooks/useCrossSection.ts` | Zustand (isActive, orientation, position), Datenberechnung, Animation-Loop |
| `src/components/wave/CrossSectionPanel.tsx` | Container: Steuerleiste (X/Y-Toggle, Slider) + Chart-Komponente |
| `src/components/wave/CrossSectionChart.tsx` | shadcn/ui Chart mit Recharts LineChart + ReferenceLine für Quellen |

### Geänderte Dateien

| Datei | Änderung |
|---|---|
| `src/hooks/useWaveAnimation.ts` | `timeRef` nach außen exponieren (als Return-Wert); 3D-Schnittebene + 3D-Schnittkurve verwalten |
| `src/components/wave/WaveVisualization.tsx` | `useCrossSection` einbinden; `timeRef` an beide Hooks übergeben; Layout auf flex-col umstellen |
| `src/components/wave/ControlBar.tsx` | Toggle-Button "Schnittebene" hinzufügen (Scissors-Icon) |

---

### Abhängigkeiten (neue Pakete)

| Paket | Zweck | Installation |
|---|---|---|
| **shadcn/ui chart** | 2D-Liniendiagramm (wraps Recharts + recharts) | `npx shadcn@latest add chart` |

Recharts wird als Peer-Dependency von shadcn/ui chart automatisch installiert.

---

### Performance-Budget

- **Datenpunkte pro Frame:** ~200 (alle 0,05 m über das 10 m breite Feld)
- **Diagramm-Update-Rate:** gedrosselt auf 30 FPS (jedes 2. Frame bei 60 FPS)
- **3D-Schnittebene:** statisches Mesh, nur bei Positions-/Orientierungsänderung neu positioniert
- **Erwarteter Overhead:** < 5 % CPU zusätzlich zur bestehenden 3D-Darstellung

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
