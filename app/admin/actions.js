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
    ({ error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    }));
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

export async function buatDeskripsiProdukAdmin(namaInput, kategoriInput) {
  let supabase;

  try {
    supabase = await createSupabaseSessionClient();
  } catch (error) {
    console.error("Gagal menyiapkan sesi admin untuk deskripsi AI:", error);
    return { error: "server" };
  }

  let user;

  try {
    const {
      data: { user: admin },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Gagal memverifikasi sesi admin untuk deskripsi AI:", authError);
      return { error: "server" };
    }

    user = admin;
  } catch (error) {
    console.error("Gagal memverifikasi sesi admin untuk deskripsi AI:", error);
    return { error: "server" };
  }

  if (!user) {
    return { error: "unauthorized" };
  }

  const nama = typeof namaInput === "string" ? namaInput.trim() : "";
  const kategori = typeof kategoriInput === "string" ? kategoriInput.trim() : "";

  if (!nama || nama.length > 120 || kategori.length > 80) {
    return { error: "input" };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { error: "configuration" };
  }

  const endpoint = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  );

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "Tulis deskripsi produk dalam bahasa Indonesia yang menarik, alami, dan jujur.",
                  "Gunakan maksimal 2 kalimat. Jangan menambahkan klaim atau detail yang tidak diberikan.",
                  `Nama produk: ${nama}`,
                  `Kategori: ${kategori || "tidak disebutkan"}`,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 160,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    console.error("Permintaan deskripsi ke Gemini gagal:", error);
    return { error: "provider" };
  }

  if (!response.ok) {
    console.error("Gemini menolak permintaan deskripsi dengan status:", response.status);
    return { error: "provider" };
  }

  let hasil;

  try {
    hasil = await response.json();
  } catch (error) {
    console.error("Respons deskripsi Gemini tidak dapat dibaca:", error);
    return { error: "provider" };
  }

  const bagianTeks = hasil?.candidates?.[0]?.content?.parts;
  const deskripsi = Array.isArray(bagianTeks)
    ? bagianTeks
    ?.map((bagian) => bagian.text ?? "")
    .join("")
    .trim()
    : "";

  if (!deskripsi) {
    console.error("Gemini tidak mengembalikan teks deskripsi produk.");
    return { error: "empty" };
  }

  return { deskripsi };
}

export async function tambahProdukAdmin(formData) {
  let supabase;
  let belumLogin = false;
  let gagalServer = false;

  try {
    supabase = await createSupabaseSessionClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      belumLogin = true;
    }
  } catch {
    gagalServer = true;
  }

  if (belumLogin) {
    redirect("/admin/login");
  }

  if (gagalServer) {
    redirect("/admin/produk/baru?error=server");
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const hargaInput = String(formData.get("harga") ?? "").trim();
  const harga = Number(hargaInput);

  if (!nama || !hargaInput || !Number.isSafeInteger(harga) || harga < 0) {
    redirect("/admin/produk/baru?error=input");
  }

  const produk = {
    nama,
    harga,
    kategori: String(formData.get("kategori") ?? "").trim() || null,
    foto_url: String(formData.get("foto_url") ?? "").trim() || null,
    deskripsi: String(formData.get("deskripsi") ?? "").trim() || null,
  };

  let insertError;

  try {
    ({ error: insertError } = await supabase.from("produk").insert(produk));
  } catch {
    redirect("/admin/produk/baru?error=server");
  }

  if (insertError) {
    redirect("/admin/produk/baru?error=save");
  }

  redirect("/admin");
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      belumLogin = true;
    } else {
      ({ error: updateError } = await supabase.auth.updateUser({
        password: passwordBaru,
      }));
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
