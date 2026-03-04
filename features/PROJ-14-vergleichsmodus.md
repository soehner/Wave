# PROJ-14: Vergleichsmodus (Split-Screen)

## Status: Geplant
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
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
