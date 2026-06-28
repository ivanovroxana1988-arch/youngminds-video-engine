import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { getPostQualityWarnings, getVisualBody, getVisualChips } from "@/lib/content/post-quality";
import { GeneratedPost, StylePreset, TemplateType } from "@/types/content";

export type VisualAsset = {
  filename: string;
  label: string;
  svg: string;
  dataUrl: string;
  warnings: string[];
  qualityScore: number;
};

export type VisualAssetOptions = {
  photoUrl?: string;
  templateType?: TemplateType;
};

type TextFit = {
  lines: string[];
  size: number;
  lineHeight: number;
  truncated: boolean;
};

type LayoutResult = {
  svg: string;
  warnings: string[];
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

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function wrapTextDetailed(text: string, maxChars: number, maxLines: number): { lines: string[]; truncated: boolean } {
  const words = cleanText(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let index = 0;

  while (index < words.length) {
    const word = words[index];
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
      index += 1;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  const consumedWords = lines.join(" ").replace(/…/g, "").split(" ").filter(Boolean).length;
  const truncated = consumedWords < words.length;
  if (truncated && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]+$/g, "")}…`;
  }

  return { lines: lines.map(escapeXml), truncated };
}

function fitTextBlock(
  text: string,
  candidates: Array<{ size: number; maxChars: number }>,
  maxLines: number,
  lineHeightFactor = 0.96
): TextFit {
  for (const candidate of candidates) {
    const wrapped = wrapTextDetailed(text, candidate.maxChars, maxLines);
    if (!wrapped.truncated) {
      return {
        lines: wrapped.lines,
        size: candidate.size,
        lineHeight: candidate.size * lineHeightFactor,
        truncated: false
      };
    }
  }

  const fallback = candidates[candidates.length - 1];
  const wrapped = wrapTextDetailed(text, fallback.maxChars, maxLines);
  return {
    lines: wrapped.lines,
    size: fallback.size,
    lineHeight: fallback.size * lineHeightFactor,
    truncated: true
  };
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderLines(lines: string[], x: number, y: number, lineHeight: number, style: string, anchor = "start") {
  const textAnchor = anchor === "middle" ? ' text-anchor="middle"' : "";
  return `<text x="${x}" y="${y}"${textAnchor} style="${style}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
    .join("")}</text>`;
}

function renderCenteredLines(lines: string[], x: number, centerY: number, lineHeight: number, style: string) {
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  return renderLines(lines, x, startY, lineHeight, style, "middle");
}

function miniLogo(x: number, y: number, scale = 1, fill: string = C.white) {
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
      <stop offset="0" stop-color="#1F285F" stop-opacity="0.12"/>
      <stop offset="0.65" stop-color="#12183D" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#0F1434" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="softOverlay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2B356F" stop-opacity="0.84"/>
      <stop offset="1" stop-color="#5668B5" stop-opacity="0.72"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#091137" flood-opacity="0.22"/>
    </filter>
  </defs>`;
}

function photoOrPlaceholder(x: number, y: number, width: number, height: number, photoUrl?: string, theme?: string) {
  if (photoUrl) {
    return `<image href="${escapeXml(photoUrl)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`;
  }

  const lines = wrapTextDetailed(theme ? `Imagine: ${theme}` : "Imagine YoungMinds", 18, 3).lines;
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#D8E2FF"/>
    <circle cx="${x + width / 2}" cy="${y + height / 2 - 40}" r="82" fill="${C.yellow}" opacity="0.92"/>
    <text x="${x + width / 2}" y="${y + height / 2 - 15}" text-anchor="middle" style="font-size: 74px;">📷</text>
    ${renderCenteredLines(lines, x + width / 2, y + height / 2 + 90, 34, `font-family: Arial, sans-serif; font-size: 28px; font-weight: 700; fill: ${C.midnight};`)}
  </g>`;
}

function pill(x: number, y: number, width: number, height: number, fill: string, text: string, light = false) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${fill}" filter="url(#shadow)"/>
    <text x="${x + width / 2}" y="${y + height / 2 + 10}" text-anchor="middle" style="font: 900 28px Arial, sans-serif; fill: ${light ? C.white : C.midnight};">${escapeXml(text)}</text>
  </g>`;
}

