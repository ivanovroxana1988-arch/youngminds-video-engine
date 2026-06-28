import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "post-images";

    const { data, error } = await supabase.storage
      .from(bucket)
      .list("brand-media", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" }
      });

    if (error) {
      throw new Error(error.message);
    }

    const items = (data ?? [])
      .filter((item) => item.name && !item.name.endsWith("/"))
      .map((item) => {
        const path = `brand-media/${item.name}`;
        const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
        return {
          name: item.name,
          path,
          url: publicUrl.publicUrl,
          createdAt: item.created_at ?? null
        };
      });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Could not list media library." }, { status: 500 });
  }
}
