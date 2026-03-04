# PROJ-11: Screenshot & URL-Sharing

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — WebGL-Canvas für Screenshot
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — Parameter-Zustand serialisieren
- Benötigt: PROJ-3 (Wellenquellen-Konfiguration) — Quellenkonfig serialisieren

## User Stories
- Als Physiklehrkraft möchte ich den aktuellen Visualisierungszustand als PNG-Bild speichern, damit ich Momentaufnahmen in Präsentationen und Arbeitsblättern verwenden kann.
- Als Lehrkraft möchte ich einen Link zum aktuellen Zustand der App generieren, damit ich Schülern per Schulportal oder E-Mail eine fertig konfigurierte Demonstration schicken kann.
- Als Schülerin möchte ich den Link in der Browseradressleiste teilen, damit ich meiner Lehrkraft zeigen kann, welche Parameter ich eingestellt habe.
- Als Benutzer möchte ich beim Öffnen eines Links automatisch den gespeicherten Zustand laden, damit ich direkt mit der vorbereiteten Konfiguration starten kann.

## Akzeptanzkriterien

### Screenshot (PNG-Export)
- [ ] Ein "Screenshot"-Button (Kamera-Icon) ist in der ControlBar sichtbar
- [ ] Klick auf den Button lädt eine PNG-Datei herunter (Dateiname: `wavephysics-YYYY-MM-DD-HH-MM.png`)
- [ ] Das PNG enthält das gesamte Canvas (3D-Ansicht inkl. Wellenfeld, Achsen, Quellenmarker)
- [ ] Optional: Ein Parameteroverlay (Textbox) in der Bildecke zeigt die aktuellen Werte (A, f, λ, φ, d, Quellentyp)
- [ ] Der Screenshot funktioniert bei laufender und pausierter Animation
- [ ] Der Download funktioniert in Chrome, Firefox und Safari ohne Plugin

### URL-Sharing
- [ ] Ein "Link teilen"-Button (Link-Icon) ist neben dem Screenshot-Button sichtbar
- [ ] Klick auf den Button aktualisiert die Browser-URL mit allen aktuellen Parametern als Query-String
- [ ] Der Query-String enthält alle Parameter: Amplitude, Frequenz, Wellenlänge, Phase, Dämpfung pro Quelle sowie Quellentyp, Anzahl, Abstand
- [ ] Gleichzeitig wird der Link in die Zwischenablage kopiert; eine kurze Bestätigungsmeldung "Link kopiert!" erscheint (2 Sekunden, dann verschwindet sie)
- [ ] Beim Öffnen der App mit einem vollständigen Query-String werden alle Parameter automatisch aus dem URL geladen
- [ ] Bei einem teilweise gültigen URL (einzelne Parameter fehlen oder sind ungültig) werden die fehlenden Parameter auf Standardwerte gesetzt; keine Fehlermeldung
- [ ] Die URL bleibt unter 2000 Zeichen (Browser-Kompatibilität mit IE/Edge-Legacy)

## Grenzfälle
- **WebGL `preserveDrawingBuffer`:** Muss auf `true` gesetzt werden, sonst ist der Canvas nach dem Render geleert und der Screenshot ist schwarz. Möglicher Performance-Hinweis beachten.
- **URL mit korrupten Werten (z. B. `?amplitude=abc`):** Wert wird ignoriert, Standard wird verwendet; kein Crash.
- **URL mit Werten außerhalb des erlaubten Bereichs (z. B. `?frequency=999`):** Wert wird auf `max` geclampt.
- **Clipboard-API nicht verfügbar (HTTP statt HTTPS):** Fallback: Der Link wird in einem Textfeld angezeigt, das der Benutzer manuell kopieren kann.
- **Sehr viele Quellen (8 Quellen × 5 Parameter = 40 Werte):** URL bleibt unter 2000 Zeichen (40 × ~20 Zeichen = ~800 Zeichen).
- **Benutzer teilt Link, Empfänger öffnet auf Mobilgerät:** Die bestehende Viewport-Warnung greift; App funktioniert, aber Layout ist nicht optimiert.
- **Screenshot während Zeitlupe (PROJ-6):** PNG zeigt den exakten Frame zum Zeitpunkt des Klicks.

## Technische Anforderungen
- `canvas.toDataURL('image/png')` für Screenshot — erfordert `preserveDrawingBuffer: true` im WebGLRenderer
- `URL API` / `URLSearchParams` für Query-String-Serialisierung und -Deserialisierung
- `navigator.clipboard.writeText()` für Clipboard-Zugriff (mit Fallback auf `document.execCommand('copy')`)
- Keine Backend-Kommunikation, keine Datenpersistenz — rein clientseitig
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
