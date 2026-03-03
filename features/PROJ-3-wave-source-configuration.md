# PROJ-3: Wellenquellen-Konfiguration

## Status: Geplant
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

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
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
