# PROJ-3: Wellenquellen-Konfiguration

## Status: Deployed
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03
**Deployed:** 2026-03-03
**Produktions-URL:** https://wave-chi-livid.vercel.app

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

**Getestet:** 2026-03-03 (Ersttest) / 2026-03-03 (Revalidierung)
**App-URL:** http://localhost:3000
**Tester:** QA-Ingenieur (KI)
**Build-Status:** Erfolgreich (Next.js 16.1.6, Turbopack, 0 TypeScript-Fehler)
**Lint-Status:** 2 ESLint-Fehler in PROJ-3-relevanten Dateien (siehe BUG-8, BUG-9)

---

### Akzeptanzkriterien-Status

#### AK-1: Dropdown/Icon-Auswahl fuer Quellenform (Punkt, Kreis, Balken, Dreieck)
- [x] shadcn/ui `Select`-Dropdown ist im `SourcePanel` implementiert (`src/components/wave/SourcePanel.tsx`, Zeile 109-131)
- [x] Alle vier Quellenformen sind als Optionen verfuegbar: POINT, CIRCLE, BAR, TRIANGLE
- [x] Labels korrekt: "Punkt", "Kreis", "Balken", "Dreieck" (definiert in `src/lib/wave-sources.ts`)
- [x] Tooltip-Beschreibungen fuer jede Quellenform vorhanden
- **Status: BESTANDEN**

#### AK-2: Quellenform in 3D-Szene visuell hervorgehoben (leuchtendes Marker-Element)
- [x] Marker-Meshes werden fuer jede Quellenform erstellt (`src/hooks/useWaveAnimation.ts`, Zeile 130-167)
- [x] POINT: SphereGeometry (kleine Kugel)
- [x] CIRCLE: EllipseCurve als Ring-Linie
- [x] BAR: Vertikale Linienstrecke
- [x] TRIANGLE: Gleichseitiges Dreieck aus drei Kanten
- [ ] BUG-1: Marker verwenden `MeshBasicMaterial` mit orange Farbe, aber KEIN leuchtendes/emissives Material. Das Akzeptanzkriterium verlangt "leuchtendes Marker-Element", die Spec spricht von "Emissive Color". Es wird jedoch nur ein simples oranges Material verwendet, das nicht leuchtet.
- **Status: TEILWEISE BESTANDEN (siehe BUG-1)**

#### AK-3: Slider "Anzahl der Quellen" erlaubt 1-8 Quellen
- [x] Slider implementiert mit `min={SOURCE_COUNT_MIN}` (1) und `max={SOURCE_COUNT_MAX}` (8)
- [x] `step={1}` stellt sicher, dass nur ganze Zahlen moeglich sind
- [x] Badge zeigt aktuelle Quellenanzahl an
- [x] Min/Max-Werte werden unter dem Slider angezeigt
- [x] Input-Clamping im Hook vorhanden (`Math.round(count)` in `setSourceCount`)
- **Status: BESTANDEN**

#### AK-4: Bei >= 2 Quellen erscheint Slider "Abstand zwischen Quellen [m]" (0.5-10 m)
- [x] Bedingte Anzeige korrekt: `{config.count >= 2 && (...)}` (Zeile 162)
- [x] Slider-Bereich: `min={SOURCE_SPACING_MIN}` (0.5) bis `max={SOURCE_SPACING_MAX}` (10.0)
- [x] Abstandswert wird mit einer Nachkommastelle angezeigt (`.toFixed(1)`)
- [x] Einheit "m" wird angezeigt
- [x] `step={0.1}` fuer feine Einstellung
- **Status: BESTANDEN**

#### AK-5: Mehrere Quellen werden symmetrisch entlang der X-Achse angeordnet
- [x] `computeSourcePositions` berechnet symmetrische Verteilung (`src/lib/wave-sources.ts`, Zeile 51-67)
- [x] Formel korrekt: `x = (i - (count - 1) / 2) * spacing`
- [x] Bei 1 Quelle: Position [0, 0]
- [x] Bei 2 Quellen: Positionen [-d/2, 0] und [+d/2, 0]
- [x] Quellen werden auf das Simulationsfeld geclippt (PLANE_SIZE / 2 = 5)
- **Status: BESTANDEN**

