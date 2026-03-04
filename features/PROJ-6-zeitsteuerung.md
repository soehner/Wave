# PROJ-6: Zeitsteuerung (Zeitlupe / Zeitraffer)

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Animation und timeRef

## User Stories
- Als Physiklehrkraft möchte ich die Animation in Zeitlupe abspielen, damit ich schnelle Wellenbewegungen im Detail erklären kann.
- Als Schülerin möchte ich die Animationsgeschwindigkeit selbst einstellen, damit ich den Zusammenhang zwischen t und Wellenbild in meinem eigenen Tempo erkunden kann.
- Als Lehrkraft möchte ich die aktuelle Zeit t angezeigt bekommen, damit ich Schülern zeigen kann, wie die Formel z(x,y,t) mit dem sichtbaren Wellenbild zusammenhängt.
- Als Lehrkraft möchte ich die Animation Bild für Bild vorwärts oder rückwärts schalten, damit ich exakte Momentaufnahmen für die Diskussion einfrieren kann.
- Als Benutzer möchte ich die Geschwindigkeit auf einen Standardwert (1×) zurücksetzen, damit ich schnell zur normalen Darstellung zurückkehren kann.

## Akzeptanzkriterien
- [ ] Ein Geschwindigkeitsregler (Slider oder Stufenschalter) ist in der ControlBar sichtbar
- [ ] Der Regler erlaubt mindestens die Stufen: 0.1×, 0.25×, 0.5×, 1× (Standard), 2×, 5×
- [ ] Die aktuelle Animationsgeschwindigkeit wird als Text neben dem Regler angezeigt (z. B. "0.5×")
- [ ] Die aktuelle simulierte Zeit t wird in der ControlBar in Sekunden angezeigt (z. B. "t = 2.34 s")
- [ ] Die Zeit-Anzeige aktualisiert sich in Echtzeit während der Animation
- [ ] Zwei Buttons "⏮ Einzelbild zurück" und "⏭ Einzelbild vor" sind bei pausierter Animation aktiv
- [ ] Ein Einzelbild-Schritt entspricht Δt = 1/60 s (ein Frame bei 60 FPS)
- [ ] Einzelbild-Buttons sind bei laufender Animation deaktiviert (grayed out)
- [ ] Ein Doppelklick auf den Geschwindigkeitsregler setzt ihn auf 1× zurück
- [ ] Geschwindigkeitsänderungen wirken sich sofort (< 50 ms) auf die Animation aus
- [ ] Bei Geschwindigkeit 0.1× sind immer noch ≥ 30 FPS Rendering gewährleistet (nur langsamere Zeitakkumulation, nicht niedrigere FPS)
- [ ] Die Zeit t wird beim Neustart-Button auf 0 zurückgesetzt

## Grenzfälle
- **Geschwindigkeit auf 0×:** Nicht erlaubt (entspricht Pause); der Regler hat als Minimum 0.1×.
- **Sehr hohe Geschwindigkeit (5×) bei hoher Frequenz:** Aliasing-Artefakte können auftreten; ein Tooltip warnt: "Bei hoher Geschwindigkeit + hoher Frequenz kann die Visualisierung unscharf wirken."
- **Einzelbild-Button während Play:** Buttons sind inaktiv; Klick hat keinen Effekt und gibt kein Feedback.
- **Zeit t läuft sehr lange (> 1000 s):** Darstellung bleibt stabil (kein Float-Overflow); Zähler zeigt bis zu 9999.99 s, danach Überlauf auf 0 mit optionalem Hinweis.
- **Geschwindigkeit ändern während pausiert:** Zeit steht still, aber die neue Geschwindigkeit greift sofort beim nächsten Play.
- **Preset geladen während Zeitlupe aktiv:** Geschwindigkeit bleibt erhalten; nur Parameter und Zeit werden zurückgesetzt.

## Technische Anforderungen
- Die Zeitakkumulation in `useWaveAnimation` wird mit einem `speedMultiplier`-Faktor gesteuert: `timeRef.current += deltaTime * speedMultiplier`
- Kein Neuaufbau der Three.js-Szene bei Geschwindigkeitsänderung
- Performance-Ziel: ≥ 30 FPS bei allen Geschwindigkeitsstufen
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
