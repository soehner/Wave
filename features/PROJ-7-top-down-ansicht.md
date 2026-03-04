# PROJ-7: Top-Down-2D-Ansicht (Draufsicht als Farbkarte)

## Status: In Review
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

### Übersicht
Reine Frontend-Erweiterung — kein Backend, kein LocalStorage, kein neues npm-Paket nötig.
Der Kern-Trick: Die **gleiche Three.js-Szene** läuft weiter. Nur die Kamera wird ausgetauscht (PerspectiveCamera → OrthographicCamera) und OrbitControls wird auf "nur Zoom" eingeschränkt. Kein Shader-Umbau, keine neue Geometrie.

---

### Komponentenstruktur (visueller Baum)

```
WaveVisualization (State-Koordinator)
+-- SourcePanel (links, unverändert)
+-- Canvas-Bereich (Mitte)
|   +-- Three.js Canvas (dieselbe Szene, nur Kamera wechselt)
|   +-- [NEU] TopDownOverlay (absolut positioniertes CSS-Overlay, nur im 2D-Modus)
|       +-- "X" Beschriftung (rechter Rand)
|       +-- "Y" Beschriftung (oberer Rand)
|       +-- "−5 m … +5 m" Grenzmarkierungen (alle vier Seiten)
+-- CrossSectionPanel (optional, bleibt aktiv; 3D-Schnittebene im Canvas ausgeblendet)
+-- ParameterPanel (rechts, unverändert)
+-- ControlBar (unten)
    +-- [bestehend] Play/Pause, Neu starten, Kamera, Presets, Schnittebene, Zeitsteuerung
    +-- [NEU] "3D / 2D" Toggle-Button (mit Layers-Icon)
```

---

### Datenmodell (Klartext)

```
Neuer Zustand in WaveVisualization:
  is2DView    boolean — false = 3D-Perspektive (Standard), true = 2D-Draufsicht

Neue interne Referenzen in useWaveAnimation (keine React-Renders):
  orthoCameraRef          Orthografische Kamera — einmalig beim Setup erstellt,
                          bleibt inaktiv bis zum ersten 2D-Wechsel
  saved3DPositionRef      Gespeicherte Kameraposition (Vector3) beim Wechsel in 2D,
                          wird beim Zurückwechseln nach 3D wiederhergestellt
  saved3DTargetRef        Gespeichertes Kameraziel (Vector3), ebenfalls gespeichert

Kein Backend. Kein LocalStorage.
```

---

### Wie der Kamerawechsel funktioniert (ohne Technik-Jargon)

Stell dir vor, die 3D-Szene ist ein Aquarium. Die **Perspektivkamera** schaut von schräg oben hinein und zeigt Tiefenwirkung (Objekte in der Ferne kleiner). Die **orthografische Kamera** hängt senkrecht über dem Aquarium und zeigt alles gleich groß — wie ein Grundriss.

Beim Wechsel zu 2D:
1. Aktuelle 3D-Kameraposition wird gespeichert.
2. Die orthografische Kamera wird direkt über dem Mittelpunkt positioniert und schaut senkrecht nach unten.
3. Die Wellenfarbgebung (Blau-Weiß-Rot) funktioniert identisch — der Shader zeichnet weiterhin nach Wellenhöhe ein.
4. Die 3D-Schnittebene (halbtransparente Fläche von PROJ-4) wird ausgeblendet — sie wäre in Draufsicht verwirrend.
5. Quell-Marker (Punkte, Ringe, Linien) bleiben sichtbar.
6. OrbitControls-Drehen wird gesperrt; nur Mausrad-Zoom bleibt aktiv.
7. Ein CSS-Overlay erscheint mit Achsenbeschriftungen.

Beim Zurückwechseln zu 3D: alle Schritte rückgängig, gespeicherte Position wiederhergestellt.

---

### Änderungen je Datei

| Datei | Art | Beschreibung |
|-------|-----|--------------|
| `useWaveAnimation.ts` | Erweiterung | Neuer `viewMode`-Prop (`"3d"` / `"2d"`); OrthoCam einmalig beim Setup erstellt; `useEffect` reagiert auf Moduswechsel: tauscht aktive Kamera, sperrt OrbitControls-Rotation, blendet Z-Achse und Schnittebene aus/ein |
| `TopDownOverlay.tsx` | Neu | Absolut positioniertes CSS-Div über dem Canvas; zeigt X/Y-Beschriftungen und ±5-m-Grenzen; nur sichtbar wenn `is2DView === true` |
| `WaveVisualization.tsx` | Erweiterung | Neuer `is2DView`-State; rendert `TopDownOverlay` über Canvas; leitet State an Hook und ControlBar weiter |
| `ControlBar.tsx` | Erweiterung | Neue Props `is2DView`, `onToggleViewMode`; neuer Toggle-Button "3D / 2D" mit Layers-Icon |

---

### Technische Entscheidungen (WARUM)

**1. Gleiche Three.js-Szene — nur Kameratausch**
Die gesamte Geometrie, der Shader und alle Quell-Marker müssen nicht neu aufgebaut werden. Das verhindert jedes Flackern und erfüllt das < 200 ms-Ziel der Spezifikation. Es gibt auch keine FPS-Einbrüche, weil die GPU-Last unverändert bleibt.

**2. OrthographicCamera statt Kameraposition-Hack**
Eine orthografische Kamera projiziert ohne Tiefenverzerrung — Objekte erscheinen in der richtigen Größe unabhängig von ihrer Entfernung. Das ist pädagogisch korrekt für eine Farbkarten-Ansicht: Interferenzmuster sollen nicht perspektivisch verzerrt sein.

**3. CSS-Overlay statt Three.js-Sprites für 2D-Labels**
Die bestehenden Achsenbeschriftungen (X, Y, Z) sind bereits als Three.js-Sprites in der Szene. Für die 2D-Rand-Beschriftungen ist ein CSS-Overlay einfacher zu positionieren, responsiver und braucht keine GPU-Sprites für Text. Es wird einfach über den Canvas gelegt und ist damit unabhängig von der Kamera.

**4. Schnittebene ausblenden (nicht deaktivieren) im 2D-Modus**
Das `CrossSectionPanel` (2D-Diagramm unter dem Canvas) bleibt aktiv und synchron — das ist pädagogisch wertvoll. Nur die halbtransparente 3D-Schnittebene im Canvas wird ausgeblendet, weil sie in Draufsicht senkrecht zur Sichtlinie wäre und nichts zeigen würde.

**5. 3D-Kameraposition speichern, nicht zurücksetzen**
Würde der Wechsel zu 2D die 3D-Kamera auf den Standardwert zurücksetzen, wäre das für Lehrkräfte frustrierend (manuell gewählter Blickwinkel verloren). Das explizite Speichern und Wiederherstellen entspricht dem Grenzfall in der Spezifikation.

---

### Abhängigkeiten / neue Pakete
Keine — alle benötigten Elemente sind bereits vorhanden:
- `src/components/ui/button.tsx` ✓
- `src/components/ui/tooltip.tsx` ✓
- Lucide-Icon `Layers` ist in `lucide-react` enthalten ✓

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
