import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { GeneratedPost } from "@/types/content";

export type VisualAsset = {
  filename: string;
  label: string;
  svg: string;
  dataUrl: string;
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
  const words = text.replace(/\s+/g, " ").trim().split(" ");
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

function textBlock(lines: string[], x: number, y: number, lineHeight: number, className: string) {
  return `<text x="${x}" y="${y}" class="${className}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
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
  <circle cx="122" cy="420" r="10" fill="${C.pink}"/>
  <path d="M930 760 l9 18 18 9 -18 9 -9 18 -9 -18 -18 -9 18 -9z" fill="${C.softBlue}" opacity="0.75"/>`;
}

function miniLogo(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
    <path d="M92 30 C116 30 131 47 128 71 C152 74 166 91 166 116 C166 144 143 166 115 166 C98 166 83 158 74 146 C64 159 49 166 31 166 C10 166 -6 150 -6 128 C-6 112 2 99 15 92 C5 80 4 62 15 49 C30 31 55 34 69 52 C75 39 83 30 92 30Z" fill="${C.yellow}" stroke="${C.orange}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M67 45 L113 154" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="80" cy="98" rx="103" ry="31" transform="rotate(-25 80 98)" fill="none" stroke="${C.indigo}" stroke-width="12"/>
    <path d="M-58 18 l12 24 24 12 -24 12 -12 24 -12 -24 -24 -12 24 -12z" fill="${C.yellow}"/>
    <path d="M178 104 l9 18 18 9 -18 9 -9 18 -9 -18 -18 -9 18 -9z" fill="${C.white}"/>
  </g>`;
}

function buildSlideSvg(args: {
  kicker: string;
  title: string;
  body: string;
  footer: string;
  index: number;
  total: number;
}) {
  const titleLines = wrapText(args.title, 22, 4);
  const bodyLines = wrapText(args.body, 38, 8);
  const kicker = escapeXml(args.kicker);
  const footer = escapeXml(args.footer);
  const progress = Math.round(((args.index + 1) / args.total) * 720);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="space" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5C70BE"/>
      <stop offset="0.52" stop-color="#354282"/>
      <stop offset="1" stop-color="#222A67"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.98"/>
      <stop offset="1" stop-color="#F6F8FF" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#050A35" flood-opacity="0.28"/>
    </filter>
    <style>
      .brand { font: 900 58px Arial, sans-serif; fill: ${C.white}; letter-spacing: 2px; }
      .tagline { font: 800 26px Arial, sans-serif; fill: ${C.softBlue}; }
      .kicker { font: 900 30px Arial, sans-serif; fill: ${C.yellow}; letter-spacing: 4px; text-transform: uppercase; }
      .title { font: 900 76px Arial, sans-serif; fill: ${C.midnight}; }
      .body { font: 500 42px Arial, sans-serif; fill: #343B6B; }
      .footer { font: 800 30px Arial, sans-serif; fill: ${C.midnight}; }
      .counter { font: 900 28px Arial, sans-serif; fill: ${C.midnight}; }
    </style>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#space)"/>
  <path d="M-80 260 C260 30 400 80 210 430 C90 650 240 710 510 585 C810 448 1040 210 1160 -50 L1160 0 L0 0 Z" fill="#7187D2" opacity="0.2"/>
  <path d="M-90 1070 C180 860 470 930 680 760 C860 614 900 346 1180 250 L1180 1390 L-90 1390 Z" fill="#0D164D" opacity="0.18"/>
  ${decorativeStars()}
  ${miniLogo(430, 80)}
  <text x="540" y="310" text-anchor="middle" class="brand">YOUNGMINDS</text>
  <text x="540" y="356" text-anchor="middle" class="tagline">afterschool si loc de joaca</text>
  <rect x="90" y="430" width="900" height="770" rx="56" fill="url(#card)" filter="url(#shadow)"/>
  <text x="150" y="520" class="kicker">${kicker}</text>
  ${textBlock(titleLines, 150, 640, 82, "title")}
  ${textBlock(bodyLines, 150, 885, 54, "body")}
  <rect x="150" y="1114" width="720" height="12" rx="6" fill="#DDE6FF"/>
  <rect x="150" y="1114" width="${progress}" height="12" rx="6" fill="${C.yellow}"/>
  <text x="150" y="1178" class="footer">${footer}</text>
  <circle cx="910" cy="1165" r="42" fill="${C.yellow}"/>
  <text x="897" y="1175" class="counter">${args.index + 1}</text>
</svg>`;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildVisualAssets(post: GeneratedPost, postIndex: number): VisualAsset[] {
  const base = safeFilename(`${postIndex + 1}-${post.title}`);

  if (post.carouselSlides?.length) {
    return post.carouselSlides.map((slide, index) => {
      const svg = buildSlideSvg({
        kicker: index === 0 ? post.format.replace("instagram_", "") : "slide",
        title: slide.title,
        body: slide.body,
        footer: post.cta || post.hashtags.slice(0, 2).join(" "),
        index,
        total: post.carouselSlides?.length ?? 1
      });

      return {
        filename: `${base}-slide-${String(index + 1).padStart(2, "0")}.png`,
        label: `Slide ${index + 1}`,
        svg,
        dataUrl: svgDataUrl(svg)
      };
    });
  }

  const body = post.caption.length > 260 ? `${post.caption.slice(0, 260).trim()}…` : post.caption;
  const svg = buildSlideSvg({
    kicker: post.format.replace("instagram_", ""),
    title: post.hook || post.title,
    body,
    footer: post.cta || post.hashtags.slice(0, 2).join(" "),
    index: 0,
    total: 1
  });

  return [{ filename: `${base}.png`, label: "Post visual", svg, dataUrl: svgDataUrl(svg) }];
}
