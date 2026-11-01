"use server";

import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase/session";

export async function loginAdmin(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@") || !password) {
    redirect("/admin/login?error=input");
  }

  let loginError;

  try {
    const supabase = await createSupabaseSessionClient();
    ({ error: loginError } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    redirect("/admin/login?error=server");
  }

  if (loginError) {
    redirect("/admin/login?error=credentials");
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  let logoutError;

  try {
    const supabase = await createSupabaseSessionClient();
    ({ error: logoutError } = await supabase.auth.signOut());
  } catch {
    redirect("/admin?error=logout");
  }

  if (logoutError) {
    redirect("/admin?error=logout");
  }

  redirect("/admin/login");
}

export async function ubahPasswordAdmin(formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasiPassword = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    redirect("/admin/password?error=short");
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect("/admin/password?error=mismatch");
  }

  let belumLogin = false;
  let gagalServer = false;
  let updateError;

  try {
    const supabase = await createSupabaseSessionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      belumLogin = true;
    } else {
      ({ error: updateError } = await supabase.auth.updateUser({ password: passwordBaru }));
    }
  } catch {
    gagalServer = true;
  }

  if (belumLogin) {
    redirect("/admin/login");
  }

  if (gagalServer) {
    redirect("/admin/password?error=server");
  }

  if (updateError) {
    redirect("/admin/password?error=update");
  }

  redirect("/admin/password?status=success");
}