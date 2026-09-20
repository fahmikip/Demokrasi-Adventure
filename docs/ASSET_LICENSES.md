# Lisensi Aset

Dokumen ini memetakan lisensi setiap aset **fisik** yang digunakan proyek,
sebagai bagian dari Asset Source of Truth (lihat `data/assets/ASSET_REGISTRY.json`).

## Ringkasan

| Aset | Lisensi | Pemegang hak | Catatan |
| --- | --- | --- | --- |
| `assets/ui/icon-192.png` | Proyek-internal / Hak cipta proyek | Tim Demokrasi Adventure | Ikon PWA buatan sendiri |
| `assets/ui/icon-512.png` | Proyek-internal / Hak cipta proyek | Tim Demokrasi Adventure | Ikon PWA buatan sendiri |
| `assets/ui/icon-maskable-512.png` | Proyek-internal / Hak cipta proyek | Tim Demokrasi Adventure | Ikon PWA maskable |
| `assets/ui/favicon.png` | Proyek-internal / Hak cipta proyek | Tim Demokrasi Adventure | Favicon browser |

## Aset procedural (generatedAt runtime)

Seluruh texture placeholder (player sheet, tileset_village, bangunan, objek
lingkungan, ikon HUD, joystick, marker) dihasilkan oleh kode
`src/core/PlaceholderAssets.js` dan tidak memiliki file fisik di repo.

- **Origin** : kode milik proyek (original code-generated art).
- **Lisensi** : Hak cipta proyek; boleh digunakan & dimodifikasi bebas oleh tim.
- Catatan: seluruh placeholder **wajib** diganti dengan aset final berlisensi
  sesuai backlog (`docs/ASSET_BACKLOG.md`). Saat penggantian dilakukan, perbarui
  `ASSET_REGISTRY.json` (status → `approved`, origin → `physical`) dan file ini.

## Library / framework

| Komponen | Lisensi |
| --- | --- |
| Phaser 3.80.1 (via CDN) | MIT — © Richard Davey & Phaser Studio |
| Sistem font (Segoe UI, sistem) | Disediakan OS (punya lisensi masing-masing) |

## Aturan penambahan aset baru

1. Tidak ada aset berhak cipta pihak ketiga kecuali lisensinya tercatat di sini.
2. Selalu catat: nama pencipta/publisher, lisensi (SPDX), URL sumber.
3. Jangan pernah meng-commit aset tanpa menandainya di daftar di atas dan
   mencantumkannya di `ASSET_REGISTRY.json`.