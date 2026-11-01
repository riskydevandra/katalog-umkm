# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** Baca AGENTS.md dan docs/user-stories.md bagian US-01. Ubah `app/page.jsx` agar mengambil produk dari tabel `produk` di Supabase pada sisi server, menggunakan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`. Gunakan `KartuProduk`, tampilkan pesan error atau "Belum ada produk", dan hapus `CatatanBelumAktif`.

**Hasil:** Katalog membaca produk melalui helper Supabase server, tetap memakai `KartuProduk`, dan menampilkan status error atau kosong.

**Perbaikan:** Build awal menunjukkan beranda diprerender statis. Tambahkan `connection()` agar query berjalan saat request.

## US-02 Detail produk

**Prompt:** Baca US-02. Ubah `app/produk/[id]/page.jsx` agar mengambil satu produk dari Supabase berdasarkan `id` URL di server, panggil `notFound()` jika tidak ditemukan, pertahankan tampilan dan tombol WhatsApp, lalu hapus `CatatanBelumAktif`.

**Hasil:** Halaman detail menggunakan query berdasarkan ID dan menampilkan halaman tidak ditemukan untuk produk yang tidak ada.

**Perbaikan:** ID nonnumerik ditangani sebagai 404 dan kegagalan query menampilkan pesan yang aman, bukan objek error Supabase mentah.

## US-03 Pesan via WhatsApp

**Prompt:** Baca bagian US-03 di `docs/rancangan-teknis.md`. Ubah `TombolWhatsApp.jsx` menjadi tautan `wa.me` ke nomor `lib/toko.js`, dengan pesan nama dan harga produk dalam format rupiah, di-encode memakai `encodeURIComponent`, dibuka di tab baru, dan pertahankan tampilannya. Hapus catatan US-03 di halaman detail.

**Hasil:** Tombol menjadi tautan WhatsApp dengan nama dan harga produk terisi otomatis; kelas tampilannya tetap.

**Perbaikan:** Catatan US-03 di halaman detail sudah dihapus pada pengerjaan US-02, sehingga tidak perlu perubahan ulang.

## US-04 Login admin

**Prompt:** Baca aturan keamanan dan US-04. Buat login admin memakai Supabase Auth, `@supabase/ssr`, cookie, `SUPABASE_URL`, dan `SUPABASE_PUBLISHABLE_KEY`. Proses dengan Server Action, tampilkan error login, arahkan login berhasil ke `/admin`, fungsikan tombol keluar, pertahankan tampilan, dan hapus `CatatanBelumAktif`.

**Hasil:** Login dan logout diproses lewat Server Actions dengan sesi cookie Supabase; halaman login menampilkan pesan error.

**Perbaikan:** Helper sesi server dan `proxy.js` ditambahkan untuk mendukung cookie serta perlindungan rute admin.

## US-05 Ganti password

**Prompt:** Baca US-05. Buat Server Action untuk mengganti password admin yang login. Validasi password minimal 8 karakter dan konfirmasi harus sama, tampilkan pesan berhasil/error, hubungkan ke form tanpa mengubah tampilan, dan hapus `CatatanBelumAktif`.

**Hasil:** Form terhubung ke Server Action yang memverifikasi sesi sebelum memperbarui password dan menampilkan hasilnya.

**Perbaikan:** Validasi dilakukan di server; pengguna tanpa sesi dialihkan ke halaman login.

## US-06 Proteksi halaman admin

**Prompt:** Baca aturan keamanan nomor 3 dan 4 serta US-06. Pastikan semua rute `/admin` kecuali login memerlukan Supabase Auth dan mengalihkan pengguna tanpa sesi ke `/admin/login`. Pastikan setiap Server Action yang mengubah data memeriksa login, lalu hapus `CatatanBelumAktif` dari `/admin`.

**Hasil:** `proxy.js` melindungi `/admin/:path*` kecuali `/admin/login`; halaman admin tidak lagi menampilkan catatan placeholder.

**Perbaikan:** Aksi ganti password yang mengubah data memeriksa pengguna lewat `getUser()` sebelum update.

## Debugging dan fitur bonus

### URL Supabase tidak valid

**Prompt:** Beranda menampilkan "Produk gagal dimuat"; cari penyebabnya dari konfigurasi Supabase.

**Hasil:** Probe read-only mengembalikan `PGRST125` karena `SUPABASE_URL` berisi jalur `/rest/v1/`, yang ditambahkan otomatis oleh SDK.

**Perbaikan:** Ubah `SUPABASE_URL` di `.env.local` menjadi URL dasar proyek dan validasi bahwa path-nya `/`. Secret key yang sempat terlampir perlu dirotasi.
