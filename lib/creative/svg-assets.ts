import { GeneratedPost } from "@/types/content";

export type VisualAsset = {
  filename: string;
  label: string;
  svg: string;
  dataUrl: string;
};

const WIDTH = 1080;
const HEIGHT = 1350;

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

function buildSlideSvg(args: {
  brand: string;
  kicker: string;
  title: string;
  body: string;
  footer: string;
  index: number;
  total: number;
}) {
  const titleLines = wrapText(args.title, 24, 4);
  const bodyLines = wrapText(args.body, 40, 8);
  const brand = escapeXml(args.brand);
  const kicker = escapeXml(args.kicker);
  const footer = escapeXml(args.footer);
  const progress = Math.round(((args.index + 1) / args.total) * 760);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbf7ff"/>
      <stop offset="0.48" stop-color="#f1e5ff"/>
      <stop offset="1" stop-color="#d9c2ff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6f3cc3"/>
      <stop offset="1" stop-color="#2f145f"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#32124f" flood-opacity="0.16"/>
    </filter>
    <style>
      .brand { font: 800 34px Arial, sans-serif; fill: #35145f; letter-spacing: 2px; }
      .kicker { font: 800 30px Arial, sans-serif; fill: #6f3cc3; letter-spacing: 5px; text-transform: uppercase; }
      .title { font: 900 78px Arial, sans-serif; fill: #171321; }
      .body { font: 500 43px Arial, sans-serif; fill: #3f3852; }
      .footer { font: 700 30px Arial, sans-serif; fill: #5e5870; }
      .counter { font: 800 30px Arial, sans-serif; fill: #ffffff; }
    </style>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="-60" cy="120" r="260" fill="#ffffff" opacity="0.55"/>
  <circle cx="1040" cy="1220" r="360" fill="#6f3cc3" opacity="0.12"/>
  <rect x="90" y="95" width="900" height="1160" rx="58" fill="#ffffff" opacity="0.88" filter="url(#shadow)"/>
  <rect x="130" y="135" width="820" height="1080" rx="42" fill="#ffffff" opacity="0.94"/>
  <text x="160" y="220" class="brand">${brand}</text>
  <text x="160" y="300" class="kicker">${kicker}</text>
  ${textBlock(titleLines, 160, 420, 86, "title")}
  ${textBlock(bodyLines, 160, 760, 56, "body")}
  <rect x="160" y="1132" width="760" height="12" rx="6" fill="#eadcff"/>
  <rect x="160" y="1132" width="${progress}" height="12" rx="6" fill="url(#accent)"/>
  <text x="160" y="1210" class="footer">${footer}</text>
  <circle cx="905" cy="1197" r="44" fill="url(#accent)"/>
  <text x="890" y="1208" class="counter">${args.index + 1}</text>
</svg>`;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildVisualAssets(post: GeneratedPost, postIndex: number, brand: string): VisualAsset[] {
  const base = safeFilename(`${postIndex + 1}-${post.title}`);

  if (post.carouselSlides?.length) {
    return post.carouselSlides.map((slide, index) => {
      const svg = buildSlideSvg({
        brand,
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
    brand,
    kicker: post.format.replace("instagram_", ""),
    title: post.hook || post.title,
    body,
    footer: post.cta || post.hashtags.slice(0, 2).join(" "),
    index: 0,
    total: 1
  });

  return [{ filename: `${base}.png`, label: "Post visual", svg, dataUrl: svgDataUrl(svg) }];
}
