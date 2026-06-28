# YoungMinds Video Engine

MVP pentru un produs care transformă un script lung într-o săptămână de conținut Instagram și trimite postările către Postiz pentru programare.

Pe românește: tu dai scriptul, aplicația scoate postări, carusele, captions, hook-uri, CTA-uri și brief-uri vizuale. Postiz se ocupă de programare/publicare. Civilizația mai câștigă cinci minute, ceea ce e aproape emoționant.

## Stack

- Next.js App Router
- TypeScript
- OpenAI Responses API
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

- primește script lung;
- generează plan de conținut în română;
- afișează postările generate;
- trimite postările spre Postiz pentru programare;
- pregătește structura pentru carusele și Reel-uri.

## Ce vine după

- editor pentru modificarea fiecărei postări înainte de programare;
- generare imagini carusel din template-uri;
- upload media către Postiz;
- autentificare și proiecte per user;
- analytics din Postiz înapoi în aplicație;
- calendar editorial propriu.