#### AK-6: Wellengleichungen aller Quellen ueberlagern sich (Superpositionsprinzip)
- [x] Vertex-Shader implementiert Schleife ueber alle Quellen (`src/lib/wave-shader.ts`, Zeile 74-83)
- [x] `z += amplitudes[i] * envelope * sin(...)` addiert Beitraege korrekt
- [x] Abstandsberechnung pro Quellentyp korrekt (distanceToSource-Funktion)
- [x] Per-Source-Parameter (Amplitude, Frequenz etc.) werden korrekt als Arrays uebergeben
- **Status: BESTANDEN**

#### AK-7: Interferenzmuster (konstruktiv / destruktiv) sind sichtbar
- [x] Superposition im Shader erzeugt Interferenzmuster
- [x] Farbskala (Blau-Weiss-Rot) visualisiert positive/negative Amplituden
- [x] Normierung verwendet `sumMaxAmp` (Summe aller Amplituden), was konstruktive Interferenz korrekt abbildet
- [x] `clamp(z / normFactor, -1.0, 1.0)` stellt sicher, dass konstruktive Interferenz bei Werten > normFactor als volle Farbe dargestellt wird
- **Status: BESTANDEN**
- **KORREKTUR zum Ersttest:** BUG-2 aus dem Ersttest war fehlerhaft. Der Shader normiert mit `sumMaxAmp` (Zeile 86: `float normFactor = max(sumMaxAmp, 0.001)`), NICHT mit `u_sourceCount * maxContrib`. Die Normierung ist physikalisch korrekt: Bei gleichen Amplituden ist `sumMaxAmp = N * A`, und konstruktive Interferenz erreicht maximal `N * A`, was auf 1.0 normiert wird. Das Interferenzmuster bleibt damit bei steigender Quellenanzahl sichtbar. BUG-2 wird als GESCHLOSSEN markiert.

#### AK-8: Beim Wechsel der Quellenform wird Visualisierung sofort aktualisiert
- [x] `useEffect` in `useWaveAnimation.ts` reagiert auf Aenderungen von `sType`, `sCount`, `sPositions`
- [x] Uniform-Werte werden direkt ueberschrieben (kein Frame-Delay)
- [x] Marker-Meshes werden vollstaendig entfernt und neu erstellt
- **Status: BESTANDEN**

#### AK-9: Quellenparameter koennen unabhaengig von Wellenparametern (PROJ-2) zurueckgesetzt werden
- [x] Separater `resetSources`-Callback im `useWaveSources`-Hook
- [x] Separater "Zuruecksetzen"-Button im `SourcePanel` (Zeile 90-99)
- [x] `resetAll` im `useWaveParams` ist unabhaengig und setzt nur Wellenparameter zurueck
- [x] Kein gemeinsamer Reset-Mechanismus, der beide gleichzeitig beeinflusst
- **Status: BESTANDEN**

---

### Grenzfaelle-Status

#### GF-1: 1 Punktquelle + Form "Balken"
- [x] Bei `count=1` und `type=BAR` wird korrekt eine einzelne Balkenquelle angezeigt
- [x] Die Abstandsberechnung im Shader verwendet `distanceToSource` mit dem BAR-Typ, unabhaengig von der Quellenanzahl
- **Status: BESTANDEN**

#### GF-2: 8 Quellen bei sehr kleinem Abstand (< 0.5 m)
- [x] Slider-Untergrenze ist `SOURCE_SPACING_MIN = 0.5`
- [x] `setSourceSpacing` clampt auf `[0.5, 10.0]`
- **Status: BESTANDEN**

#### GF-3: Form "Dreieck" mit 5 Quellen
- [ ] BUG-2: Die Spec verlangt, dass bei "Dreieck mit N Quellen" die Quellen entlang der Dreiecks-Kontur verteilt werden. Tatsaechlich werden die Quellen aber wie bei allen anderen Formen symmetrisch entlang der X-Achse verteilt (`computeSourcePositions` behandelt alle Formen gleich). Jede Quelle hat dann ihre eigene Dreieckskontur. Die physikalische Interpretation weicht von der Spec ab.
- **Status: NICHT BESTANDEN (siehe BUG-2)**

