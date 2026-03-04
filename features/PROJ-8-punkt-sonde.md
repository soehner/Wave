# PROJ-8: Punkt-Sonde (z vs. t Zeitverlauf)

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Canvas-Klick und timeRef
- Benötigt: PROJ-4 (Schnittebenen-Analyse) — wave-math.ts Berechnungslogik wiederverwendbar
- Empfohlen: PROJ-7 (Top-Down-Ansicht) — Klick auf Punkt intuitiver in Draufsicht

## User Stories
- Als Physiklehrkraft möchte ich auf einen beliebigen Punkt im Wellenfeld klicken und dessen Schwingungsverlauf z(t) sehen, damit ich den Unterschied zwischen Welle (räumlich) und Schwingung (zeitlich) am selben Punkt demonstrieren kann.
- Als Schülerin möchte ich sehen, wie sich die Auslenkung an einem festen Ort über die Zeit verhält, damit ich verstehe, dass die Welle sich bewegt, der Punkt selbst aber schwingt.
- Als Lehrkraft möchte ich mehrere Sondenpunkte gleichzeitig setzen, damit ich den Phasenunterschied an verschiedenen Orten vergleichen kann.
- Als Benutzer möchte ich einen Sondenpunkt durch erneuten Klick oder X-Button entfernen, damit ich die Ansicht nicht überlade.
- Als Lehrkraft möchte ich die Sondenposition als (x, y)-Koordinaten abgelesen bekommen, damit ich sie mit der Formel in Beziehung setzen kann.

## Akzeptanzkriterien
- [ ] Durch Klick (oder Tap in Desktop-Modus) auf die 3D-Wellenoberfläche wird ein Sondenpunkt gesetzt
- [ ] Ein sichtbares Marker-Symbol (z. B. weißer Kreis mit schwarzem Rand) erscheint an der geklickten Position auf der Wellenoberfläche
- [ ] Neben oder unterhalb des Canvas öffnet sich ein Zeitverlaufsdiagramm (Recharts LineChart), das z(t) für die letzten ~5 Sekunden zeigt
- [ ] Das Diagramm aktualisiert sich in Echtzeit (~30 FPS) synchron mit der Animation
- [ ] Die Sondenposition (x, y) in Metern wird im Diagramm-Titel angezeigt (z. B. "Sonde: x = 2.3 m, y = -1.5 m")
- [ ] Es können bis zu 3 Sondenpunkte gleichzeitig gesetzt werden; jeder erhält eine eigene Farbe (z. B. Gelb, Cyan, Magenta)
- [ ] Jeder Sondenmarker hat einen X-Button zum Entfernen
- [ ] Ein "Alle Sonden entfernen"-Button löscht alle Marker und das Diagramm
- [ ] Bei pausierter Animation friert das Diagramm ein (kein weiterer Datenpuffer)
- [ ] Die Y-Achse des Diagramms zeigt die Auslenkung z in Metern; X-Achse zeigt die Zeit t in Sekunden
- [ ] Nach einem Neustart (t = 0) wird der Datenpuffer geleert und das Diagramm startet neu

## Grenzfälle
- **Klick außerhalb des Wellenfeldes (z. B. auf Leerraum neben Canvas):** Kein Sondenpunkt wird gesetzt; keine Fehlermeldung.
- **Mehr als 3 Klicks:** Vierter Klick ersetzt ältesten Sondenpunkt oder zeigt Hinweis "Maximal 3 Sonden gleichzeitig".
- **Klick genau auf einen Quellenmarker:** Sonde wird gesetzt, Quellenmarker bleibt sichtbar; beide Marker überlagern sich.
- **Sonde gesetzt, dann Preset-Wechsel:** Sondenmarker bleiben bestehen, aber Datenpuffer wird geleert (neues Szenario → neue Zeitmessung).
- **Sonde gesetzt, dann Quellenanzahl geändert:** Sondenberechnung passt sich automatisch an die neue Quellenkonstellation an.
- **Animation sehr schnell (5×-Modus mit PROJ-6):** Datenpuffer-Auflösung bleibt bei ~30 Hz; keine verzerrte Darstellung.
- **3D-Modus: Klick trifft kein Mesh-Polygon:** Raycaster gibt keinen Treffer zurück; keine Reaktion.

## Technische Anforderungen
- Three.js `Raycaster` für Mausklick → 3D-Position auf Wellenoberfläche
- Datenpuffer pro Sonde: Ringpuffer der letzten ~300 Punkte (5 s × 60 Hz)
- CPU-seitige Wellenberechnung via `wave-math.ts` (wiederverwendet aus PROJ-4)
- Recharts `LineChart` mit bis zu 3 überlagerten Linien
- Performance-Budget: Sonden-Berechnung darf nicht mehr als 2 ms pro Frame kosten
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
