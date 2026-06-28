import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { GeneratedPost, TemplateType } from "@/types/content";

export type VisualAsset = {
  filename: string;
  label: string;
  svg: string;
  dataUrl: string;
};

export type VisualAssetOptions = {
  photoUrl?: string;
  templateType?: TemplateType;
};

const WIDTH = 1080;
const HEIGHT = 1350;
const C = YOUNGMINDS_BRAND.colors;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52) || "youngminds-post";
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?]+$/, "")}…`;
  }
  return lines.map(escapeXml);
}

function fontSizeFor(text: string, base: number, min: number, thresholds: Array<[number, number]>) {
  const length = text.length;
  const reduction = thresholds.reduce((total, [limit, amount]) => total + (length > limit ? amount : 0), 0);
  return Math.max(min, base - reduction);
}

function centeredTextBlock(args: {
  lines: string[];
  x: number;
  centerY: number;
  lineHeight: number;
  className: string;
  anchor?: "start" | "middle";
}) {
  const startY = args.centerY - ((args.lines.length - 1) * args.lineHeight) / 2;
  const anchor = args.anchor ?? "middle";
  return `<text x="${args.x}" y="${startY}" text-anchor="${anchor}" class="${args.className}">${args.lines
    .map((line, index) => `<tspan x="${args.x}" dy="${index === 0 ? 0 : args.lineHeight}">${line}</tspan>`)
    .join("")}</text>`;
}

function decorativeStars() {
  return `
  <path d="M170 160 l18 38 38 18 -38 18 -18 38 -18 -38 -38 -18 38 -18z" fill="${C.white}" opacity="0.92"/>
  <path d="M886 206 l13 27 27 13 -27 13 -13 27 -13 -27 -27 -13 27 -13z" fill="${C.yellow}"/>
  <path d="M770 1048 l14 30 30 14 -30 14 -14 30 -14 -30 -30 -14 30 -14z" fill="${C.white}"/>
  <circle cx="900" cy="1080" r="18" fill="${C.pink}" opacity="0.88"/>
  <circle cx="170" cy="1010" r="16" fill="${C.softBlue}" opacity="0.78"/>
  <circle cx="962" cy="366" r="9" fill="${C.yellow}"/>
  <circle cx="122" cy="420" r="10" fill="${C.pink}"/>`;
}

function miniLogo(x: number, y: number, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M92 30 C116 30 131 47 128 71 C152 74 166 91 166 116 C166 144 143 166 115 166 C98 166 83 158 74 146 C64 159 49 166 31 166 C10 166 -6 150 -6 128 C-6 112 2 99 15 92 C5 80 4 62 15 49 C30 31 55 34 69 52 C75 39 83 30 92 30Z" fill="${C.yellow}" stroke="${C.orange}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M67 45 L113 154" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="80" cy="98" rx="103" ry="31" transform="rotate(-25 80 98)" fill="none" stroke="${C.indigo}" stroke-width="12"/>
  </g>`;
}

function baseDefs(titleSize = 74, bodySize = 40) {
  return `<defs>
    <linearGradient id="space" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5C70BE"/>
      <stop offset="0.52" stop-color="#354282"/>
      <stop offset="1" stop-color="#222A67"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.98"/>
      <stop offset="1" stop-color="#F6F8FF" stop-opacity="0.96"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#050A35" flood-opacity="0.24"/>
    </filter>
    <clipPath id="photoClip"><rect x="90" y="220" width="900" height="520" rx="52"/></clipPath>
    <clipPath id="splitPhotoClip"><rect x="90" y="255" width="430" height="780" rx="52"/></clipPath>
    <style>
      .brand { font: 900 42px Arial, sans-serif; fill: ${C.white}; letter-spacing: 1.5px; }
      .tagline { font: 800 23px Arial, sans-serif; fill: ${C.softBlue}; }
      .kicker { font: 900 27px Arial, sans-serif; fill: ${C.yellow}; letter-spacing: 3px; text-transform: uppercase; }
      .title { font: 900 ${titleSize}px Arial, sans-serif; fill: ${C.midnight}; }
      .titleLight { font: 900 ${titleSize}px Arial, sans-serif; fill: ${C.white}; }
      .body { font: 500 ${bodySize}px Arial, sans-serif; fill: #343B6B; }
      .bodyLight { font: 650 ${bodySize}px Arial, sans-serif; fill: #EEF3FF; }
      .footer { font: 800 28px Arial, sans-serif; fill: ${C.midnight}; }
      .small { font: 800 24px Arial, sans-serif; fill: ${C.softBlue}; }
      .counter { font: 900 28px Arial, sans-serif; fill: ${C.midnight}; }
    </style>
  </defs>`;
}

