# PROJ-2: Wellenparameter-Steuerung

## Status: Deployed
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Parameter steuern die Wellengleichung der 3D-Szene

## Beschreibung
Ein Steuerungspanel, über das alle Parameter der Wellengleichung `z = A · sin(k·r - ω·t + φ)` interaktiv eingestellt werden können. Jeder Parameter hat:
1. Ein Slider von -100 % bis +100 % des eingestellten Absolutwerts
2. Ein numerisches Eingabefeld für den Absolutwert

Änderungen aktualisieren die 3D-Visualisierung in Echtzeit ohne Neuladen.

## Parameter der Wellengleichung

| Parameter | Symbol | Einheit | Standardwert | Typischer Bereich |
|-----------|--------|---------|--------------|-------------------|
| Amplitude | A | m | 1.0 | 0.1 – 5.0 |
| Frequenz | f | Hz | 1.0 | 0.1 – 10.0 |
| Kreisfrequenz | ω | rad/s | 2π·f | (abgeleitet) |
| Wellenzahl | k | 1/m | 2π/λ | (abgeleitet) |
| Wellenlänge | λ | m | 2.0 | 0.5 – 20.0 |
| Wellengeschwindigkeit | v | m/s | v = f·λ | (anzeigbar) |
| Anfangsphase | φ | rad | 0.0 | -π – +π |
| Dämpfung | d | 1/m | 0.0 | 0.0 – 1.0 |

> **Hinweis:** f, λ und v sind nicht unabhängig (v = f·λ). Bei Änderung von f oder λ wird v neu berechnet und angezeigt (read-only).

## User Stories

- Als Lehrkraft möchte ich die Amplitude über einen Slider live ändern, damit ich dem Kurs zeigen kann, wie die Wellenhöhe variiert.
- Als Schüler möchte ich die Frequenz als Absolutwert eingeben und dann mit dem Slider ±100 % variieren, damit ich präzise und explorativ experimentieren kann.
- Als Lehrkraft möchte ich die abgeleiteten Größen (ω, k, v) berechnet sehen, damit ich den Zusammenhang zwischen den Parametern didaktisch verdeutlichen kann.
- Als Benutzer möchte ich alle Parameter mit einem "Zurücksetzen"-Button auf Standardwerte zurücksetzen, damit ich schnell neue Szenarien beginnen kann.
- Als Benutzer möchte ich sehen, welche Formel gerade aktiv ist (z. B. `z = 1.0 · sin(3.14·r - 6.28·t + 0)`), damit der Bezug zur Mathematik sichtbar bleibt.

## Akzeptanzkriterien

- [ ] Jeder Parameter hat: einen benannten Slider (–100 % bis +100 %) + ein numerisches Absolutwert-Eingabefeld
- [ ] Slider und Eingabefeld sind bidirektional synchronisiert (Änderung in einem aktualisiert das andere)
- [ ] Slider-Wert 0 % = Absolutwert, –100 % = 0 (geclampt auf Parameter-Minimum falls physikalisch nötig), +100 % = 2 × Absolutwert
- [ ] Die Wellenvisualisierung aktualisiert sich bei jeder Parameteränderung in Echtzeit (< 100 ms Latenz)
- [ ] Abgeleitete Größen (ω, k, v) werden im Panel als read-only Felder angezeigt und automatisch aktualisiert
- [ ] Eine Formelzeile zeigt die aktuelle Wellengleichung mit eingesetzten Werten an
- [ ] Ein "Parameter zurücksetzen"-Button setzt alle Werte auf Standardwerte zurück
- [ ] Eingabewerte werden validiert: Wellenlänge darf nicht < 0.1 sein, Frequenz darf nicht negativ sein (Frequenz = 0 ist erlaubt: stehende Momentaufnahme)
- [ ] Das Panel ist kollabierbar (minimierbar), um die 3D-Ansicht zu vergrößern
- [ ] Labels enthalten die physikalische Einheit (z. B. "Amplitude A [m]")

## Grenzfälle

- **Frequenz = 0:** Slider-Minimum → stehende Momentaufnahme (keine Animation). Kein Fehler.
- **Amplitude = 0:** Flache Ebene sichtbar, Slider funktioniert weiterhin.
- **Ungültige Texteingabe (z. B. "abc"):** Eingabefeld wird rot hervorgehoben, letzter gültiger Wert bleibt aktiv.
- **Sehr großer Absolutwert (z. B. Amplitude = 1000):** Darstellung skaliert automatisch (Kamera-Clip-Plane wird angepasst), kein Overflow.
- **Negative Dämpfung:** Wird auf 0 geclippt (physikalisch sinnloser Wert), mit Tooltip-Erklärung.
- **Schnelle Slider-Bewegung:** Rendering wird gedrosselt (throttle 16 ms), keine Performance-Einbußen.

