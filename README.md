# YoungMinds Content Studio

Generator dedicat pentru YoungMinds: transformă o idee, un script sau o campanie într-o săptămână de conținut Instagram pentru afterschool și locul de joacă.

Pe românește: scrii tema, aplicația scoate postări, carusele, captions, hook-uri, CTA-uri, Reel scripts și imagini în stilul YoungMinds. Internetul nu devine mai puțin absurd, dar măcar postările ies coerent.

## Brand focus

YoungMinds = afterschool și loc de joacă.

Activități incluse în generator:

- STEM: juguetronica, learning resources, tablă interactivă multitouch;
- Pian;
- Tae-kwon do;
- Robotică: Lego Wedo, Boost, Mindstorms;
- Limbi străine;
- Yoga.

Identitate vizuală folosită în asset-uri: albastru/mov cosmic, accente galbene, stele, forme rotunjite, energie caldă și jucăușă.

## Stack

- Next.js App Router
- TypeScript
- OpenAI Responses API pentru text și imagini
- Supabase pentru persistență și storage public de imagini
- Meta Instagram Graph API pentru publicare directă și programare

## Setup local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Deschide:

```bash
http://localhost:3000/content-engine
```

## Variabile de mediu

```bash
# AI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Meta Graph API
META_ACCESS_TOKEN=
META_INSTAGRAM_BUSINESS_ID=
META_APP_ID=
META_APP_SECRET=

# Optional, pentru cron / protejarea rutelor automate viitoare
CRON_SECRET=
```

## Supabase

Rulează schema din:

```bash
supabase/schema.sql
```

Creează și bucket-ul public pentru imaginile generate:

```bash
supabase storage create post-images --public
```

Sau din Supabase Dashboard:

1. Storage → New bucket.
2. Nume bucket: `post-images`.
3. Public bucket: activat.

De ce public? Meta Graph API are nevoie de un `image_url` accesibil public pentru a crea media container. Da, și aici simplul „postează poza” devine un mic tratat despre infrastructură.

## Meta Graph API

Aplicația postează direct prin Instagram Graph API, nu prin Postiz.

Ai nevoie de:

- cont Instagram Professional, ideal Business;
- contul Instagram conectat la o pagină Facebook;
- Meta Developer App;
- long-lived User Access Token;
- Instagram Business Account ID numeric;
- permisiuni potrivite pentru publicare, de regulă `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.

Variabilele folosite de cod:

```bash
META_ACCESS_TOKEN=
META_INSTAGRAM_BUSINESS_ID=
META_APP_ID=
META_APP_SECRET=
```

Statusul tokenului apare în UI prin ruta:

```bash
/api/meta/token-status
```

## Vercel deploy

1. Importă repo-ul în Vercel.
2. Framework preset: Next.js.
3. Build command:

```bash
npm run build
```

4. Setează în Vercel toate variabilele din `.env.example`.
5. Deploy.
6. Testează pagina:

```bash
/content-engine
```

## Ce face acum

- primește o idee sau un script YoungMinds;
- generează plan de conținut în română;
- creează postări, carusele, Reel scripts și stories;
- generează imagini pentru postări;
- urcă imaginile în Supabase Storage;
- publică imediat pe Instagram prin Meta Graph API;
- programează o săptămână de postări pe Instagram;
- salvează statusul în Supabase, dacă variabilele Supabase sunt setate.

## Limitări actuale

- imaginile DALL-E încă trebuie ajustate mai bine pe identitatea vizuală exactă YoungMinds;
- nu există încă editor vizual avansat pentru fiecare slide;
- tokenul Meta trebuie menținut valid;
- nu există încă autentificare multi-user;
- nu există analytics din Instagram înapoi în aplicație;
- nu există calendar editorial propriu.

## Test rapid

După deploy, folosește o idee de test:

```text
Vrem o campanie despre robotică la YoungMinds. Copiii lucrează cu Lego Wedo, Boost și Mindstorms, învață să construiască, să testeze, să greșească și să repare. Vrem să explicăm părinților că robotica dezvoltă gândirea logică, răbdarea și colaborarea.
```

Verifică în ordine:

1. generarea planului;
2. generarea unei imagini pentru o postare;
3. publicarea unei singure postări;
4. programarea săptămânii.
