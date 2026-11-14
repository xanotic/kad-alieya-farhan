# Kad Jemputan Walimatulurus Alieya & Farhan

Laman web jemputan digital untuk Walimatulurus **Alieya Husna binti Asrul Ependi & Muhammad Farhan bin Datuk Md Fauzi**, Sabtu 2 Januari 2027, Dewan Tengku Zara, Shah Alam.

**Live:** https://alieyadanfarhan.tech

## Apa ada dalam kad
- Skrin alu-aluan: sampul surat + rama-rama. Satu sentuhan buka sampul, muzik terus main (pelayar tak benarkan muzik tanpa sentuhan), kemudian ke laman utama
- Setiap scroll berhenti tepat pada satu halaman penuh (scroll snap); hero ilustrasi pengantin bawah gerbang bunga
- Teks jemputan, kiraan detik, butiran majlis, peta, atur cara
- **RSVP terus masuk Google Sheet** (tiada database), ucapan tetamu dipaparkan semula
- BM / EN, mod gelap automatik, link peribadi `?to=Nama`

## Struktur
| Fail | Guna |
|---|---|
| `index.html` | Seluruh laman (HTML + CSS + JS dalam satu fail). Tetapan di blok `CONFIG` dekat bawah, dalam `<script>` |
| `assets/` | Gambar yang dipotong dari kad Canva (bunga, khat, monogram, halaman kad) |
| `rsvp-apps-script.gs` | Kod Google Apps Script yang terima RSVP dan tulis ke Sheet |
| `PANDUAN-RSVP.md` | Langkah sediakan Google Sheet + Apps Script |
| `deploy/` | `docker-compose.yml` + `nginx.conf` yang sedang jalan di VPS |
| `versi-maroon-lama.html` | Rekaan lama (simpanan sahaja, tidak di-deploy) |

## Tukar maklumat
Buka `index.html`:
- **Tetapan** (`CONFIG`): `RSVP_URL`, `MAX_PAX` (had orang per RSVP), tarikh/masa, alamat, senarai `CONTACTS`.
- **Teks BM/EN**: objek `T` (`T.ms` dan `T.en`) betul-betul di bawah `CONFIG`.
- **Nama ibu bapa / pengantin** dalam HTML: cari `Asrul Ependi` atau `Muhammad Farhan`.
- **Warna**: token di `:root` pada bahagian atas `<style>` (`--ink` maroon, `--gold` emas, dan blok mod gelap).
- **Gambar galeri** (pilihan): letak `assets/gambar-1.jpg`, `gambar-2.jpg`, `gambar-3.jpg`, terus ganti artwork.
- **Muzik** (pilihan): letak `assets/lagu.mp3`, butang muzik muncul sendiri.

Kalau tukar `MAX_PAX`, tukar juga `MAX_PAX` dalam `rsvp-apps-script.gs`.

## Test di komputer
Buka `index.html` terus dalam Chrome. RSVP akan hantar ke Google Sheet sebenar, jadi padam baris ujian selepas test.
Untuk test tanpa sentuh Sheet, kosongkan sementara `RSVP_URL: ""` (mod percubaan, simpan dalam pelayar sahaja).

## Hosting sekarang: GitHub Pages (percuma)
Laman di-host oleh **GitHub Pages** dari branch `main` (fail `CNAME` = domain). Setiap `git push` ke `main` terus live dalam ~1 minit. Tak perlu SSH/VPS.
DNS: `A @` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`; `CNAME www` → `xanotic.github.io`.

## (Lama) Deploy ke VPS
VPS Hostinger (`179.197.242.108`, Ubuntu 24.04). Server sudah ada **Traefik** (urus port 80/443 + HTTPS Let's Encrypt automatik).
**Jangan pasang nginx/Apache terus pada host**; ia akan berebut port dengan Traefik.

Laman ini jalan sebagai container `nginx:alpine` dalam `/docker/kad-alieya-farhan/` di VPS:
```
/docker/kad-alieya-farhan/
├── docker-compose.yml   (salinan dalam deploy/)
├── nginx.conf           (salinan dalam deploy/)
└── site/                (index.html + assets/)
```

Upload perubahan (dari folder repo ini, perlukan akses SSH ke VPS):
```bash
tar -cf - index.html assets | ssh root@179.197.242.108 'tar -xf - -C /docker/kad-alieya-farhan/site'
```
Tak perlu restart. Perubahan terus live.

Kalau ubah `deploy/docker-compose.yml` atau `deploy/nginx.conf`:
```bash
scp deploy/docker-compose.yml deploy/nginx.conf root@179.197.242.108:/docker/kad-alieya-farhan/
ssh root@179.197.242.108 'cd /docker/kad-alieya-farhan && docker compose up -d'
```

Akses SSH: tambah SSH public key anda di hPanel → VPS → Settings → SSH keys.

## Domain
`alieyadanfarhan.tech` di Hostinger. DNS: `A @` dan `A www` → `179.197.242.108` (tiada rekod AAAA).
Auto-renew domain perlu dihidupkan (tamat 9 Nov 2027).

## RSVP / Google Sheet
- Tab **RSVP**: satu baris satu tetamu. Hantar semula dengan nombor telefon sama = kemas kini baris lama.
- Tab **Ringkasan**: jumlah keluarga hadir, jumlah orang, tidak hadir.
- Kalau ubah `rsvp-apps-script.gs`, tampal semula dalam Apps Script dan **Deploy → Manage deployments → Edit → New version** supaya URL kekal sama. Deployment baharu = URL baharu = perlu tukar `RSVP_URL` dan upload semula `index.html`.
