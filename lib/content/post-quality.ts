import { CarouselSlide, ContentPlan, GeneratedPost, StylePreset, TemplateType } from "@/types/content";

const MAX_TITLE_CHARS = 56;
const MAX_HOOK_CHARS = 64;
const MAX_CAPTION_CHARS = 420;
const MAX_VISUAL_BRIEF_CHARS = 220;
const MAX_CTA_CHARS = 72;
const MAX_DESIGN_NOTES_CHARS = 120;
const MAX_PHOTO_THEME_CHARS = 36;
const MAX_BODY_PREVIEW_CHARS = 170;
const MAX_CHIP_CHARS = 16;
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
  /post title\s*:/gi
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
  return stripOuterQuotes(normalizeWhitespace(stripPromptArtifacts(value)));
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
  const parts = normalizeWhitespace(value)
    .split(/\n{2,}/)
    .map((part) => ensureSentenceEnd(part))
    .filter(Boolean);

  if (!parts.length) return "";
  return parts.slice(0, 4).join("\n\n");
}

function normalizeHashtag(value: string) {
  const compact = cleanText(value).replace(/[^\p{L}\p{N}]+/gu, "");
  if (!compact) return "";
  return `#${compact.charAt(0).toUpperCase()}${compact.slice(1)}`;
}

function normalizeSlide(slide: CarouselSlide): CarouselSlide {
  return {
    title: clipWords(sentenceCase(slide.title), 7),
    body: clipWords(ensureSentenceEnd(slide.body), 22)
  };
}

function detectPromo(post: GeneratedPost) {
  const combined = `${post.title} ${post.hook} ${post.caption} ${post.cta}`.toLowerCase();
  return PROMO_KEYWORDS.some((keyword) => combined.includes(keyword));
}

function chooseTemplate(post: GeneratedPost): TemplateType {
  if (post.carouselSlides?.length) return "carousel_education";

  const density = post.title.length + post.hook.length + post.caption.length;
  if (density > 280) return "text_card";
  if (density > 170) return "photo_split";
  if (detectPromo(post)) return "photo_hero";
  return post.photoRequired ? "photo_hero" : "photo_split";
}

function chooseStyle(templateType: TemplateType, post: GeneratedPost): StylePreset {
  if (templateType === "carousel_education") return "bottom_band";
  if (templateType === "photo_split") return "split_showcase";
  if (templateType === "text_card") return detectPromo(post) ? "mosaic_promo" : "bottom_band";
  return detectPromo(post) ? "overlay_photo" : "overlay_photo";
}

function shortenForVisual(value: string, maxChars: number, maxWordsCount: number) {
  return clipChars(clipWords(sentenceCase(value), maxWordsCount), maxChars);
}

function visualBodyFromCaption(caption: string) {
  const singleLine = normalizeWhitespace(caption.replace(/\n+/g, " "));
  return clipChars(singleLine, MAX_BODY_PREVIEW_CHARS);
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
  const normalized = normalizeParagraphs(value);
  const clipped = clipChars(normalized, MAX_CAPTION_CHARS);
  return normalizeParagraphs(clipped);
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
    .slice(0, 8);

  return {
    ...post,
    templateType,
    stylePreset,
    imageType: post.imageType || "ai_image",
    photoTheme,
    photoRequired: post.photoRequired ?? templateType !== "text_card",
    designNotes: normalizeDesignNotes(post.designNotes || "Păstrează headline-ul scurt și spațiu clar pentru overlay."),
    title: shortenForVisual(post.title, MAX_TITLE_CHARS, 10),
    hook: shortenForVisual(post.hook || post.title, MAX_HOOK_CHARS, 10),
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
  if (post.designNotes && post.templateType === "text_card") {
    return clipChars(cleanText(post.designNotes), 210);
  }
  return visualBodyFromCaption(post.caption);
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
