# AA Klus CRM

Een werkende CRM MVP voor renovatie- en klusbedrijf **AA Klus**. De app is gebouwd met Next.js, React, TypeScript en Tailwind CSS, met een voorbereid Prisma/SQLite schema.

## Functies in deze MVP

- Dashboard met nieuwe leads, lopende projecten, open offertes, open facturen, maandomzet en taken voor vandaag.
- Klantenbeheer met contactgegevens, klanttype, notities en klantgeschiedenis.
- Leads met bron, status, prioriteit en automatische vervolgtaak.
- Projecten vanuit klant of lead, inclusief type, status, planning, budget en notities.
- Offertes met regels, BTW en automatische totaalberekening.
- Facturen vanuit offerte of losse factuur, met betaaltermijn en status.
- Taken met koppeling aan klant, lead of project.
- Gebruikersrollen voorbereid: eigenaar/admin, medewerker, verkoper en boekhouding.
- Zoekfunctie op klant, telefoon, project, offerte en factuur.
- API-routes en gescheiden domeinlogica als basis voor latere mobiele app met React Native of Expo.

## Installatie lokaal

1. Installeer dependencies:

   ```bash
   npm install
   ```

2. Maak het lokale `.env` bestand:

   ```bash
   cp .env.example .env
   ```

3. Optioneel: initialiseer SQLite via Prisma:

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Start de webapp:

   ```bash
   npm run dev
   ```

5. Open de app op:

   ```text
   http://localhost:3000
   ```

## Projectstructuur

```text
src/app             Next.js pagina's en API-routes
src/components      Herbruikbare UI- en CRM-componenten
src/data            Dummydata en MVP data-entrypoint
src/domain          Business types en berekeningen
src/lib             Kleine gedeelde helpers
prisma              SQLite database schema en seedscript
```

## Later uitbreiden

- Vervang `src/data/seed.ts` door echte databasequeries via Prisma of Supabase.
- Voeg authenticatie toe per rol.
- Voeg uploadopslag toe voor projectfoto's en documenten.
- Bouw PDF-export voor offertes en facturen.
- Voeg e-Boekhouden-integratie toe via een aparte service in `src/domain` of `src/lib`.
- Hergebruik `src/domain` en gedeelde componentconcepten bij een latere Expo/React Native app.

Er zijn geen externe betaalde diensten gebruikt.
