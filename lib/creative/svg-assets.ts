import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { GeneratedPost, StylePreset, TemplateType } from "@/types/content";

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
const DEFAULT_PHONE = "0746 220 222";
const DEFAULT_DATE = "29.06 – 28.08.2026";

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

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderLines(lines: string[], x: number, y: number, lineHeight: number, className: string) {
  return `<text x="${x}" y="${y}" class="${className}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
    .join("")}</text>`;
}

function renderCenteredLines(lines: string[], x: number, centerY: number, lineHeight: number, className: string) {
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  return `<text x="${x}" y="${startY}" text-anchor="middle" class="${className}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
    .join("")}</text>`;
}

function miniLogo(x: number, y: number, scale = 1, fill = C.white) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M92 30 C116 30 131 47 128 71 C152 74 166 91 166 116 C166 144 143 166 115 166 C98 166 83 158 74 146 C64 159 49 166 31 166 C10 166 -6 150 -6 128 C-6 112 2 99 15 92 C5 80 4 62 15 49 C30 31 55 34 69 52 C75 39 83 30 92 30Z" fill="${C.yellow}" stroke="${C.orange}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M67 45 L113 154" stroke="${fill}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="80" cy="98" rx="103" ry="31" transform="rotate(-25 80 98)" fill="none" stroke="${C.indigo}" stroke-width="12"/>
  </g>`;
}

function brandHeader(light = true) {
  const textColor = light ? C.white : C.midnight;
  const subColor = light ? "#E3EBFF" : C.indigo;
  return `${miniLogo(56, 44, 0.44, textColor)}
  <text x="145" y="95" style="font: 900 28px Arial, sans-serif; fill: ${textColor}; letter-spacing: 1px;">YOUNGMINDS</text>
  <text x="145" y="118" style="font: 700 14px Arial, sans-serif; fill: ${subColor};">afterschool și loc de joacă</text>`;
}

function defs() {
  return `<defs>
    <linearGradient id="overlayFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1F285F" stop-opacity="0.15"/>
      <stop offset="0.65" stop-color="#12183D" stop-opacity="0.48"/>
      <stop offset="1" stop-color="#0F1434" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="softOverlay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2B356F" stop-opacity="0.86"/>
      <stop offset="1" stop-color="#5668B5" stop-opacity="0.74"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#091137" flood-opacity="0.22"/>
    </filter>
    <clipPath id="rounded-lg"><rect x="0" y="0" width="1080" height="1350" rx="0"/></clipPath>
    <style>
      .titleLight { font-family: Arial, sans-serif; font-weight: 900; fill: ${C.white}; }
      .titleDark { font-family: Arial, sans-serif; font-weight: 900; fill: ${C.midnight}; }
      .bodyLight { font-family: Arial, sans-serif; font-weight: 700; fill: ${C.white}; }
      .bodyDark { font-family: Arial, sans-serif; font-weight: 700; fill: ${C.midnight}; }
      .kickerLight { font-family: Georgia, serif; font-size: 26px; fill: ${C.white}; letter-spacing: 4px; text-transform: uppercase; }
      .kickerDark { font-family: Arial, sans-serif; font-size: 26px; font-weight: 900; fill: ${C.yellow}; letter-spacing: 3px; text-transform: uppercase; }
      .pillTextDark { font-family: Arial, sans-serif; font-size: 28px; font-weight: 900; fill: ${C.midnight}; }
      .pillTextLight { font-family: Arial, sans-serif; font-size: 28px; font-weight: 900; fill: ${C.white}; }
      .smallLight { font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; fill: ${C.white}; }
      .smallDark { font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; fill: ${C.midnight}; }
    </style>
  </defs>`;
}

function photoOrPlaceholder(x: number, y: number, width: number, height: number, photoUrl?: string, theme?: string, rx = 0) {
  if (photoUrl) {
    return `<image href="${escapeXml(photoUrl)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"${rx ? ` clip-path="inset(0 round ${rx}px)"` : ""}/>`;
  }
  const lines = wrapText(theme ? `Imagine: ${theme}` : "Imagine YoungMinds", 18, 3);
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="#D8E2FF"/>
    <circle cx="${x + width / 2}" cy="${y + height / 2 - 40}" r="82" fill="${C.yellow}" opacity="0.92"/>
    <text x="${x + width / 2}" y="${y + height / 2 - 15}" text-anchor="middle" style="font-size: 74px;">📷</text>
    ${renderCenteredLines(lines, x + width / 2, y + height / 2 + 90, 34, "bodyDark")}
  </g>`;
}

