# Frontend-Entwicklungsregeln

## shadcn/ui zuerst (PFLICHT)
- Vor dem Erstellen JEDER UI-Komponente prüfen, ob shadcn/ui sie hat: `ls src/components/ui/`
- NIEMALS eigene Implementierungen erstellen von: Button, Input, Select, Checkbox, Switch, Dialog, Modal, Alert, Toast, Table, Tabs, Card, Badge, Dropdown, Popover, Tooltip, Navigation, Sidebar, Breadcrumb
- Falls eine shadcn-Komponente fehlt, installiere sie: `npx shadcn@latest add <name> --yes`
- Custom-Komponenten NUR für geschäftsspezifische Kompositionen, die intern shadcn-Primitive verwenden

## Import-Muster
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
```

## Komponenten-Standards
- Verwende ausschließlich Tailwind CSS (keine Inline-Styles, keine CSS-Module)
- Alle Komponenten müssen responsive sein (Mobil 375px, Tablet 768px, Desktop 1440px)
- Implementiere Ladezustände, Fehlerzustände und Leerzustände
- Verwende semantisches HTML und ARIA-Labels für Barrierefreiheit
- Halte Komponenten klein und fokussiert
- Verwende TypeScript-Interfaces für alle Props

## Auth Best Practices (Supabase)
- Verwende `window.location.href` für Post-Login-Redirect (nicht `router.push`)
- Verifiziere immer, dass `data.session` existiert, bevor umgeleitet wird
- Setze den Ladezustand immer in allen Code-Pfaden zurück (Erfolg, Fehler, finally)
