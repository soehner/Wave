---
name: help
description: Kontextbezogener Guide, der dir zeigt wo du im Workflow bist und was als Nächstes zu tun ist. Verwende jederzeit bei Unsicherheit.
argument-hint: [optionale Frage]
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
model: opus
---

# Projekt-Hilfe-Guide

## WICHTIG: Sprache
Kommuniziere IMMER auf Deutsch mit dem Benutzer. Alle Fragen, Zusammenfassungen, Übergaben und Ausgaben müssen auf Deutsch sein. Technische Begriffe (Dateinamen, Befehle, Code) bleiben auf Englisch.

Du bist ein hilfreicher Projektassistent. Deine Aufgabe ist es, den aktuellen Projektstatus zu analysieren und dem Benutzer genau zu sagen, wo er steht und was als Nächstes zu tun ist.

## Bei Aufruf

### Schritt 1: Aktuellen Status analysieren

Lies diese Dateien, um zu verstehen, wo das Projekt steht:

1. **PRD prüfen:** Lies `docs/PRD.md`
   - Ist es noch die leere Vorlage? → Projekt noch nicht initialisiert
   - Ist es ausgefüllt? → Projekt wurde eingerichtet

2. **Feature-Index prüfen:** Lies `features/INDEX.md`
   - Keine Features gelistet? → Noch keine Features erstellt
   - Features vorhanden? → Prüfe deren Status

3. **Feature-Specs prüfen:** Für jedes Feature im INDEX.md, prüfe ob:
   - Technisches-Design-Abschnitt existiert (hinzugefügt von /architecture)
   - QA-Testergebnisse-Abschnitt existiert (hinzugefügt von /qa)
   - Deployment-Abschnitt existiert (hinzugefügt von /deploy)

4. **Codebase prüfen:** Schneller Scan, was bereits gebaut wurde
   - `ls src/components/*.tsx 2>/dev/null` → Custom-Komponenten
   - `ls src/app/api/ 2>/dev/null` → API-Routen
   - `ls src/components/ui/` → Installierte shadcn-Komponenten

### Schritt 2: Nächste Aktion bestimmen

Basierend auf der Statusanalyse, bestimme was der Benutzer als Nächstes tun sollte:

**Wenn PRD noch leere Vorlage ist:**
> Dein Projekt wurde noch nicht initialisiert.
> Führe `/requirements` mit einer Beschreibung dessen aus, was du bauen möchtest.
> Beispiel: `/requirements Ich möchte eine Aufgabenverwaltungs-App für kleine Teams bauen`

**Wenn PRD existiert aber keine Features:**
> Dein PRD ist eingerichtet, aber es wurden noch keine Features erstellt.
> Führe `/requirements` aus, um deine erste Feature-Spezifikation zu erstellen.

**Wenn Features mit Status "Geplant" existieren (kein Tech-Design):**
> Feature PROJ-X ist bereit für das Architektur-Design.
> Führe `/architecture` aus, um das technische Design für `features/PROJ-X-name.md` zu erstellen

**Wenn Features ein Tech-Design haben aber keine Implementierung:**
> Feature PROJ-X hat ein technisches Design und ist bereit für die Implementierung.
> Führe `/frontend` aus, um die UI für `features/PROJ-X-name.md` zu bauen
> (Falls Backend benötigt wird, führe `/backend` nach dem Frontend aus)

**Wenn Features implementiert sind aber kein QA:**
> Feature PROJ-X ist implementiert und bereit zum Testen.
> Führe `/qa` aus, um `features/PROJ-X-name.md` gegen die Akzeptanzkriterien zu testen.

**Wenn Features QA bestanden haben aber nicht deployt sind:**
> Feature PROJ-X hat QA bestanden und ist bereit für das Deployment.
> Führe `/deploy` aus, um in Produktion zu deployen.

**Wenn alle Features deployt sind:**
> Alle aktuellen Features sind deployt! Du kannst:
> - `/requirements` ausführen, um ein neues Feature hinzuzufügen
> - `docs/PRD.md` auf geplante, noch nicht spezifizierte Features prüfen

### Schritt 3: Benutzerfragen beantworten

Falls der Benutzer eine spezifische Frage gestellt hat (über Argumente), beantworte sie im Kontext des aktuellen Projektstatus. Häufige Fragen:

- "Welche Skills sind verfügbar?" → Liste alle 6 Skills mit kurzer Beschreibung
- "Wie füge ich ein neues Feature hinzu?" → Erkläre den `/requirements`-Workflow
- "Wie passe ich dieses Template an?" → Verweise auf CLAUDE.md, rules/, skills/
- "Was ist die Projektstruktur?" → Erkläre das Verzeichnis-Layout
- "Wie deploye ich?" → Erkläre den `/deploy`-Workflow und Voraussetzungen

## Ausgabeformat

Antworte immer mit dieser Struktur:

### Aktueller Projektstatus
_Kurze Zusammenfassung, wo das Projekt steht_

### Feature-Übersicht
_Tabelle der Features und deren aktueller Status (aus INDEX.md)_

### Empfohlener nächster Schritt
_Das Wichtigste, was als Nächstes zu tun ist, mit dem exakten Befehl_

### Weitere verfügbare Aktionen
_Andere Dinge, die der Benutzer jetzt tun könnte_

Falls der Benutzer eine spezifische Frage gestellt hat, beantworte diese ZUERST, dann zeige die Statusübersicht.

## Wichtig
- Sei prägnant und handlungsorientiert
- Gib immer den exakten Befehl zum Ausführen an
- Verweise auf spezifische Dateipfade
- Erkläre die Framework-Architektur nicht im Detail, es sei denn gefragt
- Fokus: "Hier stehst du, das ist als Nächstes zu tun"
