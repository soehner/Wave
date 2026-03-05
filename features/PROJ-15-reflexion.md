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
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
