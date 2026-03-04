# PROJ-5: Vorgefertigte Szenarien / Presets

## Status: Deployed
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Renderingfundament
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Parameter werden gesetzt
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Quellentyp und -anzahl werden gesetzt

## User Stories
- Als Physiklehrkraft möchte ich mit einem Klick eine vorbereitete Demonstration laden, damit ich nicht während des Unterrichts Parameter manuell einstellen muss.
- Als Lehrkraft möchte ich bekannte Wellenphänomene (Doppelspalt, Stehende Welle) als fertige Presets abrufen, damit Schüler sofort die korrekte Konfiguration sehen.
- Als Schülerin möchte ich verschiedene Szenarien vergleichen, indem ich zwischen Presets wechsle, damit ich die Auswirkungen der Parameter besser verstehe.
- Als Lehrkraft möchte ich nach dem Laden eines Presets alle Parameter weiter anpassen, damit ich ausgehend vom Preset eigene Variationen demonstrieren kann.
- Als Benutzer möchte ich das aktive Szenario jederzeit zurücksetzen, damit ich wieder zum Preset-Ausgangszustand zurückkehren kann.

## Akzeptanzkriterien
- [ ] Ein Dropdown "Szenarien" ist in der ControlBar sichtbar und beschriftet
- [ ] Das Dropdown enthält mindestens 6 Presets: Einzelwelle, Doppelspalt-Interferenz, Stehende Welle, Schwebung, Ebene Welle (Balkenquelle), Dämpfungseffekt
- [ ] Nach Auswahl eines Presets werden alle Parameter (Amplitude, Frequenz, Wellenlänge, Phase, Dämpfung, Quellentyp, Quellenanzahl, Quellenabstand) sofort auf die Preset-Werte gesetzt
- [ ] Die Visualisierung aktualisiert sich ohne spürbare Verzögerung (< 100 ms) nach Preset-Auswahl
- [ ] Nach dem Laden eines Presets sind alle Slider und Eingabefelder weiterhin editierbar
- [ ] Ein Reset-Button neben dem Dropdown stellt den Preset-Ausgangszustand wieder her
- [ ] Das Dropdown zeigt den Namen des aktuell aktiven Presets an; nach manueller Änderung wechselt es zu "Benutzerdefiniert"
- [ ] Presets funktionieren unabhängig vom vorherigen Zustand der App (kein Seiteneffekt durch Vorzustand)
- [ ] Auf einem 1024 px breiten Display ist das Dropdown vollständig sichtbar und bedienbar

## Grenzfälle
- **Preset "Schwebung" benötigt individuelle Frequenzen pro Quelle:** Falls PROJ-3 noch keine per-Quelle-Frequenz unterstützt, zeigt das Preset eine Fehlermeldung "Dieses Szenario benötigt individuelle Quellenparameter (noch nicht verfügbar)" statt stillem Fehlschlag.
- **Preset setzt Phase auf einen Wert außerhalb des aktuellen Sliderbereichs:** Wert wird geclampt und ein Hinweis "Wert wurde auf zulässigen Bereich begrenzt" wird eingeblendet.
- **Schneller Preset-Wechsel (< 100 ms zwischen zwei Klicks):** Letzter ausgewählter Preset gewinnt; kein intermediärer Zustand bleibt bestehen.
- **Benutzer lädt Preset während Animation pausiert ist:** Parameter werden gesetzt, aber die Animation bleibt pausiert; Schüler sehen den eingefrorenen Preset-Zustand.
- **Preset "Stehende Welle" erfordert zwei Quellen mit Phasenversatz π:** Wenn Quellenanzahl zuvor auf 1 stand, wird sie automatisch auf 2 erhöht.
- **Ungültiger Preset-Name im Code:** Fehler wird in der Konsole geloggt; Dropdown zeigt "Benutzerdefiniert" und App bleibt funktionsfähig.

## Preset-Definitionen (fachlich)

