# PROJ-16: Mausgesteuerte Quellenhöhe (Z-Position)

## Status: In Review
**Erstellt:** 2026-03-07
**Zuletzt aktualisiert:** 2026-03-07

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — 3D-Canvas und Animationsloop
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — aktive Quellenauswahl
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Quellenanzahl und aktive Quelle

## Beschreibung

Wenn der "Mausverfolgung"-Modus per Toggle-Button aktiviert wird, steuert die vertikale Mausbewegung über dem 3D-Canvas die Z-Höhe (Höhe über der Wellenebene) der aktiven Wellenquelle. Die Quelle verlässt dadurch die X-Y-Ebene (Z=0) und schwebt auf einem einstellbaren Z-Wert über oder unter der Wellenoberfläche.

Physikalisch ändert sich dadurch der Abstand `r` von der Quelle zu jedem Vertex auf der Wellenoberfläche:

```
r = sqrt((vx - sx)² + (vy - sy)² + sz²)
```

Das erzeugt ein visuell und physikalisch interessantes Phänomen: Je höher die Quelle, desto „weicher" erscheint das Interferenzmuster, da die geometrischen Abstände zwischen benachbarten Punkten auf der Oberfläche kleiner werden.

## User Stories

- Als Lehrkraft möchte ich die Quellenhöhe per Mausbewegung live verändern, damit ich den Einfluss der Quellenposition auf das Wellenmuster direkt während der Demonstration zeigen kann.
- Als Schüler möchte ich sehen, wie eine Quelle über der Wellenoberfläche das Muster beeinflusst, damit ich den Unterschied zwischen flacher und erhöhter Quellenposition verstehe.
- Als Benutzer möchte ich die Maussteuerung per Toggle-Button ein- und ausschalten, damit die Kamera-Orbit-Steuerung (Drehen/Zoomen) weiterhin nutzbar bleibt.
- Als Benutzer möchte ich, dass nur die aktuell ausgewählte Quelle der Maus folgt, damit ich bei mehreren Quellen gezielt einzelne Quellen positionieren kann.
- Als Benutzer möchte ich den aktuellen Z-Wert der aktiven Quelle als numerischen Wert sehen, damit ich die exakte Höhe nachvollziehen kann.

## Akzeptanzkriterien

- [ ] Ein Toggle-Button in der Benutzeroberfläche (ControlBar oder SourcePanel) aktiviert/deaktiviert den "Mausverfolgung"-Modus
- [ ] Im aktivierten Modus: vertikale Mausbewegung steuert die Z-Position relativ (Delta-Mapping) — Maus nach oben = Z steigt, Maus nach unten = Z sinkt; die Änderungsrate ist proportional zur Mausbewegungsgeschwindigkeit
- [ ] Der Z-Bereich ist auf -5.0 m bis +5.0 m begrenzt
- [ ] Die aktuell angezeigte Z-Höhe wird als numerischer Wert in der UI angezeigt (1 Nachkommastelle, Einheit "m")
- [ ] Bei aktiviertem Mausverfolgungsmodus wird die OrbitControls-Rotation deaktiviert (kein Konflikt mit Kamera-Drehen)
- [ ] Beim Deaktivieren des Modus bleibt die Quelle auf der zuletzt gesetzten Z-Höhe (kein automatisches Zurücksetzen)
- [ ] Ein "Zurücksetzen"-Button setzt die Z-Höhe der aktiven Quelle auf 0.0 m zurück
- [ ] Die Wellenphysik (Vertex-Shader) berechnet den Abstand `r` unter Einbeziehung des Z-Offsets der Quelle
- [ ] Bei mehreren Quellen: nur die aktive Quelle (ausgewählt im SourcePanel) folgt der Maus; andere behalten ihre Z-Höhe
- [ ] Der Quellenmarker in der 3D-Szene zeigt die tatsächliche 3D-Position der Quelle (inklusive Z-Offset)

## Grenzfälle

- **Z = 0 (Standard):** Quelle liegt in der Wellenebene — Verhalten identisch zu bisherigem Verhalten, keine Regression
- **Sehr hohe Z-Werte (±5 m):** Quelle weit über/unter der Ebene; Wellen erscheinen nahezu konzentrisch (Abstandsformel dominiert), wird per Clamp-Grenze verhindert
- **Mausbewegung außerhalb des Canvas:** Z-Wert wird eingefroren (kein Update solange Maus außerhalb); beim Wiedereintreten setzt das Delta-Tracking nahtlos fort (kein Sprung)
- **Mausverfolgung bei Einzelquelle:** Identisch zu Mehrfachquellen — die eine aktive Quelle folgt der Maus
- **Mausverfolgung + Preset-Wechsel:** Beim Laden eines Presets wird die Mausverfolgung deaktiviert und alle Z-Höhen auf 0.0 zurückgesetzt
- **Mausverfolgung + Top-Down-Ansicht (PROJ-7):** In der Top-Down-Ansicht ist die Z-Position nicht sichtbar; ein Hinweis erscheint ("Z-Steuerung in Draufsicht nicht verfügbar")