function pill(x: number, y: number, width: number, height: number, fill: string, text: string, textClass = "pillTextLight") {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${fill}" filter="url(#shadow)"/>
    <text x="${x + width / 2}" y="${y + height / 2 + 10}" text-anchor="middle" class="${textClass}">${escapeXml(text)}</text>
  </g>`;
}

function chipsRow(items: string[], x: number, y: number) {
  return items
    .slice(0, 3)
    .map((item, index) => {
      const label = escapeXml(item);
      const width = Math.min(250, 30 + label.length * 12);
      const offset = index === 0 ? 0 : index === 1 ? 195 : 390;
      return `<g>
        <rect x="${x + offset}" y="${y}" width="${width}" height="48" rx="24" fill="#FF9E1A"/>
        <text x="${x + offset + width / 2}" y="${y + 31}" text-anchor="middle" style="font: 900 18px Arial, sans-serif; fill: ${C.white};">${label}</text>
      </g>`;
    })
    .join("");
}

function baseBackground() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1F275E"/>`;
}

function titleWordHighlight(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return { lead: title, accent: "" };
  return {
    lead: words.slice(0, -1).join(" "),
    accent: words[words.length - 1]
  };
}

function overlayPhotoLayout(args: { title: string; body: string; kicker: string; photoUrl?: string; photoTheme?: string }) {
  const titleSize = fontSizeFor(args.title, 96, 68, [[20, 4], [32, 6], [48, 8], [64, 10]]);
  const titleLines = wrapText(args.title, titleSize >= 88 ? 18 : 22, 4);
  const bodyLines = wrapText(args.body, 36, 3);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    ${baseBackground()}
    ${photoOrPlaceholder(0, 0, WIDTH, HEIGHT, args.photoUrl, args.photoTheme)}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#overlayFade)"/>
    ${brandHeader(true)}
    <text x="684" y="84" class="kickerLight">${escapeXml(args.kicker.toUpperCase())}</text>
    ${renderLines(titleLines, 60, 740, titleSize * 0.95, `titleLight`)}
    ${renderLines(bodyLines, 60, 1038, 58, `bodyLight`)}
    ${pill(60, 1180, 365, 80, C.yellow, `📅  ${DEFAULT_DATE}`, "pillTextDark")}
    ${pill(678, 1180, 342, 84, C.indigo, `📞  ${DEFAULT_PHONE}`, "pillTextLight")}
  </svg>`;
}

function splitShowcaseLayout(args: { title: string; body: string; kicker: string; photoUrl?: string; photoTheme?: string; chips: string[] }) {
  const titleSize = fontSizeFor(args.title, 90, 62, [[18, 4], [28, 8], [38, 8], [52, 8]]);
  const titleLines = wrapText(args.title, 15, 4);
  const bodyLines = wrapText(args.body, 23, 4);
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="540" height="1350" fill="#646FBC"/>
    <rect x="540" width="540" height="1350" fill="#F4F4F4"/>
    ${photoOrPlaceholder(540, 0, 540, 1350, args.photoUrl, args.photoTheme)}
    ${brandHeader(true)}
    <text x="55" y="228" class="kickerDark">${escapeXml(args.kicker)}</text>
    ${renderLines(titleLines, 55, 360, titleSize * 0.95, "titleLight")}
    ${renderLines(bodyLines, 55, 800, 54, "bodyLight")}
    ${chipsRow(args.chips, 55, 1048)}
    ${pill(58, 1186, 364, 82, C.indigo, `📞  ${DEFAULT_PHONE}`, "pillTextLight")}
    ${pill(815, 1188, 225, 72, C.yellow, DEFAULT_DATE.replace("2026", ""), "pillTextDark")}
  </svg>`;
}

function bottomBandLayout(args: { title: string; body: string; photoUrl?: string; photoTheme?: string }) {
  const title = titleWordHighlight(args.title);
  const leadSize = fontSizeFor(title.lead, 78, 52, [[18, 4], [32, 8], [46, 10]]);
  const accentSize = Math.max(leadSize, 66);
  const leadLines = wrapText(title.lead, 20, 3);
  const accentLine = escapeXml(title.accent || "");
  const bodyLines = wrapText(args.body, 40, 2);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    ${baseBackground()}
    ${photoOrPlaceholder(0, 0, WIDTH, 890, args.photoUrl, args.photoTheme)}
    <rect width="${WIDTH}" height="890" fill="url(#overlayFade)" opacity="0.35"/>
    ${brandHeader(true)}
    ${pill(730, 54, 292, 72, C.yellow, DEFAULT_DATE, "pillTextDark")}
    <rect x="0" y="846" width="1080" height="504" fill="${C.yellow}"/>
    ${renderLines(leadLines, 62, 958, leadSize * 0.92, "titleDark")}
    <text x="62" y="${1070 + (leadLines.length - 1) * leadSize * 0.92}" style="font-family: Arial, sans-serif; font-weight: 900; font-size: ${accentSize}px; fill: #FF9E1A;">${accentLine}</text>
    ${renderLines(bodyLines, 62, 1170, 48, "bodyDark")}
    ${pill(674, 1188, 350, 84, C.indigo, `📞  ${DEFAULT_PHONE}`, "pillTextLight")}
  </svg>`;
}

function mosaicPromoLayout(args: { title: string; body: string; photoUrl?: string; photoTheme?: string }) {
  const title = titleWordHighlight(args.title);
  const leadSize = fontSizeFor(title.lead, 88, 62, [[16, 4], [26, 8], [38, 8]]);
  const leadLines = wrapText(title.lead, 16, 2);
  const accent = escapeXml(title.accent || "");

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    ${photoOrPlaceholder(0, 0, 540, 675, args.photoUrl, args.photoTheme)}
    ${photoOrPlaceholder(540, 0, 540, 675, args.photoUrl, args.photoTheme)}
    ${photoOrPlaceholder(0, 675, 540, 675, args.photoUrl, args.photoTheme)}
    ${photoOrPlaceholder(540, 675, 540, 675, args.photoUrl, args.photoTheme)}
    <rect width="1080" height="1350" fill="url(#softOverlay)"/>
    ${brandHeader(true)}
    ${renderLines(leadLines, 58, 462, leadSize * 0.92, "titleLight")}
    <text x="${58 + Math.max(...leadLines.map((line) => line.length), 10) * 22}" y="${462 + (leadLines.length - 1) * leadSize * 0.92}" style="font-family: Arial, sans-serif; font-weight: 900; font-size: ${leadSize}px; fill: ${C.yellow};">${accent}</text>
    ${renderCenteredLines(wrapText(args.body, 38, 2), 540, 710, 54, "bodyLight")}
    ${pill(179, 795, 722, 84, C.yellow, `📞  Sună acum: ${DEFAULT_PHONE}`, "pillTextDark")}
    <text x="540" y="995" text-anchor="middle" style="font: 700 28px Georgia, serif; fill: ${C.white};">${escapeXml(`${DEFAULT_DATE} · Buzău`)}</text>
  </svg>`;
}

function chooseStylePreset(post: GeneratedPost, explicit?: StylePreset): StylePreset {
  if (explicit) return explicit;
  if (post.stylePreset) return post.stylePreset;
  if (post.templateType === "photo_split") return "split_showcase";
  if (post.templateType === "photo_hero") return "overlay_photo";
  if (post.templateType === "carousel_education") return "bottom_band";
  return post.photoRequired ? "overlay_photo" : "mosaic_promo";
}

function bodyFromPost(post: GeneratedPost) {
  if (post.designNotes) return post.designNotes;
  const caption = post.caption.replace(/\s+/g, " ").trim();
  return caption.length > 160 ? `${caption.slice(0, 160).trim()}…` : caption;
}

function chipsFromPost(post: GeneratedPost) {
  if (post.hashtags?.length) {
    return post.hashtags.slice(0, 3).map((tag) => tag.replace(/^#/, ""));
  }
  if (post.photoTheme) {
    return post.photoTheme.split(/[,·]/).map((item) => item.trim()).filter(Boolean).slice(0, 3);
  }
  return ["YoungMinds", "Atelier", "Joacă"];
}

function buildMarketingSvg(post: GeneratedPost, args: { title: string; body: string; photoUrl?: string; stylePreset?: StylePreset; templateType?: TemplateType }) {
  const stylePreset = chooseStylePreset(post, args.stylePreset);
  const kicker = post.format.replace("instagram_", "").replace(/_/g, " ");
  const common = {
    title: args.title,
    body: args.body,
    kicker,
    photoUrl: args.photoUrl,
    photoTheme: post.photoTheme
  };

  if (stylePreset === "split_showcase") {
    return splitShowcaseLayout({ ...common, chips: chipsFromPost(post) });
  }
  if (stylePreset === "bottom_band") {
    return bottomBandLayout(common);
  }
  if (stylePreset === "mosaic_promo") {
    return mosaicPromoLayout(common);
  }
  return overlayPhotoLayout(common);
}

export function buildVisualAssets(post: GeneratedPost, postIndex: number, options: VisualAssetOptions = {}): VisualAsset[] {
  const base = safeFilename(`${postIndex + 1}-${post.title}`);

  if (post.carouselSlides?.length) {
    return post.carouselSlides.map((slide, index) => {
      const svg = buildMarketingSvg(post, {
        title: slide.title,
        body: slide.body,
        photoUrl: options.photoUrl,
        stylePreset: index === 0 ? chooseStylePreset(post) : "bottom_band",
        templateType: options.templateType
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
    title: post.hook || post.title,
    body: bodyFromPost(post),
    photoUrl: options.photoUrl,
    templateType: options.templateType
  });

  return [{ filename: `${base}.png`, label: "Post visual", svg, dataUrl: svgDataUrl(svg) }];
}
