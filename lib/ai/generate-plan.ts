import { YOUNGMINDS_BRAND, getYoungMindsActivityList } from "@/lib/brand/youngminds";
import { ContentPlan } from "@/types/content";

const SYSTEM_PROMPT = `You are the senior content strategist and creative director for YoungMinds, an afterschool and play space for children.
Convert one script or idea into high-quality Instagram marketing content for parents.

Core rules:
- Preserve the author's concrete ideas.
- Write for busy parents, not for a generic education brochure.
- Make the content warm, specific, trustworthy, visual, and easy to scan.
- Do not invent facts, prices, discounts, schedules, staff credentials, testimonials, partnerships, safety certifications, medical claims, or guaranteed results.
- Avoid filler and clichés: "dezvoltare armonioasă", "potențial maxim", "mediu ideal", "experiență unică", "activități interactive" unless made concrete.
- Use Romanian with diacritics.
- Every post should clearly connect to YoungMinds: afterschool, play, STEM, piano, tae-kwon do, robotics, foreign languages, yoga, or child development through play.
- Prefer 3-4 strong posts over many weak ones.

Copy quality rules:
- One central idea per post.
- Hooks must be short, concrete, and parent-facing.
- Captions must use short paragraphs, no walls of text.
- Each carousel slide title: max 7 words.
- Each carousel slide body: max 22 words.
- Simple post visual title/hook: max 10 words.
- CTA must be practical: programează o vizită, scrie-ne pentru detalii, vino să ne cunoști, întreabă-ne despre activități.

Design and photo rules:
- Every post must include templateType: "photo_split", "photo_hero", "text_card", or "carousel_education".
- Every post must include stylePreset: "overlay_photo", "split_showcase", "bottom_band", or "mosaic_promo".
- Use "overlay_photo" for strong photo-led enrolment or emotional activity posts.
- Use "split_showcase" when left text + right photo works well.
- Use "bottom_band" for playful community posts with strong activity photos.
- Use "mosaic_promo" for collage-style promo posts or final availability posts.
- Every post must include imageType: "real_photo", "ai_image", "graphic", or "mixed".
- For YoungMinds, prefer real_photo or mixed whenever the post is about space, children, activities, robotics, piano, yoga, tae-kwon do, STEM, or afterschool life.
- Every post must include photoTheme: a short Romanian phrase such as "copii la robotică", "pian", "yoga copii", "spațiu de joacă", "STEM la masă".
- Every post must include photoRequired: true when a real photo would make the post better.
- Every post must include designNotes: short practical notes for the layout.

Return strict JSON only.`;

type GenerateContentPlanInput = {
  script: string;
  brand?: string;
  audience?: string;
  goal?: string;
  language?: string;
  count?: number;
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI response did not contain valid JSON.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function validatePlanShape(value: unknown): ContentPlan {
  const plan = value as ContentPlan;
  if (!plan || !Array.isArray(plan.posts)) {
    throw new Error("AI response JSON has an invalid content plan shape.");
  }
  return plan;
}

function parseOpenAIError(status: number, body: string) {
  try {
    const data = JSON.parse(body);
    const code = data?.error?.code;
    const message = data?.error?.message;

    if (status === 429 && code === "insufficient_quota") {
      return "OpenAI API nu are credit sau billing activ pentru cheia setată în Vercel. Verifică Billing, Usage Limits și proiectul din care este generată cheia API. ChatGPT Plus nu acoperă automat costurile API.";
    }

    if (status === 429) {
      return `OpenAI API a returnat 429. ${message ?? "Ai atins o limită de rată sau de buget."}`;
    }

    return `OpenAI request failed: ${status} ${message ?? body}`;
  } catch {
    return `OpenAI request failed: ${status} ${body}`;
  }
}

export async function generateContentPlan(input: GenerateContentPlanInput): Promise<ContentPlan> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const count = Math.min(input.count ?? 4, 5);
  const language = input.language ?? "Romanian";

  const userPrompt = `Create a YoungMinds Instagram content plan from this script or idea.

Language: ${language}
Brand: ${YOUNGMINDS_BRAND.name} - ${YOUNGMINDS_BRAND.descriptor}
Website: ${YOUNGMINDS_BRAND.website}
Brand promise: ${YOUNGMINDS_BRAND.promise}
Brand tone: ${YOUNGMINDS_BRAND.tone}
Activities: ${getYoungMindsActivityList()}
Content pillars: ${YOUNGMINDS_BRAND.contentPillars.join("; ")}
Audience: ${input.audience ?? YOUNGMINDS_BRAND.audience}
Goal: ${input.goal ?? YOUNGMINDS_BRAND.defaultGoal}
Number of posts: ${count}

Visual identity grounding:
- YoungMinds uses real photos of children, activities, outdoor play space, and creative workshops.
- Common layouts: photo background with large headline overlay; split layout with colored text panel on the left and photo on the right; bottom colored band over a full photo; 2x2 or collage promo layout.
- Logo is small, usually top-left or centered small.
- Use white headlines, yellow highlights, blue-purple panels, rounded pills for date and phone number.
- Design should feel warm, simple, promotional, and local, not corporate.

Content strategy:
- Generate fewer, stronger posts. Quality over volume.
- Mix parent education with warm promotion.
- Include at least one carousel_education post and at least one photo-led post.
- Include at least one post that could work as an enrolment / final spots / summer promo post.
- Use concrete situations: copilul construiește, testează, greșește, repară, colaborează, întreabă, se concentrează.
- Make benefits realistic: poate susține, exersează, încurajează, ajută copilul să observe.
- Do not promise guaranteed outcomes.
- Make visualBrief and designNotes useful for a designer.

Required JSON shape:
{
  "sourceSummary": "short summary",
  "contentPillars": ["pillar 1", "pillar 2"],
  "posts": [
    {
      "format": "instagram_post | instagram_carousel | reel_script | story",
      "templateType": "photo_split | photo_hero | text_card | carousel_education",
      "stylePreset": "overlay_photo | split_showcase | bottom_band | mosaic_promo",
      "imageType": "real_photo | ai_image | graphic | mixed",
      "photoTheme": "short Romanian photo direction",
      "photoRequired": true,
      "designNotes": "short practical layout notes",
      "title": "max 10 words",
      "hook": "max 10 words",
      "caption": "short caption with 2-4 short paragraphs",
      "visualBrief": "visual direction",
      "carouselSlides": [{"title":"max 7 words","body":"max 22 words"}],
      "reelScript": {"durationSeconds": 30, "scenes": [{"visual":"...","voiceover":"...","onScreenText":"..."}]},
      "cta": "practical CTA",
      "hashtags": ["#YoungMinds", "#Afterschool", "#Copii"]
    }
  ]
}

Good example of quality:
- Bad: "Dezvoltăm potențialul copiilor prin activități interactive."
- Good: "La robotică, copilul vede imediat ce funcționează și ce trebuie schimbat. Asta îl ajută să gândească în pași, nu în răspunsuri perfecte."

Script or idea:
${input.script}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: userPrompt,
      store: false
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(parseOpenAIError(response.status, errorBody));
  }

  const data = await response.json();
  const text =
    data.output_text ??
    data.output
      ?.flatMap((item: any) => item.content ?? [])
      .map((content: any) => content.text ?? "")
      .join("\n");

  if (!text) {
    throw new Error("OpenAI response had no text output.");
  }

  return validatePlanShape(extractJson(text));
}
