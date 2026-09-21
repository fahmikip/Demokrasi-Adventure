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