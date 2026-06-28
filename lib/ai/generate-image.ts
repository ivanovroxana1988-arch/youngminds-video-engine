const BRAND_IMAGE_SYSTEM_PROMPT = `You are a visual designer creating Instagram marketing images for YoungMinds educational brand.

Brand identity:
- Color palette: cosmic blue and purple accents, yellow highlights, white details
- Style: playful, warm, child-friendly, educational, rounded shapes
- Aesthetic: afterschool, play space, stars, curiosity, learning through play
- Mood: safe, joyful, imaginative, trustworthy for parents

For every image:
- Create an original image, not a copy of any stock photo
- Prefer clean, polished marketing compositions
- No watermarks, no fake logos, no unreadable text in the image
- Keep the composition usable for Instagram marketing and later text overlays
- Show diverse, generic, non-identifiable children or learning environments when people are present
- Avoid uncanny faces, visual clutter, chaotic classrooms, and fake-looking props`;

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
  const shouldLookPhotographic = context.photoRequired || context.imageType === "real_photo" || context.imageType === "mixed";

  const modePrompt = shouldLookPhotographic
    ? `Create a polished, photorealistic, generic marketing image. Show a believable educational or play scene that matches the brief. The image should feel like an original lifestyle photo for a premium afterschool brand. Use natural human poses, warm light, clean interiors or exteriors, playful educational props, and subtle YoungMinds colors in the environment. Leave some calm visual space for text overlays.`
    : `Create a polished branded visual illustration with a clean, modern editorial look. Use graphic shapes, playful details, and a warm educational atmosphere. Leave calm space for text overlays.`;

  const stylePrompt = context.stylePreset
    ? `Preferred campaign layout style reference: ${context.stylePreset}. Examples: overlay_photo = full photo with large headline overlay; split_showcase = left text panel, right photo; bottom_band = full photo with strong band at the bottom; mosaic_promo = 2x2 collage feel. The generated image itself should support that kind of layout.`
    : "";

  const themePrompt = context.photoTheme
    ? `Important theme to visualize: ${context.photoTheme}.`
    : "";

  const contentPrompt = [context.title, context.hook, visualBrief].filter(Boolean).join(" | ");

  return `${BRAND_IMAGE_SYSTEM_PROMPT}

Brand: ${brand}
Audience: ${context.audience ?? "parents of children"}
Post context: ${contentPrompt}
Template type: ${context.templateType ?? "not specified"}
Style preset: ${context.stylePreset ?? "not specified"}
Image type requested: ${context.imageType ?? "mixed"}
${themePrompt}
${stylePrompt}
Design notes: ${context.designNotes ?? "none"}

${modePrompt}

Visual brief for this post: ${visualBrief}

Visual direction:
- keep the image friendly, aspirational, and useful for marketing
- if children are shown, depict them generically and safely, with no readable school badges or brand marks
- if the theme is robotics, STEM, piano, yoga, languages, tae-kwon do, afterschool, or play space, reflect that clearly
- subtle stars or cosmic accents are welcome, but do not turn the result into a heavy poster background unless the scene needs it
- no readable text inside the image`;
}

export async function generatePostImage(
  visualBrief: string,
  context: BrandImageContext = {}
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const prompt = buildImagePrompt(visualBrief, context);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url"
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(parseOpenAIImageError(response.status, err));
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error("DALL-E 3 returned no image URL");
  }

  return imageUrl;
}
