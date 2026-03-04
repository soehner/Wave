# PROJ-4: Schnittebenen-Analyse

## Status: Deployed
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-04

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

### QA-Durchlauf 1 (2026-03-04)

**Tester:** QA-Engineer (Claude Code)
**Build-Status:** BESTANDEN (Next.js 16.1.6, TypeScript fehlerfrei)
**Lint-Status:** BESTANDEN
**Ergebnis:** 14/16 Kriterien bestanden, 4 Bugs gefunden (1x P2, 3x P3)

Bugs #1 (Opacity 0.15 statt 0.25), #2 (Pause + Parameteraenderung) und #3 (PlaneGeometry 10x10 statt 10x4) wurden im Nachgang behoben.

---

### QA-Durchlauf 2 (2026-03-04, Re-Test nach Bug-Fixes)

**Tester:** QA-Engineer (Claude Code)
**Build-Status:** BESTANDEN (Next.js 16.1.6, TypeScript fehlerfrei)
**Lint-Status:** NICHT BESTANDEN -- 1 ESLint-Fehler (siehe Bug #5)

---

### Akzeptanzkriterien-Pruefung (Re-Test)

#### Schnittebene aktivieren / deaktivieren

| # | Kriterium | Status | Nachweis |
|---|-----------|--------|----------|
| AC-1 | Toggle-Button "Schnittebene" in ControlBar (Scissors-Icon) | BESTANDEN | `ControlBar.tsx` Z.89-100: Scissors-Icon, aria-label, aria-pressed |
| AC-2 | Halbtransparente Ebene in 3D (Opacity ca. 0.25) | BESTANDEN | `useWaveAnimation.ts` Z.210: Opacity = 0.25 (Bug #1 behoben) |
| AC-3 | 2D-Diagramm erscheint unterhalb der 3D-Ansicht | BESTANDEN | `WaveVisualization.tsx` Z.144-158: CrossSectionPanel bedingt angezeigt |
| AC-4 | Deaktivierung entfernt Ebene + Diagramm, 3D fuellt Bereich | BESTANDEN | `WaveVisualization.tsx` Z.142-143: flex-[2] vs. flex-1 Umschaltung |

#### Schnittposition und -orientierung

| # | Kriterium | Status | Nachweis |
|---|-----------|--------|----------|
| AC-5 | Slider "Position" verschiebt Ebene (-5m bis +5m) | BESTANDEN | `CrossSectionPanel.tsx` Z.87-99: Slider mit Clamping |
| AC-6 | X-Schnitt / Y-Schnitt Toggle | BESTANDEN | `CrossSectionPanel.tsx` Z.61-73: shadcn Tabs |
| AC-7 | Kontrastreiche Schnittlinie in 3D (Cyan) | BESTANDEN | `useWaveAnimation.ts` Z.241-245: Farbe 0x00ffff |

#### 2D-Diagramm

| # | Kriterium | Status | Nachweis |
|---|-----------|--------|----------|
| AC-8 | Wellenprofil z(x) bei X-Schnitt, z(y) bei Y-Schnitt | BESTANDEN | `wave-math.ts` Z.158-161: Korrekte Zuordnung |
| AC-9 | Achsenbeschriftungen in Meter | BESTANDEN | `CrossSectionChart.tsx` Z.66, Z.83-107 |
| AC-10 | Kurvenfarbe = 3D-Schnittlinienfarbe (Cyan) | BESTANDEN | Beide Cyan: hsl(180,100%,50%) und 0x00ffff |
| AC-11 | Echtzeit-Synchronisation mit 3D | BESTANDEN | Geteilte timeRef zwischen beiden rAF-Loops |
| AC-12 | Y-Achse auto-skaliert | BESTANDEN | `CrossSectionChart.tsx` Z.50-63: Dynamische yDomain |
| AC-13 | Quellpositionen als gestrichelte Linien | BESTANDEN | `CrossSectionChart.tsx` Z.114-128: ReferenceLine |
| AC-14 | Superponierte Auslenkung bei mehreren Quellen | BESTANDEN | `wave-math.ts` Z.92-123: Summe ueber alle Quellen |

#### Verhalten bei Animation

| # | Kriterium | Status | Nachweis |
|---|-----------|--------|----------|
| AC-15 | Diagramm-Update >= 30 FPS | BESTANDEN | `useCrossSection.ts` Z.88: TARGET_INTERVAL = 33ms |
| AC-16 | Pausiert: Schnitt sichtbar und eingefroren + Parameteraenderungen | BESTANDEN | `useCrossSection.ts` Z.135: Dependency-Liste enthaelt nun `waveUniformArrays` und `sourceUniforms` (Bug #2 behoben) |

**Ergebnis: 16 von 16 Kriterien bestanden**

---

### Status der zuvor gemeldeten Bugs

| Bug | Schweregrad | Status | Details |
|-----|------------|--------|---------|
| Bug #1: Opacity 0.15 statt 0.25 | Niedrig | BEHOBEN | `useWaveAnimation.ts` Z.210: Jetzt `opacity: 0.25` |
| Bug #2: Pause + Parameteraenderung | Mittel | BEHOBEN | `useCrossSection.ts` Z.135: Dependencies erweitert um `waveUniformArrays, sourceUniforms` |
| Bug #3: PlaneGeometry ueberdimensioniert | Niedrig | BEHOBEN | `useWaveAnimation.ts` Z.206: Jetzt `PlaneGeometry(PLANE_SIZE, 4)` statt `(PLANE_SIZE, PLANE_SIZE)` |
| Bug #4: Fehlende Trennlinie | Niedrig | BEHOBEN | `ControlBar.tsx` Z.90: Separator hinzugefuegt |

---

### Verbleibende Bugs

Keine offenen Bugs. Alle 5 Bugs wurden behoben.

---

### Sicherheitsaudit (Red-Team)

| Pruefpunkt | Status | Details |
|------------|--------|---------|
| XSS via Benutzereingaben | SICHER | Nur numerische Slider-Werte; keine Textinjektion moeglich |
| DOM-Injection | SICHER | Three.js Canvas programmatisch erzeugt; kein innerHTML |
| `dangerouslySetInnerHTML` | AKZEPTABEL | `chart.tsx` Z.83: Nur statische chartConfig-Werte, keine Benutzerdaten |
| URL-Parameter | SICHER | Keine URL-Parameter werden gelesen |
| Datenlecks | SICHER | Keine Benutzerdaten, kein Storage, keine API-Aufrufe |
| Client-DoS | HINWEIS | 200 Punkte * 8 Quellen * Distanzberechnungen pro Frame -- bei langsamen Schulrechnern evtl. merkbar |
| Prototype Pollution | SICHER | Keine dynamischen Object-Key-Zuweisungen aus Eingaben |
| Preset-Daten Manipulation | SICHER | Presets sind statische TypeScript-Konstanten, nicht aus externen Quellen geladen |

**Ergebnis: Keine Sicherheitsluecken gefunden. App ist reine Frontend-Simulation ohne Benutzerdaten.**

---

### Cross-Browser & Responsive

| Browser / Viewport | Status | Anmerkung |
|--------------------|--------|-----------|
| Chrome Desktop | OK | WebGL2 + Recharts SVG vollstaendig unterstuetzt |
| Firefox Desktop | OK | WebGL2 + Recharts SVG vollstaendig unterstuetzt |
| Safari Desktop | HINWEIS | WebGL `lineWidth > 1` wird ignoriert -- Schnittlinie in 3D nur 1px breit (bekannte WebGL-Limitation, kein App-Bug) |
| 1440px Desktop | OK | Layout korrekt: 3D 2/3, Diagramm 1/3 Hoehe |
| 768px Tablet | HINWEIS | Bestehende < 1024px Warnung greift; Diagramm eng aber benutzbar |
| 375px Mobile | HINWEIS | Schnittebenen-Button sichtbar/klickbar; CrossSectionPanel mit minHeight 180px + 3D = sehr eng |

---

### Regressionspruefung

| Feature | Status | Details |
|---------|--------|---------|
| PROJ-1 (3D-Visualisierung) | KEINE REGRESSION | Separate THREE.Group fuer Schnittebene |
| PROJ-2 (Parameter-Steuerung) | KEINE REGRESSION | Hooks/Panel unveraendert |
| PROJ-3 (Quellen-Konfiguration) | KEINE REGRESSION | SourcePanel unveraendert, Positionen korrekt durchgereicht |
| PROJ-5 (Presets) | KEINE REGRESSION | Schnittebene bleibt unabhaengig von Preset-Wechseln |

---

### GLSL/CPU-Paritaet (Physikalische Korrektheit)

Die CPU-Wellenformel in `wave-math.ts` wurde gegen den GLSL-Vertex-Shader in `wave-shader.ts` verglichen:

| Aspekt | GPU (GLSL) | CPU (TypeScript) | Paritaet |
|--------|-----------|-----------------|----------|
| Wellenformel `A*exp(-d*r)*sin(k*r-w*t+phi)` | Z.85 | Z.111-118 | IDENTISCH |
| smoothstep Wellenfront-Maske | Z.83 `smoothstep(wfR-0.3, wfR+0.1, r)` | Z.105-108 nachgebaut | IDENTISCH |
| Abstand POINT | Z.47 `length(rel)` | Z.52 `Math.hypot(relX, relY)` | IDENTISCH |
| Abstand CIRCLE | Z.51 `abs(length(rel) - R)` | Z.55 `Math.abs(Math.hypot-R)` | IDENTISCH |
| Abstand BAR | Z.55-56 clamp + length | Z.58-59 Math.max/min + hypot | IDENTISCH |
| Abstand TRIANGLE | Z.62-66 distToSegment | Z.63-71 distToSegment | IDENTISCH |
| waveSpeed Division-by-zero Schutz | Z.81 `max(k, 0.001)` | Z.102 `Math.max(k, 0.001)` | IDENTISCH |

**HINWEIS:** Die GPU-Version hat eine Normierung (`v_displacement = clamp(z / normFactor, -1, 1)`, Z.92-93) fuer die Farbskala. Die CPU-Version gibt den nicht-normierten Z-Wert zurueck, was **korrekt** ist, da das 2D-Diagramm die tatsaechliche physikalische Auslenkung in Metern zeigen soll.

---

### Gesamtbewertung

| Kategorie | Bewertung |
|-----------|-----------|
| Funktionalitaet | 16/16 Kriterien bestanden |
| Bugs offen | 0 |
| Bugs behoben | 5 (Bug #1, #2, #3 seit QA-Durchlauf 1; Bug #4, #5 seit QA-Durchlauf 3) |
| Sicherheit | Keine Luecken |
| Physik-Korrektheit | GLSL/CPU-Paritaet verifiziert |
| Regression | Keine |
| Build | BESTANDEN |
| Lint | BESTANDEN |

### Produktionsbereitschaft: BEREIT

---

### QA-Durchlauf 3 (2026-03-04, Re-Test nach Bug-Fixes #4 und #5)

**Tester:** QA-Engineer (Claude Code)
**Build-Status:** BESTANDEN (Next.js 16.1.6, TypeScript fehlerfrei)
**Lint-Status:** BESTANDEN (0 Fehler)

#### Re-Test Bug #5 (P1): ESLint-Fehler `react-hooks/set-state-in-effect`

- **Status:** BEHOBEN
- **Nachweis:** `useCrossSection.ts` Z.126-136: Der Pause-useEffect ruft `setRawChartData(data)` jetzt innerhalb eines `requestAnimationFrame`-Callbacks auf (Z.126: `const id = requestAnimationFrame(() => { ... })`). Damit wird setState nicht mehr synchron im Effect-Body ausgefuehrt, sondern asynchron im naechsten Frame. `npm run lint` laeuft fehlerfrei durch.

#### Re-Test Bug #4 (P3): Fehlende Trennlinie zwischen Presets und Schnittebene

- **Status:** BEHOBEN
- **Nachweis:** `ControlBar.tsx` Z.90: `<div className="h-5 w-px bg-border" />` erzeugt eine vertikale Trennlinie zwischen dem PresetSelector-Block und dem Schnittebene-Button. Die visuelle Abgrenzung ist nun vorhanden.

## Deployment
_Wird von /deploy hinzugefügt_
