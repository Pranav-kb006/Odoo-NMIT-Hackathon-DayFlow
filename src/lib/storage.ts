import { createClient } from "@/lib/supabase/client";

const BUCKET = "logos";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Upload an image file to the public `logos` bucket. Returns the public URL.
 * The bucket is created in Supabase with a 1MB cap and png/jpeg/webp/svg only.
 */
export async function uploadLogo(file: File): Promise<UploadResult> {
  if (!file) return { ok: false, error: "No file selected" };

  const db = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `company-${Date.now()}.${ext}`;

  const { error: uploadError } = await db.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}