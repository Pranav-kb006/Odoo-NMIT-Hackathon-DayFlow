import { createClient } from "@/lib/supabase/client";

const LOGO_BUCKET = "logos";
const LEAVE_DOC_BUCKET = "leave-attachments";
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5MB
const DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

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
 * Upload a leave-proof document (PDF/JPG/PNG, max 5MB) to the public
 * `leave-attachments` bucket under the signed-in user's own folder. Returns
 * the public URL so the employee and reviewers can open it directly.
 */
export async function uploadLeaveDocument(file: File): Promise<UploadResult> {
  if (!file) return { ok: false, error: "No file selected" };
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, error: "File must be 5MB or smaller" };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!DOCUMENT_EXTENSIONS.includes(ext)) {
    return { ok: false, error: "Only PDF, JPG, or PNG files are allowed" };
  }

  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to upload a document" };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60);
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await db.storage
    .from(LEAVE_DOC_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = db.storage.from(LEAVE_DOC_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}