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

function buildImagePrompt(visualBrief: string, context: BrandImageContext) {
  const brand = context.brand ?? "YoungMinds";
  const parts = [
    `Create one polished Instagram marketing background for ${brand}.`,
    "Use a warm afterschool and play-space mood.",
    "Use blue and purple tones, yellow accents, rounded shapes and subtle stars.",
    "Show educational objects, toys, activity tables, art materials, books, robotics kits, music details, mats or outdoor play-space elements.",
    "Leave clear space for text overlay.",
    "Do not include readable text, logos or watermarks.",
    context.title ? `Post title: ${context.title}.` : "",
    context.hook ? `Hook: ${context.hook}.` : "",
    context.photoTheme ? `Theme: ${context.photoTheme}.` : "",
    context.stylePreset ? `Layout style: ${context.stylePreset}.` : "",
    context.designNotes ? `Design notes: ${context.designNotes}.` : "",
    `Visual brief: ${visualBrief}`
  ];

  return parts.filter(Boolean).join("\n");
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
