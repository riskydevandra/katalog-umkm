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