#### GF-4: Quellenabstand > Simulationsfeld
- [x] `hasClippedSources` erkennt korrekt, wenn Quellen ausserhalb liegen
- [x] Warnung mit AlertTriangle-Icon wird im UI angezeigt (Zeile 189-196)
- [x] Quellen werden in `computeSourcePositions` auf den Rand geclippt (`Math.max(-halfExtent, Math.min(halfExtent, x))`)
- **Status: BESTANDEN**

#### GF-5: Uebergang von N auf 1 Quelle
- [x] `useEffect` in `useWaveParams` passt Array-Groesse an: `prev.slice(0, sourceCount)`
- [x] `activeSourceIndex` wird zurueckgesetzt, wenn er ausserhalb liegt
- [x] Shader nutzt `if (i >= u_sourceCount) break;` um nur aktive Quellen zu berechnen
- [x] Abstandsslider verschwindet bei count < 2
- **Status: BESTANDEN**

---

### Cross-Browser-Kompatibilitaet (Code-Analyse)

#### Chrome (Desktop)
- [x] Three.js/WebGL2 wird vollstaendig unterstuetzt
- [x] Radix UI Select und Collapsible funktionieren standardmaessig
- **Status: ERWARTET BESTANDEN**

#### Firefox (Desktop)
- [x] WebGL2-Support vorhanden
- [ ] BUG-3: `linewidth` in `THREE.LineBasicMaterial({ linewidth: 2 })` wird von WebGL-Implementierungen auf den meisten Plattformen IGNORIERT. Firefox (und auch Chrome) rendern Linien immer mit Breite 1px. Der `linewidth`-Parameter ist effektiv wirkungslos. Dies ist ein bekanntes Three.js/WebGL-Limitation, kein Browser-Bug, hat aber Auswirkungen auf die Sichtbarkeit der Marker.
- **Status: ERWARTET BESTANDEN (mit Einschraenkung BUG-3)**

#### Safari (Desktop)
- [x] WebGL2 seit Safari 15 unterstuetzt
- [x] Fallback auf WebGL1 im Code vorhanden
- [ ] HINWEIS: Safari hat strengere WebGL-Grenzen; die GLSL-Schleife `for (int i = 0; i < 8; ...)` mit dynamischem `break` sollte aber funktionieren.
- **Status: ERWARTET BESTANDEN**

---

### Responsive-Test (Code-Analyse)

#### Desktop (1440px)
- [x] Layout `flex h-screen flex-col` mit `flex-1 min-h-0` fuer Canvas
- [x] SourcePanel links (w-72 xl:w-80), ParameterPanel rechts (w-72 xl:w-80)
- [x] Beide Panels kollabierbar
- **Status: BESTANDEN**

#### Tablet (768px) / < 1024px
- [x] Viewport-Warnung erscheint bei `< 1024px` (isSmallViewport)
- [x] Panels werden bei `< 1280px` initial geschlossen (Zeile 28-31 in WaveVisualization.tsx)
- **Status: BESTANDEN**
- **KORREKTUR zum Ersttest:** BUG-5 aus dem Ersttest war fehlerhaft. Der Code enthaelt bereits einen Mechanismus, der bei `window.innerWidth < 1280` beide Panels initial schliesst (Zeile 28-31). Bei 768px sind die Panels also standardmaessig geschlossen und muessen manuell geoeffnet werden. BUG-5 wird als GESCHLOSSEN markiert.

#### Desktop (1024-1279px)
- [x] Panels werden bei < 1280px initial geschlossen
- [ ] BUG-4: Bei 1024-1279px werden beide Panels initial geschlossen, was bedeutet, dass der Benutzer sie manuell oeffnen muss. Wenn er beide oeffnet, bleiben nur ~1024-576=448px fuer den Canvas. Es waere besser, bei dieser Breite nur ein Panel gleichzeitig zu erlauben oder die Panels schmaler zu machen. Dies ist aber eher eine UX-Verbesserung als ein Bug, da das PRD 1024px als Mindestbreite definiert.
- **Status: BESTANDEN (UX-Verbesserung moeglich)**

#### Mobil (375px)
- [x] PRD sagt explizit "Keine Mobile-First-Optimierung" und "Zielgeraet: Desktop/Laptop min. 1024 px"
- [x] Viewport-Warnung wird korrekt angezeigt
- **Status: NICHT ZUTREFFEND (per PRD)**

