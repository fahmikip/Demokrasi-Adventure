# DEMOKRASI ADVENTURE — Art Direction Document

Dokumen ini adalah **sumber utama standar visual** game. Semua asset baru harus mengikuti dokumen ini.

## 1. Gaya Visual

**2D Stylized Top-Down Adventure + Indonesian Environment + Modern Pixel Art**

Gaya harus terasa hangat, ramah, mudah dibaca, dan hidup — bukan kaku atau mirip aplikasi pemerintahan.

**BOLEH:**
- 2D stylized, top-down / 3/4 top-down
- Modern pixel art (retakan rendah, palet bersih)
- Siluet bersih, karakter mudah dibaca
- Suasana tropis Indonesia
- Pencahayaan alami hangat
- Bayangan halus
- Proporsi koheren

**DILARANG:**
- Medieval fantasy / kastil / arsitektur RPG barat
- Terlalu banyak neon
- Cyberpunk
- Photorealistic
- Asset dengan gaya berbeda campur aduk
- Karakter terlalu kecil hingga ekspresi sulit terlihat

## 2. Camera Perspective

- **Top-Down 3/4 angle** (sedikit miring dari atas) sehingga atap gedung tidak menghalangi karakter.
- Kamera mengikuti pemain dengan smoothing.
- Zoom dasar: `1.0` (desktop), dapat menyesuaikan di resolusi kecil.

## 3. Tile Size

- **Base tile: 32×32 px** (grid untuk peta).
- Tilemap di-export dalam bentuk data JSON + spritesheet.
- Setiap tile harus muat dalam grid 32 tanpa bleeding antar tile.

## 4. Character Size

| Tipe | Target (px) | Catatan |
|------|-------------|---------|
| Player | 16×24 (sprite base) dirender 32×48 | Generic humanoid pixel art |
| NPC dewasa | 16×24 base | Sama dengan player scale |
| Anak-anak | 12×18 base | Proporsi lebih kecil |
| Elderly | 16×24 base dengan postur berbeda | Siluet jelas |

Frame area (canvas sprite sheet): **48×48 per frame** agar muat gerakan tanpa terpotong.

## 5. Sprite Scale

- Semua karakter dirender pada skala `2×` dari base pixel (16×24 → 32×48 di layar).
- Skala dikendalikan `Config.CHARACTER_SCALE`, bukan hardcoded.
- Asset sheet diletakkan dengan padding bersih agar tidak ada outline terpotong.

## 6. Color Direction

Palet hangat & tropis:

| Fungsi | Warna Dasar |
|--------|-------------|
| Natural background | Hijau lumut hangat, tanah cokelat hangat |
| Langit/text | Krim & biru langit lembut |
| Highlight | Kuning matahari hangat |
| Accent UI | Merah marun & putih (warna bendera, aksen lembut) |
| Water | Biru kehijauan tropis |
| Shadow | Transparansi hitam 20-30% |

Batasan: hindari saturasi ekstrem neon, hindari duplikasi warna logo partai sebagai warna tema.

## 7. Lighting

- Natural warm lighting siang hari.
- Bayangan halus (soft drop shadow di bawah karakter & objek).
- Tidak ada lighting tiruan yang mengganggu gameplay.

## 8. Outline

- Outline tipis gelap pada karakter (intensitas rendah, bukan outline tebal hitam).
- Objek lingkungan: outline opsional, sebaiknya warna lebih gelap dari fill, bukan hitam pekat.
- Tujuan: readability tanpa kesan cel-shaded berlebihan.

## 9. Environment Style

- Tropis Indonesia: pohon kelapa, rimbun, taman kampung, paving merah, atap genting merah-oranye.
- Struktur desa: balai desa, warung semi permanen, papan informasi kayu.
- Struktur kota: gedung pelayanan publik bersih, taman kota, halte sederhana.

## 10. Architecture Style

- **Desa Harmoni:** arsitektur kampung Indonesia (rumah panggung sederhana, genting, dinding kayu/krem, gapura kecil).
- **Sekolah Nusantara:** bangunan sekolah bertingkat 1, dinding putih-krem, atap merah.
- **Pasar Rakyat:** lapak/pedagang, tenda, jalan ramai.
- **Pusat Kota:** gedung pelayanan publik, taman kota, halte.
- **TPS:** tenda/area netral, netral tanpa unsur politik.

## 11. NPC Style

- Gaya pixel art generik yang dapat dipersonalisasi (warna baju, rambut, aksesori).
- Wajah/ekspresi tetap terlihat di ukuran karakter (mata jelas).
- Setiap NPC punya palet warna yang membedakannya dari NPC lain.
- Role dibedakan dari aksesori: topi (petugas), buku (guru), mangkuk troli (pedagang), keranjang (petani).

## 12. UI Style

- Panel: rounded card, warna netral krem/putih dengan aksen marun.
- Bayangan halus, border tipis.
- Tipografi: font sans-serif modern dengan fallback pixel-friendly.
- Icon: flat, tebal, mudah dibaca — satu set ikon konsisten (bukan campuran emoji).
- Hierarki jelas: judul > subjudul > isi.
- Micro-animation: hover/focus halus, transisi panel.

## 13. Icon Style

- Flat 16×16 / 32×32 base, dirender crisp.
- Set ikon tunggal, gaya garis tebal sederhana:
  - XP, Coins, Quest, Journal, Inventory, Achievement, Map, Settings, Interaction (!), Dialogue.
- Semua ikon editable terpusat di `assets/ui/`.

## 14. Animation Guidelines

| Animasi | Frame | Kecepatan |
|---------|-------|-----------|
| Idle | 2-frame subtle (breath) | ~0.8s loop |
| Walk | 4-frame | ~0.15s per frame |
| Interact | 3-frame | ~0.2s per frame |
| Dialogue portrait | Idle + blink | Loop halus |

- Jangan animasi berlebihan (hurt/screen shake) tanpa kebutuhan.
- Reduced Motion: aktifkan opsi agar animasi looping dimatikan/dirampingkan.

## 15. Asset Naming Conventions

Format: `{tipe}_{id}_{varian}.{ext}` — lowercase, underscore.

```
Tipe: characters, maps, tiles, buildings, objects, ui, audio, fonts
id:   player, npc_teacher, tile_desert...
varian: walk_down, idle, portrait, sheet, tilemap, spritesheet
```

Contoh:
```
assets/characters/player/char_player_idle_sheet.png
assets/characters/npc/teacher/char_npc_teacher_walk_sheet.png
assets/maps/desa-harmoni/desa-harmoni_tilemap.json
assets/maps/desa-harmoni/desa-harmoni_spritesheet.png
assets/ui/icon_xp.png
assets/ui/icon_coins.png
```

## 16. Placeholder Strategy (Prototype)

Jika asset final belum ada, gunakan:
- Kotak warna solid + label teks (untuk karakter/NPC sementara).
- Tile sederhana satu warna untuk peta.
- Icon generik untuk UI.
- **Arsitektur harus tetap siap menerima asset final** tanpa mengubah logic (nama file & dimensi terdokumentasi).

## 17. Integration Pipeline

1. Asset dibuat sesuai spesifikasi di atas.
2. Diletakkan di path sesuai konvensi.
3. Didaftarkan di preload / data map.
4. Diverifikasi: ukuran, collision, animation frame synchronize, readability.

---

_Halaman ini harus dibaca sebelum membuat/mengganti asset visual apa pun di project ini._