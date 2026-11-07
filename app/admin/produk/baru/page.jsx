import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatDeskripsiProdukAdmin, tambahProdukAdmin } from "@/app/admin/actions";

const pesanError = {
  input: "Nama produk dan harga yang valid wajib diisi.",
  save: "Produk gagal disimpan. Periksa data lalu coba lagi.",
  server: "Produk gagal disimpan karena terjadi masalah server. Silakan coba lagi.",
};

export default async function HalamanTambahProduk({ searchParams }) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {pesanError[error] ? (
        <p role="alert" className="text-bahaya">
          {pesanError[error]}
        </p>
      ) : null}
      <FormProduk
        action={tambahProdukAdmin}
        generateDescription={buatDeskripsiProdukAdmin}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
