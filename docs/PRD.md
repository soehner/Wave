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
| P0 (MVP) | 3D-Wellenvisualisierung | Perspektivische 3D-Darstellung der Wellenausbreitung mit Three.js | Geplant |
| P0 (MVP) | Wellenparameter-Steuerung | Slider + Absolutwert-Eingabe für alle Parameter der Wellengleichung | Geplant |
| P1 | Wellenquellen-Konfiguration | Form, Anzahl und Abstand der Wellenquellen einstellbar | Geplant |
| P1 | Schnittebenen-Analyse | Schnittebene durch 3D-Ansicht + separates 2D-Diagramm | Geplant |

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
