# YoungMinds Video Engine - MVP spec

## Promise

Userul adaugă un script lung. Aplicația generează o săptămână de conținut Instagram și îl trimite în Postiz pentru programare.

## Flux

1. Userul introduce scriptul, brandul și audiența.
2. API-ul `/api/content/generate` trimite scriptul către modelul AI.
3. Modelul returnează un JSON cu piloni de conținut și postări.
4. Aplicația afișează planul pentru aprobare/editare.
5. API-ul `/api/content/schedule` trimite postările către Postiz.
6. Postiz se ocupă de publicarea efectivă pe Instagram.

## Ce generează MVP-ul

- postări Instagram simple;
- carusele cu structură pe slide-uri;
- scripturi de Reel;
- stories;
- captions, hooks, CTA-uri, hashtags;
- brief vizual pentru fiecare postare.

## Ce NU face încă

- nu randează imaginile finale pentru carusel;
- nu generează video;
- nu are editor vizual;
- nu are auth multi-user;
- nu are billing;
- nu sincronizează analytics înapoi din Postiz.

## Arhitectură

Next.js app router

OpenAI Responses API pentru generarea planului

Supabase pentru persistență opțională

Postiz Public API pentru scheduling/publicare

## Recomandare v2

Adaugă un pas între generare și programare:

`content plan -> template renderer -> media files -> Postiz`

Pentru template renderer poți folosi Canva API, Placid, Bannerbear, Creatomate sau un renderer propriu HTML/CSS -> PNG. Da, încă o alegere tehnică, pentru că aparent nu era suficientă birocrația cosmică.