## Technische Anforderungen

- **UI-Komponenten:** shadcn/ui `Button` (Toggle-Zustand), `Badge` für Z-Wert-Anzeige, `Tooltip` für Erklärung
- **Mausevent:** `mousemove`-Listener auf dem Canvas-Element; `movementY`-Delta auf Z-Änderung mappen (z.B. -movementY * Sensitivitätsfaktor); akkumulierter Wert wird auf [-5, +5] geclampt
- **Shader-Erweiterung:** `u_sourceZ[8]`-Array im Vertex-Shader — Abstandsberechnung erweitern auf 3D-Distanz
- **Hook-Erweiterung:** `useWaveSources` um `sourceZ: number[]` und `setSourceZ(index, z)` ergänzen
- **OrbitControls:** `controls.enabled = !mouseTrackingActive` um Konflikt mit Kamera-Steuerung zu vermeiden
- **Performance:** Z-Array als Uniform — minimaler GPU-Overhead, keine FPS-Auswirkung

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)

### Komponentenstruktur

```
SourcePanel (bestehend, erweitern)
└── SourceHeightControl (NEU)
    ├── Toggle-Button "Mausverfolgung" (shadcn Button, Toggle-Zustand)
    ├── Z-Wert-Anzeige: "Höhe: 2.3 m" (shadcn Badge)
    ├── Reset-Button "Z → 0" (shadcn Button)
    └── Hinweis-Badge bei Top-Down-Ansicht aktiv (shadcn Badge)

WaveVisualization (bestehend, erweitern)
└── Canvas-Element
    ├── mousemove-Listener (neu, nur wenn Mausverfolgung aktiv)
    ├── mouseleave-Listener (friert Z-Delta ein)
    └── OrbitControls.enabled = false (wenn Mausverfolgung aktiv)
```

### Datenmodell

```
Erweiterung von useWaveSources (bestehend):
- sourceZ: number[]        — Z-Höhe jeder Quelle (max. 8), Standard: alle 0.0
- activeSourceIndex: number — welche Quelle gerade ausgewählt ist, Standard: 0
- setSourceZ(index, z)     — setzt Z einer einzelnen Quelle, geclampt auf [-5, +5]
- setActiveSourceIndex(i)  — wählt die aktive Quelle aus
- resetSourceZ(index)      — setzt Z einer Quelle auf 0.0 zurück

Neuer Hook useMouseTracking:
- isActive: boolean         — Mausverfolgung ein/aus
- toggle()                  — schaltet den Modus um
- onMouseMove(movementY)    — berechnet Z-Delta und delegiert an setSourceZ

Kein Backend, keine Datenpersistenz — reiner React-State im Browser.
```

### Maus → Z-Mapping (Konzept)

Die vertikale Mausbewegung (`movementY`) wird mit einem festen Sensitivitätsfaktor
multipliziert und als Delta zum aktuellen Z-Wert addiert:

```
neuesZ = aktuellesZ + (-movementY × Sensitivität)
neuesZ = clamp(neuesZ, -5.0, +5.0)
```

Maus nach oben → `movementY` negativ → Z steigt. Das Vorzeichen wird intern
umgekehrt, damit die Intuition stimmt.

### Shader-Erweiterung (Vertex-Shader)

Das bestehende Shader-Programm berechnet den Wellenabstand `r` bisher in 2D.
Es wird ein neues Uniform-Array `u_sourceZ[8]` eingeführt. Die Abstandsformel
wird auf 3D erweitert:

```
Bisher:  r = sqrt(dx² + dy²)
Neu:     r = sqrt(dx² + dy² + sz²)  // sz = u_sourceZ[i]
```

Das ist eine minimale Änderung: ein Uniform-Array mehr, eine Rechenoperation
mehr pro Vertex. Kein messbarer FPS-Einfluss.

### Technische Entscheidungen

