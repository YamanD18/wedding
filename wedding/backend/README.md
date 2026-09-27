# Backend RSVP → Google Spreadsheet

Undangan ini tidak butuh server sendiri. RSVP tamu (nama, kehadiran, ucapan)
dikirim langsung ke Google Spreadsheet lewat **Google Apps Script**, gratis
dan tidak perlu hosting tambahan.

## Cara Setup (± 5 menit)

1. Buat Google Spreadsheet baru di [sheets.google.com](https://sheets.google.com).
   Beri nama misalnya "RSVP Undangan".
2. Di spreadsheet itu, buka menu **Extensions → Apps Script**.
3. Hapus kode default di editor, lalu tempel seluruh isi file `apps-script.gs`
   (satu folder dengan file ini) ke editor tersebut.
4. Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - "Execute as": **Me**.
   - "Who has access": **Anyone**.
   - Klik **Deploy**, lalu izinkan akses saat diminta (Authorize access).
5. Setelah deploy selesai, salin **Web app URL** yang muncul (diakhiri `/exec`).
6. Buka file `js/script.js`, cari baris:
   ```js
   GOOGLE_SCRIPT_URL: "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI",
   ```
   Ganti dengan URL yang tadi disalin.
7. Simpan. Sekarang setiap RSVP dari tamu akan otomatis masuk sebagai baris baru
   di tab "RSVP" pada spreadsheet Anda, dan daftar ucapan tamu akan tampil
   otomatis di halaman undangan.

## Update kode Apps Script di kemudian hari

Jika `apps-script.gs` diedit lagi, kembali ke **Extensions → Apps Script**,
tempel ulang kodenya, lalu **Deploy → Manage deployments → Edit (ikon pensil)
→ Deploy** (pakai deployment yang sama supaya URL tidak berubah).

## Mode demo (tanpa setup)

Selama `GOOGLE_SCRIPT_URL` masih berisi `PASTE_...`, form RSVP tetap bisa
dicoba — datanya hanya tersimpan sementara di browser (localStorage) untuk
keperluan testing tampilan, belum masuk ke spreadsheet.

## Lokasi Google Maps

Buka `js/script.js`, cari baris `MAPS_URL`, dan ganti dengan link Google Maps
lokasi acara (Google Maps → cari lokasi → tombol "Bagikan" → "Salin link").
