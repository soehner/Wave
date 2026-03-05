# PROJ-15: Reflexion an losem und festem Ende

## Status: In Review
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Shader und Wellenfeld
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Wellenparameter
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Punktquelle als primäre Quelle
- Empfohlen: PROJ-4 (Schnittebenen-Analyse) — 1D-Profil zeigt Überlagerung besonders deutlich
- Empfohlen: PROJ-7 (Top-Down-Ansicht) — Reflexion in Draufsicht gut erkennbar

## User Stories
- Als Physiklehrkraft möchte ich eine reflektierende Wand im Wellenfeld platzieren, damit Schüler sehen, wie eine Welle an einer Grenzfläche zurückgeworfen wird.
- Als Lehrkraft möchte ich zwischen "festem Ende" (Phasenumkehr um 180°, Auslenkung an der Wand = 0) und "losem Ende" (keine Phasenumkehr, maximale Auslenkung an der Wand) umschalten, damit ich beide Fälle direkt vergleichen kann.
- Als Schülerin möchte ich die überlagerte Welle (einfallend + reflektiert) als Gesamtwellenbild sehen, damit ich verstehe, wie stehende Wellen durch Reflexion entstehen.
- Als Lehrkraft möchte ich die Wandposition im Feld verschieben, damit ich demonstriere, wie sich der Knotenabstand bei unterschiedlichem Wandabstand zur Quelle verhält.
- Als Lehrkraft möchte ich auf Wunsch die einfallende und die reflektierte Welle separat einblenden können, damit Schüler die Superposition schrittweise verstehen.

## Physikalischer Hintergrund