## Technische Anforderungen

- **UI-Komponenten:** shadcn/ui `Slider`, `Input`, `Label`, `Card`, `Collapsible`
- **State-Management:** React `useState` / `useCallback` mit debounce für Slider-Events
- **Datenfluss:** Parameter-State wird an PROJ-1 Three.js-Szene per Ref / Context weitergereicht
- **Validierung:** Zod-Schema für alle Parametergrenzen
- **Performance:** Slider-Events werden auf 60 FPS (16 ms) throttled

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

**Erstellt:** 2026-03-03 | **Architektur-Typ:** Reine Frontend-Erweiterung (kein Backend)

### Komponentenstruktur

```
src/app/page.tsx  (Hauptseite, unverändert)
└── WaveVisualization  (erweitert: hält jetzt waveParams State)
    ├── WaveCanvas  (3D-Szene, empfängt Parameter via Ref-Updates)
    ├── ParameterPanel  [NEU, kollabierbar, rechte Seitenleiste]
    │   ├── Panel-Header (Titel "Wellenparameter" + Auf-/Zuklapp-Button)
    │   ├── ParameterControl × 5  [NEU, je einer pro einstellbarem Parameter]
    │   │   ├── Label  (Name + Symbol + Einheit, z.B. "Amplitude A [m]")
    │   │   ├── Slider  (–100 % bis +100 % des Absolutwerts)
    │   │   └── Input  (numerisches Absolutwert-Eingabefeld)
    │   ├── DerivedValues  [NEU, read-only Anzeige]
    │   │   ├── Kreisfrequenz ω  (= 2π·f)
    │   │   ├── Wellenzahl k  (= 2π/λ)
    │   │   └── Wellengeschwindigkeit v  (= f·λ)
    │   ├── FormulaDisplay  [NEU, aktuelle Gleichung mit eingesetzten Zahlenwerten]
    │   └── ResetButton  ("Parameter zurücksetzen" → alle auf Standardwerte)
    └── ControlBar  (Play/Pause, Kamera-Reset, FPS — unverändert)
```

### Layout-Konzept

```
+-----------------------------------------------------+
| Header: WavePhysics    z = A·sin(k·r − ω·t + φ)    |
+--------------------------------------+--------------+
|                                      | Parameter-   |
|                                      | Panel        |
|           3D-Canvas                  | (kollabier-  |
|        (nimmt restlichen             |  bar)        |
|          Platz ein)                  |              |
|                                      | [Slider]     |
|                                      | [Input]      |
|                                      | [...]        |
+--------------------------------------+--------------+
| ControlBar: ▶ Pause | ↺ Kamera Reset |    42 FPS   |
+-----------------------------------------------------+
```

Bei eingeklapptem Panel füllt der 3D-Canvas die volle Breite.

### Slider-Mechanik (Dual-Control-Konzept)

Jeder Parameter hat **zwei** zusammenhängende Bedienelemente:

```
Absolutwert-Eingabe: Der Benutzer tippt z.B. "2.0" ein (= Basiswert)
Slider-Position:     -100% ────── 0% ────── +100%
Tatsächlicher Wert:    0        2.0         4.0  (= 2 × Basiswert)
```

- **0 %** = der eingegebene Absolutwert wird unverändert verwendet
- **–100 %** = Untergrenze (meist 0 oder Parameter-Minimum)
- **+100 %** = doppelter Absolutwert (2×)
- Slider und Input sind bidirektional synchronisiert
- Ändert man den Absolutwert, bleibt die Slider-Position bei 0 %

### Datenmodell (alles im Browser-Arbeitsspeicher)

```
Einstellbare Parameter (React State in WaveVisualization):
- Amplitude (A): Höhe der Welle [m], Standard: 1.0
- Frequenz (f): Schwingungen pro Sekunde [Hz], Standard: 1.0
- Wellenlänge (λ): Abstand zwischen Wellenbergen [m], Standard: 2.0
- Anfangsphase (φ): horizontale Verschiebung [rad], Standard: 0.0
- Dämpfung (d): Abschwächung mit Abstand [1/m], Standard: 0.0

Abgeleitete Größen (berechnet, nicht einstellbar):
- Kreisfrequenz (ω) = 2π · f
- Wellenzahl (k) = 2π / λ
- Wellengeschwindigkeit (v) = f · λ

Gespeichert: nur im flüchtigen Browser-Arbeitsspeicher
→ Kein LocalStorage, keine Datenbank
```

### Datenfluss (Parameter → 3D-Szene)

