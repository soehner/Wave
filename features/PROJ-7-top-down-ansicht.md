# PROJ-7: Top-Down-2D-Ansicht (Draufsicht als Farbkarte)

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Three.js-Szene und Shader
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Quellenmarker in Draufsicht

## User Stories
- Als Physiklehrkraft möchte ich zwischen 3D-Perspektive und 2D-Draufsicht umschalten, damit ich Interferenzmuster besser erklären kann, die in der 3D-Ansicht durch die Perspektive verzerrt wirken.
- Als Schülerin möchte ich die Wellenausbreitung von oben als Farbkarte sehen, damit ich Maxima (rot), Minima (blau) und Knotenlinien (weiß) klar erkennen kann.
- Als Lehrkraft möchte ich in der Draufsicht die Quellenmarker sehen, damit die Lage der Quellen im Interferenzmuster erkennbar ist.
- Als Benutzer möchte ich zwischen den Ansichten wechseln ohne die Animation zu unterbrechen, damit der Übergang fließend wirkt.

## Akzeptanzkriterien
- [ ] Ein Toggle-Button "3D / 2D" ist in der ControlBar oder als Icon-Button am Canvas-Rand sichtbar
- [ ] Im 2D-Modus wechselt die Kamera auf eine senkrechte Draufsicht (orthografische Projektion, Kamera direkt über dem Ursprung)
- [ ] Im 2D-Modus ist OrbitControls deaktiviert (keine unbeabsichtigte Perspektivänderung durch Maus-Drag)
- [ ] Im 2D-Modus ist Zoom mit dem Mausrad weiterhin möglich (Skalierung der Orthokamera)
- [ ] Im 2D-Modus sind die Wellenfarben identisch zur 3D-Ansicht (Blau-Weiß-Rot)
- [ ] Im 2D-Modus werden die Quellenmarker als kleine Symbole (Kreise / Linien) in der Farbkarte eingeblendet
- [ ] Der Wechsel zwischen 3D und 2D erfolgt innerhalb von 200 ms (kein Flackern, kein Schwarzbild)
- [ ] Alle Parameter-Änderungen wirken sich in beiden Modi gleich aus
- [ ] Im 2D-Modus sind Achsenbeschriftungen (X, Y) und Feldgrenzen (±5 m) als Overlay eingeblendet
- [ ] Beim Zurückwechseln in 3D wird die zuletzt verwendete 3D-Kameraposition wiederhergestellt

## Grenzfälle
- **Benutzer dreht Kamera in 3D, wechselt zu 2D, wechselt zurück:** 3D-Kameraposition wird wiederhergestellt (gespeichert beim Wechsel zu 2D).
- **Sehr hohe Amplitude im 2D-Modus:** Farbkarte sättigt (Rot/Blau maximal), kein visueller Clipping-Hinweis nötig da Normierung bereits im Shader.
- **Schnittebene (PROJ-4) aktiv während 2D-Wechsel:** Schnittebene-Ebene wird im 2D-Modus ausgeblendet; 2D-Diagramm bleibt aktiv und synchron.
- **Preset-Wechsel im 2D-Modus:** Parameter werden gesetzt, Ansicht bleibt 2D (kein erzwungener Wechsel zu 3D).
- **Fenstergröße < 1024 px während 2D-Modus:** Bestehende Viewport-Warnung zeigt sich; 2D-Modus bleibt aktiv.

## Technische Anforderungen
- Umschaltung zwischen `PerspectiveCamera` und `OrthographicCamera` in Three.js
- Kameraposition im 2D-Modus: (0, 0, 20), lookAt (0, 0, 0)
- Zoom-Faktor der Orthokamera: proportional zum Canvas-AspectRatio × Feldgröße (10 m)
- Keine Neuerstellung der Geometrie oder des Shaders beim Modewechsel
- Performance-Ziel: kein FPS-Einbruch beim Moduswechsel
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