### Festes Ende
- Randbedingung: z(Wand, t) = 0 (Knoten an der Wand)
- Reflexion mit Phasenumkehr um π (180°)
- Die reflektierte Welle hat die Form: z_r = −A · sin(k·r' − ω·t + φ), wobei r' der Abstand vom Spiegelpunkt der Quelle ist
- Ergebnis: Stehende Welle mit Knoten an der Wand und bei Abständen n·λ/2 von der Wand
- Beispiel: Saite, die am Ende eingespannt ist; Schallwelle in geschlossenem Rohr

### Loses Ende
- Randbedingung: dz/dn = 0 (Bauch an der Wand; maximale Auslenkung)
- Reflexion ohne Phasenumkehr
- Die reflektierte Welle hat die gleiche Phase wie die einfallende
- Ergebnis: Stehende Welle mit Bauch an der Wand
- Beispiel: Seilende frei beweglich; Schallwelle in offenem Rohr

### Implementierungsmodell: Spiegelquellen-Methode
Die Reflexion wird durch eine "Spiegelquelle" an der gespiegelten Position der Originalquelle modelliert:
- Spiegelposition: x_s = 2·x_Wand − x_Quelle (Spiegelung an der Wandposition)
- Festes Ende: Spiegelquelle mit Phase φ + π (Phasenumkehr)
- Loses Ende: Spiegelquelle mit Phase φ (keine Umkehr)
- Die Gesamtwelle = Originalquelle + Spiegelquelle (Superpositionsprinzip)

## Akzeptanzkriterien

### Wand-Konfiguration
- [ ] Im SourcePanel oder einem eigenen "Reflexion"-Abschnitt ist ein Toggle "Reflexionswand aktivieren" verfügbar
- [ ] Nach Aktivierung erscheint eine vertikale Wand (leuchtende Linie) im Wellenfeld; Standardposition: x = +3.0 m
- [ ] Ein Slider erlaubt die Verschiebung der Wand von x = −4.5 m bis x = +4.5 m
- [ ] Die Wand erstreckt sich über die gesamte Y-Breite des Feldes (−5 m bis +5 m)

### Endtyp-Auswahl
- [ ] Ein Dropdown oder Radiobutton-Gruppe "Endtyp" bietet zwei Optionen: "Festes Ende" und "Loses Ende"
- [ ] Beim Wechsel des Endtyps ändert sich das Wellenbild sofort (< 100 ms)
- [ ] Ein kurzer Erklärungstext unter dem Dropdown beschreibt den physikalischen Unterschied:
  - Festes Ende: "Phasenumkehr um 180°, Knoten an der Wand — wie eine eingespannte Saite"
  - Loses Ende: "Keine Phasenumkehr, Bauch an der Wand — wie ein freies Seilende"

### Visualisierung
- [ ] Die Gesamtwelle (einfallend + reflektiert) wird standardmäßig angezeigt
- [ ] Ein Toggle "Einfallende Welle" blendet nur die Originalquelle ein (reflektierte ausgeblendet)
- [ ] Ein Toggle "Reflektierte Welle" blendet nur die Spiegelquelle ein (Original ausgeblendet)
- [ ] Ein Toggle "Beide (Superposition)" zeigt die Gesamtwelle — Standard
- [ ] Die Spiegelquelle ist als gestrichelter Marker an ihrer Spiegelposition sichtbar (transparenter Quellenmarker)
- [ ] An der Wand ist deutlich erkennbar: beim festen Ende liegt ein Knoten (z = 0), beim losen Ende ein Bauch (z = max)

### Kompatibilität mit bestehenden Features
- [ ] Reflexion funktioniert mit Einzelquelle (Punkt) und Balkenquelle
- [ ] Bei ≥ 2 Originalquellen wird jede Quelle einzeln gespiegelt (N Spiegelquellen für N Quellen)
- [ ] Reflexion ist mit Schnittebene (PROJ-4) kompatibel: das 2D-Profil zeigt die Überlagerung
- [ ] Reflexion ist mit Top-Down-Ansicht (PROJ-7) kompatibel

## Grenzfälle
- **Wand direkt auf der Quelle (x_Wand = x_Quelle):** Spiegelquelle liegt am gleichen Ort wie Original; Ergebnis für festes Ende: vollständige Auslöschung (A + (−A) = 0); ein Hinweis "Wand überlappt Quelle — physikalisch sinnlos" erscheint.
- **Wand außerhalb des sichtbaren Feldes (±5 m):** Slider ist auf ±4.5 m begrenzt; keine Extrapolation.
- **8 Quellen + Reflexion = 16 Shader-Quellen:** Shader unterstützt aktuell max. 8 Quellen; für Reflexion muss Limit auf 16 erhöht oder eine separate Spiegelquellen-Berechnung implementiert werden.
- **Loses Ende + Stehende-Welle-Preset (PROJ-5):** Preset setzt Endtyp auf "Festes Ende"; Benutzer kann danach umschalten.
- **Dämpfung > 0 mit Reflexion:** Spiegelquelle hat dieselbe Dämpfung; die reflektierte Welle dämpft sich zusätzlich mit dem Abstand vom Spiegelpunkt — physikalisch korrekt.
- **Vergleichsmodus (PROJ-14): Links festes Ende, rechts loses Ende:** Jedes Panel hat unabhängigen Endtyp; direkter Vergleich möglich.

## Technische Anforderungen
- Implementierung via **Spiegelquellen-Methode** im GLSL-Shader: Spiegelquellen-Position und ggf. invertierte Phase als zusätzliche Uniforms
- Shader-Limit von 8 Quellen muss für Reflexion auf mindestens 16 erhöht werden (oder separate Reflexions-Berechnung im Shader)
- `u_reflectionWallX`: X-Position der Wand als Uniform (float)
- `u_reflectionType`: 0 = kein Reflexion, 1 = festes Ende, 2 = loses Ende (int)
- Performance-Ziel: Keine messbare FPS-Reduktion durch Reflexionsberechnung (Shader-seitig billig)
- Wandmarker: Three.js `LineSegments` in Cyan oder Weiß, volle Y-Höhe
- Spiegelquellenmarker: Transparenter (opacity 0.4) Quellenmarker an gespiegelter Position
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Komponentenstruktur
```
WaveVisualization (Orchestrator)
  +-- SourcePanel (linke Sidebar, enthaelt ReflectionPanel)
  |    +-- ReflectionPanel (NEU)
  |         +-- Switch "Reflexionswand aktivieren"
  |         +-- Slider "Wandposition (x)"
  |         +-- Select "Endtyp: Festes/Loses Ende"
  |         +-- Select "Anzeige: Total/Einfallend/Reflektiert"
  +-- WaveCanvas (erhaelt Reflexions-Uniforms)
  |    +-- Wandmarker (Three.js Line, Cyan)
  |    +-- Spiegelquellenmarker (transparente Kugeln)
```

### Neue/Geaenderte Dateien
| Datei | Aenderung |
|-------|-----------|
| `src/hooks/useReflection.ts` | NEU: Reflexions-Zustand + Spiegelquellen-Logik |
| `src/components/wave/ReflectionPanel.tsx` | NEU: UI-Panel |
| `src/lib/wave-shader.ts` | Array-Limit 8->16, Reflexions-Uniforms |
| `src/lib/wave-math.ts` | CPU-seitige Reflexion (ReflectionParams) |
| `src/lib/wave-params.ts` | pad auf 16 |
| `src/hooks/useWaveAnimation.ts` | Reflexions-Uniforms, Wand+Spiegelmarker |
| `src/hooks/useCrossSection.ts` | Reflexion durchreichen |
| `src/hooks/useIntensityScreen.ts` | Reflexion durchreichen |
| `src/hooks/useProbeData.ts` | Reflexion durchreichen |
| `src/components/wave/WaveVisualization.tsx` | Hook + Panel integrieren |
| `src/components/wave/SourcePanel.tsx` | ReflectionPanel einbetten |

### Technische Entscheidungen
- Spiegelquellen-Methode im Shader (physikalisch korrekt, GPU-seitig billig)
- Shader-Limit 8->16 fuer Original+Spiegelquellen
- Keine neuen npm-Pakete noetig

## QA-Testergebnisse

**Getestet:** 2026-03-05
**App-URL:** http://localhost:3000
**Tester:** QA-Ingenieur (KI)
**Methode:** Code-Review + Build-Verifikation (TypeScript-Kompilierung erfolgreich)

### Akzeptanzkriterien-Status

#### AK-1: Wand-Konfiguration
- [x] Im SourcePanel ist ein Toggle "Reflexionswand" verfuegbar (ReflectionPanel.tsx, Zeile 57-64)
- [x] Nach Aktivierung erscheint eine vertikale Wand (Cyan-Linie) im Wellenfeld; Standardposition x = +3.0 m (useReflection.ts, Zeile 31; useWaveAnimation.ts, Zeile 330-352)
- [x] Slider erlaubt Verschiebung von x = -4.5 m bis x = +4.5 m (WALL_X_MIN/MAX korrekt definiert)
- [x] Die Wand erstreckt sich ueber die gesamte Y-Breite des Feldes (-5 m bis +5 m, PLANE_SIZE/2 = 5)

#### AK-2: Endtyp-Auswahl
- [x] Select-Dropdown "Endtyp" bietet "Festes Ende" und "Loses Ende" (ReflectionPanel.tsx, Zeile 99-113)
- [x] Beim Wechsel aendert sich das Wellenbild sofort (Shader-Uniforms werden synchron aktualisiert)
- [x] Erklaerungstext unter dem Dropdown beschreibt den physikalischen Unterschied korrekt (Zeile 31-34)

#### AK-3: Visualisierung
- [x] Gesamtwelle (einfallend + reflektiert) wird standardmaessig angezeigt (displayMode: "total")
- [x] Toggle "Nur einfallende Welle" vorhanden (displayMode: "incident")
- [x] Toggle "Nur reflektierte Welle" vorhanden (displayMode: "reflected")
- [x] Toggle "Beide (Superposition)" vorhanden und ist Standard
- [x] Spiegelquellen-Marker als transparente Kugeln (opacity 0.4) an gespiegelter Position sichtbar
- [ ] BUG-1: Spiegelquellen-Marker ist immer eine Kugel, auch bei Balken-/Kreis-/Dreiecksquellen
- [ ] BUG-2: Physik -- Knoten/Bauch an der Wand nicht garantiert korrekt (siehe BUG-2 Details)

#### AK-4: Kompatibilitaet mit bestehenden Features
- [x] Reflexion funktioniert mit Einzelquelle (Punkt) -- Spiegelquellen-Berechnung in useReflection.ts
- [ ] BUG-3: Reflexion mit Balkenquelle -- Spiegelposition wird korrekt berechnet (x-Spiegelung), aber der Quellentyp der Spiegelquelle im Shader ist derselbe wie das Original (korrekt fuer Punkt, fragwuerdig fuer Balken)
- [x] Bei >= 2 Originalquellen wird jede einzeln gespiegelt (mirrorSources Array, Zeile 68-74 in useReflection.ts)
- [x] Reflexion mit Schnittebene (PROJ-4) kompatibel: reflection-Parameter wird an useCrossSection durchgereicht
- [x] Reflexion mit Top-Down-Ansicht (PROJ-7) kompatibel: Shader berechnet Reflexion unabhaengig von Kamera
- [x] Reflexion mit Punkt-Sonde (PROJ-8) kompatibel: useProbeData erhaelt reflectionParams
- [x] Reflexion mit Intensitaetsschirm (PROJ-9) kompatibel: useIntensityScreen erhaelt reflectionParams

### Grenzfaelle-Status

#### GF-1: Wand direkt auf der Quelle
- [x] Warnung "Wand ueberlappt Quelle" erscheint korrekt (wallOverlapsSource, Abstand < 0.1 m)
- [x] Toleranz von 0.1 m ist sinnvoll implementiert

#### GF-2: Wand ausserhalb des sichtbaren Feldes
- [x] Slider ist auf +/-4.5 m begrenzt (WALL_X_MIN/MAX)

#### GF-3: 8 Quellen + Reflexion = 16 Shader-Quellen
- [x] Shader-Arrays sind auf 16 erweitert (wave-shader.ts, Zeile 22-26)
- [x] pad-Funktion in wave-params.ts fuellt auf 16 auf
- [ ] BUG-4: Kein Schutz bei >8 Quellen + Reflexion -- Schleife bricht bei idx >= 16 ab, aber kein UI-Hinweis

#### GF-4: Stehende-Welle-Preset + Reflexion
- [x] Preset setzt keine Reflexion (korrekt, Reflexion ist unabhaengig)
- [x] Benutzer kann Reflexion manuell aktivieren nach Preset-Laden

#### GF-5: Daempfung > 0 mit Reflexion
- [x] Spiegelquelle erbt Daempfungsparameter der Originalquelle (useWaveAnimation.ts, Zeile 303)

### Sicherheitsaudit-Ergebnisse

Da WavePhysics eine reine Frontend-Applikation ohne Backend, Authentifizierung oder Benutzerdaten ist, entfallen viele klassische Sicherheitstests. Relevante Pruefungen:

- [x] Keine API-Endpunkte vorhanden (kein Backend)
- [x] Keine Benutzerdaten oder Credentials gespeichert
- [x] Keine localStorage/sessionStorage-Nutzung mit sensiblen Daten
- [x] Eingabevalidierung: Slider-Werte sind durch min/max begrenzt (WALL_X_MIN/MAX)
- [x] Keine XSS-Angriffsvektoren -- Benutzereingaben werden nur als numerische Werte verwendet
- [x] Keine externen API-Aufrufe oder Netzwerkkommunikation
- [x] WebGL-Shader: Keine dynamische Code-Generierung basierend auf Benutzereingaben
- [x] Keine Geheimnisse oder API-Keys im Quellcode

**Sicherheitsbewertung: Bestanden** -- Keine Sicherheitsrisiken identifiziert.

### Regressionstests

- [x] PROJ-1 (3D-Visualisierung): Build kompiliert erfolgreich, Shader-Aenderungen sind rueckwaertskompatibel (Arrays von 8 auf 16 erweitert, Standardwerte bleiben gleich)
- [x] PROJ-2 (Parameter-Steuerung): Keine Aenderungen an wave-params.ts Logik, nur pad-Funktion auf 16 erweitert
- [x] PROJ-3 (Quellen-Konfiguration): SourcePanel korrekt erweitert, bestehende Funktionalitaet unangetastet
- [x] PROJ-4 (Schnittebene): reflection-Parameter korrekt durchgereicht, optionaler Parameter
- [x] PROJ-5 (Presets): Preset-Mechanismus nicht veraendert, Reflexion ist unabhaengig
- [x] PROJ-7 (Top-Down): Kein Einfluss auf 2D-Ansicht
- [x] PROJ-8 (Punkt-Sonde): reflection-Parameter korrekt durchgereicht
- [x] PROJ-9 (Intensitaetsschirm): reflection-Parameter korrekt durchgereicht

### Gefundene Bugs

#### BUG-1: Spiegelquellen-Marker ignoriert Quellenform
- **Schweregrad:** Niedrig
- **Reproduktionsschritte:**
  1. Quellenform auf "Balken" oder "Kreis" aendern
  2. Reflexionswand aktivieren
  3. Erwartet: Spiegelquellen-Marker hat dieselbe Form wie Original (Balken/Kreis/Dreieck)
  4. Tatsaechlich: Spiegelquellen-Marker ist immer eine kleine Kugel (SphereGeometry)
- **Datei:** `src/hooks/useWaveAnimation.ts`, Zeile 356-364
- **Prioritaet:** Im naechsten Sprint beheben

#### BUG-2: Amplituden-Normierung zaehlt Spiegelquellen doppelt
- **Schweregrad:** Mittel
- **Reproduktionsschritte:**
  1. Einzelne Punktquelle, Reflexionswand aktivieren
  2. Anzeige auf "Beide (Superposition)" stellen
  3. Erwartet: Konstruktive Interferenz nahe der Wand zeigt volle Amplitude
  4. Tatsaechlich: Die Normierung im Shader (Zeile 115-121 in wave-shader.ts) summiert die Amplituden ALLER sichtbaren Quellen (Original + Spiegel). Bei Superposition wird durch 2*A normiert statt durch A, was die dargestellte Amplitude halbiert. Stehende Wellen mit Baeuchen (2A) werden nur als 1A dargestellt.
- **Datei:** `src/lib/wave-shader.ts`, Zeile 115-121
- **Prioritaet:** Vor Deployment beheben

#### BUG-3: Wellenfront der Spiegelquelle beginnt sofort bei t=0
- **Schweregrad:** Mittel
- **Reproduktionsschritte:**
  1. Animation zuruecksetzen (t=0), Reflexionswand bei x=3.0
  2. Animation starten
  3. Erwartet: Reflektierte Welle erscheint erst, nachdem die Originalwelle die Wand erreicht hat (Laufzeitverzoegerung)
  4. Tatsaechlich: Spiegelquelle emittiert Wellen sofort ab t=0, als ob sie eine eigenstaendige Quelle waere. Der Wavefront-Mask beginnt bei r=0 des Spiegelpunkts, nicht bei der Wand.
- **Datei:** `src/lib/wave-shader.ts`, Zeile 109-111 (Wavefront-Berechnung fuer Spiegelquellen)
- **Prioritaet:** Vor Deployment beheben -- physikalisch inkorrekt, da die reflektierte Welle erst nach Wandkontakt entstehen sollte

#### BUG-4: Kein UI-Hinweis bei 8 Quellen + Reflexion am Array-Limit
- **Schweregrad:** Niedrig
- **Reproduktionsschritte:**
  1. 8 Quellen einstellen (Maximum)
  2. Reflexionswand aktivieren
  3. Erwartet: Hinweis dass 16 Shader-Quellen am Limit sind, oder Quellenanzahl wird auf 8 begrenzt
  4. Tatsaechlich: Kein Hinweis, System funktioniert aber korrekt (Schleife bricht bei i >= 16 ab, useWaveAnimation Zeile 294)
- **Datei:** `src/components/wave/ReflectionPanel.tsx` (fehlende Warnung)
- **Prioritaet:** Nice-to-have

#### BUG-5: Anzeigemodus "Nur reflektierte Welle" zeigt unvollstaendige Normierung
- **Schweregrad:** Niedrig
- **Reproduktionsschritte:**
  1. Reflexion aktivieren, Anzeige auf "Nur reflektierte Welle" stellen
  2. Erwartet: Reflektierte Welle mit korrekter Amplitude
  3. Tatsaechlich: Die sumMaxAmp im Shader zaehlt nur die nicht-uebersprungenen Quellen. Beim "reflected"-Modus werden Originalquellen uebersprungen (continue in Zeile 102), aber deren Amplitude wird nicht zu sumMaxAmp addiert. Das fuehrt zu einer korrekten relativen Normierung, aber inkonsistent mit dem "total"-Modus.
- **Datei:** `src/lib/wave-shader.ts`, Zeile 102-103 / 115
- **Prioritaet:** Nice-to-have

### Cross-Browser und Responsive

Da es sich um eine reine Frontend-Applikation handelt und die Aenderungen hauptsaechlich im GLSL-Shader und React-Hooks liegen:
- **Chrome/Firefox/Safari:** WebGL-Shader-Code verwendet Standard-GLSL-Funktionen. Integer-Division `u_sourceCount / 2` im Shader ist GLSL-konform (ganzzahlige Division fuer int-Typen).
- **Responsive (375px):** ReflectionPanel ist in der Sidebar (SourcePanel) untergebracht, die auf kleinen Viewports per Collapsible ein-/ausblendbar ist. Kein spezifisches Responsive-Problem erkannt.
- **Responsive (768px):** Panel-Layout funktioniert mit bestehender Collapsible-Logik.
- **Responsive (1440px):** Vollstaendiges Layout mit beiden Sidebars sichtbar.

### Zusammenfassung
- **Akzeptanzkriterien:** 15/18 bestanden (3 mit Bugs)
- **Grenzfaelle:** 5/5 grundsaetzlich behandelt (1 mit fehlendem UI-Hinweis)
- **Gefundene Bugs:** 5 gesamt (0 kritisch, 2 hoch/mittel, 3 niedrig)
- **Sicherheit:** Bestanden -- keine Sicherheitsrisiken
- **Produktionsbereit:** NEIN
- **Empfehlung:** BUG-2 (Normierung) und BUG-3 (Wellenfront-Timing) muessen vor Deployment behoben werden. BUG-1, BUG-4 und BUG-5 sind niedrigprioritaer und koennen im naechsten Sprint behoben werden.

## Deployment
_Wird von /deploy hinzugefügt_