```
Benutzer ändert Slider oder Input
     ↓
React State "waveParams" wird aktualisiert (in WaveVisualization)
     ↓
useWaveAnimation erhält neue Werte via Ref-Update
     ↓  (kein Neuaufbau der Three.js-Szene nötig!)
Shader-Uniforms werden direkt überschrieben
     ↓
GPU berechnet neue Wellenauslenkung im nächsten Frame
     ↓
Visuelles Ergebnis sofort sichtbar (< 16 ms)
```

### Validierung

```
Eingabe ungültig (z.B. "abc"):
→ Eingabefeld wird rot markiert
→ Letzter gültiger Wert bleibt aktiv
→ Keine Änderung an der Visualisierung

Wellenlänge oder Frequenz = 0 oder negativ:
→ Wird abgelehnt (Minimum-Grenzen greifen)
→ Tooltip erklärt, warum der Wert nicht erlaubt ist

Negative Dämpfung:
→ Wird auf 0 geclippt (physikalisch sinnlos)
→ Tooltip: "Dämpfung kann nicht negativ sein"
```

### Technische Entscheidungen (Begründung)

| Entscheidung | Gewählt | Warum |
|---|---|---|
| Panel-Position | Rechte Seitenleiste (statt Overlay) | Lehrkräfte brauchen 3D-Szene und Parameter gleichzeitig sichtbar |
| Panel kollabierbar | shadcn/ui `Collapsible` | Vollbild-3D-Ansicht für Präsentationen am Beamer |
| State-Ort | React `useState` in WaveVisualization | Einfachste Lösung, kein Kontext/Store nötig für 5 Parameter |
| Uniform-Updates | Direkt via `uniformsRef` (bereits vorhanden) | Kein Neuaufbau der 3D-Szene = keine Ruckler bei Parameteränderung |
| Slider-Throttling | 16 ms (= 60 FPS) | Flüssig genug für das Auge, schont CPU/GPU bei schnellem Schieben |
| Validierung | Zod-Schema (bereits in `wave-params.ts` vorhanden) | Schon vorbereitet, alle Grenzen definiert, typsicher |
| Formelanzeige | Statische Textzeile mit eingesetzten Werten | Didaktisch wertvoll: Schüler sehen Zusammenhang Formel ↔ Visualisierung |

### Bestehende Infrastruktur (wird wiederverwendet)

Folgende Dateien existieren bereits und werden erweitert, **nicht neu erstellt**:

| Datei | Was ist schon da | Was kommt dazu |
|-------|------------------|----------------|
| `wave-params.ts` | Typen, Defaults, Zod-Schema, abgeleitete Werte, UI-Metadaten | Nichts — bereits vollständig vorbereitet |
| `useWaveAnimation.ts` | Three.js-Szene, `uniformsRef`, Animationsloop | Akzeptiert externen Parameter-State, Dämpfungs-Uniform |
| `wave-shader.ts` | Vertex/Fragment-Shader ohne Dämpfung | Neues Uniform `u_damping` für exponentiellen Abfall |
| `WaveVisualization.tsx` | Layout, Play/Pause, FPS | Hält `waveParams`-State, integriert ParameterPanel |

### Zu erstellende Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/wave/ParameterPanel.tsx` | Kollabierbare Seitenleiste mit allen Parametern |
| `src/components/wave/ParameterControl.tsx` | Einzelner Parameter: Label + Slider + Input |
| `src/components/wave/FormulaDisplay.tsx` | Formelzeile mit eingesetzten Werten |
| `src/hooks/useWaveParams.ts` | Custom Hook: verwaltet Parameterwerte, Slider-Prozent, Validierung |

### Abhängigkeiten (zu installieren)

**Keine neuen Pakete nötig.** Alles ist bereits vorhanden:
- shadcn/ui: Slider, Input, Label, Card, Collapsible, Tooltip, Button
- Zod (Validierung)
- Three.js (3D-Rendering)
- lucide-react (Icons)

## QA-Testergebnisse

**QA-Durchlauf:** 2026-03-03 | **Status:** 7/10 PASS, 3/10 FAIL

### Akzeptanzkriterien -- Einzelergebnisse

#### AK-1: Jeder Parameter hat benannten Slider (-100% bis +100%) + numerisches Absolutwert-Eingabefeld
**Ergebnis: PASS**

Begruendung: In `ParameterControl.tsx` (Zeilen 127-137) wird ein shadcn/ui `Slider` mit `min={-100}` und `max={100}` und `step={1}` gerendert. Darunter befindet sich ein `Input`-Feld (Zeilen 142-162) vom Typ `text` mit `inputMode="decimal"`. Alle 5 einstellbaren Parameter (Amplitude, Frequenz, Wellenlaenge, Phase, Daempfung) werden in `ParameterPanel.tsx` (Zeilen 89-98) ueber `PARAMETER_CONFIGS.map()` erzeugt. Jeder hat Label, Slider und Input -- korrekt implementiert.

