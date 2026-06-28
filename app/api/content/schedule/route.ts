import { NextResponse } from "next/server";
import { z } from "zod";
import { PostizClient } from "@/lib/postiz/client";

const PostSchema = z.object({
  format: z.enum(["instagram_post", "instagram_carousel", "reel_script", "story"]),
  title: z.string(),
  hook: z.string(),
  caption: z.string(),
  visualBrief: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).default([]),
  scheduledAt: z.string().optional()
});

const BodySchema = z.object({
  integrationId: z.string().min(1).optional(),
  startDateIso: z.string(),
  daysBetweenPosts: z.number().int().min(1).max(14).default(1),
  posts: z.array(PostSchema).min(1).max(50)
});

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    const integrationId = body.integrationId ?? process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID;
    if (!integrationId) throw new Error("Missing Instagram integration id.");

    const client = new PostizClient();
    const results = await client.scheduleGeneratedPosts({
      integrationId,
      posts: body.posts,
      startDateIso: body.startDateIso,
      daysBetweenPosts: body.daysBetweenPosts
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Postiz request failed" }, { status: 400 });
  }
}
