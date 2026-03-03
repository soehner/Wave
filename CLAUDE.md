# AI Coding Starter Kit

> Ein Next.js-Template mit KI-gestütztem Entwicklungs-Workflow über spezialisierte Skills für Anforderungen, Architektur, Frontend, Backend, QA und Deployment.

## WICHTIG: Sprache
Kommuniziere IMMER auf Deutsch mit dem Benutzer. Alle Fragen, Zusammenfassungen, Übergaben und Ausgaben müssen auf Deutsch sein. Technische Begriffe (Dateinamen, Befehle, Code) bleiben auf Englisch.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Copy-Paste-Komponenten)
- **Backend:** Supabase (PostgreSQL + Auth + Storage) - optional
- **Deployment:** Vercel
- **Validierung:** Zod + react-hook-form
- **State:** React useState / Context API

## Projektstruktur

```
src/
  app/              Seiten (Next.js App Router)
  components/
    ui/             shadcn/ui-Komponenten (NIEMALS nachbauen)
  hooks/            Custom React Hooks
  lib/              Hilfsfunktionen (supabase.ts, utils.ts)
features/           Feature-Spezifikationen (PROJ-X-name.md)
  INDEX.md          Feature-Statusübersicht
docs/
  PRD.md            Produktanforderungsdokument
  production/       Produktions-Anleitungen (Sentry, Sicherheit, Performance)
```

## Entwicklungs-Workflow

1. `/requirements` - Feature-Spezifikation aus Idee erstellen
2. `/architecture` - Technische Architektur entwerfen (PM-freundlich, kein Code)
3. `/frontend` - UI-Komponenten bauen (shadcn/ui zuerst!)
4. `/backend` - APIs, Datenbank, RLS-Policies bauen
5. `/qa` - Gegen Akzeptanzkriterien testen + Sicherheitsaudit
6. `/deploy` - Auf Vercel deployen + Produktionsbereitschafts-Checks

## Feature-Tracking

Alle Features werden in `features/INDEX.md` verfolgt. Jeder Skill liest es beim Start und aktualisiert es nach Abschluss. Feature-Specs befinden sich unter `features/PROJ-X-name.md`.

## Wichtige Konventionen

- **Feature-IDs:** PROJ-1, PROJ-2, etc. (sequenziell)
- **Commits:** `feat(PROJ-X): Beschreibung`, `fix(PROJ-X): Beschreibung`
- **Single Responsibility:** Ein Feature pro Spec-Datei
- **shadcn/ui zuerst:** NIEMALS eigene Versionen installierter shadcn-Komponenten erstellen
- **Mensch-im-Loop:** Alle Workflows haben Benutzerfreigabe-Checkpoints

## Build- & Test-Befehle

```bash
npm run dev        # Entwicklungsserver (localhost:3000)
npm run build      # Produktions-Build
npm run lint       # ESLint
npm run start      # Produktionsserver
```

## Produktkontext

@docs/PRD.md

## Feature-Übersicht

@features/INDEX.md
