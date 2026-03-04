# Feature-Index

## Übersicht

| ID | Feature | Status | Erstellt |
|----|---------|--------|----------|
| PROJ-1 | 3D-Wellenvisualisierung (Core Rendering Engine) | Deployed | 2026-03-03 |
| PROJ-2 | Wellenparameter-Steuerung | Deployed | 2026-03-03 |
| PROJ-3 | Wellenquellen-Konfiguration | Deployed | 2026-03-03 |
| PROJ-4 | Schnittebenen-Analyse | Deployed | 2026-03-03 |
| PROJ-5 | Vorgefertigte Szenarien / Presets | Deployed | 2026-03-04 |
| PROJ-6 | Zeitsteuerung (Zeitlupe / Zeitraffer) | In Arbeit | 2026-03-04 |
| PROJ-7 | Top-Down-2D-Ansicht (Draufsicht) | In Review | 2026-03-04 |
| PROJ-8 | Punkt-Sonde (z vs. t Zeitverlauf) | In Review | 2026-03-04 |
| PROJ-9 | Intensitätsschirm | In Review | 2026-03-04 |
| PROJ-10 | Visuelle Annotationen | In Review | 2026-03-04 |
| PROJ-11 | Screenshot & URL-Sharing | Geplant | 2026-03-04 |
| PROJ-12 | Farbschema-Optionen | Geplant | 2026-03-04 |
| PROJ-13 | In-App Physik-Erklärungen | In Review | 2026-03-04 |
| PROJ-14 | Vergleichsmodus (Split-Screen) | Geplant | 2026-03-04 |
| PROJ-15 | Reflexion an losem und festem Ende | Geplant | 2026-03-04 |

## Nächste verfügbare ID: PROJ-16

## Empfohlene Implementierungsreihenfolge
1. **PROJ-1** — Core Rendering Engine (Fundament, alle anderen hängen davon ab)
2. **PROJ-2** — Wellenparameter-Steuerung (macht die App interaktiv)
3. **PROJ-3** — Wellenquellen-Konfiguration (erweitert die Physik-Didaktik)
4. **PROJ-4** — Schnittebenen-Analyse (ergänzende Analysefunktion)
5. **PROJ-5** — Presets (sofortiger Unterrichtseinsatz)
6. **PROJ-6** — Zeitsteuerung (Zeitlupe für Demonstrationen)
7. **PROJ-7** — Top-Down-Ansicht (Interferenzmuster-Analyse)
8. **PROJ-15** — Reflexion (neues Wellenphänomen)
9. **PROJ-10** — Visuelle Annotationen (didaktische Hilfslinien)
10. **PROJ-12** — Farbschema-Optionen (Beamer-Kompatibilität)
11. **PROJ-11** — Screenshot & URL-Sharing (Unterrichts-Integration)
12. **PROJ-13** — In-App Physik-Erklärungen (Lernmodus)
13. **PROJ-8** — Punkt-Sonde (z vs. t)
14. **PROJ-9** — Intensitätsschirm (Doppelspalt-Analyse)
15. **PROJ-14** — Vergleichsmodus (Split-Screen, größter Aufwand)

## Abhängigkeitsgraph
```
PROJ-1 (Core)
  └── PROJ-2 (Parameter)
        └── PROJ-3 (Quellen)
        │     └── PROJ-5 (Presets)
        │     └── PROJ-15 (Reflexion)
        │     └── PROJ-9 (Intensitätsschirm)
        │     └── PROJ-14 (Vergleichsmodus)
        └── PROJ-4 (Schnittebene)
        └── PROJ-6 (Zeitsteuerung)
        └── PROJ-7 (Top-Down-Ansicht)
              └── PROJ-8 (Punkt-Sonde)
              └── PROJ-10 (Annotationen)
        └── PROJ-11 (Screenshot & URL-Sharing)
        └── PROJ-12 (Farbschema)
        └── PROJ-13 (Physik-Erklärungen)
```

## Status-Legende
- **Geplant** - Spezifikation erstellt, wartet auf Architektur
- **In Arbeit** - Architektur/Implementierung läuft
- **In Review** - QA-Tests laufen
- **Deployed** - In Produktion live
