# PROJ-12: Farbschema-Optionen

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Fragment-Shader für Farbberechnung

## User Stories
- Als Physiklehrkraft möchte ich zwischen verschiedenen Farbschemata wählen, damit die Darstellung an die Lichtverhältnisse im Klassenraum (Beamer, helles Whiteboard, abgedunkelter Raum) angepasst werden kann.
- Als Lehrkraft möchte ich ein Höhenlinien-Overlay aktivieren, damit Schüler die Isokurven gleicher Auslenkung wie bei einer topografischen Karte lesen können.
- Als Schülerin mit Farbsehschwäche (Rot-Grün-Blindheit) möchte ich ein barrierefreies Farbschema nutzen, damit ich die Wellen-Visualisierung genauso gut verstehen kann.
- Als Lehrkraft möchte ich das Farbschema für die Intensitätsdarstellung nutzen (I = z²), damit Energieverteilung statt Auslenkung hervorgehoben wird.
- Als Benutzer möchte ich das aktive Farbschema mit einem Klick wechseln, ohne die laufende Animation zu unterbrechen.

## Akzeptanzkriterien
- [ ] Ein Farbschema-Auswahlelement (Dropdown oder Icon-Buttons) ist in der ControlBar oder im ParameterPanel verfügbar
- [ ] Mindestens 4 Farbschemata sind verfügbar:
  - **Klassisch (Standard):** Blau (negativ) → Weiß (null) → Rot (positiv)
  - **Heatmap / Regenbogen:** Violett → Blau → Grün → Gelb → Rot (für Intensität)
  - **Schwarz-Weiß:** Schwarz (negativ) → Grau (null) → Weiß (positiv); geeignet für Beamer mit schlechtem Kontrast
  - **Barrierefrei (Viridis):** Lila → Blau → Grün → Gelb; Rot-Grün-sicher
- [ ] Ein Toggle "Höhenlinien" zeigt Konturlinien (Isoamplitudenlinien) als schwarze oder weiße Linien überlagert auf der Wellenoberfläche
- [ ] Die Höhenlinien werden bei N äquidistanten Amplitudenwerten gezeichnet (Standard N = 8; einstellbar per Slider 4–16)
- [ ] Der Farbschemawechsel erfolgt ohne Animation-Unterbrechung (< 50 ms)
- [ ] Das aktive Farbschema wird im URL-State (PROJ-11) gespeichert und beim Laden wiederhergestellt
- [ ] Im Heatmap-Modus wird die Intensität I = z² statt der Auslenkung z auf die Farbskala gemappt
- [ ] Jedes Farbschema zeigt eine kleine Legende (Farbskala) mit Min/Max-Beschriftung

## Grenzfälle
- **Farbschema-Wechsel während Screenshot (PROJ-11):** Screenshot zeigt das gerade aktive Schema; kein timing-Problem.
- **Höhenlinien bei sehr kleiner Amplitude (A → 0):** Linien kollabieren auf Mittelpunkt; kein Rendering-Fehler.
- **Höhenlinien bei N = 16 und feiner Wellenlänge:** Linien können dicht liegen; kein Performance-Problem, da im Shader berechnet.
- **Heatmap-Modus und Knotenlinien (PROJ-10) gleichzeitig:** Knotenlinien sind auf dem Heatmap sichtbar (Linien bei I = 0).
- **Barrierefrei-Schema auf Beamer mit schlechtem Kontrast:** Nutzer kann zu Schwarz-Weiß wechseln; kein automatischer Erkennungsmechanismus.

## Technische Anforderungen
- Farbschema-Auswahl als Uniform im Fragment-Shader: `u_colorScheme` (int 0–3)
- Höhenlinien als Fragment-Shader-Effekt: `fract(displacement * N) < lineWidth` → schwarz/weiß
- Kein Neuaufbau des Meshes oder Shaders beim Wechsel; nur Uniform-Update
- Farbpaletten als GLSL-Lookup-Tabelle oder Gradient-Funktion
- Performance-Ziel: Kein FPS-Einbruch bei Farbschemawechsel
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
