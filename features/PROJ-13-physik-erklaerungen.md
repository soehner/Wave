# PROJ-13: In-App Physik-Erklärungen

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Erklärungen an Parameter-Controls
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Erklärungen an Quellenformen

## User Stories
- Als Physiklehrkraft möchte ich durch Klick auf ein Info-Icon neben jedem Parameter eine physikalische Erklärung lesen, damit ich bei Bedarf den Unterricht direkt in der App ergänzen kann.
- Als Schülerin möchte ich verstehen, was Dämpfung bedeutet, ohne die App verlassen zu müssen, damit ich selbstständig experimentieren und lernen kann.
- Als Lehrkraft möchte ich einen "Lernmodus" aktivieren, bei dem beim Ändern eines Parameters eine kurze Erklärung des Effekts eingeblendet wird, damit neue Schülergruppen geführt einsteigen können.
- Als Schülerin möchte ich die Wellengleichung im Header interaktiv erkunden: Wenn ich auf "A" in der Formel klicke, wird der Amplitude-Slider hervorgehoben, damit ich Formel und Steuerung verbinde.
- Als Benutzer möchte ich die Erklärungen ausblenden können, damit die Ansicht im fortgeschrittenen Gebrauch nicht überladen ist.

## Akzeptanzkriterien

### Info-Tooltips
- [ ] Neben jedem Parameter-Label (A, f, λ, φ, d) erscheint ein kleines Info-Icon (ⓘ)
- [ ] Hover (Desktop) oder Klick auf das Icon öffnet einen Tooltip mit:
  - Physikalische Bedeutung des Parameters (2–3 Sätze)
  - Formelzeichen und Einheit
  - Beispiel: "Erhöhe A → Wellenberge werden höher"
- [ ] Tooltips sind maximal 200 Zeichen lang (keine Bleiwüsten)
- [ ] Tooltips erscheinen rechts vom Icon und überlagern nicht den Canvas
- [ ] Gleiches Info-Icon und Tooltip existieren bei den Quellentypen (Punkt, Kreis, Balken, Dreieck)

### Interaktive Formel im Header
- [ ] In der Formeldarstellung z = A · sin(k·r − ω·t + φ) sind die Symbole A, k, ω, φ klickbar
- [ ] Klick auf ein Symbol hebt den zugehörigen Slider im ParameterPanel kurz hervor (Pulse-Animation, 1 Sekunde)
- [ ] Hover über ein Symbol zeigt dessen aktuellen Wert als Tooltip

### Lernmodus (optional, per Toggle aktivierbar)
- [ ] Ein Toggle "Lernmodus" ist in der ControlBar oder einem Info-Bereich verfügbar
- [ ] Im Lernmodus erscheint beim Bewegen eines Sliders eine kurze Erklärung des Effekts als Toast-Nachricht (z. B. "Größere Amplitude → mehr Energie, höhere Wellenberge")
- [ ] Im Lernmodus werden Quellentypen mit einem illustrativen Icon und kurzem Text beschriftet
- [ ] Lernmodus-Toasts verschwinden nach 3 Sekunden automatisch
- [ ] Lernmodus-Status wird im URL-State (PROJ-11) gespeichert

## Grenzfälle
- **Mehrere Tooltips gleichzeitig offen:** Nur ein Tooltip gleichzeitig; neuer Klick schließt vorherigen.
- **Lernmodus aktiv, Benutzer zieht Slider sehr schnell:** Toasts werden gedrosselt (maximal 1 Toast alle 500 ms), um Überschwemmung zu vermeiden.
- **Formel-Symbol geklickt, ParameterPanel eingeklappt:** Panel öffnet sich automatisch, dann Highlight-Animation.
- **Tooltip-Text zu lang für Bildschirm (< 1280 px):** Tooltip bricht um und bleibt innerhalb des Viewports (kein Overflow).
- **Lernmodus + Preset-Wechsel (PROJ-5):** Beim Preset-Laden kein Toast ("Szenario geladen: Doppelspalt-Interferenz" statt Einzel-Parameter-Meldungen).

## Inhaltliche Anforderungen (Physik-Texte)

| Parameter | Erklärungstext |
|-----------|---------------|
| Amplitude A | "Die Amplitude gibt die maximale Auslenkung einer Welle an. Eine größere Amplitude bedeutet mehr Energie und höhere Wellenberge. Einheit: Meter (m)" |
| Frequenz f | "Die Frequenz gibt an, wie viele Schwingungen pro Sekunde stattfinden. Höhere Frequenz → kürzere Periode, schnellere Schwingung. Einheit: Hertz (Hz)" |
| Wellenlänge λ | "Die Wellenlänge ist der räumliche Abstand zwischen zwei benachbarten Wellenbergen. Zusammen mit der Frequenz bestimmt sie die Wellengeschwindigkeit: v = f · λ. Einheit: Meter (m)" |
| Phase φ | "Die Anfangsphase gibt den Startzustand der Schwingung zum Zeitpunkt t = 0 an. Ein Phasenversatz von 180° zwischen zwei Quellen führt zu destruktiver Interferenz. Einheit: Grad (°)" |
| Dämpfung d | "Die Dämpfung beschreibt den exponentiellen Amplitudenabfall mit zunehmender Entfernung von der Quelle. Modelliert Energieverlust durch Reibung oder Absorption. Einheit: 1/m" |

## Technische Anforderungen
- shadcn/ui `Tooltip` für Info-Tooltips (bereits installiert)
- shadcn/ui `Toast` / `Sonner` für Lernmodus-Meldungen
- Kein separater Backend-Call; alle Texte sind statisch im Frontend
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
