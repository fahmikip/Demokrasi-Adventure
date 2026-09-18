# DEMOKRASI ADVENTURE — Player Asset Specification

Dokumen ini mendefinisikan kontrak asset sprite pemain. Asset final (buatan tangan / AI-generated) **wajib** mengikuti spesifikasi ini agar dapat menggantikan placeholder tanpa mengubah gameplay code.

## 1. Sprite Sheet

| Property | Nilai |
|----------|-------|
| File | `assets/characters/player/player.png` |
| Format | PNG 32-bit (RGBA), background **transparan** |
| Ukuran frame | 48×48 px |
| Grid | 4 kolom × 4 baris |
| Ukuran sheet total | 192×192 px |
| Padding antar frame | Tanpa padding (0 px), frame bersentuhan tepat |

## 2. Frame Grid & Animations

Grid disusun per baris = **arah hadap**, per kolom = **fase animasi**.

| Baris | Arah | Kolom 0 | Kolom 1 | Kolom 2 | Kolom 3 |
|-------|------|---------|---------|---------|---------|
| 0 | Down | idle | walk 1 | walk 2 | walk 3 |
| 1 | Left | idle | walk 1 | walk 2 | walk 3 |
| 2 | Right | idle | walk 1 | walk 2 | walk 3 |
| 3 | Up | idle | walk 1 | walk 2 | walk 3 |

## 3. Nama Animasi

| Key | Frames |
|-----|--------|
| `idle_down` | 0, 1 |
| `idle_left` | 4, 5 |
| `idle_right` | 8, 9 |
| `idle_up` | 12, 13 |
| `walk_down` | 1, 2, 3 |
| `walk_left` | 5, 6, 7 |
| `walk_right` | 9, 10, 11 |
| `walk_up` | 13, 14, 15 |

Di dalam kode: `idle_{direction}` dan `walk_{direction}` — direction = `down | left | right | up`.

## 4. Karakter di Dalam Frame

- Posisi karakter pada frame 48×48: bagian bawah karakter sejajar dengan tepi bawah frame (foot contact di y ≈ 46–48).
- Lebar visual karakter ≈ 20 px dalam frame.
- Karakter menghadap "down" = wajah terlihat; "up" = belakang kepala.
- Tidak boleh ada outline/asset melampaui batas frame 48×48.

## 5. Anchor & Scale

| Property | Nilai |
|----------|-------|
| Anchor point | `(0.5, 0.5)` (origin Phaser default) |
| Scale | 1 (dikontrol `Config.PLAYER.SCALE`) |
| Ukuran body / bounding box | 20×30 px (dikontrol `Config.PLAYER.BODY`) |
| Akses | `Config.PLAYER.SHEET.KEY` = `"player"` |

## 6. Resolusi Kontrak

Kontrak runtime yang di-render (tidak mengubah ukuran file):

```
base char  : 20×30 px (bounding box), foot contact di bawah
sprite     : 48×48 frame → tampil 48×48 di layar (scale 1)
grid       : 4×4 frame dalam satu sheet
```

## 7. Integrasi Pipeline

1. Letakkan file pada `assets/characters/player/player.png`.
2. (Opsional) `.json` sheet metadata ditempatkan di jalur yang sama.
3. Ubah `PreloadScene`/`PlaceholderAssets` untuk `this.load.spritesheet('player', ...)` saat asset final tersedia.
4. Jangan ubah `Player.js`, `PlayerController.js`, atau nama animasi.
5. Verifikasi: animasi idle/walk 4 arah berjalan, collision body 20×30 tersetel, tidak ada frame yang terpotong.

## 8. Catatan Placeholder

Placeholder saat ini **dibangkitkan prosedural** oleh `src/core/PlaceholderAssets.js` dengan layout persis di atas (4×4, 48×48). Mengganti ke asset final cukup menyalakan loader spritesheet dan menonaktifkan generator placeholder.