---

### Sicherheitsaudit-Ergebnisse (Red-Team-Perspektive)

#### Eingabevalidierung
- [x] Quellenanzahl wird mit `Math.max/Math.min/Math.round` geclampt (serverseitige Validierung nicht relevant da reine Frontend-App)
- [x] Quellenabstand wird mit `Math.max/Math.min` geclampt
- [x] Quellentyp wird als TypeScript-Enum behandelt; die `as SourceType`-Cast in Zeile 111 des SourcePanel ist sicher, da nur vordefinierte Werte im Select-Dropdown existieren
- [x] Zod-Validierung fuer Wellenparameter vorhanden
- **Status: BESTANDEN**

#### XSS / Injection
- [x] Keine `dangerouslySetInnerHTML` verwendet
- [x] Keine `eval()`, `Function()`, oder `innerHTML` verwendet
- [x] Keine URL-Parameter oder Query-Strings ausgewertet
- [x] GLSL-Shader-Strings sind hardcoded, keine User-Eingaben in Shader-Code
- [x] Alle Benutzereingaben sind numerisch (Slider) -- kein Freitext-Input fuer Quellenparameter
- **Status: BESTANDEN**

#### Datenlecks
- [x] Reine Frontend-App, keine API-Calls
- [x] Keine sensitiven Daten gespeichert
- [x] Kein localStorage/sessionStorage/Cookies verwendet (verifiziert per Grep)
- **Status: BESTANDEN**

#### Authentifizierung / Autorisierung
- [x] Nicht zutreffend: App hat kein Login, keine Benutzerdaten (per PRD)
- **Status: NICHT ZUTREFFEND**

#### Exposed Secrets
- [x] Keine `.env`-Dateien im Repository (verifiziert per Glob)
- [x] Keine API-Keys oder Zugangsdaten im Code
- [x] `.gitignore` enthaelt `.env*`-Pattern
- **Status: BESTANDEN**

#### Rate-Limiting
- [x] Nicht zutreffend: Reine Frontend-App ohne Server-Requests
- **Status: NICHT ZUTREFFEND**

#### Performance / DoS
- [ ] BUG-5: Der `useEffect` fuer Marker-Meshes (Zeile 81-168 in `useWaveAnimation.ts`) erstellt bei JEDER Aenderung neue Three.js-Geometrien und Materialien, disposed die alten und erstellt neue. Bei schnellem Slider-Ziehen (z.B. Quellenanzahl von 1 auf 8) wird dies fuer jeden Zwischenwert ausgefuehrt. Das ist nicht memory-safe bei sehr schnellem Interagieren, auch wenn die alten Objekte disposed werden. Es fehlt ein Debounce/Throttle.
- **Status: POTENZIELLES PROBLEM (siehe BUG-5)**

#### Sicherheitsheader
- [ ] HINWEIS: `next.config.ts` enthaelt keine Sicherheitsheader (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security). Da es sich um eine reine Frontend-Visualisierungs-App ohne sensible Daten handelt, ist das akzeptabel, sollte aber vor einem oeffentlichen Deployment ergaenzt werden.
- **Status: AKZEPTABEL (Verbesserung vor Deployment empfohlen)**

---

### Regressions-Test (PROJ-1 und PROJ-2)

#### PROJ-1: 3D-Wellenvisualisierung
- [x] WebGL-Support-Check weiterhin vorhanden
- [x] OrbitControls funktionieren (Code unveraendert)
- [x] Achsenbeschriftungen und Grid vorhanden
- [x] Animationsloop unveraendert
- [x] resetCamera und resetTime funktionieren
- [x] `ControlBar` korrekt um `onRestartWave` erweitert, Build ist erfolgreich
- [ ] BUG-6: Inkonsistente Umlaut-Kodierung: `ControlBar.tsx` Zeile 58 verwendet "zuruecksetzen" mit echtem ue-Umlaut, waehrend alle anderen PROJ-3-Texte konsequent "ue"-Ersatzschreibweise verwenden ("Zuruecksetzen", "zuruecksetzen", "oeffnen", "schliessen"). Ebenso verwenden `ParameterPanel.tsx` und `wave-params.ts` echte Umlaute fuer manche Labels ("Wellenlaenge", "Daempfung"). Die Kodierung ist insgesamt inkonsistent.
- **Status: BESTANDEN (kosmetische Inkonsistenz notiert)**

