# PROJ-14: Vergleichsmodus (Split-Screen)

## Status: In Review
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — zwei unabhängige Three.js-Instanzen
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Parameter-State für zwei Instanzen
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Quellen-State für zwei Instanzen
- Empfohlen: PROJ-5 (Presets) — schnelles Befüllen der beiden Vergleichs-Slots

## User Stories
- Als Physiklehrkraft möchte ich zwei Wellenfelder nebeneinander mit unterschiedlichen Parametern anzeigen, damit Schüler den direkten Vergleich sehen: "Was ändert sich, wenn ich λ verdopple?"
- Als Schülerin möchte ich links ein Preset laden und rechts einen Parameter verändern, damit ich die Auswirkung einer einzelnen Parameteränderung isoliert beobachte.
- Als Lehrkraft möchte ich beide Animationen synchron laufen lassen (gleiche Zeit t), damit Phasendifferenzen direkt sichtbar sind.
- Als Benutzer möchte ich den Vergleichsmodus mit einem Klick ein- und ausblenden, damit ich wieder zur Einzelansicht zurückkehren kann.
- Als Lehrkraft möchte ich die Parameter-Unterschiede zwischen beiden Feldern als Tabelle sehen, damit ich beim Erklären keinen mentalen Overhead habe.

## Akzeptanzkriterien
- [ ] Ein Toggle-Button "Vergleich" ist in der ControlBar sichtbar
- [ ] Im Vergleichsmodus teilt sich der Canvas horizontal: links Panel A, rechts Panel B; jedes Panel erhält 50% der Canvas-Breite
- [ ] Jedes Panel hat seinen eigenen vollständigen Parametersatz (alle 5 Wellenparameter + Quellentyp/-anzahl/-abstand)
- [ ] Beide Animationen laufen synchron (gleicher `timeRef`-Wert für beide Shader)
- [ ] Play/Pause und Neustart in der ControlBar gelten für beide Panels gleichzeitig
- [ ] Jedes Panel hat ein kleines Label "A" / "B" in der Ecke
- [ ] Eine Differenz-Tabelle unterhalb der Panels zeigt alle Parameter mit den Werten beider Panels; unterschiedliche Werte sind farblich hervorgehoben
- [ ] Beim Aktivieren des Vergleichsmodus übernimmt Panel B die aktuellen Parameter von Panel A (Startpunkt: identisch)
- [ ] Bei der Mindestbreite (1024 px) ist der Vergleichsmodus nutzbar (jedes Panel ≥ 480 px)
- [ ] Im Vergleichsmodus sind beide ParameterPanel-Sidebars durch Tabs (A / B) umschaltbar

## Grenzfälle
- **Viewport < 1024 px im Vergleichsmodus:** Bestehende Breiten-Warnung erscheint; Vergleichsmodus bleibt aktiv, ist aber möglicherweise unbenutzbar — kein automatisches Deaktivieren.
- **Schnittebene (PROJ-4) aktiv und Vergleichsmodus aktiviert:** Schnittebene gilt nur für Panel A; Panel B hat keine Schnittebene.
- **Preset-Wechsel im Vergleichsmodus:** Preset wird nur auf das aktuell fokussierte Panel (A oder B) angewendet.
- **Sehr hohe Quellenanzahl in beiden Panels (8+8 Quellen):** GPU rendert 2 Meshes mit je 8 Quellen; kein Shader-Problem, aber möglicher FPS-Abfall — Warnhinweis wenn FPS < 20.
- **Benutzer resize das Fenster:** Beide Canvas-Größen skalieren proportional; `ResizeObserver` wird für beide Instanzen aufgerufen.
- **Screenshot (PROJ-11) im Vergleichsmodus:** Screenshot zeigt beide Panels nebeneinander (kombiniertes Canvas oder separater Download per Panel).

## Technische Anforderungen
- Zwei unabhängige `useWaveAnimation`-Hook-Instanzen, beide mit demselben `timeRef`
- Zwei unabhängige `useWaveParams`-Hook-Instanzen
- Zwei WebGL-Kontexte (zwei `<canvas>`-Elemente) oder ein Canvas mit zwei Viewports (Scissor-Test)
- Performance-Ziel: Vergleichsmodus ≥ 30 FPS auf einem durchschnittlichen Schulrechner
- Minimale Breite pro Panel: 480 px (also mind. 960 px gesamt)
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Übersicht

Der Vergleichsmodus erweitert die bestehende `WaveVisualization`-Hauptkomponente um einen optionalen Split-Screen-Modus. Beide Panels teilen dieselbe Zeitachse (synchrone Animation), haben aber unabhängige Parameter- und Quellen-Konfigurationen.

**Kein Backend erforderlich** — reine Frontend-Änderung, alles im Browser.

---

### Komponentenstruktur

