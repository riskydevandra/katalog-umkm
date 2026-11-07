"use client";

import { useRef, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action, generateDescription }) {
  const formRef = useRef(null);
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi ?? "");
  const [sedangMembuat, setSedangMembuat] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  async function buatDeskripsi() {
    if (!formRef.current) {
      return;
    }

    const dataForm = new FormData(formRef.current);
    setSedangMembuat(true);
    setPesanAI(null);

    try {
      const hasil = await generateDescription(
        String(dataForm.get("nama") ?? ""),
        String(dataForm.get("kategori") ?? ""),
      );

      if (hasil.error) {
        const pesanError = {
          unauthorized: "Sesi admin berakhir. Silakan masuk kembali.",
          input: "Isi nama produk dengan benar sebelum membuat deskripsi.",
          configuration: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di server.",
          provider: "Gemini gagal membuat deskripsi. Periksa koneksi, API key, dan kuota.",
          empty: "Gemini tidak menghasilkan deskripsi. Silakan coba lagi.",
          server: "Terjadi masalah saat memeriksa sesi admin. Silakan coba lagi.",
        };
        setPesanAI({ teks: pesanError[hasil.error] ?? pesanError.server, berhasil: false });
      } else {
        setDeskripsi(hasil.deskripsi);
        setPesanAI({ teks: "Deskripsi berhasil dibuat. Periksa kembali sebelum menyimpan.", berhasil: true });
      }
    } catch {
      setPesanAI({ teks: "Permintaan gagal dikirim. Periksa koneksi lalu coba lagi.", berhasil: false });
    } finally {
      setSedangMembuat(false);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex max-w-xl flex-col gap-4">
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <p className="-mt-3 text-xs font-normal text-teks-lembut">
        Ilustrasi animasi contoh: /produk/kopi.svg, /produk/keripik.svg, /produk/sambal.svg,
        /produk/nastar.svg, /produk/tas.svg, atau /produk/batik.svg.
      </p>
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <label htmlFor="deskripsi-produk">Deskripsi</label>
        <textarea
          id="deskripsi-produk"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <button
          type="button"
          onClick={buatDeskripsi}
          disabled={sedangMembuat}
          className="self-start rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-utama hover:border-utama disabled:cursor-wait disabled:opacity-60"
        >
          {sedangMembuat ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
        </button>
        {pesanAI ? (
          <p role={pesanAI.berhasil ? "status" : "alert"} className={pesanAI.berhasil ? "font-normal text-utama" : "font-normal text-bahaya"}>
            {pesanAI.teks}
          </p>
        ) : null}
      </div>
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
