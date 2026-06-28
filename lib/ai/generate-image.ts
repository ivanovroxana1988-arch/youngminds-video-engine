const BRAND_IMAGE_SYSTEM_PROMPT = `You are a visual designer creating Instagram post images for YoungMinds educational brand.

Brand identity:
- Color palette: cosmic blue and purple backgrounds, yellow accents, white details
- Style: playful, warm, child-friendly, educational, rounded shapes
- Aesthetic: afterschool, play space, stars, curiosity, learning through play
- Mood: safe, joyful, imaginative, trustworthy for parents

For every image:
- Use blue/purple space-inspired backgrounds
- Add yellow accents, small stars, soft playful shapes
- Avoid stock-photo clichés and overly busy compositions
- 1:1 square or 4:5 portrait ratio composition
- No watermarks, no fake logos, no unreadable text in the image`;

export type BrandImageContext = {
  brand?: string;
  audience?: string;
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

export async function generatePostImage(
  visualBrief: string,
  context: BrandImageContext = {}
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const brand = context.brand ?? "YoungMinds";

  const prompt = `${BRAND_IMAGE_SYSTEM_PROMPT}

Brand: ${brand}
Visual brief for this post: ${visualBrief}

Create a warm, playful Instagram image that visualizes this brief in the YoungMinds universe. Blue/purple cosmic background, yellow accents, stars, rounded friendly shapes. No readable text, no watermark.`;

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
