import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePostImage } from "@/lib/ai/generate-image";
import { uploadImageToStorage } from "@/lib/ai/upload-image";

const schema = z.object({
  visualBrief: z.string().min(10),
  brand: z.string().optional(),
  postIndex: z.number().int().nonnegative().optional(),
  post: z
    .object({
      title: z.string().optional(),
      hook: z.string().optional(),
      imageType: z.string().optional(),
      photoTheme: z.string().optional(),
      photoRequired: z.boolean().optional(),
      templateType: z.string().optional(),
      stylePreset: z.string().optional(),
      designNotes: z.string().optional()
    })
    .optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    const dalleUrl = await generatePostImage(input.visualBrief, {
      brand: input.brand,
      title: input.post?.title,
      hook: input.post?.hook,
      imageType: input.post?.imageType,
      photoTheme: input.post?.photoTheme,
      photoRequired: input.post?.photoRequired,
      templateType: input.post?.templateType,
      stylePreset: input.post?.stylePreset,
      designNotes: input.post?.designNotes
    });
    const permanentUrl = await uploadImageToStorage(dalleUrl, `post-${input.postIndex ?? 0}-${Date.now()}`);

    return NextResponse.json({ imageUrl: permanentUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
