# PROJ-4: Schnittebenen-Analyse

## Status: Geplant
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Schnittebene liegt in der 3D-Szene
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Querschnitt spiegelt aktuelle Parameter wider
- Optional: PROJ-3 (Wellenquellen-Konfiguration) — Bei mehreren Quellen zeigt der Schnitt Interferenz

## Beschreibung
Eine interaktive Schnittebene, die durch die 3D-Wellenvisualisierung gelegt werden kann. Der Schnittpfad der Ebene mit der Wellenoberfläche wird in einem separaten 2D-Liniendiagramm (unterhalb oder seitlich der 3D-Ansicht) angezeigt. Die Schnittebene kann entlang der X- oder Y-Achse verschoben und auch rotiert werden.

## User Stories

- Als Lehrkraft möchte ich eine vertikale Schnittebene durch die 3D-Welle legen, damit ich den Schülern zeigen kann, wie ein 2D-Querschnitt der Welle aussieht.
- Als Schüler möchte ich die Schnittebene verschieben, damit ich sehe, wie sich das Wellenprofil an verschiedenen Positionen unterscheidet.
- Als Lehrkraft möchte ich das 2D-Schnittdiagramm neben der 3D-Ansicht sehen, damit ich beide Darstellungen gleichzeitig erklären kann.
- Als Benutzer möchte ich die Schnittebene ein- und ausblenden können, damit die 3D-Ansicht nicht dauerhaft verdeckt wird.
- Als Schüler möchte ich im 2D-Diagramm die Achsenbeschriftungen mit physikalischen Einheiten sehen, damit ich den Bezug zur Wellengleichung herstellen kann.
- Als Lehrkraft möchte ich die Orientierung der Schnittebene wählen können (parallel zur X- oder Y-Achse), damit ich verschiedene Schnittrichtungen demonstrieren kann.

## Akzeptanzkriterien

- [ ] Ein Toggle-Button "Schnittebene anzeigen" aktiviert / deaktiviert die Schnittebene in der 3D-Szene
- [ ] Die Schnittebene wird in der 3D-Szene als halbtransparente, farbige Ebene dargestellt
- [ ] Ein Slider "Position der Schnittebene" verschiebt die Ebene entlang ihrer Normalenachse (Bereich: gesamtes Simulationsfeld)
- [ ] Die Orientierung der Schnittebene ist wählbar: parallel zur X-Achse oder parallel zur Y-Achse
- [ ] Unterhalb (oder seitlich) der 3D-Ansicht erscheint ein 2D-Liniendiagramm mit dem Wellenprofil am Schnittpunkt
- [ ] Das 2D-Diagramm aktualisiert sich in Echtzeit bei Änderung der Schnittposition oder Wellenparameter
- [ ] Das 2D-Diagramm zeigt X- und Z-Achse mit physikalischen Einheiten (m bzw. m Auslenkung)
- [ ] Die Schnittlinie in der 3D-Ansicht und die Kurve im 2D-Diagramm haben dieselbe Farbe
- [ ] Das 2D-Diagramm ist scrollbar / zoombar (Mausrad)
- [ ] Bei Pause der Animation (PROJ-1) bleibt der Schnitt sichtbar und eingefroren

## Grenzfälle

- **Schnittebene außerhalb des Simulationsfeldes:** Slider-Grenzen entsprechen genau den Feldgrenzen; kein Overflow.
- **Schnitt bei sehr hoher Frequenz:** 2D-Diagramm zeigt ggf. sehr viele Perioden — automatisches Rescaling der X-Achse.
- **Schnitt durch eine Quelle:** Quellposition im 2D-Diagramm wird als vertikale gestrichelte Linie markiert.
- **Mehrere Quellen (PROJ-3) mit Interferenz:** Das 2D-Diagramm zeigt das überlagerte (superponierte) Wellenprofil.
- **Gleichzeitig 2 Schnittebenen:** Nur eine Schnittebene ist gleichzeitig aktiv (kein Multi-Schnitt im MVP).
- **Fenster zu schmal für Side-by-Side:** 2D-Diagramm wechselt automatisch von seitlich auf unterhalb der 3D-Ansicht.

## Technische Anforderungen

- **3D-Darstellung:** Three.js `Plane`-Mesh als halbtransparentes Objekt (`opacity: 0.3`)
- **Datenpunkt-Extraktion:** Aus dem Vertex-Array der Wellenoberfläche wird die Schnittlinie interpoliert
- **2D-Diagramm:** Recharts oder Chart.js — Liniendiagramm mit animierter Kurve
- **Layout:** CSS Grid — 3D-Ansicht links/oben, 2D-Diagramm rechts/unten (responsive)
- **Update-Rate:** Schnittdiagramm wird synchron mit dem Three.js Render-Loop aktualisiert (requestAnimationFrame)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
