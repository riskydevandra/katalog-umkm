import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HalamanAdmin() {
  await connection();

  let daftarProduk = [];
  let gagalMemuatProduk = false;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    daftarProduk = data;
  } catch {
    gagalMemuatProduk = true;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {gagalMemuatProduk ? (
        <p role="alert" className="text-bahaya">
          Produk gagal dimuat. Periksa koneksi database dan konfigurasi Supabase, lalu coba lagi.
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