#### PROJ-2: Wellenparameter-Steuerung
- [x] `useWaveParams` wurde von single-source auf multi-source erweitert
- [x] Backward-Kompatibilitaet: Bei `sourceCount=1` verhaelt sich der Hook wie vorher (ein Satz SliderStates)
- [x] ParameterPanel zeigt Quellen-Tabs nur bei `sourceCount >= 2`
- [x] "Alle"-Modus aendert alle Quellen gleichzeitig
- [x] FormulaDisplay und ParameterControl weiterhin eingebunden
- [ ] BUG-7: Wenn `resetAll` im "Alle"-Modus aufgerufen wird (`activeSourceIndex === null`), werden alle `validationErrors` geloescht (`setValidationErrors({})`), auch wenn es theoretisch Quellen gaebe, die nicht zurueckgesetzt werden. Da der "Alle"-Modus aber tatsaechlich alle Quellen zuruecksetzt, ist dies in der Praxis kein Problem. Semantisch waere ein gezieltes Error-Clearing sauberer.
- **Status: BESTANDEN (semantische Verbesserung notiert)**

---

### Code-Qualitaet (ESLint)

#### ESLint-Fehler in PROJ-3-relevantem Code

- [ ] BUG-8: `WaveVisualization.tsx` Zeile 29: `setIsPanelOpen(false)` wird synchron in einem `useEffect` aufgerufen, was kaskadierende Re-Renders verursachen kann. ESLint-Regel `react-hooks/set-state-in-effect` meldet einen Fehler. Die Panel-Initial-State-Logik sollte statt in einem Effect als initialer useState-Wert berechnet werden (z.B. mit einer Funktion, die `typeof window !== 'undefined' && window.innerWidth >= 1280` prueft).
- [ ] BUG-9: `useWaveParams.ts` Zeile 114: `setAllSliderStates(...)` wird synchron in einem `useEffect` aufgerufen, um die Array-Groesse an `sourceCount` anzupassen. ESLint-Regel `react-hooks/set-state-in-effect` meldet einen Fehler. Dies koennte durch `useMemo` oder durch Berechnung des angepassten Arrays direkt im Render-Pfad geloest werden.

---

### Gefundene Bugs

#### BUG-1: Marker verwenden kein leuchtendes Material (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Datei:** `src/hooks/useWaveAnimation.ts`, Zeile 116-124
- **Reproduktionsschritte:**
  1. Oeffne die App unter http://localhost:3000
  2. Waehle eine beliebige Quellenform im Source-Panel
  3. Beobachte die Marker in der 3D-Szene
  4. Erwartet: Leuchtende/emissive Marker, die sich vom Rest der Szene abheben
  5. Tatsaechlich: Einfache orange Marker ohne Leuchteffekt (MeshBasicMaterial)
- **Ursache:** `MeshBasicMaterial` hat keine `emissive`-Eigenschaft. Die Spec verlangt `MeshStandardMaterial` mit `emissive`-Farbe.
- **Prioritaet:** Im naechsten Sprint beheben

#### BUG-2: Dreieck-Quellenverteilung weicht von Spec ab (OFFEN)
- **Schweregrad:** Mittel
- **Betroffene Datei:** `src/lib/wave-sources.ts`, Funktion `computeSourcePositions`
- **Reproduktionsschritte:**
  1. Setze Quellenform auf "Dreieck"
  2. Setze Quellenanzahl auf 5
  3. Erwartet: 5 Punktquellen entlang der Dreieckskontur verteilt (wie in der Spec: "Punkte werden entlang der Dreieck-Kontur verteilt")
  4. Tatsaechlich: 5 separate Dreiecksquellen, symmetrisch auf der X-Achse verteilt, jede mit ihrer eigenen Dreieckskontur
- **Ursache:** `computeSourcePositions` behandelt alle Quellenformen identisch (X-Achsen-Verteilung). Die Spec verlangt fuer die Dreiecksform eine Sonderbehandlung.
- **Prioritaet:** Im naechsten Sprint beheben (didaktisch relevant, aber kein Kernfeature)