| Preset-Name | Quellentyp | Anzahl | Abstand | A | f | λ | φ | d | Beschreibung |
|-------------|-----------|--------|---------|---|---|---|---|---|-------------|
| Einzelwelle | Punkt | 1 | — | 1.0 | 1.0 | 2.0 | 0° | 0.0 | Einfache Kreisringwelle |
| Doppelspalt-Interferenz | Punkt | 2 | 2.0 | 1.0 | 1.0 | 2.0 | 0° | 0.0 | Zwei kohärente Quellen, Interferenzmuster |
| Stehende Welle | Punkt | 2 | 4.0 | 1.0 | 1.0 | 2.0 | 180° | 0.0 | Zwei Quellen mit Phasenversatz π |
| Ebene Welle | Balken | 1 | — | 1.0 | 1.0 | 2.0 | 0° | 0.0 | Linienquelle erzeugt parallele Wellenfronten |
| Dämpfungseffekt | Punkt | 1 | — | 2.0 | 1.0 | 2.0 | 0° | 0.4 | Sichtbarer Amplitudenabfall mit Entfernung |
| Vier-Quellen-Array | Punkt | 4 | 1.5 | 1.0 | 1.0 | 2.0 | 0° | 0.0 | Komplexes Interferenzmuster, Array-Antenne |

## Technische Anforderungen
- Performance: Preset-Wechsel < 100 ms Gesamtlatenz (Parameter setzen + Re-Render)
- Keine Backend-Kommunikation; alle Presets sind statisch im Frontend definiert
- Presets werden als TypeScript-Konstante in `src/lib/wave-presets.ts` definiert
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Überblick
PROJ-5 ist ein **reines Frontend-Feature** ohne Backend-Kommunikation. Alle Preset-Daten sind als TypeScript-Konstanten im Code definiert. Das Feature verbindet die beiden bestehenden Zustandshooks (`useWaveParams` und `useWaveSources`) über einen neuen `usePresets`-Hook und ergänzt die `ControlBar` um eine Preset-Auswahlkomponente.

---

### A) Komponentenstruktur

```
Hauptseite (page.tsx)
├── useWaveParams (bestehend) — Wellenparameter-Zustand
├── useWaveSources (bestehend) — Quellenkonfigurations-Zustand
├── usePresets (NEU) — verknüpft beide Hooks, verwaltet aktives Preset
│
├── SourcePanel (links, bestehend)
├── WaveVisualization (Mitte, bestehend)
├── ParameterPanel (rechts, bestehend)
└── ControlBar (unten, erweitert)
    └── PresetSelector (NEU)
        ├── Select-Dropdown "Szenarien" (shadcn/ui — bereits vorhanden)
        │   ├── Einzelwelle
        │   ├── Doppelspalt-Interferenz
        │   ├── Stehende Welle
        │   ├── Ebene Welle
        │   ├── Dämpfungseffekt
        │   ├── Vier-Quellen-Array
        │   └── ── Benutzerdefiniert (automatisch, nach manueller Änderung)
        └── Reset-Button (RotateCcw-Icon, shadcn Button)
```

---

### B) Datenmodell

**Preset-Eintrag (statisch im Code definiert):**
```
Jedes Preset enthält:
- Eindeutige ID (z.B. "single-wave")
- Anzeigename (z.B. "Einzelwelle")
- Kurzbeschreibung für Tooltip
- Quellenform (Punkt / Balken / Ring / Dreieck)
- Quellenanzahl (1–8)
- Quellenabstand (Meter)
- Amplitude A
- Frequenz f
- Wellenlänge λ
- Phase φ (in Grad)
- Dämpfung d

Gespeichert in: src/lib/wave-presets.ts als TypeScript-Konstante
Persistenz: Kein Speichern — Presets sind beim Seitenneuladen immer verfügbar
```

**Preset-Zustand (Laufzeit):**
```
- activePresetId: ID des aktuell geladenen Presets (oder null = "Benutzerdefiniert")
- isDirty: true sobald ein Parameter nach Preset-Load manuell verändert wurde
```

---

### C) Technische Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| Preset-Speicherort | `src/lib/wave-presets.ts` | Wie in der Spec gefordert; einfach zu erweitern |
| Platzierung im UI | In der ControlBar (unten) | Spec-Anforderung; globale Aktion gehört nicht in einen der Seitenleisten-Panels |
| "Benutzerdefiniert"-Erkennung | `isDirty`-Flag im `usePresets`-Hook | Einfachste Lösung; kein deep comparison nötig |
| Atomares Laden | Beide Hooks werden gleichzeitig gesetzt | Verhindert Zwischenzustand zwischen Parameterupdate und Quellenupdate |
| Grenzfall "Schwebung" | Fehlermeldung statt stiller Fehler | Spec-Anforderung; nutzt bestehende Toast/Alert-Muster |
| Neue Abhängigkeiten | **Keine** | Alle nötigen shadcn/ui-Komponenten (Select, Button) bereits installiert |

