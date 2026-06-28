import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePostImage } from "@/lib/ai/generate-image";
import { uploadImageToStorage } from "@/lib/ai/upload-image";
import { createScheduledMediaContainer } from "@/lib/meta/client";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const postSchema = z.object({
  format: z.string(),
  title: z.string().optional(),
  hook: z.string().optional(),
  caption: z.string(),
  visualBrief: z.string(),
  cta: z.string().optional(),
  hashtags: z.array(z.string()).optional()
});

const schema = z.object({
  posts: z.array(postSchema).min(1).max(50),
  imageUrls: z.array(z.string().optional()).optional(),
  brand: z.string().optional(),
  startDateIso: z.string(),
  daysBetweenPosts: z.number().int().min(1).max(14).default(1),
  contentScriptId: z.string().uuid().optional()
});

function buildCaption(post: z.infer<typeof postSchema>): string {
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
    const { posts, imageUrls, brand, startDateIso, daysBetweenPosts, contentScriptId } = schema.parse(body);

    const startDate = new Date(startDateIso);
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    // Meta requires scheduled time >= 10 minutes in future
    if (startDate.getTime() < now + tenMinutes) {
      return NextResponse.json(
        { error: "startDateIso must be at least 10 minutes in the future" },
        { status: 400 }
      );
    }

    const results: { title?: string; scheduledAt: string; creationId: string; imageUrl: string }[] = [];
    let supabase: ReturnType<typeof createServiceSupabaseClient> | null = null;

    try {
      supabase = createServiceSupabaseClient();
    } catch {
      // optional persistence
    }

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const scheduledAt = new Date(startDate);
      scheduledAt.setDate(scheduledAt.getDate() + i * daysBetweenPosts);

      let imageUrl = toPublicImageUrl(imageUrls?.[i], req);
      if (!imageUrl) {
        const dalleUrl = await generatePostImage(post.visualBrief, { brand });
        imageUrl = await uploadImageToStorage(dalleUrl, `schedule-${Date.now()}-${i}`);
      }

      const caption = buildCaption(post);
      const creationId = await createScheduledMediaContainer(imageUrl, caption, scheduledAt);

      if (supabase) {
        try {
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
            status: "scheduled",
            meta_creation_id: creationId,
            scheduled_at: scheduledAt.toISOString()
          });
        } catch {
          // ignore persistence errors
        }
      }

      results.push({ title: post.title, scheduledAt: scheduledAt.toISOString(), creationId, imageUrl });
    }

    return NextResponse.json({ success: true, scheduled: results.length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Schedule failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
