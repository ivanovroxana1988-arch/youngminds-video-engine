# YoungMinds Content Studio - MVP spec

## Promise

Userul adaugă o idee, o campanie sau un script despre YoungMinds. Aplicația generează o săptămână de conținut Instagram, creează asset-uri vizuale 1080 × 1350 în identitatea YoungMinds și trimite postările către Postiz pentru programare.

## Brand scope

YoungMinds este tratat ca brand fix, nu ca input generic.

Activități folosite în generator:

- STEM;
- Pian;
- Tae-kwon do;
- Robotică;
- Limbi străine;
- Yoga.

Public principal: părinți care caută afterschool, activități educaționale și un spațiu sigur și cald pentru copii.

## Flux

1. Userul introduce ideea/scriptul și ajustează audiența, dacă e nevoie.
2. API-ul `/api/content/generate` trimite inputul către modelul AI împreună cu profilul YoungMinds.
3. Modelul returnează un JSON cu piloni de conținut și postări.
4. Aplicația afișează planul pentru aprobare/editare.
5. Rendererul local creează preview-uri SVG și export PNG pentru fiecare postare.
6. API-ul `/api/content/schedule` trimite textul postărilor către Postiz.
7. Postiz se ocupă de publicarea efectivă pe Instagram.

## Ce generează MVP-ul

- postări Instagram simple;
- carusele cu structură pe slide-uri;
- asset-uri vizuale 1080 × 1350 în SVG/PNG;
- scripturi de Reel;
- stories;
- captions, hooks, CTA-uri, hashtags;
- brief vizual pentru fiecare postare.

## Ce NU face încă

- nu urcă automat PNG-urile în Postiz;
- nu generează video;
- nu are editor vizual avansat;
- nu are auth multi-user;
- nu are billing;
- nu sincronizează analytics înapoi din Postiz.

## Arhitectură

Next.js app router

OpenAI Responses API pentru generarea planului

Profil de brand în `lib/brand/youngminds.ts`

Renderer SVG propriu pentru asset-uri vizuale exportabile PNG

Supabase pentru persistență opțională

Postiz Public API pentru scheduling/publicare

## Recomandare v2

Adaugă un pas între generare și programare:

`content plan -> template renderer -> media files -> Postiz upload -> scheduled post`

Pentru template renderer poți extinde rendererul SVG propriu sau poți conecta Canva API, Placid, Bannerbear ori Creatomate. Da, încă o alegere tehnică, pentru că aparent nu era suficientă birocrația cosmică.