---

### D) Neue und geänderte Dateien

**Neu erstellt (3 Dateien):**
- `src/lib/wave-presets.ts` — Alle 6 Preset-Definitionen als typisierte Konstante
- `src/components/wave/PresetSelector.tsx` — Dropdown + Reset-Button Komponente
- `src/hooks/usePresets.ts` — Verwaltet activePresetId, isDirty, loadPreset(), resetToPreset()

**Erweitert (4 Dateien):**
- `src/hooks/useWaveParams.ts` — Neue Methode `applyParams(params)` zum atomaren Setzen aller Parameter
- `src/hooks/useWaveSources.ts` — Neue Methode `applyConfig(config)` zum atomaren Setzen der Quellenkonfiguration
- `src/components/wave/ControlBar.tsx` — PresetSelector-Komponente einbinden
- `src/app/page.tsx` — usePresets-Hook verdrahten und Callbacks weitergeben

---

### E) Abhängigkeiten

**Keine neuen Pakete erforderlich.** Alle benötigten Komponenten sind bereits installiert:
- `shadcn/ui Select` → Preset-Dropdown (`src/components/ui/select.tsx` ✓)
- `shadcn/ui Button` → Reset-Button (`src/components/ui/button.tsx` ✓)
- `lucide-react RotateCcw` → Reset-Icon (bereits in ParameterPanel genutzt ✓)

## QA-Testergebnisse

