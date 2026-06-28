import { NextResponse } from "next/server";
import { z } from "zod";
import { generateContentPlan } from "@/lib/ai/generate-plan";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const GenerateSchema = z.object({
  script: z.string().min(50, "Scriptul trebuie să aibă cel puțin 50 de caractere."),
  brand: z.string().optional(),
  audience: z.string().optional(),
  goal: z.string().optional(),
  language: z.string().default("Romanian"),
  count: z.number().int().min(1).max(20).default(7)
});

export async function POST(request: Request) {
  try {
    const body = GenerateSchema.parse(await request.json());
    const plan = await generateContentPlan(body);

    try {
      const supabase = createServiceSupabaseClient();
      await supabase.from("content_scripts").insert({
        script: body.script,
        brand: body.brand,
        audience: body.audience,
        goal: body.goal,
        language: body.language,
        generated_plan: plan
      });
    } catch (dbError) {
      console.warn("Content plan generated but not saved:", dbError);
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Generate failed" }, { status: 400 });
  }
}
