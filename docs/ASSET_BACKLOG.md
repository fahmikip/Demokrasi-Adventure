# Asset Backlog / Permintaan Aset Final

Daftar aset yang **masih placeholder** dan perlu dibuat/dibeli versi finalnya
oleh art tim. Setiap item memuat *requirement* singkat sesuai
`docs/WORLD_ASSET_SPEC.md` dan `docs/ART_DIRECTION.md`.

Format setiap permintaan:

```
[ID_REGISTRI] — Nama
- Format / ukuran
- Description & gaya
- Pemakai (kode)
- Prioritas: P0 (paling butuh) / P1 / P2
```

Saat aset final tiba:
1. Simpan file fisik di `assets/...`.
2. Update `data/assets/ASSET_REGISTRY.json`: status `approved`, origin `physical`, `path`, `sha256`.
3. Update `docs/ASSET_CHANGELOG.md` & `docs/ASSET_LICENSES.md`.
4. Jalankan `npm run assets:audit` — harus PASS.

---

## Karakter

- `characters_player_sheet` — Player (Kira)
  - Sheet 4×4 frame 48×48 PNG, anak SMA santai (seragam/atasan merah), gaya
    top-down 2D stylized. Pemakai: `Player`. Prioritas: **P0**.

## Tileset & peta

- `maps_tileset_village` — Tileset village 32 tile
  - Atlas PNG 8 kolom × 4 baris, tile 32×32; urutan mengikuti `TilesetDefs.js`.
    Pemakai: `WorldBuilder`. Prioritas: **P0**.
- `maps_world_map_01` — Peta dunia (World Map UI)
  - Ilustrasi kota pulau/atas-bawah datar gaya kidlit. Pemakai: `WorldMapUI`.
    Prioritas: **P2** (saat ini daftar area text).

## Bangunan

- `buildings_small_house_01` — Rumah desa kecil (P0)
- `buildings_large_house_01` — Rumah desa besar (P1)
- `buildings_school_01` — Gedung SD/Sekolah Nusantara (P0)
- `buildings_village_hall_01` — Balai desa (P1)
- `buildings_shop_01` — Toko kelontong (P1)
- `buildings_warung_01` — Warung sederhana (P1)
- `buildings_tent_01` — Tenda lapangan/pasar (P1)

Semua masing-masing 1 sprite PNG ukuran per `WORLD_ASSET_SPEC.md` tabel §4,
anchor bottom-center, gaya 2D stylized vektor flat.

## Objek lingkungan

- `objects_tree_large_01` — Pohon besar/tua (P0)
- `objects_tree_small_01` — Pohon muda (P0)
- `objects_bush_01` — Semak (P1)
- `objects_flower_01` — Bunga (P1, non-kolisi)
- `objects_rock_01` — Batu (P1)
- `objects_bench_01` — Bangku taman (P1)
- `objects_lamp_01` — Lampu jalan/pohon (P1)
- `objects_trash_bin_01` — Tong sampah (P2)
- `objects_fence_01` — Pagar kayu (P1)
- `objects_sign_01` — Papan penunjuk jalan (P1)
- `objects_notice_board_01` — Papan pengumuman demokrasi (P1)
- `objects_motorcycle_01` — Motor (P1)
- `objects_bicycle_01` — Sepeda (P1)
- `objects_well_01` — Sumur desa (P2)
- `objects_halte_01` — Halte (P2)

## Ikon & UI

- `icons_icon_map_01` — Ikon peta (P1)
- `icons_icon_pause_01` — Ikon pause (P1)
- `icons_icon_lvl_01`, `icons_icon_xp_01`, `icons_icon_coins_01` — Ikon HUD (P1)
- `icons_interact_marker` — Penanda interaksi [E] (P1)

## Audio

- `audio_ambient_placeholder` — Musik/ambience Desa Harmoni
  - Loop berdurasi ≥ 30 dtk, suasana pedesaan riang, OGG/MP3 ringan,
    BPM santai. Pemakai: `AudioManager.play(Config.WORLD.AMBIENT)`. Prioritas: **P1**.