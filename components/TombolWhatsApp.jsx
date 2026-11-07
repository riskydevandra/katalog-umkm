"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState("1");
  const jumlahAngka = Number(jumlah);
  const totalHarga = jumlahAngka * produk.harga;
  const jumlahValid =
    Number.isSafeInteger(jumlahAngka) &&
    jumlahAngka > 0 &&
    Number.isSafeInteger(totalHarga);
  const pesan = jumlahValid
    ? `Halo, saya ingin memesan ${produk.nama} sebanyak ${jumlahAngka} buah. Harga satuan ${formatRupiah(produk.harga)}, total ${formatRupiah(totalHarga)}.`
    : "";

  return (
    <div className="flex flex-col items-start gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Jumlah
        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={jumlah}
          onChange={(event) => setJumlah(event.target.value)}
          className="w-28 rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
        />
      </label>
      {jumlahValid ? (
        <p className="text-sm text-teks-lembut">
          Total: <span className="font-semibold text-teks">{formatRupiah(totalHarga)}</span>
        </p>
      ) : (
        <p role="alert" className="text-sm text-bahaya">
          Masukkan jumlah bilangan bulat yang valid.
        </p>
      )}
      <a
        href={
          jumlahValid
            ? `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`
            : undefined
        }
        aria-disabled={!jumlahValid}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex w-full items-center justify-center rounded-lg px-5 py-3 font-semibold text-white sm:w-auto ${
          jumlahValid ? "bg-utama hover:bg-utama-gelap" : "cursor-not-allowed bg-teks-lembut"
        }`}
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