function chipsRow(items: string[], x: number, y: number, maxWidth = 420) {
  let cursor = x;
  const gap = 12;
  return items
    .slice(0, 3)
    .map((item) => {
      const label = escapeXml(item);
      const width = Math.min(170, Math.max(96, 28 + item.length * 10));
      if (cursor + width > x + maxWidth) return "";
      const group = `<g>
        <rect x="${cursor}" y="${y}" width="${width}" height="44" rx="22" fill="#FF9E1A"/>
        <text x="${cursor + width / 2}" y="${y + 28}" text-anchor="middle" style="font: 900 17px Arial, sans-serif; fill: ${C.white};">${label}</text>
      </g>`;
      cursor += width + gap;
      return group;
    })
    .join("");
}

function baseBackground() {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1F275E"/>`;
}

function titleWordHighlight(title: string) {
  const words = cleanText(title).split(/\s+/);
  if (words.length < 2) return { lead: cleanText(title), accent: "" };
  return {
    lead: words.slice(0, -1).join(" "),
    accent: words[words.length - 1]
  };
}

function collectWarnings(titleFit: TextFit, bodyFit: TextFit, prefix: string) {
  const warnings: string[] = [];
  if (titleFit.truncated) warnings.push(`${prefix}: titlul a fost scurtat pentru a încăpea bine.`);
  if (bodyFit.truncated) warnings.push(`${prefix}: textul secundar a fost scurtat pentru layout.`);
  return warnings;
}

function overlayPhotoLayout(args: { title: string; body: string; kicker: string; photoUrl?: string; photoTheme?: string }): LayoutResult {
  const titleFit = fitTextBlock(args.title, [
    { size: 92, maxChars: 16 },
    { size: 84, maxChars: 18 },
    { size: 76, maxChars: 20 },
    { size: 68, maxChars: 22 },
    { size: 60, maxChars: 24 }
  ], 3);
  const bodyFit = fitTextBlock(args.body, [
    { size: 38, maxChars: 32 },
    { size: 34, maxChars: 35 },
    { size: 30, maxChars: 38 },
    { size: 28, maxChars: 40 }
  ], 3);

  return {
    warnings: collectWarnings(titleFit, bodyFit, "Poster"),
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${defs()}
      ${baseBackground()}
      ${photoOrPlaceholder(0, 0, WIDTH, HEIGHT, args.photoUrl, args.photoTheme)}
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#overlayFade)"/>
      ${brandHeader(true)}
      <text x="820" y="86" text-anchor="end" style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 800; fill: ${C.white}; letter-spacing: 3px; text-transform: uppercase;">${escapeXml(args.kicker.toUpperCase())}</text>
      ${renderLines(titleFit.lines, 60, 758, titleFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${titleFit.size}px; font-weight: 900; fill: ${C.white};`)}
      ${renderLines(bodyFit.lines, 60, 1038, bodyFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${bodyFit.size}px; font-weight: 700; fill: ${C.white};`)}
      ${pill(60, 1184, 365, 80, C.yellow, `📅  ${DEFAULT_DATE}`, false)}
      ${pill(676, 1184, 344, 84, C.indigo, `📞  ${DEFAULT_PHONE}`, true)}
    </svg>`
  };
}

function splitShowcaseLayout(args: { title: string; body: string; kicker: string; photoUrl?: string; photoTheme?: string; chips: string[] }): LayoutResult {
  const titleFit = fitTextBlock(args.title, [
    { size: 78, maxChars: 13 },
    { size: 70, maxChars: 15 },
    { size: 62, maxChars: 17 },
    { size: 56, maxChars: 18 }
  ], 3);
  const bodyFit = fitTextBlock(args.body, [
    { size: 30, maxChars: 24 },
    { size: 28, maxChars: 26 },
    { size: 26, maxChars: 28 },
    { size: 24, maxChars: 30 }
  ], 4);

  return {
    warnings: collectWarnings(titleFit, bodyFit, "Split layout"),
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${defs()}
      <rect width="540" height="1350" fill="#5668B5"/>
      ${photoOrPlaceholder(540, 0, 540, 1350, args.photoUrl, args.photoTheme)}
      <rect x="540" width="540" height="1350" fill="#10204A" opacity="0.08"/>
      ${brandHeader(true)}
      <text x="56" y="220" style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 900; fill: ${C.yellow}; letter-spacing: 2px; text-transform: uppercase;">${escapeXml(args.kicker)}</text>
      ${renderLines(titleFit.lines, 56, 334, titleFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${titleFit.size}px; font-weight: 900; fill: ${C.white};`)}
      ${renderLines(bodyFit.lines, 56, 688, bodyFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${bodyFit.size}px; font-weight: 700; fill: ${C.white};`)}
      ${chipsRow(args.chips, 56, 1010, 420)}
      ${pill(56, 1184, 356, 82, C.indigo, `📞  ${DEFAULT_PHONE}`, true)}
      ${pill(790, 1184, 234, 74, C.yellow, DEFAULT_DATE.replace("2026", ""), false)}
    </svg>`
  };
}

