import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePostImage } from "@/lib/ai/generate-image";
import { uploadImageToStorage } from "@/lib/ai/upload-image";
import { createMediaContainer, publishMediaContainer } from "@/lib/meta/client";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  post: z.object({
    format: z.string(),
    title: z.string().optional(),
    hook: z.string().optional(),
    caption: z.string(),
    visualBrief: z.string(),
    cta: z.string().optional(),
    hashtags: z.array(z.string()).optional()
  }),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
  contentScriptId: z.string().uuid().optional()
});

function buildCaption(post: z.infer<typeof schema>["post"]): string {
  const parts: string[] = [];
  if (post.hook) parts.push(post.hook);
  parts.push(post.caption);
  if (post.cta) parts.push(`\n${post.cta}`);
  if (post.hashtags?.length) parts.push(`\n${post.hashtags.join(" ")}`);
  return parts.join("\n\n");
}

function toPublicImageUrl(imageUrl: string | undefined, req: NextRequest) {
  if (!imageUrl) return undefined;
  return new URL(imageUrl, req.nextUrl.origin).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post, brand, imageUrl: selectedImageUrl, contentScriptId } = schema.parse(body);

    let imageUrl = toPublicImageUrl(selectedImageUrl, req);
    if (!imageUrl) {
      const dalleUrl = await generatePostImage(post.visualBrief, { brand });
      imageUrl = await uploadImageToStorage(dalleUrl, `publish-${Date.now()}`);
    }

    const caption = buildCaption(post);
    const creationId = await createMediaContainer(imageUrl, caption);
    const postId = await publishMediaContainer(creationId);

    try {
      const supabase = createServiceSupabaseClient();
      await supabase.from("scheduled_social_posts").insert({
        content_script_id: contentScriptId ?? null,
        platform: "instagram",
        format: post.format,
        title: post.title ?? null,
        hook: post.hook ?? null,
        caption: post.caption,
        visual_brief: post.visualBrief,
        cta: post.cta ?? null,
        hashtags: post.hashtags ?? [],
        image_url: imageUrl,
        status: "published",
        meta_post_id: postId,
        scheduled_at: new Date().toISOString()
      });
    } catch {
      // Persistence is optional — log but don't fail the request
    }

    return NextResponse.json({ success: true, postId, imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
