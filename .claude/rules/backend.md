# Backend-Entwicklungsregeln

## Datenbank (Supabase)
- IMMER Row Level Security auf jeder Tabelle aktivieren
- RLS-Policies für SELECT, INSERT, UPDATE, DELETE erstellen
- Indizes auf Spalten hinzufügen, die in WHERE, ORDER BY und JOIN-Klauseln verwendet werden
- Foreign Keys mit ON DELETE CASCADE verwenden wo angemessen
- Niemals RLS überspringen - Sicherheit geht vor

## API-Routen
- Alle Eingaben mit Zod-Schemas vor der Verarbeitung validieren
- Immer Authentifizierung prüfen: Benutzersitzung verifizieren
- Aussagekräftige Fehlermeldungen mit angemessenen HTTP-Statuscodes zurückgeben
- `.limit()` auf allen Listen-Abfragen verwenden

## Abfragemuster
- Supabase Joins statt N+1-Abfrageschleifen verwenden
- `unstable_cache` von Next.js für selten wechselnde Daten verwenden
- Fehler aus Supabase-Antworten immer behandeln

## Sicherheit
- Niemals Geheimnisse im Quellcode hardcoden
- Umgebungsvariablen für alle Zugangsdaten verwenden
- Alle Benutzereingaben validieren und bereinigen
- Parametrisierte Abfragen verwenden (Supabase handhabt dies)
