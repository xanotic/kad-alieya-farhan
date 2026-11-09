# Panduan: sambungkan RSVP ke spreadsheet (percuma, ~10 minit)

Tiada database. Setiap kali tetamu tekan **Hantar jawapan**, satu baris terus masuk ke Google Sheet.
Keluarga cuma buka spreadsheet tu (view sahaja) untuk tengok siapa datang. Kalau nak Excel:
**File → Download → Microsoft Excel (.xlsx)** bila-bila masa.

> Kenapa Google Sheet, bukan Excel API? API Excel (Microsoft Graph) perlukan daftar app di Azure,
> login OAuth dan server sendiri untuk simpan token, jadi tak boleh terus dari website statik.
> Google Apps Script percuma, tiada server, dan Sheet boleh dibuka/dimuat turun sebagai Excel.

## 1. Buat Sheet + skrip
1. Buka <https://sheets.new> (guna akaun Google keluarga). Namakan: `RSVP Walimatulurus Alieya & Farhan`.
2. Menu **Extensions → Apps Script**.
3. Padam semua kod contoh, tampal isi fail `rsvp-apps-script.gs`, tekan **Save** (ikon disket).
4. Di atas, pilih fungsi **setup** → tekan **Run**. Benarkan akses bila diminta
   (Advanced → Go to project → Allow). Tab **RSVP** dan **Ringkasan** akan muncul dalam Sheet.

## 2. Terbitkan sebagai Web App
1. **Deploy → New deployment** → ikon gear → **Web app**.
2. *Execute as*: **Me** · *Who has access*: **Anyone**.
3. **Deploy** → salin **Web app URL** (hujung dengan `/exec`).

## 3. Masukkan URL dalam kad
Buka `index.html`, cari bahagian `CONFIG` (dekat bawah, dalam `<script>`), dan tampal:

```js
RSVP_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

Selagi `RSVP_URL` kosong, kad berjalan dalam **mod percubaan**: borang berfungsi tetapi jawapan
hanya disimpan dalam pelayar sendiri, dan ada nota kuning di atas borang.

## 4. Kongsi dengan keluarga
Dalam Sheet: **Share** → tambah emel keluarga → pilih **Viewer**.
Tab **Ringkasan** tunjuk jumlah jawapan, keluarga hadir, **jumlah orang hadir**, dan tidak hadir.

## 5. Online-kan kad (percuma)
Pilih satu:
- **Netlify Drop**: buka <https://app.netlify.com/drop>, seret folder `Kad Alieya Farhan` ke situ. Siap.
- **GitHub Pages**: upload folder ke repo, Settings → Pages → deploy dari branch `main`.

Lepas dapat link, buka `index.html` dan tukar `og:image` kepada link penuh
(contoh `https://kad-alieya-farhan.netlify.app/assets/og.jpg`) supaya preview WhatsApp keluar gambar.

## Tips
- **Link nama tetamu**: tambah `?to=` di hujung link, contoh
  `https://.../?to=Encik%20Ahmad%20sekeluarga`. Kad tunjuk "Kepada Encik Ahmad sekeluarga",
  ganti baris gelaran, isi nama dalam borang, dan Sheet rekod nama itu di kolum *Pautan jemputan*.
- **Tiada duplikat**: tetamu yang hantar semula dengan nombor telefon sama akan *mengemas kini* baris lama.
- **Muzik latar**: letak fail lagu sebagai `assets/lagu.mp3`. Butang muzik muncul sendiri bila fail ada.
- **Had bilangan orang**: tukar `MAX_PAX` dalam `index.html` *dan* dalam skrip (kedua-dua, kini 6).
- Jika ubah kod skrip selepas deploy: **Deploy → Manage deployments → Edit (pensel) → Version: New version → Deploy**.
  URL kekal sama.
- Dinding ucapan hanya paparkan nama + ucapan. Nombor telefon tidak pernah dihantar ke website.
