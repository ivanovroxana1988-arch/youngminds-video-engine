import { YOUNGMINDS_BRAND, getYoungMindsActivityList } from "@/lib/brand/youngminds";
import { ContentPlan } from "@/types/content";

const SYSTEM_PROMPT = `You are the content strategist for YoungMinds, an afterschool and play space for children.
Convert one script or idea into Instagram-ready content for parents.
Rules:
- Preserve the author's concrete ideas.
- Make the content warm, playful, trustworthy, and easy for parents to understand.
- Do not invent facts, prices, discounts, schedules, staff credentials, testimonials, partnerships, safety certifications, medical claims, or guaranteed results.
- Avoid generic motivational filler and corporate language.
- Use Romanian with diacritics.
- Every post should clearly connect to YoungMinds: afterschool, play, STEM, piano, tae-kwon do, robotics, foreign languages, yoga, or child development through play.
- Return strict JSON only.
- Every post must include: format, title, hook, caption, visualBrief, cta, hashtags.
- For carousel posts, create 5-8 carouselSlides.
- For reels, create a reelScript with scenes: visual, voiceover, onScreenText.`;

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

  const count = input.count ?? 7;
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

Content strategy:
- Mix practical parent education with warm promotion.
- Include at least one carousel, one simple post, and one reel script when possible.
- Use CTAs like: programeaza o vizita, scrie-ne pentru detalii, vezi activitatile YoungMinds, vino sa ne cunosti.
- Keep claims realistic. Say what the activity can support or encourage, not what it guarantees.
- Make visualBrief match the YoungMinds universe: blue/purple space background, yellow accents, stars, playful icons, rounded shapes.

Required JSON shape:
{
  "sourceSummary": "short summary",
  "contentPillars": ["pillar 1", "pillar 2"],
  "posts": [
    {
      "format": "instagram_post | instagram_carousel | reel_script | story",
      "title": "...",
      "hook": "...",
      "caption": "...",
      "visualBrief": "...",
      "carouselSlides": [{"title":"...","body":"..."}],
      "reelScript": {"durationSeconds": 30, "scenes": [{"visual":"...","voiceover":"...","onScreenText":"..."}]},
      "cta": "...",
      "hashtags": ["#YoungMinds", "#Afterschool", "#Copii"]
    }
  ]
}

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
