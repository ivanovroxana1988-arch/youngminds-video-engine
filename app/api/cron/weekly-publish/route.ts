import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { publishMediaContainer } from "@/lib/meta/client";

// Called by Vercel Cron every Monday at 09:00 UTC.
// Publishes all posts with status='approved' scheduled for this week.
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-vercel-cron-signature") ?? req.headers.get("authorization");
  if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();

  const weekStart = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data: pendingPosts, error } = await supabase
    .from("scheduled_social_posts")
    .select("id, meta_creation_id, title")
    .eq("status", "approved")
    .gte("scheduled_at", weekStart.toISOString())
    .lte("scheduled_at", weekEnd.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendingPosts?.length) {
    return NextResponse.json({ message: "No approved posts to publish this week", published: 0 });
  }

  const results: { id: string; status: "published" | "failed"; metaPostId?: string; error?: string }[] = [];

  for (const post of pendingPosts) {
    if (!post.meta_creation_id) {
      results.push({ id: post.id, status: "failed", error: "No meta_creation_id stored" });
      continue;
    }

    try {
      const metaPostId = await publishMediaContainer(post.meta_creation_id);

      await supabase
        .from("scheduled_social_posts")
        .update({ status: "published", meta_post_id: metaPostId })
        .eq("id", post.id);

      results.push({ id: post.id, status: "published", metaPostId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      await supabase
        .from("scheduled_social_posts")
        .update({ status: "failed" })
        .eq("id", post.id);

      results.push({ id: post.id, status: "failed", error: message });
    }
  }

  const published = results.filter((r) => r.status === "published").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({ published, failed, results });
}
