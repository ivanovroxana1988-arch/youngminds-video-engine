import { ContentPlan } from "@/types/content";
import { sanitizeContentPlan } from "@/lib/content/post-quality";

const SYSTEM_PROMPT = `You are a Romanian copy editor and social media quality checker for YoungMinds.
Polish the provided JSON content plan.

Rules:
- Preserve the JSON structure and all required fields.
- Correct spelling, punctuation, grammar, diacritics, and awkward phrasing.
- Keep the tone warm, concrete, and parent-facing.
- Do not invent facts, schedules, prices, claims, or names.
- Keep hooks short and natural.
- Keep titles compact and visual.
- Keep carousel slide titles max 7 words.
- Keep carousel slide bodies max 22 words.
- Keep captions concise, scannable, and in Romanian.
- Remove prompt leakage, system comments, layout instructions, or meta instructions if any appear in the text fields.
- If a text is too long for a visual, shorten it naturally without changing the meaning.
- Return strict JSON only.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI proofreader did not return valid JSON.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function isContentPlan(value: unknown): value is ContentPlan {
  return Boolean(value && typeof value === "object" && Array.isArray((value as ContentPlan).posts));
}

export async function proofreadContentPlan(plan: ContentPlan): Promise<ContentPlan> {
  const sanitized = sanitizeContentPlan(plan);

  if (!process.env.OPENAI_API_KEY) {
    return sanitized;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        instructions: SYSTEM_PROMPT,
        input: JSON.stringify(sanitized),
        store: false
      })
    });

    if (!response.ok) {
      return sanitized;
    }

    const data = await response.json();
    const text =
      data.output_text ??
      data.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
        .map((content: { text?: string }) => content.text ?? "")
        .join("\n");

    if (!text) {
      return sanitized;
    }

    const proofread = extractJson(text);
    if (!isContentPlan(proofread)) {
      return sanitized;
    }

    return sanitizeContentPlan(proofread);
  } catch {
    return sanitized;
  }
}