function background() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#space)"/>
  <path d="M-80 260 C260 30 400 80 210 430 C90 650 240 710 510 585 C810 448 1040 210 1160 -50 L1160 0 L0 0 Z" fill="#7187D2" opacity="0.2"/>
  <path d="M-90 1070 C180 860 470 930 680 760 C860 614 900 346 1180 250 L1180 1390 L-90 1390 Z" fill="#0D164D" opacity="0.18"/>
  ${decorativeStars()}`;
}

function header() {
  return `${miniLogo(80, 60, 0.52)}
  <text x="190" y="117" class="brand">YOUNGMINDS</text>
  <text x="190" y="150" class="tagline">afterschool si loc de joaca</text>`;
}

function photoOrPlaceholder(args: { x: number; y: number; width: number; height: number; clipId?: string; photoUrl?: string; theme?: string }) {
  if (args.photoUrl) {
    return `<image href="${escapeXml(args.photoUrl)}" x="${args.x}" y="${args.y}" width="${args.width}" height="${args.height}" preserveAspectRatio="xMidYMid slice"${args.clipId ? ` clip-path="url(#${args.clipId})"` : ""}/>`;
  }

  const lines = wrapText(args.theme ? `Adaugă poză: ${args.theme}` : "Adaugă poză reală YoungMinds", 22, 3);
  return `<g>
    <rect x="${args.x}" y="${args.y}" width="${args.width}" height="${args.height}" rx="52" fill="#DDE7FF" opacity="0.95"/>
    <circle cx="${args.x + args.width * 0.5}" cy="${args.y + args.height * 0.42}" r="92" fill="${C.yellow}" opacity="0.95"/>
    <text x="${args.x + args.width * 0.5}" y="${args.y + args.height * 0.44}" text-anchor="middle" font-size="82">📷</text>
    ${centeredTextBlock({ lines, x: args.x + args.width * 0.5, centerY: args.y + args.height * 0.68, lineHeight: 38, className: "body", anchor: "middle" })}
  </g>`;
}

function footer(cta: string, index: number, total: number) {
  const progress = Math.round(((index + 1) / total) * 720);
  return `<rect x="180" y="1160" width="720" height="12" rx="6" fill="#DDE6FF"/>
  <rect x="180" y="1160" width="${progress}" height="12" rx="6" fill="${C.yellow}"/>
  <text x="180" y="1224" class="footer">${escapeXml(cta)}</text>
  <circle cx="918" cy="1212" r="42" fill="${C.yellow}"/>
  <text x="905" y="1222" class="counter">${index + 1}</text>`;
}

function buildTextCard(args: { kicker: string; title: string; body: string; cta: string; index: number; total: number }) {
  const titleSize = fontSizeFor(args.title, 82, 58, [[45, 8], [70, 8], [95, 8]]);
  const titleLines = wrapText(args.title, titleSize > 70 ? 18 : 24, 4);
  const bodyLines = wrapText(args.body, 36, 5);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${baseDefs(titleSize, 40)}
  ${background()}
  ${header()}
  <rect x="90" y="245" width="900" height="870" rx="64" fill="url(#card)" filter="url(#shadow)"/>
  <text x="540" y="355" text-anchor="middle" class="kicker">${escapeXml(args.kicker)}</text>
  ${centeredTextBlock({ lines: titleLines, x: 540, centerY: 585, lineHeight: titleSize * 1.05, className: "title" })}
  ${centeredTextBlock({ lines: bodyLines, x: 540, centerY: 880, lineHeight: 52, className: "body" })}
  ${footer(args.cta, args.index, args.total)}
</svg>`;
}

