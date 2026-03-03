# Feature-Index

## Übersicht

| ID | Feature | Status | Erstellt |
|----|---------|--------|----------|
| PROJ-1 | 3D-Wellenvisualisierung (Core Rendering Engine) | Deployed | 2026-03-03 |
| PROJ-2 | Wellenparameter-Steuerung | Deployed | 2026-03-03 |
| PROJ-3 | Wellenquellen-Konfiguration | In Arbeit | 2026-03-03 |
| PROJ-4 | Schnittebenen-Analyse | Geplant | 2026-03-03 |

## Nächste verfügbare ID: PROJ-5

## Empfohlene Implementierungsreihenfolge
1. **PROJ-1** — Core Rendering Engine (Fundament, alle anderen hängen davon ab)
2. **PROJ-2** — Wellenparameter-Steuerung (macht die App interaktiv)
3. **PROJ-3** — Wellenquellen-Konfiguration (erweitert die Physik-Didaktik)
4. **PROJ-4** — Schnittebenen-Analyse (ergänzende Analysefunktion)

## Abhängigkeitsgraph
```
PROJ-1 (Core)
  └── PROJ-2 (Parameter)
        └── PROJ-3 (Quellen)
        └── PROJ-4 (Schnittebene)
```

## Status-Legende
- **Geplant** - Spezifikation erstellt, wartet auf Architektur
- **In Arbeit** - Architektur/Implementierung läuft
- **In Review** - QA-Tests laufen
- **Deployed** - In Produktion live