#### BUG-3: linewidth wird von WebGL ignoriert (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Datei:** `src/hooks/useWaveAnimation.ts`, Zeile 121-124
- **Reproduktionsschritte:**
  1. Oeffne die App und waehle Quellenform "Kreis" oder "Balken"
  2. Beobachte die Linienstaerke der Marker
  3. Erwartet: Linien mit Breite 2 (wie `linewidth: 2` konfiguriert)
  4. Tatsaechlich: Linien immer mit Breite 1px (WebGL-Limitation)
- **Ursache:** WebGL-Standard erlaubt nur `linewidth: 1`. Dies ist ein bekanntes Three.js-Problem. Fuer dickere Linien muss `Line2` / `LineMaterial` aus `three/examples/jsm/lines/` verwendet werden.
- **Prioritaet:** Nice-to-have

#### BUG-4: UX-Problem bei mittleren Viewport-Breiten (1024-1279px) (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Datei:** `src/components/wave/WaveVisualization.tsx`
- **Reproduktionsschritte:**
  1. Oeffne die App mit einer Fensterbreite von 1024-1279px
  2. Beide Panels sind initial geschlossen (korrekt)
  3. Oeffne beide Panels manuell
  4. Erwartet: Panels passen sich an oder ein Hinweis erscheint
  5. Tatsaechlich: Beide Panels belegen zusammen ~576px, nur ~448-703px bleiben fuer den Canvas
- **Ursache:** Kein Mechanismus, der verhindert, dass beide Panels gleichzeitig bei schmalen Breiten geoeffnet werden.
- **Prioritaet:** Nice-to-have (PRD definiert 1024px als Mindestbreite; Panels sind initial geschlossen)

#### BUG-5: Marker-Mesh-Erstellung ohne Debounce bei schnellem Slider-Ziehen (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Datei:** `src/hooks/useWaveAnimation.ts`, Zeile 81-168
- **Reproduktionsschritte:**
  1. Oeffne die App und stelle Quellenanzahl auf > 1
  2. Ziehe den Quellenanzahl- oder Abstand-Slider schnell hin und her
  3. Erwartet: Fluessige Marker-Aktualisierung ohne uebermassige Objekterstellung
  4. Tatsaechlich: Bei jedem Slider-Zwischenwert werden alle Marker-Meshes zerstoert und neu erstellt (dispose + create). Bei 8 Quellen mit je einem Mesh werden potentiell viele kurzlebige GPU-Objekte erzeugt.
- **Ursache:** Kein Debounce/Throttle auf dem `useEffect` fuer Marker-Aktualisierung
- **Prioritaet:** Nice-to-have (dispose verhindert Memory-Leaks, aber GPU-Thrashing moeglich)

#### BUG-6: Inkonsistente Umlaut-Kodierung im UI-Text (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Dateien:** `src/components/wave/ControlBar.tsx` (Zeile 58), `src/lib/wave-params.ts` (Zeile 139, 160)
- **Reproduktionsschritte:**
  1. Oeffne die App und betrachte die UI-Texte
  2. "Kamera zuruecksetzen" verwendet echten Umlaut ue
  3. "Wellenlaenge" und "Daempfung" in `wave-params.ts` verwenden echte Umlaute
  4. Alle PROJ-3-Texte verwenden "ue"-Ersatzschreibweise ("Zuruecksetzen", "oeffnen", "schliessen")
- **Ursache:** Inkonsistente Kodierungs-Konvention zwischen PROJ-2 und PROJ-3 Code
- **Prioritaet:** Nice-to-have

#### BUG-7: resetAll loescht validationErrors fuer alle Quellen im Alle-Modus (OFFEN)
- **Schweregrad:** Niedrig
- **Betroffene Datei:** `src/hooks/useWaveParams.ts`, Zeile 252
- **Reproduktionsschritte:**
  1. Setze Quellenanzahl auf 3
  2. Waehle Quelle 2 und gib einen ungueltigen Wert ein (Fehler erscheint)
  3. Wechsle zu "Alle"-Modus
  4. Klicke "Zuruecksetzen"
  5. Erwartet: Alle Parameter werden zurueckgesetzt, Fehler werden korrekt geloescht
  6. Tatsaechlich: `setValidationErrors({})` loescht alle Fehler global -- funktional korrekt, da "Alle" auch alle zuruecksetzt, aber semantisch ungenau