| Entscheidung | Begründung |
|---|---|
| `movementY`-Delta statt absoluter Mausposition | Verhindert Sprünge beim Wieder-Eintreten des Cursors in den Canvas |
| OrbitControls komplett deaktivieren (Rotation + Pan) | Kein Konflikt zwischen Kamera-Geste und Z-Steuerung |
| Z-Wert bleibt beim Deaktivieren des Modus | Lehrkraft kann Höhe präzise einstellen und dann Kamera wieder drehen |
| Quellen-Index explizit verwalten (activeSourceIndex) | Ermöglicht gezielte Steuerung bei mehreren Quellen |
| Preset-Wechsel setzt Mausverfolgung + alle Z auf 0 zurück | Konsistenter, vorhersehbarer Zustand nach Preset-Load |

### Abhängigkeiten (keine neuen Pakete nötig)

Alle benötigten shadcn/ui-Komponenten sind bereits installiert:
- `Button` ✓ (Toggle-Zustand via `variant`)
- `Badge` ✓ (Z-Wert-Anzeige)
- `Tooltip` ✓ (Erklärung für Mausverfolgung)
- `Switch` ✓ (alternativ zum Toggle-Button)

Kein neues npm-Paket erforderlich. Alle Änderungen sind rein im bestehenden
React/Three.js-Stack.

## QA-Testergebnisse

**Getestet:** 2026-03-07 (Re-Test)
**App-URL:** http://localhost:3000
**Tester:** QA-Ingenieur (KI)
**Build-Status:** Erfolgreich (Next.js 16.1.6, keine TypeScript-Fehler)

### Akzeptanzkriterien-Status

#### AK-1: Toggle-Button fuer Mausverfolgungsmodus -- BESTANDEN
- [x] Toggle-Button "Mausverfolgung" ist im SourcePanel vorhanden (SourceHeightControl-Komponente)
- [x] Button zeigt korrekten Zustand: "Mausverfolgung" (inaktiv, outline) / "Maus aktiv" (aktiv, default-variant)
- [x] Button ist disabled wenn Top-Down-Ansicht aktiv (is2DView)
- [x] Button hat korrektes aria-label und aria-pressed fuer Barrierefreiheit

#### AK-2: Vertikale Mausbewegung steuert Z-Position (Delta-Mapping) -- BESTANDEN
- [x] mousemove-Listener auf Canvas-Element registriert (useWaveAnimation.ts Zeile 1192)
- [x] movementY-Delta wird mit Sensitivitaetsfaktor 0.02 multipliziert
- [x] Vorzeichen korrekt invertiert: Maus hoch = movementY negativ = Z steigt
- [x] Delta-Mapping (relativ, nicht absolut) verhindert Spruenge beim Wiedereintreten

#### AK-3: Z-Bereich auf -5.0 bis +5.0 begrenzt -- BESTANDEN
- [x] Konstanten SOURCE_Z_MIN = -5.0 und SOURCE_Z_MAX = 5.0 definiert (useWaveSources.ts)
- [x] Clamping in setSourceZ (useWaveSources.ts Zeile 79)
- [x] Clamping in handleMouseMove (useMouseTracking.ts Zeile 37-38)

#### AK-4: Z-Hoehe als numerischer Wert angezeigt -- BESTANDEN
- [x] Badge-Komponente zeigt activeZ.toFixed(1) + " m" an
- [x] Font-mono und tabular-nums fuer stabile Darstellung
- [x] aria-label vorhanden: "Z-Hoehe: X.X Meter"

#### AK-5: OrbitControls bei aktivem Mausverfolgungsmodus deaktiviert -- BESTANDEN
- [x] enableRotate und enablePan werden auf false gesetzt (useWaveAnimation.ts Zeile 170-172)
- [x] Beim Deaktivieren werden enableRotate und enablePan wieder auf true gesetzt (Zeile 173-175)
- [x] Korrekte Bedingung: nur in 3D-Ansicht wiederhergestellt (viewModeRef.current === "3d")

#### AK-6: Z-Hoehe bleibt beim Deaktivieren des Modus -- BESTANDEN
- [x] toggle() in useMouseTracking aendert nur isActive-State, kein Z-Reset
- [x] Z-Wert bleibt im sourceZ-Array erhalten

#### AK-7: Zuruecksetzen-Button setzt Z auf 0.0 zurueck -- BESTANDEN
- [x] Reset-Button mit RotateCcw-Icon vorhanden
- [x] onClick ruft resetSourceZ(activeSourceIndex) auf
- [x] Button ist disabled wenn activeZ === 0 (korrekte UX)
- [x] Tooltip "Z auf 0 zuruecksetzen" vorhanden

