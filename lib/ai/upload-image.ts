import { createServiceSupabaseClient } from "@/lib/supabase/server";

// Downloads a temporary DALL-E URL and uploads it to Supabase Storage,
// returning a permanent public URL needed by Meta Graph API.
export async function uploadImageToStorage(temporaryUrl: string, fileName: string): Promise<string> {
  const imageResponse = await fetch(temporaryUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image from DALL-E: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const supabase = createServiceSupabaseClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "post-images";

  const path = `posts/${Date.now()}-${fileName}.jpg`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, imageBuffer, {
      contentType: "image/jpeg",
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