---

#### AK-2: Slider und Eingabefeld sind bidirektional synchronisiert
**Ergebnis: PASS**

Begruendung: In `useWaveParams.ts`:
- `setSliderPercent` (Zeile 148) aendert den Slider-Prozentsatz -> `computeEffectiveValue` (Zeile 40) berechnet den neuen Wert -> der effektive Wert wird als `= X.XX m` neben dem Label angezeigt.
- `setBaseValue` (Zeile 171) aendert den Absolutwert und setzt `sliderPercent` auf 0 (Zeile 183).
- In `ParameterControl.tsx` zeigt `displayValue` (Zeile 45-48) den aktuellen `baseValue` im Input an.
Die Synchronisation funktioniert korrekt in beide Richtungen.

---

#### AK-3: Slider-Wert 0% = Absolutwert, -100% = 0 (Untergrenze), +100% = 2x Absolutwert
**Ergebnis: FAIL** -- Schweregrad: MITTEL

Begruendung: Die Funktion `computeEffectiveValue` in `useWaveParams.ts` (Zeilen 40-58) berechnet:
- Bei `sliderPercent >= 0`: `value = baseValue + (baseValue * sliderPercent / 100)` --> Bei 0% = baseValue (korrekt), bei +100% = 2 * baseValue (korrekt).
- Bei `sliderPercent < 0`: `value = baseValue + (range * sliderPercent / 100)` wobei `range = baseValue - config.min`.

**BUG-1: Slider -100% erreicht nicht 0, sondern config.min**
- Fuer Amplitude: `config.min = 0.01`, also -100% = 0.01 (nicht 0).
- Fuer Wellenlaenge: `config.min = 0.1`, also -100% = 0.1 (nicht 0).
- Fuer Phase: `config.min = -Math.PI`, also -100% = -Math.PI (nicht 0).
- Fuer Daempfung: `config.min = 0`, also -100% = 0 (korrekt nur hier).

Das Akzeptanzkriterium sagt explizit "-100% = 0 (Untergrenze)". Die Implementierung nutzt stattdessen `config.min` als Untergrenze. Fuer Amplitude und Wellenlaenge ist dies physikalisch sinnvoll (Division durch 0 vermeiden), aber die Spec sagt "0". Bei Phase ist das Verhalten besonders problematisch: -100% fuehrt zu -PI statt 0.

**Reproduktionsschritte:**
1. Amplitude auf Absolutwert 1.0 setzen
2. Slider auf -100% ziehen
3. Erwartet: effektiver Wert = 0.00 m
4. Tatsaechlich: effektiver Wert = 0.01 m

**Prioritaet:** P2 -- Die Abweichung ist gering bei den meisten Parametern, aber die Spec-Konformitaet ist nicht gegeben. Entscheidung noetig: Soll die Spec angepasst werden (physikalisch sinnvoll) oder der Code?

---

#### AK-4: Wellenvisualisierung aktualisiert sich bei jeder Parameteraenderung in Echtzeit (< 100 ms Latenz)
**Ergebnis: PASS**

Begruendung: Der Datenfluss ist effizient implementiert:
1. Parameteraenderung -> `useWaveParams` State-Update -> `useMemo` berechnet `uniforms` (`useWaveParams.ts` Zeile 114)
2. `useWaveAnimation` empfaengt `waveUniforms` als Prop (`useWaveAnimation.ts` Zeile 31)
3. Ein `useEffect` (Zeilen 67-76) schreibt die Werte direkt in die Three.js Uniform-Referenzen -- KEIN Neuaufbau der Szene
4. Der Animationsloop rendert im naechsten Frame (< 16 ms)

Die Latenz von Parameter-Aenderung bis visueller Aktualisierung liegt bei maximal 1-2 Frames (16-32 ms), weit unter den geforderten 100 ms. Die Uniform-Referenzen werden direkt ueberschrieben, was die effizienteste Methode ist.

---

#### AK-5: Abgeleitete Groessen (omega, k, v) werden als read-only Felder angezeigt und automatisch aktualisiert
**Ergebnis: PASS**

Begruendung: In `ParameterPanel.tsx` (Zeilen 103-129) werden drei `DerivedField`-Komponenten gerendert:
- Kreisfrequenz omega = 2*PI*f (Symbol: omega, Einheit: rad/s, Formel: 2*PI*f)
- Wellenzahl k = 2*PI/lambda (Symbol: k, Einheit: 1/m, Formel: 2*PI/lambda)
- Wellengeschwindigkeit v = f*lambda (Symbol: v, Einheit: m/s, Formel: f*lambda)