#### AK-8: Shader berechnet 3D-Abstand mit Z-Offset -- BESTANDEN
- [x] u_sourceZ[16]-Array als Uniform im Vertex-Shader deklariert
- [x] Abstandsformel: r = sqrt(r2d * r2d + sz * sz) (wave-shader.ts Zeile 131-133)
- [x] CPU-seitige Berechnung in wave-math.ts identisch (Zeile 119-120)
- [x] Spiegelquellen erben Z-Hoehe der Originalquelle (wave-math.ts Zeile 163)

#### AK-9: Nur aktive Quelle folgt der Maus bei mehreren Quellen -- BESTANDEN
- [x] handleCanvasMouseMove verwendet waveSourcesHook.activeSourceIndex
- [x] Quelle-Auswahl-Buttons im SourceHeightControl bei sourceCount > 1 sichtbar
- [x] setActiveSourceIndex passt sich an bei Quellenanzahl-Aenderung (useWaveSources.ts Zeile 57)

#### AK-10: Quellenmarker zeigt 3D-Position mit Z-Offset -- BESTANDEN
- [x] Marker-Position setzt Z auf sSourceZ[i] (useWaveAnimation.ts Zeile 263)
- [x] Gestrichelte vertikale Linie von Ebene (Z=0) zum Marker bei |Z| > 0.05
- [x] Alle Quellentypen (POINT, CIRCLE, BAR, TRIANGLE) verwenden Z-Position

### Grenzfaelle-Status

#### GF-1: Z = 0 (Standard) -- BESTANDEN
- [x] Alle sourceZ-Werte initialisiert auf 0 -- kein Einfluss auf bisherige Physik
- [x] sqrt(r2d^2 + 0^2) = r2d -- identisch zum bisherigen Verhalten

#### GF-2: Sehr hohe Z-Werte (+/-5 m) -- BESTANDEN
- [x] Clamping auf [-5, +5] in setSourceZ und handleMouseMove

#### GF-3: Mausbewegung ausserhalb des Canvas -- BESTANDEN (mit Hinweis)
- [x] mousemove-Events werden nur auf dem Canvas-Element registriert (addEventListener auf renderer.domElement)
- [x] Da der Listener direkt auf dem Canvas-Element liegt, feuern keine mousemove-Events ausserhalb
- [ ] BUG-1 (Niedrig): useMouseTracking.ts exportiert kein isInsideCanvas-Ref, aber WaveVisualization.tsx referenziert auch keines. Falls isInsideCanvas-Refs in einer frueheren Version existierten, ist das toter Code -- funktional kein Problem

#### GF-4: Mausverfolgung bei Einzelquelle -- BESTANDEN
- [x] Funktioniert identisch -- activeSourceIndex ist 0, einzige Quelle wird gesteuert
- [x] Quellen-Auswahl-Buttons werden bei sourceCount === 1 nicht angezeigt

#### GF-5: Mausverfolgung + Preset-Wechsel -- BESTANDEN
- [x] handleLoadPreset ruft mouseTrackingHook.deactivate() auf (WaveVisualization.tsx Zeile 224)
- [x] applyConfig setzt alle Z-Hoehen auf 0 zurueck (useWaveSources.ts Zeile 74)
- [x] handleResetToPreset macht dasselbe (Zeile 236)

#### GF-6: Mausverfolgung + Top-Down-Ansicht (PROJ-7) -- BESTANDEN
- [x] Hinweis-Badge "Z-Steuerung in Draufsicht nicht verfuegbar" wird angezeigt
- [x] Toggle-Button ist disabled bei is2DView
- [x] useEffect deaktiviert Mausverfolgung automatisch bei Wechsel zu 2D (WaveVisualization.tsx Zeile 143-147) -- BUG-2 aus vorherigem Test wurde behoben

### Sicherheitsaudit-Ergebnisse

Da PROJ-16 ein reines Frontend-Feature ohne Backend, API oder Benutzerdaten ist:

- [x] Keine API-Endpunkte: Kein Angriffspunkt fuer Injection oder Auth-Bypass
- [x] Keine Benutzerdaten: Keine Datenlecks moeglich
- [x] Keine Secrets: Keine API-Keys oder Zugangsdaten im Code
- [x] Eingabevalidierung: Z-Wert wird numerisch geclampt -- kein Ueberlauf moeglich
- [x] Keine DOM-Manipulation durch Benutzereingaben (keine textuelle Eingabe)
- [x] Performance: Kein Denial-of-Service-Vektor durch schnelle Mausbewegung (Z wird geclampt, State-Updates sind gedrosselt durch React-Batching)
- [x] Keine XSS-Vektoren: Anzeige verwendet .toFixed(1), keine HTML-Injection moeglich
- [x] Kein Prototype-Pollution-Risiko: sourceZ-Array wird mit spread-Operator kopiert, nie direkt mutiert