```
WaveVisualization (bestehend — wird erweitert)
├── Header (bestehend)
├── SmallViewportWarning (bestehend)
├── [NEU] CompareToggle-Button (in ControlBar integriert)
│
├── Einzelmodus (bestehend, unverändert)
│   ├── SourcePanel (links)
│   ├── CanvasArea (Mitte, mit Three.js-Container)
│   └── ParameterPanel (rechts)
│
└── Vergleichsmodus [NEU]
    ├── ComparePanelLayout (Flex-Row)
    │   ├── WavePanel A (50% Breite)
    │   │   ├── PanelLabel "A"
    │   │   └── Three.js Canvas-Container
    │   └── WavePanel B (50% Breite)
    │       ├── PanelLabel "B"
    │       └── Three.js Canvas-Container
    ├── CompareParameterSidebar [NEU]
    │   ├── Tabs "A" / "B" (shadcn Tabs)
    │   ├── ParameterPanel (für aktives Tab)
    │   └── SourcePanel (für aktives Tab)
    └── CompareDiffTable [NEU]
        ├── Tabellenzeile pro Parameter
        ├── Wert Panel A
        ├── Wert Panel B
        └── Hervorhebung bei Unterschied (farbiger Badge)
```

---

### Datenmodell

**Gemeinsam (geteilt zwischen beiden Panels):**
```
Geteilter Zustand:
- isPlaying (boolean)            — Play/Pause gilt für beide
- speedMultiplier (number)       — gleiche Animationsgeschwindigkeit
- timeRef (React Ref)            — EINE gemeinsame Zeitreferenz, beide Shader lesen denselben Wert
```

**Pro Panel (A und B unabhängig):**
```
Panel-eigener Zustand:
- waveParams       — Amplitude, Wellenlänge, Frequenz, Dämpfung, Phase
- waveSources      — Quellentyp, Anzahl, Abstand
- containerRef     — eigener Three.js-Canvas-Container
```

**Beim Aktivieren des Vergleichsmodus:**
```
Panel B erbt beim Start eine Kopie aller Werte von Panel A
(danach unabhängig veränderbar)
```

---

### Technische Entscheidungen

#### Zwei getrennte Three.js-Canvas-Instanzen (statt ein Canvas mit zwei Viewports)
**Warum:** Zwei `<canvas>`-Elemente sind einfacher zu implementieren und wartbarer. Der Scissor-Test-Ansatz (ein Canvas, zwei Viewports) würde den bestehenden `useWaveAnimation`-Hook fundamental umbauen und das Risiko erhöhen. Zwei unabhängige Instanzen erfordern nur eine zweite Hook-Instanz — der bestehende Code bleibt unberührt.

**Kompromiss:** Zwei WebGL-Kontexte beanspruchen mehr GPU-Speicher. Bei 8+8 Quellen kann es zu FPS-Einbrüchen kommen — ein FPS-Warnhinweis (< 20 FPS) fängt das auf.

#### Geteilte Zeitreferenz durch Prop-Drilling
**Warum:** `timeRef` wird aus dem `useWaveAnimation`-Hook von Panel A extrahiert und als Prop an Panel B weitergegeben. Panel B überschreibt seinen eigenen internen Timer nicht, sondern liest aus der gemeinsamen Referenz. Das garantiert Frame-genaue Synchronisation ohne globalen State oder Context.

#### Tabs statt zwei parallele Sidebars
**Warum:** Bei 1024 px Mindestbreite reicht der Platz nicht für vier Panels (SourcePanel A + ParameterPanel A + Canvas A + Canvas B + SourcePanel B + ParameterPanel B). Tabs (A / B) in einer einzigen Sidebar sparen Platz und entsprechen dem bestehenden shadcn `Tabs`-Muster, das bereits im Projekt vorhanden ist.

#### Differenz-Tabelle als eigene Komponente
**Warum:** Setzt bestehende Daten (die zwei `waveParams`-Objekte) zusammen und rendert sie als Vergleich. Keine neue Logik nötig — nur Darstellung. Farbige Hervorhebung via `Badge`-Komponente (bereits in shadcn installiert).

---

### Neue Komponenten und Erweiterungen

```
Neu zu erstellen:
- src/components/wave/ComparePanelLayout.tsx   — Flex-Row mit zwei WavePanel-Slots
- src/components/wave/CompareDiffTable.tsx     — Parameterdifferenz-Tabelle

Zu erweitern:
- src/components/wave/WaveVisualization.tsx    — Compare-State, zweite Hook-Instanz, bedingtes Rendering
- src/components/wave/ControlBar.tsx           — "Vergleich"-Toggle-Button hinzufügen
```

---

### Abhängigkeiten

Keine neuen Pakete erforderlich — alle benötigten shadcn-Komponenten (`Tabs`, `Badge`) sind bereits installiert.

---

### Performance-Abschätzung

| Szenario | Erwartete FPS |
|----------|--------------|
| 2 Quellen pro Panel (2+2) | ≥ 30 FPS |
| 4 Quellen pro Panel (4+4) | ≥ 30 FPS |
| 8 Quellen pro Panel (8+8) | möglicherweise < 30 FPS → Warnung |

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
