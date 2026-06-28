import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePostImage } from "@/lib/ai/generate-image";
import { uploadImageToStorage } from "@/lib/ai/upload-image";

const schema = z.object({
  visualBrief: z.string().min(10),
  brand: z.string().optional(),
  postIndex: z.number().int().nonnegative().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    const dalleUrl = await generatePostImage(input.visualBrief, { brand: input.brand });
    const permanentUrl = await uploadImageToStorage(dalleUrl, `post-${input.postIndex ?? 0}`);

    return NextResponse.json({ imageUrl: permanentUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
