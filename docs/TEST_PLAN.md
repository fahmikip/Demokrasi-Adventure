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
| T02 | Preload | Tunggu load | Loading bar 0→100%, placeholder texture dibuat, otomatis ke main menu |
| T03 | Menu | Klik MULAI BERMAIN | Masuk WorldScene, UIScene tampil |
| T04 | Movement | WASD/Arrow / joystick (mobile) | Player bergerak, bounding box aktif |
| T05 | Collision | Tabrak batas layar | Player terhenti di batas world (world bounds aktif) |
| T06 | Camera | Gerakkan player | Kamera follow halus, tidak patah |
| T07 | Pause | Tekan Esc | GameState `PAUSE`, menu pause tampil; Esc lagi kembali `PLAYING` (Phase 1) |
| T08 | Dialog | Interaksi dengan NPC | Dialog tampil, player terkunci (Phase 3) |
| T09 | Quest | Jalankan quest | Objective bertambah, reward diterima (Phase 4) |
| T10 | Save/Load | Simpan lalu reload halaman | Posisi & progress pulih (Phase 5+) |
| T11 | Achievement | Capai pencapaian | Unlock event & UI (Phase 5) |
| T12 | Journal | Kumpulkan collectible | Journal bertambah dengan source (Phase 6) |
| T13 | TPS Simulation | Jalankan mini-game | Alur 8 langkah berjalan, kandidat fiktif/abstrak, review literasi tampil, reward diterima (Phase 8) |
| T14 | Audio | Ubah volume master/music/sfx | Volume berubah, mute berfungsi (Phase 10+) |
| T15 | Responsive | Resize & rotating device | Canvas FIT, UI tidak terpotong |
| T16 | Accessibility | Reduced motion, subtitle, skip | Opsi diterapkan |
| T17 | PWA | Install & offline | App terinstall, offline cache berfungsi (Phase 11+) |
| T18 | Mobile touch | Joystick & tombol aksi | Semua tombol touch-friendly |
| T19 | Save corrupt | Beri data save rusak | Fallback reset friendly tanpa crash |
| T20 | Asset missing | Hapus satu asset | Fallback placeholder + warning jelas |
| T21 | Journal content update | Tambah kartu di `data/education/` tanpa ubah engine | Kartu baru tampil/bisa di-collect via registry (`journalId`) — divalidasi `education_registry` resolve + kategori + source |
| T22 | Decision / branching | Jalankan Misi 02 "Kabar di Pasar" | Dialog bercabang (pilihan verifikasi/percaya/tanya), konsekuensi tercatat: flag, decision, relationship, jurnal; quest selesai via `dec_rumor_verified` (Phase 7) |

## Prosedur Per Fase
1. Jalankan tes T01–T06 setiap sesi coding.
2. Jalankan tes relevan dengan fitur baru pada fase tersebut.
3. Periksa console untuk warning/error.
4. Catat hasil pada bagian di bawah.

## Automated Smoke Test (Dev / CI)

Smoke test otomatis berjalan hanya dalam mode `DEBUG + ?selftest=1` (tidak aktif di production).
Game loop di-drive manual (`game.loop.manualStep`) agar deterministik di headless.

```bash
# server lokal
python -m http.server 8000

# boot → WorldScene + UIScene (WebGL & Canvas), verifikasi player/obstacle/state/anim
chrome --headless=new --no-sandbox --use-angle=swiftshader \
  --virtual-time-budget=20000 --enable-logging=stderr --v=0 --dump-dom \
  "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1"
# (output divalidasi via <title>SMOKE:{...}</title>)

# boot → MenuScene
... "http://127.0.0.1:8000/index.html?scene=MenuScene&selftest=1"

# quest flow (misi 01) → boot WorldScene, drive quest, verifikasi QUEST_COMPLETED + reward
... "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&quest=1"

# progression flow (Phase 5) → quest misi 01 + passive XP + collectible (player walk-in),
# verifikasi level up + achievement unlock + koin
... "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&progression=1"

# journal flow (Phase 6) → quest misi 01 (journalEntries) + 3 collectible desa (journalId),
# verifikasi entri jurnal dengan source, kategori terbuka, total >= 4
... "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&journal=1"

# decision flow (Phase 7) → dunia WorldScene + DialogueManager sungguhan:
# bicara Bu Sri (startNode via startSelector) → pilih jalur verifikasi → baca Papan
# Informasi (startInfo) → kembali ber-Bu Sri (node "sudah_baca") → dec_rumor_verified.
# Verifikasi: decisions >= 3, flags >= 3, relationship > 0, jurnal decision >= 2,
# quest misi_02 selesai.
... "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&decision=1"

# tps flow (Phase 8) → dunia WorldScene + TPSScene (8 langkah) via POI tps:
# AREA_ENTERED tps (auto-start misi_03 + achievement first_simulation) →
# simulasi 8 langkah (info/choice) → review → dec_tps_selesai + flag +
# jurnal TPS + reward (XP/Koin) + TPS_COMPLETED (achievement tps_selesai).
# Verifikasi: tpsDone, steps >= 8, score >= 1, flag set, quest misi_03 selesai.
... "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&tps=1"

# E2E input (movement / interact / pause toggle) dilakukan via CDP
# (Input.dispatchKeyEvent + manualStep) — lihat catatan hasil Phase 1.
```

