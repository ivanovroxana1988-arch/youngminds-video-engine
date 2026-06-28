export type ContentFormat = "instagram_post" | "instagram_carousel" | "reel_script" | "story";

export type TemplateType = "photo_split" | "photo_hero" | "text_card" | "carousel_education";
export type ImageType = "real_photo" | "ai_image" | "graphic" | "mixed";

export type CarouselSlide = {
  title: string;
  body: string;
};

export type ReelScene = {
  visual: string;
  voiceover: string;
  onScreenText: string;
};

export type GeneratedPost = {
  format: ContentFormat;
  templateType?: TemplateType;
  imageType?: ImageType;
  photoTheme?: string;
  photoRequired?: boolean;
  designNotes?: string;
  title: string;
  hook: string;
  caption: string;
  visualBrief: string;
  carouselSlides?: CarouselSlide[];
  reelScript?: {
    durationSeconds: number;
    scenes: ReelScene[];
  };
  cta: string;
  hashtags: string[];
  scheduledAt?: string;
};

export type ContentPlan = {
  sourceSummary: string;
  contentPillars: string[];
  posts: GeneratedPost[];
};
