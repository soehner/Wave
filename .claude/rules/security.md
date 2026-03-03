# Sicherheitsregeln

## Geheimnisse-Management
- NIEMALS Geheimnisse, API-Keys oder Zugangsdaten in git committen
- `.env.local` für lokale Entwicklung verwenden (bereits in .gitignore)
- `NEXT_PUBLIC_`-Prefix NUR für Werte verwenden, die sicher im Browser exponiert werden können
- Alle benötigten Env-Vars in `.env.local.example` mit Dummy-Werten dokumentieren

## Eingabevalidierung
- ALLE Benutzereingaben serverseitig mit Zod validieren
- Niemals nur auf clientseitige Validierung vertrauen
- Daten vor dem Einfügen in die Datenbank bereinigen

## Authentifizierung
- Immer Authentifizierung vor der Verarbeitung von API-Anfragen verifizieren
- Supabase RLS als zweite Verteidigungslinie verwenden
- Rate-Limiting auf Authentifizierungs-Endpunkten implementieren

## Sicherheitsheader
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Strict-Transport-Security mit includeSubDomains

## Code-Review-Auslöser
- Alle Änderungen an RLS-Policies erfordern explizite Benutzerfreigabe
- Alle Änderungen am Authentifizierungsablauf erfordern explizite Benutzerfreigabe
- Alle neuen Umgebungsvariablen müssen in .env.local.example dokumentiert werden
