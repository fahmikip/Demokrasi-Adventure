# Asset Changelog

Catatan perubahan aset sesuai Asset Source of Truth
(`data/assets/ASSET_REGISTRY.json` — selalu sinkronkan dengan file ini).

Format: `YYYY-MM-DD — [ID] Deskripsi`.

---

## 2026-09-25

- `ui_icon_apple_touch` — MENAMBAH: apple touch icon 180x180 fisik
  `assets/ui/apple-touch-icon.png` (regenerable via `tools/../temp` encoder;
  dipakai `<link rel="apple-touch-icon">` di `index.html`, Phase 10).

## 2026-09-18

- `maps_tileset_village` — MENAMBAH: atlas tileset village 32 tile (8 kolom),
  dibuat procedural di `PlaceholderAssets::_generateTilesetAtlas`
  (definisi: `src/map/TilesetDefs.js`).
- `characters_player_sheet` — REGISTRASI ulang: placeholder procedural
  4x4 frame 48x48 (eksisting Phase 1), dicatat sebagai `placeholder`.
- `buildings_small_house_01` … `buildings_tent_01` — MENAMBAH: 7 bangunan
  placeholder procedural (rumah kecil/besar, sekolah, balai desa, toko,
  warung, tenda) untuk Map/World system.
- `objects_tree_large_01` … `objects_halte_01` — MENAMBAH: 16 objek
  lingkungan placeholder procedural (pohon, semak, bunga, batu, bangku,
  lampu, tong sampah, pagar, papan, motor, sepeda, sumur, halte).
- `icons_*` — MENAMBAH: ikon HUD procedural baru
  `icon_lvl`, `icon_xp`, `icon_coins`, `icon_pause`, `icon_map`,
  `interact_marker`, `joystick_base`, `joystick_knob`.
- `audio_ambient_placeholder` — MENAMBAH: ambience hening placeholder.
- `ui_icon_*` — REGISTRASI pertama: 4 ikon PWA fisik sebagai `approved`.

## 2026-09-17 — Fase 0-1 (sebelum Asset Source of Truth)

- Aset ini tidak tercatat terpusat; sejak commit ini seluruh perubahan aset
  dicatat di sini.