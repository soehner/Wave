# PROJ-4: Schnittebenen-Analyse

## Status: Geplant
**Erstellt:** 2026-03-03
**Zuletzt aktualisiert:** 2026-03-03

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Schnittebene liegt in der 3D-Szene
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Querschnitt spiegelt aktuelle Parameter wider
- Optional: PROJ-3 (Wellenquellen-Konfiguration) — Bei mehreren Quellen zeigt der Schnitt Interferenz

## Beschreibung

Eine interaktive Schnittebene, die durch die 3D-Wellenvisualisierung gelegt werden kann. Der Schnittpfad der Ebene mit der Wellenoberfläche wird in einem **separaten 2D-Liniendiagramm unterhalb der 3D-Ansicht** angezeigt. Die Schnittebene kann entlang ihrer Normalenachse verschoben werden. Die Orientierung ist auf **zwei Richtungen** beschränkt: parallel zur X-Achse oder parallel zur Y-Achse.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [SourcePanel]   3D-Wellenbild (WebGL)   [ParameterPanel] │
│                  (mit eingeblendeter Schnittebene)        │
│                                                           │
├─────────────────────────────────────────────────────────┤
│             2D-Schnittdiagramm (Liniendiagramm)           │
│   z [m]  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿                   │
│          ─────────────────────────────  x/y [m]           │
└─────────────────────────────────────────────────────────┘
│  ControlBar (Abspielen / Neu starten / Kamera)            │
└─────────────────────────────────────────────────────────┘
```

Das 2D-Diagramm erscheint nur, wenn die Schnittebene aktiviert ist. Es teilt sich die verfügbare Höhe mit der 3D-Ansicht (ca. 30–35 % Höhe).

## User Stories

- Als Lehrkraft möchte ich eine vertikale Schnittebene durch die 3D-Welle legen, damit ich den Schülern zeigen kann, wie ein 2D-Querschnitt der Welle aussieht.
- Als Schüler möchte ich die Schnittebene verschieben, damit ich sehe, wie sich das Wellenprofil an verschiedenen Positionen unterscheidet.
- Als Lehrkraft möchte ich das 2D-Schnittdiagramm unterhalb der 3D-Ansicht sehen, damit ich beide Darstellungen gleichzeitig erklären kann.
- Als Benutzer möchte ich die Schnittebene ein- und ausblenden können, damit die 3D-Ansicht nicht dauerhaft verdeckt wird.
- Als Schüler möchte ich im 2D-Diagramm die Achsenbeschriftungen mit physikalischen Einheiten sehen, damit ich den Bezug zur Wellengleichung herstellen kann.
- Als Lehrkraft möchte ich zwischen X-Schnitt und Y-Schnitt wählen können, damit ich verschiedene Schnittrichtungen demonstrieren kann.
- Als Schüler möchte ich bei mehreren Wellenquellen das überlagerte Interferenzmuster im 2D-Diagramm sehen, damit ich Superposition besser verstehe.

## Akzeptanzkriterien

### Schnittebene aktivieren / deaktivieren
- [ ] In der ControlBar gibt es einen Toggle-Button "Schnittebene" (Icon: Scissors oder ähnlich)
- [ ] Beim Aktivieren erscheint die Schnittebene in der 3D-Szene als halbtransparente farbige Ebene (Opacity ca. 0.25)
- [ ] Beim Aktivieren erscheint das 2D-Diagramm unterhalb der 3D-Ansicht
- [ ] Beim Deaktivieren verschwinden beide (Ebene + Diagramm); die 3D-Ansicht füllt wieder den gesamten Bereich

### Schnittposition und -orientierung
- [ ] Ein Slider "Position" im Schnitt-Bereich verschiebt die Ebene entlang ihrer Normalenachse (gesamtes Simulationsfeld, z. B. –5 m bis +5 m)
- [ ] Zwei Buttons / ein Toggle wählen die Orientierung: "X-Schnitt" (Ebene senkrecht zur X-Achse) oder "Y-Schnitt" (Ebene senkrecht zur Y-Achse)
- [ ] Die Schnittlinie in der 3D-Ansicht (Schnittebene trifft Wellenoberfläche) hat eine kontrastreiche Farbe (z. B. Gelb oder Cyan)

### 2D-Diagramm
- [ ] Das 2D-Diagramm zeigt das Wellenprofil z(x) bei festem y (X-Schnitt) bzw. z(y) bei festem x (Y-Schnitt)
- [ ] Die horizontale Achse zeigt die Raumkoordinate in Meter [m], die vertikale Achse die Auslenkung z in Meter [m]
- [ ] Die Kurve im Diagramm hat dieselbe Farbe wie die Schnittlinie in der 3D-Ansicht
- [ ] Das Diagramm aktualisiert sich in Echtzeit synchron mit dem 3D-Render-Loop (kein wahrnehmbares Lag)
- [ ] Die Y-Achse (Auslenkung) skaliert automatisch auf den sichtbaren Wertebereich (auto-skaliert, kein manueller Zoom)
- [ ] Quellenposition(en) werden im 2D-Diagramm als vertikale gestrichelte Linie(n) markiert
- [ ] Bei mehreren Quellen (PROJ-3) zeigt das Diagramm die superponierte (summierte) Auslenkung

### Verhalten bei Animation
- [ ] Während die Animation läuft, aktualisiert sich die Kurve im Diagramm flüssig (≥ 30 FPS)
- [ ] Bei pausierter Animation (Abspielen-Button) bleibt der Schnitt sichtbar und eingefroren

## Grenzfälle

- **Schnittebene außerhalb des Simulationsfeldes:** Slider-Grenzen entsprechen den Feldgrenzen; kein Overflow, kein leeres Diagramm.
- **Schnitt exakt durch eine Quelle:** Quellposition als vertikale gestrichelte Linie im 2D-Diagramm — keine Division durch null im Shader.
- **Sehr hohe Frequenz (viele Perioden sichtbar):** Y-Achse auto-skaliert; X-Achse bleibt konstant (gesamte Breite des Feldes).
- **Sehr kleine Amplitude (fast flache Kurve):** Y-Achse skaliert auf kleinen Bereich — Nulllinie bleibt immer sichtbar.
- **Fenster zu schmal (< 1024 px):** Der bestehende Hinweis "Empfehlen wir min. 1024 px" greift; Schnittfeature ist bei < 1024 px nicht optimiert.
- **Mehrere Quellen mit Interferenz:** Das Diagramm zeigt die Superposition (Summe aller Quell-Beiträge) — keine Einzelkurven.
- **Schnittebene + Parameter gleichzeitig ändern:** Diagramm aktualisiert sich sofort, kein Race Condition zwischen Slider-Update und Render.

## Out of Scope (MVP)

- Kein gleichzeitiger X- und Y-Schnitt (nur einer aktiv)
- Keine frei rotierbaren Schnittebenen (nur achsenparallel)
- Kein manueller Zoom / Scroll im 2D-Diagramm
- Kein Exportieren des Diagramms als Bild/CSV

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
