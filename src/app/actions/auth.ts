"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient as createAdminClient } from "@/lib/supabase/admin";

import { loginSchema, signupSchema } from "@/lib/validation";

export type ActionResult = { error?: string };

/** Server-side DB access only after the client boundary. */
async function db() {
  const mod = await import("@/lib/supabase/server");
  return mod.createClient();
}

/** Email + password login. On success redirects to /dashboard. */
export async function signInAction(_: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const client = await db();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message === "Invalid login credentials" ? "Wrong email or password" : error.message };
  }
  redirect("/dashboard");
}

/**
 * Company + admin signup. Creates the auth user via service-role (email
 * confirmed immediately), then inserts the company and an admin profile.
 * TODO(B4 Lokaksha): swap the /signup shell for the real visual; keep this action.
 */
export async function signUpAction(_: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const logoFile = formData.get("logo");
  const parsed = signupSchema.safeParse({
    companyName: formData.get("companyName"),
    companyCode: formData.get("companyCode"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();

  // Upload logo server-side (service role bypasses storage RLS). The browser
  // can't upload because the user isn't authenticated until signup completes,
  // and the `logos` bucket only allows authenticated uploads.
  let logoUrl: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    const ext = logoFile.name.split(".").pop()?.toLowerCase() || "png";
    const safeName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
    const path = `company-${Date.now()}-${safeName}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("logos")
      .upload(path, logoFile, { cacheControl: "3600", upsert: false, contentType: logoFile.type || "image/png" });
    if (upErr) {
      return { error: `Logo upload failed: ${upErr.message}` };
    }
    const { data } = admin.storage.from("logos").getPublicUrl(path);
    logoUrl = data.publicUrl;
  }

  // 1. auth user (confirmed so the demo team can log in instantly)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (createError) throw new Error(createError.message);
  if (!created.user) throw new Error("No user returned from signup");

  // 2. company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: parsed.data.companyName, code: parsed.data.companyCode, ...(logoUrl ? { logo_url: logoUrl } : {}) })
    .select("id")
    .single();
  if (companyError) {
    await admin.auth.admin.deleteUser(created.user.id); // roll back auth user
    throw new Error(`Could not create company: ${companyError.message}`);
  }

  // 3. admin profile
  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    company_id: company.id,
    full_name: parsed.data.fullName,
    role: "admin",
    department: "Management",
    designation: "Administrator",
    joined_on: new Date().toISOString().slice(0, 10),
    status: "active",
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(`Could not create profile: ${profileError.message}`);
  }

  redirect("/dashboard");
}

/** Sign out and return to /login. */
export async function signOutAction() {
  const client = await db();
  await client.auth.signOut();
  redirect("/login");
}