Parameter debug headless:
- `?selftest=1` — aktifkan smoke test.
- `?scene=WorldScene|MenuScene` — langsung membuka scene target setelah preload.
- `?renderer=canvas` — paksa Canvas (opsional, untuk isolasi).

## Catatan Hasil

| Fase | T01 | T02 | T03 | T04 | T05 | T06 | Lainnya | Keterangan |
|------|-----|-----|-----|-----|-----|-----|---------|-----------|
| 0 | - | - | - | - | - | - | - | Foundation, belum runtime QA |
| 1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T07 ✅, T18 ⏳ manual, T15 ⏳ manual | Smoke matrix + E2E CDP: load, menu, world+UI, movement (arrow → 1200,800→1527,800 & y↓), world bounds aktif, anim idle(2)/walk(3) frame OK, pause toggle `PLAYING⇄PAUSE` OK. T15/T18 pending QA device nyata. |
| 4 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T08 ✅, T09 ✅ | Quest: Misi 01 auto-start bicara Bu Ratna → baca papan info → lapor Pak Dedi; `QUEST_COMPLETED` terkirim + reward XP/Coins; tracker HUD tampil (`?quest=1` smoke; unit harness juga verified load 1 quest, objective talk/interact). |
| 5 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T11 ✅, T09 ✅ | Progression: XP pasif + quest → level 2–3, level-up; Achievement unlock (first_step, first_collectible, village_helper, perfect_mission) + reward XP/Koin; coin economy (`totalEarned`); collectible klaim nyata via player walk-in (2/20); transition fix restart (`?progression=1` + `?transition=1` smoke). HUD progress bar & Achievement UI tampil. |
| 6 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T12 ✅, T09 ✅, T21 ✅ | Journal & education: quest → 1 entri (Pemilu) + collectible → 3 entri (Pemilu/Informasi/Tahapan) via `journalId`; `JOURNAL_UPDATED` + HUD counter `📖 Jurnal N`; UI 7 kategori (`J` buka/tutup, ESC, scroll wheel); sumber tampil per entri (`journalWithSource`=4); smoke `?journal=1`. Validasi `data/education/`: 18 kartu, 7 kategori, semua collectible resolve, per-kategori tercakup. Transition smoke masih flaky di headless (crash renderer saat restart) — catatan: tidak berhubungan dgn perubahan journal (WorldScene tak disentuh fase ini). |
| 7 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T08 ✅, T22 ✅ | Decision system: DialogueManager/UI aktif (buka/tutup, ketik, pilihan via klik/E/angka), branching nyata lewat `conditions` + `startSelector`, konsekuensi via DecisionManager (flags/decisions/relationship/jurnal) + auto-start sidebar Misi 02; Skenario verifikasi pasar melewati jalur sapa→verifikasi→info POI→sudah_baca→`dec_rumor_verified`, quest selesai, relationship `npc_warga_pasar` naik, 3 decision+jurnal tercatat; smoke `?decision=1`. |
| 8 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | T13 ✅, T09 ✅ | TPS Simulation: TPSScene (scene overlay, `TPS_SIMULATION` state) — alur 8 langkah data-driven (`data/tps/sim_tps.json`): Datang→Interaksi→Verifikasi→Perlengkapan→Bilik→Simulasi (kandidat fiktif/abstrak: Mentari/Roda/Bintang)→Selesai→Review; feedback literasi per pilihan + review skor; reward XP/Koin via DecisionManager (`dec_tps_selesai`, flag `story_tps_selesai`, jurnal kategori TPS); Misi 03 "TPS untuk Semua Warga" auto-start via `AREA_ENTERED` (fitur `autoStart`), selesai setelah simulasi; achievement `first_simulation` + `tps_selesai`; ikon placeholder `icon_tps`; smoke `?tps=1` (8 langkah, skor 5/5, quest selesai, 2 entri jurnal). |