function buildPhotoHero(args: { kicker: string; title: string; body: string; cta: string; index: number; total: number; photoUrl?: string; photoTheme?: string }) {
  const titleSize = fontSizeFor(args.title, 62, 46, [[42, 6], [70, 8]]);
  const titleLines = wrapText(args.title, 25, 3);
  const bodyLines = wrapText(args.body, 38, 3);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${baseDefs(titleSize, 36)}
  ${background()}
  ${header()}
  ${photoOrPlaceholder({ x: 90, y: 220, width: 900, height: 520, clipId: "photoClip", photoUrl: args.photoUrl, theme: args.photoTheme })}
  <rect x="90" y="705" width="900" height="420" rx="54" fill="url(#card)" filter="url(#shadow)"/>
  <text x="150" y="790" class="kicker">${escapeXml(args.kicker)}</text>
  ${centeredTextBlock({ lines: titleLines, x: 540, centerY: 905, lineHeight: titleSize * 1.02, className: "title" })}
  ${centeredTextBlock({ lines: bodyLines, x: 540, centerY: 1044, lineHeight: 44, className: "body" })}
  ${footer(args.cta, args.index, args.total)}
</svg>`;
}

function buildPhotoSplit(args: { kicker: string; title: string; body: string; cta: string; index: number; total: number; photoUrl?: string; photoTheme?: string }) {
  const titleSize = fontSizeFor(args.title, 58, 43, [[38, 6], [62, 8]]);
  const titleLines = wrapText(args.title, 18, 4);
  const bodyLines = wrapText(args.body, 23, 6);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${baseDefs(titleSize, 34)}
  ${background()}
  ${header()}
  <rect x="70" y="220" width="940" height="900" rx="64" fill="#FFFFFF" opacity="0.18"/>
  ${photoOrPlaceholder({ x: 90, y: 255, width: 430, height: 780, clipId: "splitPhotoClip", photoUrl: args.photoUrl, theme: args.photoTheme })}
  <rect x="495" y="255" width="495" height="780" rx="52" fill="url(#card)" filter="url(#shadow)"/>
  <text x="555" y="350" class="kicker">${escapeXml(args.kicker)}</text>
  ${centeredTextBlock({ lines: titleLines, x: 742, centerY: 545, lineHeight: titleSize * 1.03, className: "title" })}
  ${centeredTextBlock({ lines: bodyLines, x: 742, centerY: 830, lineHeight: 45, className: "body" })}
  ${footer(args.cta, args.index, args.total)}
</svg>`;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function bodyFromPost(post: GeneratedPost) {
  if (post.designNotes) return post.designNotes;
  const caption = post.caption.replace(/\s+/g, " ").trim();
  return caption.length > 170 ? `${caption.slice(0, 170).trim()}…` : caption;
}

function buildMarketingSvg(post: GeneratedPost, args: { index: number; total: number; title: string; body: string; photoUrl?: string; templateType?: TemplateType }) {
  const template = args.templateType ?? post.templateType ?? (post.photoRequired ? "photo_split" : "text_card");
  const kicker = post.format.replace("instagram_", "").replace("_", " ");
  const common = {
    kicker,
    title: args.title,
    body: args.body,
    cta: post.cta || post.hashtags.slice(0, 2).join(" "),
    index: args.index,
    total: args.total,
    photoUrl: args.photoUrl,
    photoTheme: post.photoTheme
  };

  if (template === "photo_hero") return buildPhotoHero(common);
  if (template === "photo_split") return buildPhotoSplit(common);
  if (template === "carousel_education") return buildTextCard(common);
  return buildTextCard(common);
}

export function buildVisualAssets(post: GeneratedPost, postIndex: number, options: VisualAssetOptions = {}): VisualAsset[] {
  const base = safeFilename(`${postIndex + 1}-${post.title}`);
  const templateType = options.templateType ?? post.templateType;

  if (post.carouselSlides?.length) {
    return post.carouselSlides.map((slide, index) => {
      const svg = buildMarketingSvg(post, {
        index,
        total: post.carouselSlides?.length ?? 1,
        title: slide.title,
        body: slide.body,
        photoUrl: index === 0 ? options.photoUrl : undefined,
        templateType: index === 0 && options.photoUrl ? "photo_hero" : "carousel_education"
      });

      return {
        filename: `${base}-slide-${String(index + 1).padStart(2, "0")}.png`,
        label: `Slide ${index + 1}`,
        svg,
        dataUrl: svgDataUrl(svg)
      };
    });
  }

  const svg = buildMarketingSvg(post, {
    index: 0,
    total: 1,
    title: post.hook || post.title,
    body: bodyFromPost(post),
    photoUrl: options.photoUrl,
    templateType
  });

  return [{ filename: `${base}.png`, label: "Post visual", svg, dataUrl: svgDataUrl(svg) }];
}