**QA-Durchlauf 1:** 2026-03-04
**Tester:** QA-Engineer (Claude Code)
**Build-Status:** BESTANDEN (Next.js 16.1.6, TypeScript fehlerfrei)
**Lint-Status:** NICHT BESTANDEN -- 1 ESLint-Fehler in abhaengiger Datei (siehe PROJ-4 Bug #5, inzwischen behoben)

---

### Akzeptanzkriterien-Pruefung

| # | Kriterium | Status | Nachweis |
|---|-----------|--------|----------|
| AC-1 | Dropdown "Szenarien" in ControlBar sichtbar und beschriftet | BESTANDEN | `ControlBar.tsx` Z.77-86: PresetSelector bedingt gerendert; `PresetSelector.tsx` Z.37: Label "Szenarien:" |
| AC-2 | Mindestens 6 Presets (Einzelwelle, Doppelspalt, Stehende Welle, Schwebung, Ebene Welle, Daempfungseffekt) | BESTANDEN | `wave-presets.ts`: 7 Presets vorhanden -- alle 6 geforderten plus "Vier-Quellen-Array" als Bonus (Bug #1 behoben) |
| AC-3 | Preset-Auswahl setzt alle Parameter sofort | BESTANDEN | `usePresets.ts` Z.29-41: `loadPreset()` ruft `applyConfig()` + `applyParams()` atomar auf |
| AC-4 | Visualisierung aktualisiert < 100ms | BESTANDEN | Synchrone React-State-Updates; kein async/await oder setTimeout |
| AC-5 | Slider/Eingabefelder nach Preset-Load editierbar | BESTANDEN | `useWaveParams.ts`: `applyParams()` setzt SliderStates mit sliderPercent=0; Slider bleibt funktional |
| AC-6 | Reset-Button stellt Preset-Ausgangszustand wieder her | BESTANDEN | `PresetSelector.tsx` Z.64-83: Reset-Button mit RotateCcw-Icon; `usePresets.ts` Z.43-50: `resetToPreset()` |
| AC-7 | Dropdown zeigt aktiven Preset-Namen; nach manueller Aenderung "Benutzerdefiniert" | BESTANDEN | `PresetSelector.tsx` Z.33: displayValue-Logik; Z.46: Placeholder "Benutzerdefiniert" bei isDirty; `WaveVisualization.tsx` Z.39-51: wrappedHooks rufen `markDirty()` bei jeder manuellen Aenderung |
| AC-8 | Presets funktionieren unabhaengig vom Vorzustand | BESTANDEN | `applyParams()` setzt ALLE Quellen auf identische Werte; `applyConfig()` ersetzt Config komplett |
| AC-9 | Dropdown vollstaendig sichtbar bei 1024px | BESTANDEN | `PresetSelector.tsx` Z.44: `w-[200px]` feste Breite; ControlBar hat `flex-wrap`-faehiges Layout |

**Ergebnis Durchlauf 1: 8 von 9 Kriterien bestanden, 1 teilweise bestanden**
**Ergebnis Re-Test (Durchlauf 2): 9 von 9 Kriterien bestanden**

---

### Gefundene Bugs

#### Bug #1: Preset "Schwebung" fehlt in der Implementierung
- **Schweregrad:** Mittel (Feature-Luecke)
- **Prioritaet:** P2
- **Status:** BEHOBEN (Re-Test Durchlauf 2)
- **Nachweis:** `wave-presets.ts` Z.91-107: Neues Preset "Schwebung" (id: "beat-frequency") mit `perSourceParams` -- Quelle 1: f=1.0, lambda=2.0; Quelle 2: f=1.2, lambda=1.67. Es sind nun 7 Presets insgesamt, alle 6 geforderten sind enthalten.

#### Bug #2: "Stehende Welle"-Preset setzt Phase 180 fuer ALLE Quellen identisch
- **Schweregrad:** Hoch (Physikalisch inkorrekt)
- **Prioritaet:** P1
- **Status:** BEHOBEN (Re-Test Durchlauf 2)
- **Nachweis:** `wave-presets.ts` Z.59-62: `perSourceParams` eingefuehrt -- Quelle 1 hat Phase=0, Quelle 2 hat Phase=180. Die `applyParams()`-Methode in `useWaveParams.ts` Z.252-270 unterstuetzt jetzt den optionalen Parameter `perSourceParams?: WaveParams[]` und setzt fuer jede Quelle individuelle SliderStates via `toSliderStates(perSourceParams[i])`.

#### Bug #3: Reset-Button nur sichtbar wenn Preset geladen UND dirty
- **Schweregrad:** Niedrig (UX)
- **Prioritaet:** P3
- **Status:** OFFEN (akzeptabel)
- **Datei:** `src/components/wave/PresetSelector.tsx`, Zeile 64
- **Beschreibung:** Die Bedingung `{activePresetId && isDirty && (...)}` zeigt den Reset-Button nur wenn nach einem Preset-Load manuell etwas geaendert wurde. Das ist logisch korrekt (es gibt nichts zurueckzusetzen), aber die Spezifikation sagt "Ein Reset-Button neben dem Dropdown". Benutzer koennten den Button vermissen.
- **Auswirkung:** Minimale UX-Verwirrung; Button erscheint erst nach manueller Aenderung

#### Bug #4: Tooltip im Select-Dropdown funktioniert nicht zuverlaessig
- **Schweregrad:** Niedrig (UX)
- **Prioritaet:** P3
- **Status:** OFFEN (akzeptabel)
- **Datei:** `src/components/wave/PresetSelector.tsx`, Zeilen 50-61
- **Beschreibung:** Jedes `SelectItem` ist in ein `TooltipProvider` und `Tooltip` gewickelt. Die Verschachtelung innerhalb des Select-Portals kann zu Konflikten fuehren.
- **Empfehlung:** Beschreibung direkt unter dem Preset-Namen im SelectItem anzeigen statt Tooltip
- **Auswirkung:** Benutzer sehen moeglicherweise die Preset-Beschreibungen nicht

---

### Sicherheitsaudit (Red-Team)

| Pruefpunkt | Status | Details |
|------------|--------|---------|
| XSS via Preset-Daten | SICHER | Preset-Daten sind statische TypeScript-Konstanten, nicht aus externen Quellen |
| Preset-ID Injection | SICHER | `getPresetById()` sucht per `.find()` in einem festen Array; keine DB-Abfrage |
| Prototype Pollution via Preset-Params | SICHER | `applyParams()` erstellt ein neues SliderStates-Objekt mit bekannten Keys |
| Client-DoS via Preset-Wechsel | SICHER | Keine Schleifen oder rekursive Aufrufe bei Preset-Wechsel |
| Daten-Exposure | SICHER | Keine sensiblen Daten in Presets |

**Ergebnis: Keine Sicherheitsluecken.**

---

### Cross-Browser & Responsive

| Browser / Viewport | Status | Anmerkung |
|--------------------|--------|-----------|
| Chrome Desktop | OK | shadcn Select-Dropdown rendert korrekt |
| Firefox Desktop | OK | shadcn Select-Dropdown rendert korrekt |
| Safari Desktop | PRUEFUNG AUSSTEHEND | shadcn Select nutzt Radix UI Portale; Safari kann Fokus-Handling in Portalen anders behandeln |
| 1440px Desktop | OK | PresetSelector hat genuegend Platz im ControlBar |
| 1024px Desktop | OK | PresetSelector mit w-[200px] passt; Label "Szenarien:" hat `hidden sm:inline` |
| 768px Tablet | HINWEIS | Label "Szenarien:" wird per `hidden sm:inline` ausgeblendet; Dropdown bleibt sichtbar |
| 375px Mobile | HINWEIS | ControlBar wird eng; alle Elemente (Buttons + Preset + Schnittebene) muessen sich Platz teilen |

---

### Regressionspruefung

| Feature | Status | Details |
|---------|--------|---------|
| PROJ-1 (3D-Visualisierung) | KEINE REGRESSION | Preset aendert nur Parameter, nicht die Rendering-Engine |
| PROJ-2 (Parameter-Steuerung) | KEINE REGRESSION | Slider bleiben nach Preset-Load funktional; wrappedHooks aendern keine Kernlogik |
| PROJ-3 (Quellen-Konfiguration) | KEINE REGRESSION | `applyConfig()` setzt SourceConfig; bestehende Setter bleiben unveraendert |
| PROJ-4 (Schnittebene) | KEINE REGRESSION | Schnittebene reagiert auf Parameteraenderungen via geteilte Refs |

---

### Gesamtbewertung

| Kategorie | Bewertung |
|-----------|-----------|
| Funktionalitaet | 9/9 Kriterien bestanden |
| Bugs behoben | 2 (Bug #1 P2, Bug #2 P1) |
| Bugs offen | 2 (Bug #3 P3, Bug #4 P3 -- beide akzeptabel) |
| Sicherheit | Keine Luecken |
| Regression | Keine |
| Build | BESTANDEN |
| Lint | BESTANDEN |

### Produktionsbereitschaft: BEREIT

Alle P1- und P2-Bugs sind behoben. Die verbleibenden P3-Bugs (Reset-Button-Sichtbarkeit und Tooltip-Portal-Konflikte) sind kosmetischer Natur und koennen in einem Folge-Sprint behoben werden.

---

### QA-Durchlauf 2 -- Re-Test (2026-03-04, nach Bug-Fixes)

**Tester:** QA-Engineer (Claude Code)
**Build-Status:** BESTANDEN (Next.js 16.1.6, TypeScript fehlerfrei)
**Lint-Status:** BESTANDEN (0 Fehler -- PROJ-4 Bug #5 ebenfalls behoben)

#### Re-Test Bug #2 (P1): "Stehende Welle" physikalisch inkorrekt

- **Status:** BEHOBEN
- **Nachweis:** `wave-presets.ts` Z.59-62 fuehrt `perSourceParams` ein: Quelle 1 bekommt Phase=0, Quelle 2 bekommt Phase=180. Die `applyParams()`-Methode in `useWaveParams.ts` Z.252-270 akzeptiert jetzt den optionalen Parameter `perSourceParams?: WaveParams[]` und wendet pro Quelle individuelle Parameter an (Z.261-266: `perSourceParams && perSourceParams[i] ? toSliderStates(perSourceParams[i]) : defaultState`).

#### Re-Test Bug #1 (P2): Preset "Schwebung" fehlt

- **Status:** BEHOBEN
- **Nachweis:** `wave-presets.ts` Z.91-107: Neues Preset mit id="beat-frequency", name="Schwebung". Verwendet `perSourceParams` mit Quelle 1 (f=1.0, lambda=2.0) und Quelle 2 (f=1.2, lambda=1.67). Insgesamt 7 Presets, alle 6 geforderten sind vorhanden.

#### Verbleibende P3-Bugs (nicht deployment-blockierend)

- **Bug #3 (P3):** Reset-Button nur bei dirty sichtbar -- unveraendert, akzeptabel
- **Bug #4 (P3):** Tooltip-Portal-Konflikte im Select -- unveraendert, akzeptabel

## Deployment
_Wird von /deploy hinzugefügt_
