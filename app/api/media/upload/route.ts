import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Nu ai trimis niciun fișier." }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "post-images";
    const uploaded: Array<{ name: string; path: string; url: string }> = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = sanitizeFileName(file.name || `image-${Date.now()}.jpg`);
      const path = `brand-media/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false
      });

      if (error) {
        throw new Error(`Upload failed for ${file.name}: ${error.message}`);
      }

      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
      uploaded.push({
        name: file.name,
        path,
        url: publicUrl.publicUrl
      });
    }

    return NextResponse.json({ uploaded });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Media upload failed." }, { status: 500 });
  }
}
