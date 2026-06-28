export type BrandImageContext = {
  brand?: string;
  audience?: string;
  title?: string;
  hook?: string;
  imageType?: string;
  photoTheme?: string;
  photoRequired?: boolean;
  templateType?: string;
  stylePreset?: string;
  designNotes?: string;
};

function parseOpenAIImageError(status: number, body: string) {
  try {
    const data = JSON.parse(body);
    const code = data?.error?.code;
    const message = data?.error?.message;

    if (status === 429 && code === "insufficient_quota") {
      return "OpenAI API nu are credit sau billing activ pentru generarea imaginilor. Verifică Billing, Usage Limits și cheia API din Vercel. ChatGPT Plus nu acoperă automat costurile API.";
    }

    if (status === 429) {
      return `OpenAI Images API a returnat 429. ${message ?? "Ai atins o limită de rată sau de buget."}`;
    }

    return `OpenAI Images request failed: ${status} ${message ?? body}`;
  } catch {
    return `OpenAI Images request failed: ${status} ${body}`;
  }
}

function cleanFragment(value?: string) {
  return (value || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .replace(/post context\s*:/gi, "")
    .replace(/layout style\s*:/gi, "")
    .replace(/design notes\s*:/gi, "")
    .replace(/visual brief\s*:/gi, "")
    .replace(/template type\s*:/gi, "")
    .replace(/style preset\s*:/gi, "")
    .replace(/theme\s*:/gi, "")
    .replace(/do not include[^.]*\.?/gi, "")
    .replace(/leave clear[^.]*\.?/gi, "")
    .trim();
}

function buildImagePrompt(visualBrief: string, context: BrandImageContext) {
  const brand = context.brand ?? "YoungMinds";
  const subject = [cleanFragment(context.photoTheme), cleanFragment(context.title)]
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const scene = cleanFragment(visualBrief);
  const style = cleanFragment(context.stylePreset);

  return [
    `Create one rich, polished Instagram background image for ${brand}.`,
    "Visual feel: warm lifestyle editorial, premium afterschool brand, playful learning, soft natural light, gentle depth of field, welcoming atmosphere.",
    "Composition: cinematic 1:1 marketing background, clean but not sterile, with visual depth and a clear focal area.",
    "Brand palette: deep blue, soft purple, warm yellow accents, white highlights, rounded shapes, subtle stars, joyful details.",
    "Scene elements: learning corners, activity tables, robotics kits, art supplies, books, music details, yoga mats, playful outdoor corners, craft materials, toys, colorful educational objects.",
    "The scene may suggest activity and movement through objects, hands, shadows or soft silhouettes, but avoid close-up faces or portrait-style subjects.",
    "Keep part of the image calm and uncluttered so the app can place the headline later.",
    "Critical rule: background asset only. No readable text, no letters, no numbers, no captions, no labels, no interface notes, no watermarks, no logos.",
    subject ? `Main visual theme: ${subject}.` : "",
    style ? `Layout support: ${style}.` : "",
    scene ? `Scene direction: ${scene}.` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function extractImageUrl(data: any) {
  const first = data?.data?.[0];
  if (first?.url) return first.url as string;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return undefined;
}

export async function generatePostImage(
  visualBrief: string,
  context: BrandImageContext = {}
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const prompt = buildImagePrompt(visualBrief, context);
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
  const quality = process.env.OPENAI_IMAGE_QUALITY ?? "medium";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      quality,
      output_format: "png"
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(parseOpenAIImageError(response.status, err));
  }

  const data = await response.json();
  const imageUrl = extractImageUrl(data);

  if (!imageUrl) {
    throw new Error("OpenAI Images API returned no usable image URL or base64 image.");
  }

  return imageUrl;
}