### Regressionstests

- [x] Build kompiliert ohne Fehler (TypeScript + Next.js)
- [x] PROJ-1 (3D-Wellenvisualisierung): Shader-Erweiterung abwaertskompatibel (Z=0 ergibt identisches Verhalten)
- [x] PROJ-3 (Wellenquellen): sourceConfigToUniforms akzeptiert optionales sourceZ-Array mit Fallback auf Array(16).fill(0)
- [x] PROJ-4 (Schnittebenen): wave-math.ts beruecksichtigt sourceZ korrekt mit optionalem Chaining (?.[i] ?? 0)
- [x] PROJ-5 (Presets): applyConfig setzt Z-Hoehen zurueck, handleLoadPreset deaktiviert Mausverfolgung
- [x] PROJ-9 (Intensitaetsschirm): computeWaveZ verwendet sourceZ korrekt
- [x] PROJ-15 (Reflexion): Spiegelquellen erben Z-Hoehe der Originalquelle (wave-math.ts Zeile 163)

### Cross-Browser / Responsive

#### Cross-Browser
- [x] mousemove + movementY: Unterstuetzt in Chrome, Firefox, Safari (Standard seit >5 Jahren)
- [x] Keine browser-spezifischen APIs verwendet
- [x] Three.js OrbitControls und WebGL: plattformuebergreifend kompatibel

#### Responsive
- [x] SourcePanel hat responsive Breite (w-64 sm:w-72 xl:w-80)
- [x] SourceHeightControl verwendet relative Layouts (flex, gap)
- [x] Auf Mobile (< 768px) werden Panels automatisch geschlossen -- SourceHeightControl nur erreichbar wenn Panel manuell geoeffnet
- [ ] BUG-2 (Niedrig): Auf Touch-Geraeten (375px) gibt es kein mousemove-Event mit movementY. Die Funktion ist auf reinen Touch-Geraeten nicht nutzbar. Laut PRD ist Mobile-First kein Ziel ("Zielgeraet: Desktop/Laptop"), daher Schweregrad Niedrig.

### Gefundene Bugs

#### BUG-1: isInsideCanvas-Ref ist moeglicherweise toter Code (aus frueherer Version)
- **Schweregrad:** Niedrig
- **Beschreibung:** Falls in einer frueheren Implementierung isInsideCanvas-Refs in useMouseTracking existierten, die jetzt nicht mehr vorhanden oder nicht gelesen werden, ist das toter Code. In der aktuellen Version wird das mousemove-Event direkt auf dem Canvas-Element registriert, sodass Events ohnehin nicht ausserhalb des Canvas feuern.
- **Prioritaet:** Nice-to-have (Code-Hygiene, keine funktionale Auswirkung)

#### BUG-2: Mausverfolgung nicht auf Touch-Geraeten nutzbar
- **Schweregrad:** Niedrig
- **Reproduktionsschritte:**
  1. App auf reinem Touch-Geraet oeffnen (Smartphone/Tablet)
  2. Mausverfolgung aktivieren
  3. Erwartet: Hinweis oder alternative Touch-Steuerung
  4. Tatsaechlich: Funktion ist stillschweigend nicht nutzbar (kein mousemove mit movementY)
- **Prioritaet:** Nice-to-have (PRD definiert Desktop als Zielgeraet, Touch nicht in Scope)

#### Behobene Bugs (aus vorherigem QA-Durchlauf)
- ~~BUG-2 (alt): Mausverfolgung bleibt aktiv beim Wechsel zu Top-Down-Ansicht~~ -- Behoben durch useEffect in WaveVisualization.tsx Zeile 143-147

### Zusammenfassung
- **Akzeptanzkriterien:** 10/10 bestanden
- **Grenzfaelle:** 6/6 bestanden
- **Gefundene Bugs:** 2 gesamt (0 kritisch, 0 hoch, 0 mittel, 2 niedrig)
- **Sicherheit:** Bestanden (keine Angriffsvektoren bei reinem Frontend-Feature)
- **Regression:** Bestanden (Build erfolgreich, bestehende Features nicht beeintraechtigt)
- **Produktionsbereit:** JA -- Alle Akzeptanzkriterien bestanden, keine kritischen oder hohen Bugs. Die 2 niedrigen Bugs (toter Code, Touch-Support) sind nicht blockierend.

## Deployment
_Wird von /deploy hinzugefügt_
