# Produktanforderungsdokument (PRD)

## Vision

WavePhysics ist eine interaktive Web-Applikation für den Physikunterricht, die Wellenausbreitung als echtzeit-animierte, perspektivische 3D-Darstellung im Browser visualisiert. Lehrkräfte und Schülerinnen und Schüler können alle Parameter der Wellengleichung live anpassen und die Auswirkungen sofort beobachten — ohne Installation, ohne Account, direkt im Browser.

## Zielbenutzer

**Primär: Physiklehrkräfte (Gymnasium, Sek II)**
- Bedürfnis: Anschauliche Demonstration von Wellenphänomenen am Whiteboard / Beamer
- Schmerzpunkt: Bestehende Tools sind zu komplex oder erfordern Installation

**Sekundär: Schülerinnen und Schüler (Gymnasium, Sek II)**
- Bedürfnis: Selbstständiges Experimentieren und Verständnis von Wellenparametern
- Schmerzpunkt: Abstrakte Formeln ohne visuellen Bezug schwer nachvollziehbar

## Kernfeatures (Roadmap)

| Priorität | Feature | Beschreibung | Status |
|-----------|---------|-------------|--------|
| P0 (MVP) | 3D-Wellenvisualisierung (PROJ-1) | Perspektivische 3D-Darstellung der Wellenausbreitung mit Three.js | Deployed |
| P0 (MVP) | Wellenparameter-Steuerung (PROJ-2) | Slider + Absolutwert-Eingabe für alle Parameter der Wellengleichung | Deployed |
| P1 | Wellenquellen-Konfiguration (PROJ-3) | Form, Anzahl und Abstand der Wellenquellen einstellbar | Deployed |
| P1 | Schnittebenen-Analyse (PROJ-4) | Schnittebene durch 3D-Ansicht + separates 2D-Diagramm | In Arbeit |
| P1 | Vorgefertigte Szenarien / Presets (PROJ-5) | Ein-Klick-Demos für Lehrkräfte (Doppelspalt, Stehende Welle, etc.) | Geplant |
| P1 | Zeitsteuerung (PROJ-6) | Zeitlupe/Zeitraffer (0.1×–5×), Einzelbild-Steuerung, Zeit t anzeigen | Geplant |
| P1 | Top-Down-2D-Ansicht (PROJ-7) | Umschaltbare Draufsicht als Farbkarte für Interferenzmuster | Geplant |
| P1 | Reflexion an losem und festem Ende (PROJ-15) | Reflexionswand mit Phasenumkehr (festes) und ohne (loses Ende) | Geplant |
| P2 | Visuelle Annotationen (PROJ-10) | Einblendbare λ-Pfeile, Knotenlinien, Wellenfront-Kreise, Gangunterschied | Geplant |
| P2 | Farbschema-Optionen (PROJ-12) | Regenbogen/Heatmap, Schwarz-Weiß, Höhenlinien-Overlay | Geplant |
| P2 | Screenshot & URL-Sharing (PROJ-11) | PNG-Export mit Parametern, Zustand als teilbarer URL-Link | Geplant |
| P2 | In-App Physik-Erklärungen (PROJ-13) | Info-Tooltips an Parametern, interaktive Formel, Lernmodus | Geplant |
| P3 | Punkt-Sonde / z vs. t (PROJ-8) | Klick auf Punkt zeigt Schwingungsverlauf z(x,y,t) als Zeitdiagramm | Geplant |
| P3 | Intensitätsschirm (PROJ-9) | Virtuelle Wand zeigt Intensitätsverteilung I(y) = A²(y) | Geplant |
| P3 | Vergleichsmodus (PROJ-14) | Split-Screen mit zwei Wellenfeldern und unterschiedlichen Parametern | Geplant |
| P3 | Mausgesteuerte Quellenhöhe (PROJ-16) | Vertikale Mausbewegung steuert die Z-Höhe der aktiven Quelle über der Wellenebene | Geplant |

## Erfolgskennzahlen

- Visualisierung läuft flüssig bei ≥ 30 FPS auf einem durchschnittlichen Schulrechner
- Parameteränderungen werden ohne wahrnehmbare Verzögerung (< 100 ms) sichtbar
- App ist ohne Einarbeitung für Lehrkräfte nutzbar (≤ 2 Minuten bis zur ersten Demonstration)
- Funktioniert auf Chrome, Firefox, Safari (Desktop) ohne Installation

## Einschränkungen

- Reine Frontend-Applikation (kein Backend, keine Benutzerdaten)
- Kein Login, keine Datenpersistenz (Einstellungen nicht speicherbar — vorerst)
- Browser-only: kein React Native / Mobile App
- Zielgerät: Desktop/Laptop im Schulumfeld (min. 1024 px Breite)

## Nicht-Ziele

- Keine Benutzerkonten oder Klassen-Management
- Keine Bewertungs- oder Aufgabenfunktionen
- Keine Simulation von elektromagnetischen Wellen (EM-Feld-Vektoren)
- Kein Mehrsprachigkeits-Support in der ersten Version
- Keine Mobile-First-Optimierung (Touchscreen / kleine Bildschirme)