Alle Werte kommen aus `derived` (`useWaveParams.ts` Zeile 113), berechnet via `computeDerivedValues` (`wave-params.ts` Zeile 45-51). Die Berechnung ist korrekt und wird bei jeder Parameteraenderung automatisch via `useMemo` aktualisiert. Die Felder sind rein darstellend (kein Input), also read-only.

---

#### AK-6: Eine Formelzeile zeigt die aktuelle Wellengleichung mit eingesetzten Werten an
**Ergebnis: PASS**

Begruendung: `FormulaDisplay.tsx` zeigt die Gleichung `z = A * exp(-d*r) * sin(k*r - omega*t + phi)` mit eingesetzten Zahlenwerten an. Der Daempfungsterm `exp(-d*r)` wird korrekt nur angezeigt wenn `damping > 0` (Zeile 23). Das Phasen-Vorzeichen wird korrekt behandelt (Zeilen 26-33: positiv mit "+", negativ mit "-", null wird weggelassen). Die Farbcodierung (Rot=Amplitude, Orange=Daempfung, Blau=Wellenzahl, Lila=Kreisfrequenz, Gruen=Phase) ist didaktisch sinnvoll.

---

#### AK-7: Ein "Parameter zuruecksetzen"-Button setzt alle Werte auf Standardwerte zurueck
**Ergebnis: PASS**

Begruendung: In `ParameterPanel.tsx` (Zeilen 71-80) gibt es einen Button "Zuruecksetzen" mit dem `RotateCcw`-Icon, der `resetAll` aufruft. Die Funktion `resetAll` in `useWaveParams.ts` (Zeilen 200-203) setzt `sliderStates` auf `createInitialSliderStates()` (alle baseValues auf Defaults, alle sliderPercents auf 0) und loescht alle `validationErrors`. Das ist korrekt.

---

#### AK-8: Eingabewerte werden validiert: Wellenlaenge und Frequenz duerfen nicht 0 oder negativ sein
**Ergebnis: FAIL** -- Schweregrad: HOCH

Begruendung: Das Zod-Schema in `wave-params.ts` (Zeilen 17-23) definiert:
- `frequency: z.number().min(0).max(100)` -- **Frequenz = 0 ist ERLAUBT!**
- `wavelength: z.number().min(0.01).max(100)` -- Wellenlaenge nahe 0 ist erlaubt (0.01)

**BUG-2: Frequenz = 0 wird vom Zod-Schema nicht abgelehnt**
Das Akzeptanzkriterium sagt: "Frequenz duerfen nicht 0 oder negativ sein." Aber `z.number().min(0)` erlaubt den Wert 0. Das Schema muesste `z.number().positive()` oder `z.number().gt(0)` verwenden.

ALLERDINGS: Der Grenzfall-Abschnitt der Spec sagt "Frequenz = 0: Slider-Minimum -> stehende Momentaufnahme (keine Animation). Kein Fehler." Das ist ein WIDERSPRUCH in der Spezifikation selbst:
- AK-8 sagt: Frequenz darf nicht 0 sein
- Grenzfall sagt: Frequenz = 0 ist erlaubt (stehende Momentaufnahme)

**BUG-3: Wellenlaenge kann durch Slider bis auf 0.01 gesenkt werden -- Division-durch-nahe-Null**
In `computeDerivedValues` (wave-params.ts Zeile 48): `waveNumber = (2 * Math.PI) / params.wavelength`. Bei wavelength = 0.01 wird k = 628.32, was zu extrem dichter Wellenstruktur fuehrt. Das ist kein Absturz, aber visuell problematisch.

**Reproduktionsschritte fuer BUG-2:**
1. Frequenz-Absolutwert auf 0 setzen
2. Erwartet: Rote Hervorhebung, Wert wird abgelehnt
3. Tatsaechlich: Wert wird akzeptiert, Welle steht still

**Prioritaet:** P1 -- Der Widerspruch in der Spezifikation muss geklaert werden. Wenn AK-8 autoritativ ist, muss das Zod-Schema geaendert werden. Wenn der Grenzfall autoritativ ist, muss AK-8 angepasst werden.

---

#### AK-9: Das Panel ist kollabierbar (minimierbar), um die 3D-Ansicht zu vergroessern
**Ergebnis: PASS**

