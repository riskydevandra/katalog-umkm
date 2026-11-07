import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export default async function HalamanKatalog({ searchParams }) {
  await connection();
  const params = await searchParams;
  const kataKunci = typeof params.q === "string" ? params.q.trim() : "";
  const kategoriDipilih = typeof params.kategori === "string" ? params.kategori : "";

  let daftarProduk = [];
  let gagalMemuatProduk = false;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("produk").select("*");

    if (error) {
      throw error;
    }

    daftarProduk = data;
  } catch {
    gagalMemuatProduk = true;
  }

  const daftarKategori = [...new Set(daftarProduk.map((produk) => produk.kategori).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id"));
  const hasilProduk = daftarProduk.filter((produk) => {
    const cocokNama = produk.nama.toLocaleLowerCase("id-ID").includes(kataKunci.toLocaleLowerCase("id-ID"));
    const cocokKategori = !kategoriDipilih || produk.kategori === kategoriDipilih;

    return cocokNama && cocokKategori;
  });

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        {gagalMemuatProduk ? (
          <p role="alert" className="text-bahaya">
            Produk gagal dimuat. Periksa koneksi database dan konfigurasi Supabase, lalu coba lagi.
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="text-teks-lembut">Belum ada produk</p>
        ) : (
          <>
            <form method="get" action="/" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">
                Cari nama produk
                <input
                  type="search"
                  name="q"
                  value={kataKunci}
                  placeholder="Contoh: kopi"
                  className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">
                Kategori
                <select
                  name="kategori"
                  value={kategoriDipilih}
                  className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
                >
                  <option value="">Semua kategori</option>
                  {daftarKategori.map((kategori) => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
              </label>
              <Tombol type="submit" className="self-start sm:self-auto">
                Cari produk
              </Tombol>
            </form>
            {hasilProduk.length === 0 ? (
              <p className="text-teks-lembut">
                Tidak ada produk yang sesuai. Ubah kata pencarian atau pilih kategori lain.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {hasilProduk.map((produk) => (
                  <KartuProduk key={produk.id} produk={produk} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
