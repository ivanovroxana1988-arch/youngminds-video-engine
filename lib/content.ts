export const brandPreset = {
  brand: "YoungMinds",
  colors: ["mov", "galben cald", "crem"],
  tone: "cald, prietenos, educațional, ușor jucăuș",
  rules: [
    "fără fețe recognoscibile de copii",
    "fără text generat direct în imagini",
    "format vertical 9:16",
    "subtitrări mari",
    "call-to-action clar",
  ],
};

export const workflowSteps = [
  "Încarci CSV sau Excel cu postările planificate.",
  "Alegi brandul YoungMinds și unul dintre template-urile MVP.",
  "AI completează hook, voice-over, text pe ecran, caption și hashtaguri.",
  "Workerul generează asset-uri, voice-over, subtitrări și pornește randarea video.",
  "Aplicația salvează MP4-ul final în Storage și îl afișează pentru preview/download.",
  "Descarci MP4-ul, copiezi descrierea și postezi manual pe TikTok.",
];

export const renderPipeline = [
  {
    title: "1. Completează conținutul",
    detail: "Pentru fiecare rând, AI scrie scriptul, textul de pe ecran, caption-ul, hashtagurile și prompturile de imagine.",
  },
  {
    title: "2. Produce asset-urile",
    detail: "Sistemul folosește poze încărcate sau generează imagini, apoi creează voice-over-ul cu TTS.",
  },
  {
    title: "3. Randează MP4",
    detail: "Un worker Node.js trimite compoziția către Remotion, Creatomate sau JSON2Video și obține fișierul vertical 1080×1920.",
  },
  {
    title: "4. Îl livrează în aplicație",
    detail: "MP4-ul, thumbnail-ul și descrierea TikTok sunt salvate și apar în pagina de rezultate pentru descărcare manuală.",
  },
];

export const templates = [
  {
    name: "Activitate",
    description: "Pentru pictură, ceramică, șah, engleză, art & craft.",
    scenes: "5 cadre slideshow premium, zoom discret, text mare și CTA final.",
  },
  {
    name: "Problemă părinte",
    description: "Pentru situații ca: copilul e în vacanță, tu încă muncești.",
    scenes: "Hook empatic, soluție clară, beneficii pentru copil și părinte.",
  },
  {
    name: "Înscrieri / CTA",
    description: "Pentru perioadă, spațiu, locuri disponibile și apel direct la înscriere.",
    scenes: "Anunț direct, date esențiale, dovadă de brand și buton de acțiune.",
  },
];

export const tableColumns = [
  "data_postarii",
  "tema",
  "obiectiv",
  "public_tinta",
  "hook",
  "script_voiceover",
  "text_pe_ecran",
  "prompt_imagine",
  "cta",
  "caption_tiktok",
  "hashtags",
  "status",
  "video_url",
  "thumbnail_url",
];

export const resultCards = [
  { label: "Tema", value: "Pictură și ceramică" },
  { label: "Status", value: "Generat" },
  { label: "Format", value: "MP4 vertical 1080×1920" },
  { label: "Durată", value: "~20 secunde" },
];
