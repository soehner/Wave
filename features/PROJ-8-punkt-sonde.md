# PROJ-8: Punkt-Sonde (z vs. t Zeitverlauf)

## Status: In Review
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

### Übersicht
Reine Frontend-Erweiterung — kein Backend, kein LocalStorage, keine neuen npm-Pakete nötig.
Zwei bestehende Bausteine werden wiederverwendet: `computeWaveZ()` aus `wave-math.ts` (identische Physik-Berechnung wie PROJ-4) und das `useCrossSection`-Datenpuffer-Muster.

---

### Komponentenstruktur (visueller Baum)

```
WaveVisualization (State-Koordinator)
+-- SourcePanel (links, unverändert)
+-- Canvas-Bereich (Mitte)
|   +-- Three.js Canvas (Klick → Sondenpunkt setzen via Raycaster)
|   +-- TopDownOverlay (unverändert, PROJ-7)
+-- [NEU] ProbePanel (unterhalb Canvas, erscheint wenn ≥1 Sonde aktiv)
|   +-- Sondenleiste (pro Sonde: Koordinaten + Farbindikator + X-Button)
|   +-- "Alle Sonden entfernen"-Button
|   +-- [NEU] ProbeChart (Recharts LineChart mit bis zu 3 Linien)
|       +-- X-Achse: Zeit t [s] (rollendes Fenster, letzte 5 Sekunden)
|       +-- Y-Achse: Auslenkung z [m]
|       +-- Je eine farbige Linie pro Sonde (Gelb / Cyan / Magenta)
+-- CrossSectionPanel (optional, unverändert; erscheint unter ProbePanel falls beides aktiv)
+-- ParameterPanel (rechts, unverändert)
+-- ControlBar (unten, unverändert)
```

---

### Datenmodell (Klartext)

```
Jede Sonde hat:
  id       Eindeutige Kennung (z. B. "probe-0")
  x        X-Koordinate im Wellenfeld in Metern (−5 bis +5)
  y        Y-Koordinate im Wellenfeld in Metern (−5 bis +5)
  color    Farbe: Gelb (1. Sonde) | Cyan (2.) | Magenta (3.)

Zeitverlaufspuffer (pro Sonde, nur im RAM):
  buffer   Ringpuffer mit den letzten ~300 Messpunkten
           Format: [{t: Zeitstempel in s, z: Auslenkung in m}, ...]
           Auflösung: ~30 Punkte/s → 5 Sekunden Verlauf sichtbar

Aktiver Zustand in WaveVisualization:
  probes   Liste von 0–3 Sonden-Objekten

Kein Backend. Kein LocalStorage. Alle Daten leben nur für die Dauer der Session.
```

---

### Wie der Raycaster funktioniert (ohne Technik-Jargon)

Wenn der Benutzer auf den Canvas klickt, wird ein unsichtbarer "Strahl" von der Kamera durch den Klick-Punkt in die 3D-Szene geschossen (wie ein Laserpointer). Wo dieser Strahl die Wellenoberfläche trifft, wird die XY-Position abgelesen — das ist die Sondenposition. Die Z-Auslenkung wird separat per Formel berechnet (kein GPU-Readback nötig).

**Klick vs. Drag-Unterscheidung:** OrbitControls und Klick teilen dasselbe Canvas. Ein kurzer Klick (Maus-Taste gedrückt und losgelassen ohne Bewegung, < 200 ms) setzt eine Sonde. Ein langer Drag (Rotation/Zoom) setzt keine Sonde.

---

### Änderungen je Datei

| Datei | Art | Beschreibung |
|-------|-----|--------------|
| `useWaveAnimation.ts` | Erweiterung | Neuer `onWaveClick`-Callback-Prop; Raycaster-Logik auf Canvas-Click-Event; unterscheidet Klick von Drag via Zeitstempel |
| `useProbeData.ts` | Neu | Hook verwaltet Zeitverlaufspuffer für bis zu 3 Sonden; rAF-Loop ~30 Hz (gleiche Strategie wie `useCrossSection`); ruft `computeWaveZ` pro Sonde und Frame auf |
| `ProbePanel.tsx` | Neu | Panel-Wrapper: Sondenleiste (Koordinaten, Farbe, X-Button), "Alle entfernen"-Button, bettet `ProbeChart` ein |
| `ProbeChart.tsx` | Neu | Recharts LineChart; X-Achse = t [s], Y-Achse = z [m]; bis zu 3 farbige Linien; kein Animations-Overhead (isAnimationActive=false) |
| `WaveVisualization.tsx` | Erweiterung | Neuer `probes`-State; `onWaveClick`-Handler setzt/ersetzt Sonden; rendert `ProbePanel` wenn Sonden aktiv; bei Neustart/Preset-Wechsel: Puffer leeren |

---

### Technische Entscheidungen (WARUM)

**1. `computeWaveZ()` statt GPU-Readback**
Die Wellenhöhe an einem Punkt per CPU-Formel zu berechnen ist deutlich einfacher als Pixel aus dem WebGL-Framebuffer zu lesen (GPU-Readback ist langsam, komplex und browserspezifisch). Die Funktion existiert bereits — sie wird identisch in PROJ-4 genutzt. Performance: 3 Sonden × 1 Berechnung pro Frame ≈ mikroskopischer Aufwand.

**2. Ringpuffer statt wachsendes Array**
300 Punkte pro Sonde (5 s × 60 Hz) sind eine feste, vorhersehbare Speichergröße. Ein Ringpuffer überschreibt automatisch älteste Werte und verhindert unbegrenztes Speicherwachstum — wichtig bei 5×-Zeitraffer (PROJ-6), der viele Punkte pro Sekunde erzeugt.

**3. Gleiches rAF-Muster wie `useCrossSection`**
Der `useCrossSection`-Hook ist bereits bewährt: ~30 FPS gedrosselt, Refs für Performance, React-State nur für Chart-Updates. Dasselbe Muster für `useProbeData` hält die Codebasis konsistent und vermeidet Neuerfindung.

**4. ProbePanel unterhalb des Canvas (nicht als Overlay)**
Ein Overlay über dem Canvas würde den Klick-Bereich einschränken. Als Panel unter dem Canvas ist es immer vollständig lesbar und stört die Interaktion nicht — analog zu `CrossSectionPanel`.

**5. Maximal 3 Sonden — vierter Klick ersetzt ältesten**
Mehr als 3 Linien im Diagramm werden schwer lesbar. Stilles Ersetzen (ohne Fehlermeldung) ist weniger frustrierend als ein Hinweistext, der nach jedem Klick erscheint. Das Verhalten ist in der Spezifikation als Option genannt.

**6. Klick-Drag-Unterscheidung via Zeitstempel**
OrbitControls und Klick teilen denselben Event-Listener. Ein Zeitstempel-Vergleich (`mousedown` → `mouseup` < 200 ms) ist einfach, zuverlässig und fügt kein separates Event-Handling-Framework hinzu.

---

### Abhängigkeiten / neue Pakete
Keine — alle benötigten Elemente sind bereits vorhanden:
- `computeWaveZ` in `src/lib/wave-math.ts` ✓
- Recharts via `src/components/ui/chart.tsx` ✓
- Three.js `Raycaster` ist Teil von Three.js (bereits installiert) ✓
- `src/components/ui/button.tsx`, `src/components/ui/badge.tsx` ✓

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
