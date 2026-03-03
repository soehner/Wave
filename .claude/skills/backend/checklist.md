# Backend-Implementierungs-Checkliste

## Kern-Checkliste
- [ ] Bestehende Tabellen/APIs per git geprüft, bevor neue erstellt werden
- [ ] Datenbanktabellen in Supabase erstellt
- [ ] Row Level Security auf ALLEN neuen Tabellen aktiviert
- [ ] RLS-Policies für SELECT, INSERT, UPDATE, DELETE erstellt
- [ ] Indizes auf performancekritischen Spalten erstellt
- [ ] Foreign Keys mit angemessenem ON DELETE-Verhalten gesetzt
- [ ] Alle geplanten API-Endpunkte unter `/src/app/api/` implementiert
- [ ] Authentifizierung verifiziert (kein Zugriff ohne gültige Sitzung)
- [ ] Eingabevalidierung mit Zod auf allen POST/PUT-Anfragen
- [ ] Aussagekräftige Fehlermeldungen mit korrekten HTTP-Statuscodes
- [ ] Keine TypeScript-Fehler in API-Routen
- [ ] Alle Endpunkte manuell getestet
- [ ] Keine hardcodierten Geheimnisse im Quellcode
- [ ] Frontend mit echten API-Endpunkten verbunden
- [ ] Benutzer hat überprüft und freigegeben

## Verifizierung (vor Abschluss ausführen)
- [ ] `npm run build` läuft ohne Fehler durch
- [ ] Alle Akzeptanzkriterien aus der Feature-Spec in der API adressiert
- [ ] Alle API-Endpunkte geben korrekte Statuscodes zurück (mit curl oder Browser testen)
- [ ] `features/INDEX.md` Status auf "In Arbeit" aktualisiert
- [ ] Code in git committet

## Performance-Checkliste
- [ ] Alle häufig gefilterten Spalten haben Indizes
- [ ] Keine N+1-Abfragen (verwende Supabase Joins statt Schleifen)
- [ ] Alle Listen-Abfragen verwenden `.limit()`
- [ ] Zod-Validierung auf allen Schreib-Endpunkten
- [ ] Langsame Abfragen wo angemessen gecacht (optional für MVP)
- [ ] Rate-Limiting auf öffentlich zugänglichen APIs (optional für MVP)
