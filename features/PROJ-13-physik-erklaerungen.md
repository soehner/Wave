# PROJ-13: In-App Physik-Erklärungen

## Status: In Review
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

### Überblick
Rein clientseitiges Feature — kein Backend, keine Datenbank. Alle Physik-Texte sind statisch im Code hinterlegt. Das Feature erweitert drei bestehende Komponenten und fügt einen neuen Hook sowie eine Datenkonstanten-Datei hinzu.

### Komponentenstruktur

```
Bestehende Komponenten (erweitert):
+-- ParameterControl.tsx          ← ⓘ-Icon neben jedem Parameter-Label
|   +-- PhysicsInfoIcon           ← neue Hilfskomponente (intern)
|       +-- shadcn Tooltip        ← bereits installiert
+-- FormulaDisplay.tsx            ← Formel-Symbole werden klickbar
|   +-- Klickbare Symbole (A, k, ω, φ, d)
|       +-- shadcn Tooltip        ← zeigt aktuellen Wert + Erklärung
+-- ControlBar.tsx                ← neuer "Lernmodus"-Toggle
+-- SourcePanel.tsx               ← ⓘ-Icon bei Quellentypen (im Lernmodus)

Neue Dateien:
+-- src/lib/physics-explanations.ts   ← statische Texte (keine Logik)
+-- src/hooks/useLearnMode.ts         ← Toggle-Zustand + Toast-Drosselung
```

### Datenmodell

**Physik-Erklärungen** (statisch, kein Server):
```
Für jeden Parameter (A, f, λ, φ, d):
  - Kurztext für Tooltip (max. 200 Zeichen)
  - Formelzeichen + Einheit
  - Beispieltext ("Erhöhe A → ...")

Für jeden Quellentyp (Punkt, Kreis, Balken, Dreieck):
  - Kurzbeschreibung

Für Lernmodus-Toasts:
  - Effekt-Text pro Parameter beim Slider-Bewegen
  - Wird beim Preset-Wechsel unterdrückt
```

**Lernmodus-Zustand** (im Hook, React State):
```
isLearnMode: boolean          ← Toggle an/aus
lastToastTime: number         ← Timestamp für 500ms-Drosselung
activeTooltip: string | null  ← Welcher Tooltip gerade offen ist
```

### Technische Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Statische Texte in TypeScript-Datei | Kein CMS nötig, einfach wartbar, typsicher |
| shadcn `Tooltip` (bereits installiert) | Konsistent mit bestehendem `ParameterControl`, kein neues Paket |
| shadcn `Sonner` (neu installieren) | Standard für Toast-Nachrichten in Next.js + shadcn-Stack |
| Kein globaler State (nur Hook) | Lernmodus ist Session-lokal, kein Persistenzbedarf (PROJ-11 noch nicht vorhanden) |
| Pulse-Animation via Tailwind | Keine externe Animationsbibliothek nötig (`animate-pulse` reicht) |
| Tooltip: max. 1 gleichzeitig | Vereinfacht UX, shadcn schließt automatisch bei Klick woanders |

### Abhängigkeiten (zu installieren)

| Paket | Zweck |
|---|---|
| `sonner` (via `npx shadcn@latest add sonner`) | Toast-Meldungen im Lernmodus |

### Änderungen an bestehenden Dateien

| Datei | Art der Änderung |
|---|---|
| `ParameterControl.tsx` | ⓘ-Icon neben Label; Prop `onSliderChange` Callback für Lernmodus-Toast |
| `FormulaDisplay.tsx` | Symbole werden mit `onClick` und Tooltip versehen; neues Prop `onSymbolClick` |
| `ControlBar.tsx` | Neuer "Lernmodus" Toggle-Button mit Switch-Icon |
| `ParameterPanel.tsx` | Nimmt `highlightedParam` entgegen, setzt kurze Pulse-Klasse |
| `SourcePanel.tsx` | Im Lernmodus ⓘ-Icon + Text bei Quellentyp-Buttons |
| `src/app/page.tsx` | `useLearnMode`-Hook einbinden, Props weitergeben |

### Neue Dateien

| Datei | Inhalt |
|---|---|
| `src/lib/physics-explanations.ts` | Alle statischen Erklärungstexte (Objekt/Map) |
| `src/hooks/useLearnMode.ts` | Toggle-State, Toast-Drosselung, Highlight-Logik |

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
