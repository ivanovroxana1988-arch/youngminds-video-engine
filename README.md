# YoungMinds Content Studio

Generator dedicat pentru YoungMinds: transformă o idee, un script sau o campanie într-o săptămână de conținut Instagram pentru afterschool și locul de joacă.

Pe românește: scrii tema, aplicația scoate postări, carusele, captions, hook-uri, CTA-uri, Reel scripts și vizualuri în stilul YoungMinds. Internetul nu devine mai puțin absurd, dar măcar postările ies coerent.

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
- OpenAI Responses API
- Renderer SVG propriu pentru asset-uri 1080 × 1350 exportabile PNG/SVG
- Supabase, opțional pentru salvarea planurilor
- Postiz Public API pentru scheduling

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
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POSTIZ_API_BASE_URL=https://api.postiz.com/public/v1
POSTIZ_API_KEY=
POSTIZ_INSTAGRAM_INTEGRATION_ID=
```

## Supabase

Rulează schema din:

```bash
supabase/schema.sql
```

Persistența este opțională în MVP. Dacă lipsesc variabilele Supabase, generarea funcționează, dar planul nu este salvat.

## Postiz

1. Conectează Instagram în Postiz.
2. Setează `POSTIZ_API_KEY`.
3. Găsește integrarea Instagram cu:

```bash
curl -H "Authorization: $POSTIZ_API_KEY" "$POSTIZ_API_BASE_URL/integrations"
```

4. Copiază id-ul integrării în `POSTIZ_INSTAGRAM_INTEGRATION_ID`.

## Ce face acum

- primește o idee sau un script YoungMinds;
- generează plan de conținut în română;
- creează postări, carusele, Reel scripts și stories;
- creează preview-uri vizuale YoungMinds 1080 × 1350;
- exportă asset-uri PNG/SVG;
- trimite postările spre Postiz pentru programare.

## Ce vine după

- upload automat al PNG-urilor în Postiz;
- editor pentru modificarea fiecărei postări înainte de programare;
- template-uri vizuale multiple;
- autentificare și proiecte per user;
- analytics din Postiz înapoi în aplicație;
- calendar editorial propriu.
