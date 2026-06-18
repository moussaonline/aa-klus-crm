# AA Klus CRM

Een werkende CRM MVP voor renovatie- en klusbedrijf **AA Klus**. De app is gebouwd met Next.js, React, TypeScript en Tailwind CSS, met Prisma en Supabase PostgreSQL als databasebasis.

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

   Vul voor Supabase PostgreSQL en lead-import minimaal in:

   ```bash
   DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<DATABASE_PASSWORD>@<POOLER_REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:<DATABASE_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
   IMPORT_API_KEY="een-sterke-geheime-key"
   CRM_LOGIN_PASSWORD="een-sterk-crm-wachtwoord"
   CRM_AUTH_SECRET="lange-random-secret-voor-cookie-signing"
   NEXT_PUBLIC_SITE_URL="https://crm.aa-klus.nl"
   ```

3. Initialiseer Supabase PostgreSQL via Prisma:

   ```bash
   npm run db:generate
   npm run db:migrate
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
src/data            Prisma data-adapters en seeddata voor initialisatie
src/domain          Business types en berekeningen
src/lib             Kleine gedeelde helpers
prisma              PostgreSQL schema, migraties en seedscript
```

## Later uitbreiden

- Voeg authenticatie toe per rol.
- Koppel uploadopslag aan Supabase Storage, S3 of lokale NAS.
- Vervang client-side PDF-print door server-side PDF-rendering wanneer automatische e-mailverzending nodig is.
- Voeg e-Boekhouden-integratie toe via een aparte service in `src/domain` of `src/lib`.
- Sluit WhatsApp Business API aan op de bestaande berichttemplates.
- Hergebruik `src/domain` en gedeelde componentconcepten bij een latere Expo/React Native app.

Er zijn geen externe betaalde diensten gebruikt.

## Login en online domein

Alle CRM-pagina's en CRM API-routes zijn beschermd met login via een httpOnly cookie. Publiek bereikbaar blijven:

```text
/login
/api/auth/login
/api/auth/logout
/api/website-leads
```

Het websiteformulier kan daardoor publiek submissions blijven sturen naar `/api/website-leads`, terwijl de CRM zelf achter login staat.

Voor productie op `crm.aa-klus.nl`:

1. Deploy de Next.js app naar je hostingprovider.
2. Stel environment variables in:

   ```text
   DATABASE_URL
   DIRECT_URL
   IMPORT_API_KEY
   CRM_LOGIN_PASSWORD
   CRM_AUTH_SECRET
   NEXT_PUBLIC_SITE_URL=https://crm.aa-klus.nl
   ```

3. Voeg DNS toe:

   ```text
   crm.aa-klus.nl CNAME <hosting-provider-domain>
   ```

   Of gebruik een A-record als je hostingprovider een vast IP-adres geeft.

4. Zet HTTPS aan bij de host. In productie gebruikt de login-cookie automatisch `secure`.

## Supabase PostgreSQL

De app gebruikt Prisma met twee Supabase database-URL's:

```text
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<DATABASE_PASSWORD>@<POOLER_REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<DATABASE_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
```

Gebruik `DATABASE_URL` voor de pooled runtime-verbinding op Vercel. Gebruik `DIRECT_URL` voor Prisma migraties.

Deploy databasewijzigingen:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

De eerste migratie staat in:

```text
prisma/migrations/20260618120000_init_supabase_postgres/migration.sql
```

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
