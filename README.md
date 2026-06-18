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
- Werkbonnen met nummering, uitvoerder, materialen, uren, status en PDF-export.
- Planning met dag-, week- en maandweergave, gekoppeld aan klanten, projecten en werkbonnen.
- Drag-and-drop planning tussen dagen.
- Projectgalerij met mappen voor voor foto's, na foto's en documenten.
- Uploadvoorbereiding voor foto's, PDF's, contracten en facturen.
- Google Maps kaart- en routeknoppen per klant en planning.
- WhatsApp-knoppen met templates voor afspraak, offerte, start werkzaamheden en afronding.
- Professionele PDF-export voor offertes en facturen in AA Klus huisstijl.
- Dashboard Pro met omzetgrafiek, conversieratio, leads, projecten, offertes en facturen.
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
- Koppel uploadopslag aan Supabase Storage, S3 of lokale NAS.
- Vervang client-side PDF-print door server-side PDF-rendering wanneer automatische e-mailverzending nodig is.
- Voeg e-Boekhouden-integratie toe via een aparte service in `src/domain` of `src/lib`.
- Sluit WhatsApp Business API aan op de bestaande berichttemplates.
- Hergebruik `src/domain` en gedeelde componentconcepten bij een latere Expo/React Native app.

Er zijn geen externe betaalde diensten gebruikt.
