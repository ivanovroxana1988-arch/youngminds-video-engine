export type ContentFormat = "instagram_post" | "instagram_carousel" | "reel_script" | "story";

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
