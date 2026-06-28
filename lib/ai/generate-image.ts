const BRAND_IMAGE_SYSTEM_PROMPT = `You are a visual designer creating Instagram post images for YoungMinds / Lucindra educational brand.

Brand identity:
- Color palette: deep purple (#4A1D96) backgrounds, lavender (#E8D5F7) accents, white text
- Style: minimal, clean, modern — educational but approachable
- Aesthetic: European minimal design with clear hierarchy
- Typography feel: clean sans-serif, generous white space
- Mood: calm authority, intellectual warmth, not corporate

For every image:
- Use deep purple or dark gradient backgrounds
- Add minimal geometric accents in lavender
- Keep text area clean if text will be overlaid
- Avoid stock-photo clichés, avoid overly busy compositions
- 1:1 square or 4:5 portrait ratio composition
- No watermarks, no logos in the generated image`;

export type BrandImageContext = {
  brand?: string;
  audience?: string;
};

export async function generatePostImage(
  visualBrief: string,
  context: BrandImageContext = {}
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const brand = context.brand ?? "YoungMinds / Lucindra";

  const prompt = `${BRAND_IMAGE_SYSTEM_PROMPT}

Brand: ${brand}
Visual brief for this post: ${visualBrief}

Create a striking, minimal Instagram image that visualizes this brief. Deep purple background, lavender accents, modern composition. No text in the image — leave space clean for caption overlay.`;

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
    throw new Error(`DALL-E 3 request failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error("DALL-E 3 returned no image URL");
  }

  return imageUrl;
}