function bottomBandLayout(args: { title: string; body: string; photoUrl?: string; photoTheme?: string }): LayoutResult {
  const title = titleWordHighlight(args.title);
  const leadFit = fitTextBlock(title.lead || args.title, [
    { size: 72, maxChars: 18 },
    { size: 66, maxChars: 20 },
    { size: 60, maxChars: 22 },
    { size: 54, maxChars: 24 }
  ], 2);
  const accentFit = fitTextBlock(title.accent || "", [
    { size: 76, maxChars: 12 },
    { size: 70, maxChars: 14 },
    { size: 62, maxChars: 16 }
  ], 1);
  const bodyFit = fitTextBlock(args.body, [
    { size: 30, maxChars: 36 },
    { size: 28, maxChars: 38 },
    { size: 26, maxChars: 40 }
  ], 2);
  const warnings = collectWarnings(leadFit, bodyFit, "Bottom band");
  if (accentFit.truncated) warnings.push("Bottom band: accentul din titlu a fost scurtat.");
  const accentY = 1010 + (leadFit.lines.length - 1) * leadFit.lineHeight;

  return {
    warnings,
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${defs()}
      ${baseBackground()}
      ${photoOrPlaceholder(0, 0, WIDTH, 860, args.photoUrl, args.photoTheme)}
      <rect width="${WIDTH}" height="860" fill="url(#overlayFade)" opacity="0.34"/>
      ${brandHeader(true)}
      ${pill(730, 54, 292, 72, C.yellow, DEFAULT_DATE, false)}
      <rect x="0" y="834" width="1080" height="516" fill="${C.yellow}"/>
      ${renderLines(leadFit.lines, 62, 944, leadFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${leadFit.size}px; font-weight: 900; fill: ${C.midnight};`)}
      ${accentFit.lines.length ? renderLines(accentFit.lines, 62, accentY, accentFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${accentFit.size}px; font-weight: 900; fill: ${C.orange};`) : ""}
      ${renderLines(bodyFit.lines, 62, 1176, bodyFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${bodyFit.size}px; font-weight: 700; fill: ${C.midnight};`)}
      ${pill(670, 1184, 354, 84, C.indigo, `📞  ${DEFAULT_PHONE}`, true)}
    </svg>`
  };
}

function mosaicPromoLayout(args: { title: string; body: string; photoUrl?: string; photoTheme?: string }): LayoutResult {
  const title = titleWordHighlight(args.title);
  const leadFit = fitTextBlock(title.lead || args.title, [
    { size: 82, maxChars: 15 },
    { size: 74, maxChars: 16 },
    { size: 66, maxChars: 18 },
    { size: 58, maxChars: 20 }
  ], 2);
  const accentFit = fitTextBlock(title.accent || "", [
    { size: 82, maxChars: 10 },
    { size: 74, maxChars: 12 },
    { size: 66, maxChars: 14 }
  ], 1);
  const bodyFit = fitTextBlock(args.body, [
    { size: 32, maxChars: 34 },
    { size: 28, maxChars: 38 },
    { size: 26, maxChars: 40 }
  ], 2);
  const warnings = collectWarnings(leadFit, bodyFit, "Mosaic promo");
  if (accentFit.truncated) warnings.push("Mosaic promo: accentul din titlu a fost scurtat.");

  return {
    warnings,
    svg: `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${defs()}
      ${photoOrPlaceholder(0, 0, 540, 675, args.photoUrl, args.photoTheme)}
      ${photoOrPlaceholder(540, 0, 540, 675, args.photoUrl, args.photoTheme)}
      ${photoOrPlaceholder(0, 675, 540, 675, args.photoUrl, args.photoTheme)}
      ${photoOrPlaceholder(540, 675, 540, 675, args.photoUrl, args.photoTheme)}
      <rect width="1080" height="1350" fill="url(#softOverlay)"/>
      ${brandHeader(true)}
      ${renderLines(leadFit.lines, 58, 456, leadFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${leadFit.size}px; font-weight: 900; fill: ${C.white};`)}
      ${accentFit.lines.length ? renderLines(accentFit.lines, 58, 456 + leadFit.lines.length * leadFit.lineHeight, accentFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${accentFit.size}px; font-weight: 900; fill: ${C.yellow};`) : ""}
      ${renderCenteredLines(bodyFit.lines, 540, 730, bodyFit.lineHeight, `font-family: Arial, sans-serif; font-size: ${bodyFit.size}px; font-weight: 700; fill: ${C.white};`)}
      ${pill(180, 810, 720, 84, C.yellow, `📞  Sună acum: ${DEFAULT_PHONE}`, false)}
      <text x="540" y="998" text-anchor="middle" style="font: 700 28px Georgia, serif; fill: ${C.white};">${escapeXml(`${DEFAULT_DATE} · Buzău`)}</text>
    </svg>`
  };
}

function chooseStylePreset(post: GeneratedPost, explicit?: StylePreset): StylePreset {
  if (explicit) return explicit;
  if (post.stylePreset) return post.stylePreset;
  if (post.templateType === "photo_split") return "split_showcase";
  if (post.templateType === "photo_hero") return "overlay_photo";
  if (post.templateType === "carousel_education") return "bottom_band";
  return post.photoRequired ? "overlay_photo" : "mosaic_promo";
}

function chooseSafeStylePreset(post: GeneratedPost, explicit: StylePreset | undefined, title: string, body: string) {
  let stylePreset = chooseStylePreset(post, explicit);
  if ((stylePreset === "overlay_photo" || stylePreset === "mosaic_promo") && (title.length > 28 || body.length > 118)) {
    stylePreset = "split_showcase";
  }
  if (stylePreset === "split_showcase" && body.length > 132) {
    stylePreset = "bottom_band";
  }
  return stylePreset;
}

function buildMarketingSvg(post: GeneratedPost, args: { title: string; body: string; photoUrl?: string; stylePreset?: StylePreset; templateType?: TemplateType }): LayoutResult {
  const stylePreset = chooseSafeStylePreset(post, args.stylePreset, args.title, args.body);
  const kicker = post.format.replace("instagram_", "").replace(/_/g, " ");
  const common = {
    title: args.title,
    body: args.body,
    kicker,
    photoUrl: args.photoUrl,
    photoTheme: post.photoTheme
  };

  if (stylePreset === "split_showcase") {
    return splitShowcaseLayout({ ...common, chips: getVisualChips(post) });
  }
  if (stylePreset === "bottom_band") {
    return bottomBandLayout(common);
  }
  if (stylePreset === "mosaic_promo") {
    return mosaicPromoLayout(common);
  }
  return overlayPhotoLayout(common);
}

function qualityScoreForWarnings(warnings: string[]) {
  return Math.max(48, 100 - warnings.length * 16);
}

export function buildVisualAssets(post: GeneratedPost, postIndex: number, options: VisualAssetOptions = {}): VisualAsset[] {
  const base = safeFilename(`${postIndex + 1}-${post.title}`);
  const postWarnings = getPostQualityWarnings(post);

  if (post.carouselSlides?.length) {
    return post.carouselSlides.map((slide, index) => {
      const result = buildMarketingSvg(post, {
        title: slide.title,
        body: slide.body,
        photoUrl: options.photoUrl,
        stylePreset: index === 0 ? chooseStylePreset(post) : "bottom_band",
        templateType: options.templateType
      });
      const warnings = [...postWarnings, ...result.warnings];

      return {
        filename: `${base}-slide-${String(index + 1).padStart(2, "0")}.png`,
        label: `Slide ${index + 1}`,
        svg: result.svg,
        dataUrl: svgDataUrl(result.svg),
        warnings,
        qualityScore: qualityScoreForWarnings(warnings)
      };
    });
  }

  const result = buildMarketingSvg(post, {
    title: post.hook || post.title,
    body: getVisualBody(post),
    photoUrl: options.photoUrl,
    templateType: options.templateType
  });
  const warnings = [...postWarnings, ...result.warnings];

  return [{
    filename: `${base}.png`,
    label: "Post visual",
    svg: result.svg,
    dataUrl: svgDataUrl(result.svg),
    warnings,
    qualityScore: qualityScoreForWarnings(warnings)
  }];
}
