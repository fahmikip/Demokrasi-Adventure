# DEMOKRASI ADVENTURE — Test Plan

## Tujuan
Menjamin setiap fase tidak merusak fitur sebelumnya, sesuai **Definition of Done**.

## Lingkup Tes
- Console bebas error
- Desktop & mobile tidak rusak
- Data tidak hardcoded jika seharusnya configurable
- Dokumentasi diperbarui

## Matriks Tes

| ID | Area | Cara Tes | Expected |
|----|------|----------|----------|
| T01 | Boot | Buka `index.html` di browser | Canvas muncul, tidak ada error console |
| T02 | Preload | Tunggu load | Placeholder texture tersedia, pindah ke main menu |
| T03 | Menu | Klik MULAI BERMAIN | Masuk WorldScene, UIScene tampil |
| T04 | Movement | WASD/Arrow / joystick (mobile) | Player bergerak, bounding box aktif |
| T05 | Collision | Tabrak batas layar | Player terhenti di batas world |
| T06 | Camera | Gerakkan player | Kamera follow halus, tidak patah |
| T07 | Pause | Tekan Esc | Scene pause (Phase 1 minimal) |
| T08 | Dialog | Interaksi dengan NPC | Dialog tampil, player terkunci (Phase 4+) |
| T09 | Quest | Jalankan quest | Objective bertambah, reward diterima (Phase 5+) |
| T10 | Save/Load | Simpan lalu reload halaman | Posisi & progress pulih (Phase 5+) |
| T11 | Achievement | Capai pencapaian | Unlock event & UI (Phase 6+) |
| T12 | Journal | Kumpulkan collectible | Journal bertambah dengan source (Phase 7+) |
| T13 | TPS Simulation | Jalankan mini-game | Alur 8 langkah berjalan, review tampil (Phase 9+) |
| T14 | Audio | Ubah volume master/music/sfx | Volume berubah, mute berfungsi (Phase 10+) |
| T15 | Responsive | Resize & rotating device | Canvas FIT, UI tidak terpotong |
| T16 | Accessibility | Reduced motion, subtitle, skip | Opsi diterapkan |
| T17 | PWA | Install & offline | App terinstall, offline cache berfungsi (Phase 11+) |
| T18 | Mobile touch | Joystick & tombol aksi | Semua tombol touch-friendly |
| T19 | Save corrupt | Beri data save rusak | Fallback reset friendly tanpa crash |
| T20 | Asset missing | Hapus satu asset | Fallback placeholder + warning jelas |

## Prosedur Per Fase
1. Jalankan tes T01–T06 setiap sesi coding.
2. Jalankan tes relevan dengan fitur baru pada fase tersebut.
3. Periksa console untuk warning/error.
4. Catat hasil pada bagian di bawah.

## Catatan Hasil

| Fase | T01 | T02 | T03 | T04 | T05 | T06 | Lainnya | Keterangan |
|------|-----|-----|-----|-----|-----|-----|---------|-----------|
| 0 | - | - | - | - | - | - | - | Foundation, belum runtime QA |
| 1 | ⏳ | ⏳ | ⏳ | - | - | - | T15, T17 | Menunggu implementasi penuh |