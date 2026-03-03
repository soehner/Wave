# Allgemeine Projektregeln

## Sprache
- Kommuniziere IMMER auf Deutsch mit dem Benutzer
- Technische Begriffe (Dateinamen, Befehle, Code) bleiben auf Englisch

## Feature-Tracking
- Alle Features werden in `features/INDEX.md` verfolgt - lies es vor Beginn jeder Arbeit
- Feature-Specs befinden sich unter `features/PROJ-X-feature-name.md`
- Feature-IDs sind sequenziell: prüfe INDEX.md für die nächste verfügbare Nummer
- Ein Feature pro Spec-Datei (Single Responsibility)
- Niemals mehrere unabhängige Funktionalitäten in einer Spec kombinieren

## Git-Konventionen
- Commit-Format: `type(PROJ-X): Beschreibung`
- Types: feat, fix, refactor, test, docs, deploy, chore
- Bestehende Features vor Neuerstellung prüfen: `ls features/ | grep PROJ-`
- Bestehende Komponenten vor dem Bauen prüfen: `git ls-files src/components/`
- Bestehende APIs vor dem Bauen prüfen: `git ls-files src/app/api/`

## Mensch-im-Loop
- Immer Benutzerfreigabe einholen, bevor Ergebnisse finalisiert werden
- Optionen mit klaren Auswahlmöglichkeiten statt offener Fragen präsentieren
- Niemals zur nächsten Workflow-Phase weitergehen ohne Benutzerbestätigung

## Statusaktualisierungen
- `features/INDEX.md` aktualisieren, wenn sich der Feature-Status ändert
- Das Status-Feld im Feature-Spec-Header aktualisieren
- Gültige Status: Geplant, In Arbeit, In Review, Deployed

## Dateihandhabung
- IMMER eine Datei lesen, bevor sie geändert wird - nie Inhalte aus dem Gedächtnis annehmen
- Nach Kontextkomprimierung Dateien erneut lesen, bevor die Arbeit fortgesetzt wird
- Bei Unsicherheit über den aktuellen Projektstatus zuerst `features/INDEX.md` lesen
- `git diff` ausführen, um zu verifizieren, was in dieser Sitzung bereits geändert wurde
- Nie Import-Pfade, Komponentennamen oder API-Routen raten - durch Lesen verifizieren

## Übergaben zwischen Skills
- Nach Abschluss eines Skills den nächsten Skill dem Benutzer vorschlagen
- Format: "Nächster Schritt: Führe `/skillname` aus, um [Aktion]"
- Übergaben werden immer vom Benutzer initiiert, nie automatisch
