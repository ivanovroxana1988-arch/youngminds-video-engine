import { CarouselSlide, ContentPlan, GeneratedPost, StylePreset, TemplateType } from "@/types/content";

const MAX_TITLE_CHARS = 48;
const MAX_HOOK_CHARS = 56;
const MAX_CAPTION_CHARS = 380;
const MAX_VISUAL_BRIEF_CHARS = 180;
const MAX_CTA_CHARS = 68;
const MAX_DESIGN_NOTES_CHARS = 96;
const MAX_PHOTO_THEME_CHARS = 30;
const MAX_BODY_PREVIEW_CHARS = 138;
const MAX_CHIP_CHARS = 14;
const PROMO_KEYWORDS = ["înscrieri", "locuri", "ultimele", "vară", "promo", "ofert", "vacanță", "acum"];
const ARTIFACT_PATTERNS = [
  /post context\s*:/gi,
  /layout style\s*:/gi,
  /design notes\s*:/gi,
  /visual brief\s*:/gi,
  /template type\s*:/gi,
  /style preset\s*:/gi,
  /theme\s*:/gi,
  /image type requested\s*:/gi,
  /important theme to visualize\s*:/gi,
  /hook\s*:/gi,
  /post title\s*:/gi,
  /commentariu(?:l)? aplicației\s*:/gi,
  /instrucțiuni interne\s*:/gi,
  /background only\s*:/gi,
  /text overlay\s*:/gi,
  /do not include[^.]*\.?/gi,
  /leave clear space[^.]*\.?/gi
];

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function stripPromptArtifacts(value: string) {
  return ARTIFACT_PATTERNS.reduce((text, pattern) => text.replace(pattern, ""), value);
}