Begruendung: `ParameterPanel.tsx` verwendet das shadcn/ui `Collapsible`-Primitiv (Zeilen 46-137). Der Zustand `isPanelOpen` wird in `WaveVisualization.tsx` (Zeile 13) verwaltet. Ein Toggle-Button mit Chevron-Icons (Zeile 48-61) ist immer sichtbar. Bei geschlossenem Panel faellt der Toggle-Button weg und der 3D-Canvas nimmt den vollen Platz ein (da `className="flex-1"` auf dem Canvas-Container, WaveVisualization.tsx Zeile 67). Die Animation wird via Tailwind-Klassen `slide-in-from-right` / `slide-out-to-right` gesteuert.

---

#### AK-10: Labels enthalten die physikalische Einheit (z.B. "Amplitude A [m]")
**Ergebnis: FAIL** -- Schweregrad: NIEDRIG

Begruendung: In `ParameterControl.tsx` (Zeilen 102-107) wird das Label so generiert:
```tsx
{config.label}{" "}
<span className="font-normal text-muted-foreground">
  {config.symbol} [{config.unit}]
</span>
```
Das ergibt z.B. "Amplitude A [m]" -- das Format stimmt.

**ABER:** Die `PARAMETER_CONFIGS` in `wave-params.ts` verwenden fuer Wellenlaenge den Namen "Wellenlaenge" (Zeile 113: `label: "Wellenlaenge"`). Das ist korrekt auf Deutsch.

Tatsaechlich zeigt die Pruefung: Die Labels sind korrekt. Das Format "Name Symbol [Einheit]" wird konsistent fuer alle Parameter eingehalten:
- "Amplitude A [m]" -- korrekt
- "Frequenz f [Hz]" -- korrekt
- "Wellenlaenge lambda [m]" -- korrekt
- "Anfangsphase phi [rad]" -- korrekt
- "Daempfung d [1/m]" -- korrekt

**Korrektur: PASS** -- die Labels sind korrekt formatiert.

**ALLERDINGS: BUG-4 -- Die Einheit wird DOPPELT angezeigt**
In `ParameterControl.tsx` wird die Einheit einmal im Label gezeigt (Zeile 105: `[{config.unit}]`) und ein zweites Mal neben dem Input-Feld (Zeile 161: `{config.unit}`). Das ist kein Fehler im Akzeptanzkriterium, aber eine UX-Redundanz. Die Einheit neben dem Input dient als Kontexthilfe, was akzeptabel ist.

**Ergebnis AK-10: PASS**

---

### Grenzfall-Tests

#### GF-1: Frequenz = 0 -> stehende Momentaufnahme
**Ergebnis: PASS (mit Einschraenkung)**

Das Zod-Schema erlaubt Frequenz = 0 (`min(0)`). Der Shader berechnet `u_angularFreq * u_time = 0 * t = 0`, wodurch die Welle einfriert. Das ist das erwartete Verhalten. ABER: Dies widerspricht AK-8 (siehe BUG-2 oben).

#### GF-2: Amplitude = 0 -> flache Ebene
**Ergebnis: FAIL** -- Schweregrad: MITTEL

**BUG-5: Amplitude = 0 ist durch das Zod-Schema nicht erreichbar**
`amplitude: z.number().min(0.01)` (wave-params.ts Zeile 18) -- Minimum ist 0.01, nicht 0. Der Slider kann die Amplitude bestenfalls auf 0.01 senken (via -100% bei baseValue = 0.01, was durch config.min = 0.01 begrenzt wird). Eine wirklich flache Ebene (Amplitude = 0) ist nicht erreichbar.

Die Spezifikation sagt: "Amplitude = 0: Flache Ebene sichtbar, Slider funktioniert weiterhin." Der Code verhindert dies.

**Prioritaet:** P2 -- Entweder muss das Minimum auf 0 gesetzt werden oder die Spec muss angepasst werden.

#### GF-3: Ungueltige Texteingabe ("abc") -> rote Hervorhebung
**Ergebnis: PASS**

In `ParameterControl.tsx`:
- `handleInputChange` (Zeile 61-69) setzt den lokalen `editingText` und versucht `parseFloat`. Wenn `isNaN(parsed)`, wird `onBaseValueChange` NICHT aufgerufen.
- In `useWaveParams.ts` prueft `validateValue` (Zeile 121) explizit auf `isNaN(value)` und gibt "Ungueltige Eingabe" zurueck.
- ABER: Da `handleInputChange` bei NaN `onBaseValueChange` nicht aufruft, wird die Validierung im Hook gar nicht ausgeloest!

**BUG-6: Rote Hervorhebung bei "abc"-Eingabe fehlt**
Wenn der Benutzer "abc" eingibt, passiert `parseFloat("abc") = NaN`, und `onBaseValueChange` wird nie aufgerufen (Zeile 67: `if (!isNaN(parsed))`). Der `validationError` wird also nie gesetzt. Das Input-Feld zeigt "abc" im lokalen `editingText`-State, aber OHNE rote Hervorhebung. Erst beim Blur (Zeile 74-77) wird `editingText` auf `null` gesetzt und der alte gueltige `baseValue` wird wieder angezeigt.

