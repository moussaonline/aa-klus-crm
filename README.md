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
- Automatische lead-import via `/lead-import` en `POST /api/leads/import` voor website, e-mail, Facebook Lead Ads en Google Ads lead forms.
- Publiek AA Klus websiteformulier via `/website-form`; dit formulier gebruikt de import API-key alleen server-side.
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

   Zet voor lead-import ook:

   ```bash
   IMPORT_API_KEY="een-sterke-geheime-key"
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
- Vervang de tijdelijke in-memory lead-import store door Prisma-tabellen voor geïmporteerde leads en importlogs.
- Voeg authenticatie toe per rol.
- Koppel uploadopslag aan Supabase Storage, S3 of lokale NAS.
- Vervang client-side PDF-print door server-side PDF-rendering wanneer automatische e-mailverzending nodig is.
- Voeg e-Boekhouden-integratie toe via een aparte service in `src/domain` of `src/lib`.
- Sluit WhatsApp Business API aan op de bestaande berichttemplates.
- Hergebruik `src/domain` en gedeelde componentconcepten bij een latere Expo/React Native app.

Er zijn geen externe betaalde diensten gebruikt.

## Lead-import API

Externe bronnen sturen leads naar:

```text
POST /api/leads/import
Header: x-api-key: <IMPORT_API_KEY>
Content-Type: application/json
```

Voorbeeld voor een websiteformulier:

```json
{
  "name": "Jan Jansen",
  "phone": "0612345678",
  "email": "jan@example.com",
  "source": "website",
  "message": "Ik wil een badkamer laten renoveren",
  "projectType": "badkamer",
  "city": "Amsterdam",
  "budget": "10000-15000",
  "preferredDate": "volgende maand",
  "campaign": "website-contactformulier",
  "externalId": "web-123"
}
```

Toegestane sources:

```text
email
website
facebook
google_ads
```

Duplicate-detectie gebeurt op e-mail, telefoonnummer en `externalId`. Bij een duplicate wordt de bestaande geïmporteerde lead bijgewerkt met extra notities en campagne-informatie, zonder dubbele lead aan te maken.

De route geeft `401 Unauthorized` als `x-api-key` ontbreekt of niet overeenkomt met `IMPORT_API_KEY`. Voor lokale demo zonder `.env` is `dev-import-key` beschikbaar.

## Websiteformulier

Het publieke AA Klus formulier staat op:

```text
/website-form
```

De browser verstuurt naar:

```text
POST /api/website-leads
```

Deze serverroute zet `source` altijd op `website` en stuurt de lead daarna server-side door naar `POST /api/leads/import` met `x-api-key: <IMPORT_API_KEY>`. De API-key komt dus niet in de browser terecht.

## Facebook Lead Ads

Gebruik later een Facebook webhook of serverless endpoint dat de Facebook payload eerst door `mapFacebookLeadToCRMLead()` haalt. Ondersteunde velden:

```text
full_name, phone_number, email, city, project_type, budget, campaign, id/externalId
```

De mapper zet `source` automatisch op `facebook` en bewaart `campaign` en `externalId`.

## Google Ads Lead Forms

Gebruik later een Google Ads webhook/connector die de Google payload eerst door `mapGoogleAdsLeadToCRMLead()` haalt. Ondersteunde velden:

```text
user_column_data, full_name, phone_number, email, postal_code, city, campaign, lead_id/externalId
```

De mapper zet `source` automatisch op `google_ads` en bewaart `campaign` en `externalId`.

## E-mail Parsing

Er is nog geen Gmail/Mail API-koppeling gebouwd. De helper `parseLeadEmail()` zet platte e-mailtekst om naar leadvelden.

Ondersteund formaat:

```text
Naam: Jan Jansen
Telefoon: 0612345678
E-mail: jan@example.com
Plaats: Amsterdam
Project: Badkamer renovatie
Budget: 10000
Bericht: Ik wil mijn badkamer laten renoveren.
```