function stripOuterQuotes(value: string) {
  return value.replace(/^["'„”«»]+/, "").replace(/["'„”«»]+$/, "");
}

function cleanText(value: string) {
  return stripOuterQuotes(normalizeWhitespace(stripPromptArtifacts(value || "")));
}

function clipChars(value: string, max: number) {
  if (value.length <= max) return value;
  const clipped = value.slice(0, max - 1).trim().replace(/[,:;.!?\-–]+$/g, "");
  return `${clipped}…`;
}

function words(value: string) {
  return cleanText(value).split(/\s+/).filter(Boolean);
}

function clipWords(value: string, maxWords: number) {
  const list = words(value);
  if (list.length <= maxWords) return list.join(" ");
  return `${list.slice(0, maxWords).join(" ").replace(/[,:;.!?\-–]+$/g, "")}…`;
}

function sentenceCase(value: string) {
  const text = cleanText(value);
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ensureSentenceEnd(value: string) {
  const text = sentenceCase(value);
  if (!text) return text;
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

function normalizeParagraphs(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  const rawParts = normalized
    .split(/\n{2,}/)
    .map((part) => cleanText(part))
    .filter(Boolean);

  const parts = (rawParts.length ? rawParts : [normalized])
    .map((part) => clipChars(ensureSentenceEnd(part), 140))
    .filter(Boolean);

  return parts.slice(0, 4).join("\n\n");
}

function normalizeHashtag(value: string) {
  const compact = cleanText(value).replace(/[^\p{L}\p{N}]+/gu, "");
  if (!compact) return "";
  return `#${compact.charAt(0).toUpperCase()}${compact.slice(1)}`;
}

function normalizeSlide(slide: CarouselSlide): CarouselSlide {
  return {
    title: clipWords(sentenceCase(slide.title), 6),
    body: clipWords(ensureSentenceEnd(slide.body), 20)
  };
}

function detectPromo(post: GeneratedPost) {
  const combined = `${post.title} ${post.hook} ${post.caption} ${post.cta}`.toLowerCase();
  return PROMO_KEYWORDS.some((keyword) => combined.includes(keyword));
}

function chooseTemplate(post: GeneratedPost): TemplateType {
  if (post.carouselSlides?.length) return "carousel_education";

  const density = post.title.length + post.hook.length + post.caption.length;
  if (detectPromo(post) && density <= 240) return "photo_hero";
  if (density > 250 || post.title.length > 34) return "photo_split";
  if (!post.photoRequired && density > 180) return "text_card";
  return post.photoRequired ? "photo_hero" : "photo_split";
}

function chooseStyle(templateType: TemplateType, post: GeneratedPost): StylePreset {
  if (templateType === "carousel_education") return "bottom_band";
  if (templateType === "photo_split") return "split_showcase";
  if (templateType === "text_card") return detectPromo(post) ? "mosaic_promo" : "bottom_band";
  return detectPromo(post) ? "overlay_photo" : "bottom_band";
}

function shortenForVisual(value: string, maxChars: number, maxWordsCount: number) {
  return clipChars(clipWords(sentenceCase(value), maxWordsCount), maxChars);
}

function visualBodyFromCaption(caption: string, cta?: string) {
  const paragraphs = normalizeParagraphs(caption).split(/\n\n/).filter(Boolean);
  const lead = paragraphs.slice(0, 2).join(" ");
  const compact = normalizeWhitespace([lead, cta ? cleanText(cta) : ""].filter(Boolean).join(" "));
  return clipChars(compact, MAX_BODY_PREVIEW_CHARS);
}

function normalizeDesignNotes(value: string) {
  return clipChars(cleanText(value), MAX_DESIGN_NOTES_CHARS);
}

function normalizePhotoTheme(value: string) {
  return clipChars(cleanText(value), MAX_PHOTO_THEME_CHARS);
}

function normalizeVisualBrief(value: string, fallbackTheme: string) {
  const text = clipChars(cleanText(value), MAX_VISUAL_BRIEF_CHARS);
  return text || `Fundal de marketing YoungMinds pentru ${fallbackTheme}.`;
}

function normalizeCta(value: string) {
  return clipChars(ensureSentenceEnd(value), MAX_CTA_CHARS);
}

function normalizeCaption(value: string) {
  return normalizeParagraphs(clipChars(normalizeParagraphs(value), MAX_CAPTION_CHARS));
}

export function preparePostForRendering(post: GeneratedPost): GeneratedPost {
  const photoTheme = normalizePhotoTheme(post.photoTheme || post.title || "activitate YoungMinds");
  const caption = normalizeCaption(post.caption);
  const templateType = chooseTemplate({ ...post, caption, photoTheme });
  const stylePreset = chooseStyle(templateType, { ...post, caption, photoTheme });

  const hashtags = (post.hashtags || [])
    .map(normalizeHashtag)
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
    .slice(0, 6);

  return {
    ...post,
    templateType,
    stylePreset,
    imageType: post.imageType || "ai_image",
    photoTheme,
    photoRequired: post.photoRequired ?? templateType !== "text_card",
    designNotes: normalizeDesignNotes(post.designNotes || "Headline scurt, corp scurt, contrast puternic și spațiu curat pentru overlay."),
    title: shortenForVisual(post.title, MAX_TITLE_CHARS, 8),
    hook: shortenForVisual(post.hook || post.title, MAX_HOOK_CHARS, 9),
    caption,
    visualBrief: normalizeVisualBrief(post.visualBrief || photoTheme, photoTheme),
    carouselSlides: post.carouselSlides?.map(normalizeSlide).slice(0, 8),
    cta: normalizeCta(post.cta || "Scrie-ne pentru detalii."),
    hashtags: hashtags.length ? hashtags : ["#YoungMinds", "#Afterschool", "#Joacă"]
  };
}

export function sanitizeContentPlan(plan: ContentPlan): ContentPlan {
  return {
    sourceSummary: clipChars(ensureSentenceEnd(plan.sourceSummary || "Plan YoungMinds generat automat"), 220),
    contentPillars: (plan.contentPillars || []).map(cleanText).filter(Boolean).slice(0, 6),
    posts: (plan.posts || []).map(preparePostForRendering)
  };
}

export function getVisualBody(post: GeneratedPost) {
  return visualBodyFromCaption(post.caption, post.cta);
}

export function getVisualChips(post: GeneratedPost) {
  const source = post.hashtags?.length
    ? post.hashtags.map((tag) => tag.replace(/^#/, ""))
    : (post.photoTheme || "YoungMinds").split(/[,·/]/g);

  return source
    .map((item) => clipChars(cleanText(item), MAX_CHIP_CHARS))
    .filter(Boolean)
    .slice(0, 3);
}

export function getPostQualityWarnings(post: GeneratedPost) {
  const warnings: string[] = [];
  const combined = [post.title, post.hook, post.caption, post.visualBrief, post.designNotes].join(" \n ");

  if (/post context|layout style|visual brief|design notes|template type|style preset/i.test(combined)) {
    warnings.push("Conținutul a păstrat fragmente de prompt intern.");
  }
  if (post.title.length > 40) warnings.push("Titlul este prea lung pentru template-uri foto." );
  if (post.hook.length > 52) warnings.push("Hook-ul este prea lung și poate crea overflow." );
  if (post.caption.length > 340) warnings.push("Caption-ul este dens; pe vizual va fi folosită o versiune scurtă." );
  if ((post.carouselSlides?.length ?? 0) > 6) warnings.push("Caruselul este lung; verifică ritmul vizual." );

  return warnings;
}
