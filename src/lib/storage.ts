import { createClient } from "@/lib/supabase/client";

const LOGO_BUCKET = "logos";
const DOCS_BUCKET = "documents";

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

  const { error: uploadError } = await db.storage.from(LOGO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = db.storage.from(LOGO_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/**
 * Upload a leave attachment (medical cert, etc.) to the private `documents`
 * bucket at `<uid>/<file>`. Returns a time-limited signed URL for download.
 * The path prefix enforces storage RLS (owners read their own folder; admins
 * in the same company read any).
 */
export async function uploadLeaveAttachment(file: File): Promise<UploadResult> {
  if (!file) return { ok: false, error: "No file selected" };

  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await db.storage.from(DOCS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data, error: signError } = await db.storage
    .from(DOCS_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day link
  if (signError || !data) return { ok: false, error: signError?.message ?? "Sign failed" };

  return { ok: true, url: data.signedUrl };
}