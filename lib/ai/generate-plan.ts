import { ContentPlan } from "@/types/content";

const SYSTEM_PROMPT = `You are a senior social media strategist.
Convert one long script into Instagram-ready content.
Rules:
- Preserve the author's voice and concrete ideas.
- Do not invent facts, testimonials, numbers, credentials, partnerships, or case studies.
- Avoid generic motivational filler.
- Write in clear Romanian unless another language is requested.
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

export async function generateContentPlan(input: GenerateContentPlanInput): Promise<ContentPlan> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const count = input.count ?? 7;
  const language = input.language ?? "Romanian";

  const userPrompt = `Create a content plan from this script.

Language: ${language}
Brand/context: ${input.brand ?? "personal brand / small business"}
Audience: ${input.audience ?? "Instagram audience"}
Goal: ${input.goal ?? "educate, build trust, and convert attention into action"}
Number of posts: ${count}

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
      "hashtags": ["#tag"]
    }
  ]
}

Script:
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
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
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