**Reproduktionsschritte:**
1. Klick auf das Amplitude-Eingabefeld
2. Text loeschen und "abc" eintippen
3. Erwartet: Rote Hervorhebung um das Eingabefeld
4. Tatsaechlich: Keine rote Hervorhebung, der Text "abc" wird angezeigt, aber beim Verlassen des Feldes wird der alte Wert wiederhergestellt

**Prioritaet:** P2 -- Der letzte gueltige Wert bleibt korrekt erhalten, aber die visuelle Rueckmeldung (rote Hervorhebung) fehlt bei nicht-numerischen Eingaben. Die Spec fordert explizit "rote Hervorhebung".

#### GF-4: Schnelle Slider-Bewegung -> Throttling bei 16 ms
**Ergebnis: PASS**

In `ParameterControl.tsx` (Zeilen 50-58) wird ein einfaches Throttling via `performance.now()` und `throttleRef` implementiert. Wenn weniger als 16 ms seit dem letzten Update vergangen sind, wird das Event ignoriert. Das ist eine korrekte 60-FPS-Drosselung.

Anmerkung: Das Throttling basiert auf `performance.now()` und nutzt keine externe Bibliothek. Das ist akzeptabel, aber es gibt einen Nachteil: Der letzte Wert beim Loslassen des Sliders koennte verschluckt werden, wenn er innerhalb der 16-ms-Sperre liegt. Radix-UI Slider sendet allerdings einen finalen `onValueCommit`-Event, der hier nicht genutzt wird. Das ist ein minimales UX-Problem (der Slider-Thumb koennte 1 Schritt vom angezeigten Wert abweichen).

---

### Sicherheitsaudit (Red-Team-Perspektive)

Da dies eine reine Frontend-Applikation ohne Backend, Authentifizierung oder Datenpersistenz ist, sind die typischen Sicherheitsrisiken (SQL-Injection, Auth-Bypass, CSRF) nicht anwendbar. Dennoch:

| Pruefpunkt | Ergebnis | Details |
|---|---|---|
| XSS via Input-Felder | KEIN RISIKO | Die Input-Werte werden als `parseFloat` verarbeitet und nie als HTML gerendert. React escaped JSX-Output automatisch. |
| Prototype Pollution | KEIN RISIKO | Keine dynamischen Objekt-Keys aus Benutzereingaben. `config.key` kommt aus dem statischen `PARAMETER_CONFIGS`-Array. |
| ReDoS (Regex-Denial-of-Service) | NICHT ANWENDBAR | Keine regulaeren Ausdruecke auf Benutzereingaben. |
| Sicherheitsheader | FEHLEN | `next.config.ts` setzt keine Security-Header (X-Frame-Options, CSP, etc.). Laut `.claude/rules/security.md` sind X-Frame-Options, X-Content-Type-Options, Referrer-Policy und HSTS gefordert. |
| Dependency-Audit | NICHT GEPRUEFT | Three.js und Radix-UI sollten auf bekannte CVEs geprueft werden (`npm audit`). |
| WebGL Shader Injection | KEIN RISIKO | Shader-Strings sind statisch definiert in `wave-shader.ts`. Benutzereingaben fliessen nur als numerische Uniform-Werte ein, nicht als GLSL-Code. |
| DoS via Extremwerte | NIEDRIGES RISIKO | Amplitude bis 100 (Zod-Max, nicht PARAMETER_CONFIG max von 5.0) koennte die GPU belasten. Das Zod-Schema und die UI-Config haben unterschiedliche Maxima. |

**BUG-7: Inkonsistenz zwischen Zod-Schema und PARAMETER_CONFIGS Grenzen**
- Zod-Schema: `amplitude.max(100)`, `wavelength.max(100)`, `damping.max(10)`
- PARAMETER_CONFIGS: `amplitude.max = 5.0`, `wavelength.max = 20.0`, `damping.max = 1.0`

Die Zod-Validierung ist deutlich grosszuegiger als die UI-Konfiguration. Da der Slider-Clamp auf `config.max` basiert (useWaveParams.ts Zeile 57: `Math.min(config.max, value)`), werden die Werte in der Praxis durch PARAMETER_CONFIGS begrenzt. Aber die Zod-Validierung in `validateValue` wuerde Werte bis 100 als gueltig akzeptieren. Wenn ein Benutzer "50" in das Amplitude-Input-Feld tippt, wird der Wert NICHT abgelehnt -- er wird auf 5.0 geclippt, aber ohne Fehlermeldung.

