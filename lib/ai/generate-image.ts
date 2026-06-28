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
    .trim();
}

function buildImagePrompt(visualBrief: string, context: BrandImageContext) {
  const brand = context.brand ?? "YoungMinds";
  const subject = [cleanFragment(context.photoTheme), cleanFragment(context.title), cleanFragment(context.hook)]
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const scene = cleanFragment(visualBrief);
  const style = cleanFragment(context.stylePreset);

  return [
    `Create one polished Instagram background image for ${brand}.`,
    "This is a background asset only, not a finished poster.",
    "Show a warm afterschool, playground, workshop or educational environment.",
    "Use blue and purple tones, yellow accents, rounded shapes and subtle star details.",
    "Show relevant objects, spaces and activity materials such as robotics kits, books, art supplies, music elements, mats, tables or outdoor play elements.",
    "Leave clear empty space for later text overlay.",
    "Absolutely no readable text, no letters, no numbers, no captions, no labels, no interface notes, no watermarks and no logos.",
    subject ? `Main subject: ${subject}.` : "",
    style ? `Preferred composition mood: ${style}.` : "",
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
