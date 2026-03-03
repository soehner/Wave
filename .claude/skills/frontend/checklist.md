# Frontend-Implementierungs-Checkliste

Vor dem Abschluss des Frontends prüfen:

## shadcn/ui
- [ ] shadcn/ui für JEDE benötigte UI-Komponente geprüft
- [ ] Keine Custom-Duplikate von shadcn-Komponenten erstellt
- [ ] Fehlende shadcn-Komponenten via `npx shadcn@latest add` installiert

## Bestehender Code
- [ ] Bestehende Projektkomponenten via `git ls-files src/components/` geprüft
- [ ] Bestehende Komponenten wo möglich wiederverwendet

## Design
- [ ] Design-Präferenzen mit Benutzer geklärt (falls keine Mockups)
- [ ] Komponentenarchitektur vom Solution Architect befolgt

## Implementierung
- [ ] Alle geplanten Komponenten implementiert
- [ ] Alle Komponenten verwenden Tailwind CSS (keine Inline-Styles, keine CSS-Module)
- [ ] Ladezustände implementiert (Spinner/Skeleton bei Datenabfragen)
- [ ] Fehlerzustände implementiert (benutzerfreundliche Fehlermeldungen)
- [ ] Leere Zustände implementiert ("Noch keine Daten"-Meldungen)

## Qualität
- [ ] Responsive: Mobil (375px), Tablet (768px), Desktop (1440px)
- [ ] Barrierefreiheit: Semantisches HTML, ARIA-Labels, Tastaturnavigation
- [ ] TypeScript: Keine Fehler (`npm run build` erfolgreich)
- [ ] ESLint: Keine Warnungen (`npm run lint`)

## Verifizierung (vor Abschluss ausführen)
- [ ] `npm run build` läuft ohne Fehler durch
- [ ] Alle Akzeptanzkriterien aus der Feature-Spec in der UI adressiert
- [ ] `features/INDEX.md` Status auf "In Arbeit" aktualisiert

## Abschluss
- [ ] Benutzer hat die UI im Browser überprüft und freigegeben
- [ ] Code in git committet