- **Ursache:** Globales Error-Clearing statt quellenspezifischem Clearing
- **Prioritaet:** Nice-to-have

#### BUG-8: ESLint-Fehler -- setState in useEffect (WaveVisualization) (OFFEN)
- **Schweregrad:** Mittel
- **Betroffene Datei:** `src/components/wave/WaveVisualization.tsx`, Zeile 29-30
- **Reproduktionsschritte:**
  1. Fuehre `npm run lint` aus
  2. ESLint meldet `react-hooks/set-state-in-effect` auf Zeile 29 (`setIsPanelOpen(false)`)
  3. Der Code ruft `setIsPanelOpen` und `setIsSourcePanelOpen` synchron innerhalb eines `useEffect` auf
- **Ursache:** `useState(true)` setzt den Initialwert fest, dann korrigiert ein `useEffect` den Wert basierend auf `window.innerWidth`. Dies verursacht ein unnoetig doppeltes Rendering: erst mit `true`, dann sofort mit `false`. Die Loesung waere, `useState` mit einer Initialisierungsfunktion zu verwenden: `useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280)`.
- **Prioritaet:** Vor Deployment beheben (ESLint-Fehler, Performance-Impact durch doppeltes Rendering)

#### BUG-9: ESLint-Fehler -- setState in useEffect (useWaveParams) (OFFEN)
- **Schweregrad:** Mittel
- **Betroffene Datei:** `src/hooks/useWaveParams.ts`, Zeile 114
- **Reproduktionsschritte:**
  1. Fuehre `npm run lint` aus
  2. ESLint meldet `react-hooks/set-state-in-effect` auf Zeile 114 (`setAllSliderStates(...)`)
  3. Der Code passt die Array-Groesse von `allSliderStates` in einem Effect an, wenn sich `sourceCount` aendert
- **Ursache:** State-Synchronisation via `useEffect` verursacht kaskadierende Re-Renders. Bei jedem Wechsel der Quellenanzahl wird erst mit dem alten Array gerendert, dann loest der Effect ein Re-Render mit dem neuen Array aus. Die Loesung waere, die Array-Anpassung direkt im `useMemo` oder als abgeleiteten State zu berechnen, statt in einem Effect.
- **Prioritaet:** Vor Deployment beheben (ESLint-Fehler, potenziell sichtbares Flackern bei Quellenanzahl-Aenderung)

---

### Zusammenfassung

- **Akzeptanzkriterien:** 8/9 vollstaendig bestanden, 1 teilweise bestanden (AK-2: kein Emissive-Material)
- **Grenzfaelle:** 4/5 bestanden, 1 nicht bestanden (GF-3: Dreieck-Verteilung)
- **Gefundene Bugs:** 9 gesamt
  - 0 Kritisch
  - 0 Hoch
  - 3 Mittel (BUG-2: Dreieck-Verteilung, BUG-8: ESLint setState WaveVisualization, BUG-9: ESLint setState useWaveParams)
  - 6 Niedrig (BUG-1: Kein Emissive, BUG-3: linewidth, BUG-4: UX mittlere Breiten, BUG-5: Kein Debounce, BUG-6: Umlaut-Inkonsistenz, BUG-7: Error-Clearing)
- **Sicherheit:** Bestanden (reine Frontend-App, keine Angriffsvektoren, keine sensitiven Daten, keine Injection-Moeglichkeiten)
- **Regression PROJ-1:** Bestanden
- **Regression PROJ-2:** Bestanden
- **Produktionsbereit:** BEDINGT JA
- **Empfehlung:** BUG-8 und BUG-9 (ESLint-Fehler) vor Deployment beheben, da sie kaskadierende Re-Renders verursachen und die Code-Qualitaet beeintraechtigen. BUG-2 (Dreieck-Verteilung) als Feature-Erweiterung einplanen. Alle Niedrig-Bugs koennen im naechsten Sprint adressiert werden. Es gibt keine Kritischen oder Hohen Bugs, die das Deployment blockieren.

## Deployment
_Wird von /deploy hinzugefügt_
