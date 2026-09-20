# Spesifikasi Aset — World & Environment System (Phase 2)

Spesifikasi untuk seluruh aset visual yang melayani sistem **Dunia & Lingkungan**
(tilemap, tileset, bangunan, objek lingkungan, peta dunia). Melengkapi
`docs/ART_DIRECTION.md` dan menjadi acuan untuk backlog
(`docs/ASSET_BACKLOG.md`) serta registri (`data/assets/ASSET_REGISTRY.json`).

## 1. Grid & skala

| Properti | Nilai |
| --- | --- |
| Ukuran tile | 32×32 px (`Config.TILE.SIZE`) |
| World dims | ditentukan per map (`data/maps/<id>.json` → `size`) |
| Resolusi kamera | 960×540 (zoom 1) |
| Gaya rujukan | 2D top-down stylized, light di kiri-atas |

## 2. Tileset `tileset_village`

- Satu atlas PNG di `assets/maps/tileset_village.png` menggantikan atlas
  procedural saat ini.
- Total 32 tile, disusun **8 kolom × 4 baris** (urutan & gid mengikuti
  `src/map/TilesetDefs.js` — TIDAK BOLEH berubah urutannya).
- Grup tile:
  - `gid 1..10` lapisan **ground**: grass, grass_accent, grass_dark, dirt,
    dirt_accent, sand, sand_accent, stone, stone_accent, grass_flowers.
  - `gid 11..20` lapisan **road**: road_h, road_v, road_corner_tl/tr/bl/br,
    road_cross, road_edge_top/bottom/left/right.
  - `gid 21..31` lapisan **water** (non-walkable, collision): water,
    water_edge_top/bottom/left/right, water_corner_tl/tr/bl/br, water_plants.
  - `gid 32` **stone_decor** (dekor non-collision di ground).
- Kontras antar tile harus jelas meski pixel-art; hindari tile terlalu
  seragam agar grid tidak "menyambar". Nada warna: warm & earthy,
  aksen hijau sawah.

## 3. Lapisan (rendering order)

Depth ditetapkan `WorldBuilder.createTilemap`:

| Layer | Depth | Collision |
| --- | --- | --- |
| ground | -130 | — |
| road | -120 | — |
| water | -110 | ya (gid 21..30) |
| bangunan & objek | `depth = y` (y-sort) | body statis per objek |
| zona transisi | 4000 | overlap |
| grid debug | 5000 | — |
| POI label/marker | 9000+ | — |

## 4. Bangunan & objek lingkungan

- **Anchor**: bottom-center (`setOrigin(0.5,1)`) — posisi sprite = titik
  "alas"/kaki di tile. Depth `= y` untuk y-sorting alami.
- **Kolisi** ikut kontrak di `src/map/ObjectDefs.js` (`body: {w,h,bottomOffset}`).
  `bottomOffset` = jarak dari alas sprite ke dasar body (batang pohon lebih
  ramping dari canopy).
- Ukuran sprite (px) tidak boleh melampaui 2 tile sebaris agar y-sorting rapi.

Tabel ukuran acuan:

| Entitas | frame (px) | body (px) |
| --- | --- | --- |
| small_house | 96×88 | 84×14 (offset bawah 8) |
| large_house | 128×104 | 116×16 |
| school | 192×120 | 176×18 |
| village_hall | 128×112 | 116×16 |
| shop | 96×80 | 84×14 |
| warung | 80×72 | 68×12 |
| tent | 96×72 | 88×12 |
| tree_large | 64×96 | 16×14 |
| tree_small | 48×72 | 12×12 |
| bush | 40×28 | 28×10 |
| flower | 24×24 | — (non-kolisi) |
| rock | 36×24 | 30×8 |
| bench | 40×26 | 36×8 |
| lamp | 24×80 | 8×8 |
| trash_bin | 24×36 | 16×12 |
| fence | 40×34 | 28×12 |
| sign | 32×64 | 18×10 |
| notice_board | 48×64 | 34×12 |
| motorcycle | 48×40 | 28×18 |
| bicycle | 44×40 | 24×14 |
| well | 40×48 | 30×12 |
| halte | 64×88 | 22×10 |

## 5. Player sheet

- Sheet `assets/characters/player/player.png`, **4×4 frame 48×48**
  (frame lebih besar dari tile agar tulang ditopang y-sorting).
- Baris: 0=down (default), 1=left, 2=right, 3=up. Kolom: idle, walk×3.
- Anchor kaki di tengah-bawah frame; collision player:
  `{ width: 20, height: 30 }`.

## 6. Peta dunia (World Map UI)

- Peta dunia awalnya cukup berupa daftar area data-driven
  (`data/maps/world.json` → `areas`). Ikon/gambar peta dunia final dapat
  menyusul (item backlog `ui_world_map_01`).
- Label ikon: `maps_world_map <variant>`.

## 7. Konvensi penamaan file fisik

- `assets/<category>/<name>.<ext>`
- snake_case, tanpa spasi/karakter non-ASCII.
- Ex: `assets/maps/tileset_village.png`, `assets/buildings/small_house_01.png`.