**Prioritaet:** P2 -- Die Zod-Grenzen sollten mit den PARAMETER_CONFIG-Grenzen synchronisiert werden.

---

### Cross-Browser-Kompatibilitaet

| Aspekt | Bewertung |
|---|---|
| Chrome (Desktop) | Erwartet OK -- WebGL2, Radix-UI und Three.js sind vollstaendig unterstuetzt. |
| Firefox (Desktop) | Erwartet OK -- Gleiche Unterstuetzung. |
| Safari (Desktop) | RISIKO: WebGL2-Support in aelteren Safari-Versionen eingeschraenkt. Der Fallback in `useWaveAnimation.ts` Zeile 12 prueft `webgl2 || webgl`, was korrekt ist. |
| Slider Touch-Events | Die Radix-UI Slider-Komponente hat `touch-none` in der Klasse (slider.tsx Zeile 34), was auf Touchscreens problematisch sein koennte, aber die PRD sagt "Desktop-only". |

### Responsive-Verhalten

| Breakpoint | Bewertung |
|---|---|
| 1440px (Desktop) | OK -- Panel-Breite 320px (xl:w-80), Canvas nimmt restlichen Platz. |
| 1024px (Mindestbreite laut PRD) | OK -- Panel-Breite 288px (w-72), Canvas ~736px. |
| < 1024px | Warnung wird angezeigt (WaveVisualization.tsx Zeile 60-63), Panel bleibt aber oeffenbar. |
| 768px (Tablet) | Nicht explizit unterstuetzt -- PRD sagt "min. 1024px Breite". |
| 375px (Mobil) | Nicht Ziel -- PRD sagt "Keine Mobile-First-Optimierung". |

---

### Zusammenfassung der Bugs

| Bug-ID | Beschreibung | Schweregrad | Prioritaet | Datei |
|--------|-------------|-------------|-----------|-------|
| BUG-1 | Slider -100% erreicht config.min statt 0 (bei Amplitude 0.01, bei Phase -PI) | MITTEL | P2 | `src/hooks/useWaveParams.ts` Zeile 52 |
| BUG-2 | Frequenz = 0 wird erlaubt, widerspricht AK-8 (aber bestaetigt Grenzfall) -- Spec-Widerspruch | HOCH | P1 | `src/lib/wave-params.ts` Zeile 19 |
| BUG-3 | Wellenlaenge 0.01 erzeugt k=628 -- visuell problematisch (kein Absturz) | NIEDRIG | P3 | `src/lib/wave-params.ts` Zeile 48 |
| BUG-4 | Einheit wird doppelt angezeigt (Label + neben Input) -- UX-Redundanz | NIEDRIG | P3 | `src/components/wave/ParameterControl.tsx` Zeilen 105 + 161 |
| BUG-5 | Amplitude = 0 nicht erreichbar (min = 0.01), widerspricht Grenzfall-Spec | MITTEL | P2 | `src/lib/wave-params.ts` Zeile 18 |
| BUG-6 | Rote Hervorhebung bei nicht-numerischer Eingabe ("abc") fehlt | MITTEL | P2 | `src/components/wave/ParameterControl.tsx` Zeile 67 |
| BUG-7 | Zod-Schema-Grenzen inkonsistent mit PARAMETER_CONFIGS-Grenzen | MITTEL | P2 | `src/lib/wave-params.ts` Zeilen 17-23 vs. 88-143 |

### Gesamtbewertung

| Kriterium | Ergebnis |
|-----------|----------|
| AK-1: Slider + Input pro Parameter | PASS |
| AK-2: Bidirektionale Synchronisation | PASS |
| AK-3: Slider-Mapping (-100%=0, 0%=Basis, +100%=2x) | FAIL (BUG-1) |
| AK-4: Echtzeit-Aktualisierung < 100 ms | PASS |
| AK-5: Abgeleitete Groessen read-only | PASS |
| AK-6: Formelzeile mit Werten | PASS |
| AK-7: Reset-Button | PASS |
| AK-8: Validierung (Frequenz/Wellenlaenge nicht 0/negativ) | FAIL (BUG-2, Spec-Widerspruch) |
| AK-9: Panel kollabierbar | PASS |
| AK-10: Labels mit Einheit | PASS |

**Ergebnis: 8 von 10 Akzeptanzkriterien bestanden.**
Blockierende Bugs: BUG-2 (Spec-Widerspruch klaeren), BUG-6 (fehlende Validierungs-UI).
Empfehlung: Bugs BUG-2 und BUG-6 vor Deployment beheben. BUG-1/BUG-5/BUG-7 im naechsten Sprint adressieren.

## Deployment
_Wird von /deploy hinzugefügt_
