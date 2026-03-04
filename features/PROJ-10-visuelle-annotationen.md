# PROJ-10: Visuelle Annotationen

## Status: Geplant
**Erstellt:** 2026-03-04
**Zuletzt aktualisiert:** 2026-03-04

## Abhängigkeiten
- Benötigt: PROJ-1 (3D-Wellenvisualisierung) — Three.js-Szene für 3D-Annotationen
- Benötigt: PROJ-2 (Wellenparameter-Steuerung) — λ, φ für Berechnungen
- Empfohlen: PROJ-3 (Wellenquellen-Konfiguration) — Gangunterschied-Annotation benötigt 2+ Quellen
- Empfohlen: PROJ-7 (Top-Down-Ansicht) — Annotationen besonders hilfreich in Draufsicht

## User Stories
- Als Physiklehrkraft möchte ich die Wellenlänge λ als beschrifteten Doppelpfeil zwischen zwei benachbarten Wellenbergen einblenden, damit Schüler den abstrakten Parameter λ direkt im Wellenbild sehen.
- Als Lehrkraft möchte ich Knotenlinien (Orte destruktiver Interferenz) hervorheben, damit die Lage der Auslöschungszonen klar erkennbar ist.
- Als Lehrkraft möchte ich Wellenfront-Kreise (Isophasenlinien) einblenden, damit Schüler die kreisförmige Ausbreitung von einer Punktquelle verstehen.
- Als Lehrkraft möchte ich den Gangunterschied Δs zwischen zwei Quellen zu einem wählbaren Punkt visuell zeigen, damit die Bedingung für Maxima (Δs = m·λ) demonstriert werden kann.
- Als Benutzer möchte ich jede Annotation einzeln ein- und ausschalten, damit die Ansicht nicht überladen wird.

## Akzeptanzkriterien
- [ ] Ein "Annotationen"-Bereich (z. B. als Dropdown oder Panel-Abschnitt) bietet mindestens 4 unabhängige Toggle-Optionen
- [ ] **Toggle 1: Wellenlänge λ** — ein animierter Doppelpfeil wird eingeblendet, der den Abstand zwischen zwei benachbarten Wellenbergen entlang der X-Achse zeigt; beschriftet mit "λ = X.X m"
- [ ] **Toggle 2: Knotenlinien** — Bereiche nahe z ≈ 0 werden als weiße gestrichelte Linien oder transparente Overlay-Ebene hervorgehoben (nur bei ≥ 2 Quellen sinnvoll)
- [ ] **Toggle 3: Wellenfronten** — Konzentrische Kreise (Isophasenlinien) werden um jede Quelle gezeichnet; der Abstand zwischen den Kreisen entspricht λ; die Kreise bewegen sich mit der Animation (v = f·λ)
- [ ] **Toggle 4: Gangunterschied** — Bei ≥ 2 Quellen und gesetztem Sondenpunkt (PROJ-8) oder wählbarem Punkt: gestrichelte Linien von beiden Quellen zum Punkt zeigen die Weglängen r₁ und r₂; beschriftet mit "Δs = r₁ − r₂ = X.X m = X.X λ"
- [ ] Jede Annotation passt sich automatisch an geänderte Parameter an (λ-Pfeil folgt neuer Wellenlänge)
- [ ] Annotationen sind in beiden Modi sichtbar: 3D-Perspektive und Top-Down-2D (PROJ-7)
- [ ] Annotationen sind bei pausierter Animation statisch sichtbar (kein Verschwinden)
- [ ] Die Annotation-Labels verwenden die gleiche Farbkodierung wie das ParameterPanel (λ blau, φ grün)

## Grenzfälle
- **Knotenlinien bei Einzelquelle:** Toggle ist aktiv, aber kein Muster erscheint (Einzelquelle hat keine Knotenlinien); ein Hinweis "Knotenlinien nur bei ≥ 2 Quellen sichtbar" erscheint.
- **Gangunterschied ohne PROJ-8 (keine Sonde):** Ein Hinweis "Setze zuerst einen Sondenpunkt (Klick auf Wellenfeld)" wird angezeigt; der Toggle bleibt aktivierbar, zeigt aber nichts.
- **Sehr kurze Wellenlänge (λ < 0.5 m):** λ-Pfeil wird sehr klein; ein minimaler Pfeilabstand (10 px) verhindert Unlesbarkeit.
- **Wellenfronten bei Balkenquelle:** Statt Kreisen werden parallele Linien gezeichnet (korrekte Physik für ebene Wellen).
- **Alle 4 Annotationen gleichzeitig aktiv:** Mögliche visuelle Überladung; kein technisches Limit, aber UX-Hinweis "Tipp: Nicht alle gleichzeitig aktivieren" eingeblendet.

## Technische Anforderungen
- Three.js `Line` / `LineSegments` für 3D-Annotationslinien
- Canvas-Text-Sprites für Labels (gleiche Technik wie bestehende Achsenbeschriftungen)
- Wellenfronten als `EllipseCurve` (bereits für Kreis-Quellenmarker vorhanden)
- Performance-Budget: Annotationen dürfen nicht mehr als 1 ms pro Frame kosten
- Annotationszustand in React-State (Boolean-Flags); kein Einfluss auf Shader-Uniforms
- Browser-Support: Chrome, Firefox, Safari (Desktop)

---
<!-- Folgende Abschnitte werden von nachfolgenden Skills hinzugefügt -->

## Technisches Design (Solution Architect)
_Wird von /architecture hinzugefügt_

## QA-Testergebnisse
_Wird von /qa hinzugefügt_

## Deployment
_Wird von /deploy hinzugefügt_
