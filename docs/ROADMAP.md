# DEMOKRASI ADVENTURE — Roadmap 12 Fase

Setiap fase harus memenuhi **Definition of Done** (lihat bawah) sebelum lanjut. Kerjakan satu fase pada satu waktu. Laporkan hasil tiap fase lalu tunggu instruksi `LANJUT PHASE <n>`.

> **Catatan penomoran:** Phase 3 dikerjakan sebagai *vertical slice* (commit `e30ef4b`) yang menggabungkan World + NPC & Dialogue. Fase setelahnya digeser satu tingkat.

## PHASE 0 — Project Audit & Game Foundation Plan ✅
- [x] Inspect repository (kosong → fresh start)
- [x] Buat struktur folder
- [x] `docs/GAME_DESIGN.md`
- [x] `docs/ART_DIRECTION.md`
- [x] `docs/TECHNICAL_ARCHITECTURE.md`
- [x] `docs/CONTENT_GUIDELINES.md`
- [x] `docs/ROADMAP.md`
- [x] Foundation minimal Phase 1 (index.html, boot, preload, menu, responsive canvas)
- [x] Identifikasi dependency (Phaser 3) & keputusan teknis

## PHASE 1 — Game Foundation & Player System ✅
- [x] Struktur folder final sesuai Technical Architecture
- [x] Phaser setup (`src/core/Game.js`, `src/main.js`)
- [x] BootScene
- [x] PreloadScene (loading screen + placeholder texture generator)
- [x] MenuScene (PLAY, SETTINGS, ABOUT)
- [x] WorldScene shell + tile placeholder (TileSprite ground/path)
- [x] UIScene (HUD, tombol pause, overlay debug)
- [x] Responsive canvas desktop & mobile (Phaser Scale.FIT)
- [x] Base path compatible GitHub Pages (`Config.BASE_PATH`)
- [x] AudioManager placeholder
- [x] PWA dasar: manifest.json + sw.js (+ register)
- [x] docs/TEST_PLAN.md dibuat
- [x] docs/PLAYER_ASSET_SPEC.md (kontrak asset player 4×4)
- [x] InputManager (WASD/Arrows/E/ESC/F1) + VirtualJoystick (mobile)
- [x] Player + PlayerController + PlayerState (IDLE/WALK/INTERACT/DISABLED)
- [x] Animasi idle/walk placeholder 4 arah
- [x] Collision & world bounds
- [x] Camera follow + smoothing
- [x] HUD (Level/XP/Coins) + PauseMenu + Panel (settings stepper/toggle)
- [x] Debug overlay (F1)
- [x] Automated smoke test + E2E input test (CDP)
- [x] Commit & push Phase 1 (`e9aec96` → fase ini)

## PHASE 2 — Player Depth & Polish (sisa dari sistem player)
- [x] PlayerController (WASD/Arrow, mobile joystick) — sudah dari Phase 1
- [x] Animasi idle/walk (placeholder) — sudah dari Phase 1
- [x] Collision & world bounds — sudah dari Phase 1
- [x] Camera follow + smoothing + zoom — sudah dari Phase 1
- [x] PlayerState (IDLE/WALK/…) — sudah dari Phase 1
- [ ] Footsteps placeholder (sfx langkah)
- [ ] Pola gerak lebih halus (acceleration/attack, sheen, dsb.) jika perlu
- [ ] QA mobile device nyata (joystick, tombol aksi, safe-area)

## PHASE 3 — World + NPC & Dialogue (vertical slice) ✅
World:
- [x] Tilemap area (Desa Harmoni, Sekolah Nusantara, Pasar Rakyat, Pusat Kota, TPS) — data JSON + spritesheet placeholder
- [x] Tileset & ObjectDefs: buildings, objects, collision (walkable per tile)
- [x] WorldBuilder + MapManager (cache, load JSON)
- [x] Transisi antar area (TransitionManager + fade + spawn target)
- [x] Interaction points / POIs (POIManager: marker, label, nearest)
- [x] AreaState + debug (map, area, weather, tod)
- [x] Test map & transitions (smoke.js param `transition`)

NPC & Dialogue:
- [x] NPC base + NPCManager + NPCState (IDLE/WANDER/TALKING/DISABLED)
- [x] NPC registry + placement per map (data JSON, semua fiktif & netral)
- [x] DialogueManager + DialogueRunner + DialogueState (ketik, advance, choices)
- [x] DialogueUI: panel, portrait placeholder, nama, baris, pilihan
- [x] Data dialogue (5 NPC fiktif) + registry JSON
- [x] Interaksi radius + tombol E / tap untuk bicara
- [x] Test dialog & interaksi (smoke.js param `interact`)
- [ ] NPCSchedule (jadwal waktu/posisi NPC) — belum
- [ ] NPC relasi / trust variable — belum
- [x] Commit & push (`e30ef4b` → fase ini)

## PHASE 4 — Quest ✅
- [x] Quest data (JSON) + QuestManager + Objective
- [x] Main Quest Misi 01 "Hari yang Semakin Dekat"
- [x] Quest tracker di HUD
- [x] Reward (XP/Coins/Journal) — Journal dicollect via `QUEST_COMPLETED.journalEntries`
- [x] Test quest flow (smoke.js param `quest` + unit harness) — dieksekusi di browser headless saat Phase 5

## PHASE 5 — Progression ✅
- [x] XPManager, LevelManager
- [x] Democracy Coins
- [x] AchievementManager (17 achievement, data-driven)
- [x] Collectible system (20 item, penempatan per peta di build-maps)
- [x] HUD lengkap (XP/Coins/Level + progress bar)
- [x] Achievement UI (overlay scrollable)
- [x] Test progression (smoke.js param `progression`)

## PHASE 6 — Journal & Education ✅
- [x] JournalManager (quest + collectible → entri, terbitkan `JOURNAL_UPDATED`)
- [x] Journal UI (7 kategori: Pemilu, Pemilih, Tahapan, Informasi, Literasi Digital, TPS, Penyelenggara)
- [x] Educational cards dengan source (`data/education/*.json` — 18 kartu, konten netral & bersumber)
- [x] Collectible → journal entry (`journalId` di collectible registry menunjuk kartu)
- [x] Test update konten tanpa ubah engine (smoke param `journal` + validasi data)
- [x] Test journal flow (smoke.js param `journal`)

## PHASE 7 — Decision System ✅
- [x] Pilihan dialog bercabang sungguhan (branching real, lintas sesi) — `conditions` (flags/anyFlags/notFlags/relationship) & `startSelector`
- [x] Konsekuensi: NPC relationship, quest, story — `consequences` (flags/questFlags/relationship/xp/coins/decision/journal) via DecisionManager
- [x] Skenario verifikasi informasi (Pasar Rakyat) — Misi 02 "Kabar di Pasar", NPC Bu Sri, POI Papan Informasi
- [x] Test branching & konsekuensi (smoke.js param `decision` + validasi data)

## PHASE 8 — TPS Simulation ✅
- [x] Mini-game TPS lengkap (alur 8 langkah) — data-driven `data/tps/sim_tps.json`, scene `TPSScene` (GameState `TPS_SIMULATION`), masuk via POI `poi_tps_area`
- [x] Kandidat fiktif/abstrak — Simbol Mentari/Roda/Bintang (netral, tanpa pihak nyata)
- [x] Review & feedback literasi — feedback per pilihan + laman review skor & tips alur
- [x] Completion reward — XP/Koin + jurnal (kategori TPS) + flag/decision via DecisionManager; Misi 03 "TPS untuk Semua Warga" (`autoStart` AREA_ENTERED); achievement `tps_selesai`
- [x] Test simulasi — smoke `?tps=1` (8 langkah, skor, quest, jurnal)

## PHASE 9 — Polish ✅
- [x] Audio lengkap — AudioManager sintesis WebAudio: master/music/sfx/ambient/ui/footsteps (6 channel), SFX terpicu gameplay (footstep, UI, collect, quest, achievement, level-up, TPS), volume+mute tersimpan via SettingsManager (localStorage)
- [x] Particle — debu kaki saat berjalan (`particle_dust`) & daun jatuh (`particle_leaf`), bisa dimatikan via reduced motion
- [x] UI polish & micro-animation — button press-scale + hover/click sfx, panel buka (fade+scale), toggle animasi, dialogue choice feedback + blip ketikan
- [x] Accessibility — panel AKSESIBILITAS: Kurangi Gerakan (guard semua tween/fade/partikel & camera lerp), Subtitle (caption dialog bawah layar), Teks Instan (reveal penuh); volume master & mute di panel PENGATURAN
- [x] Test polish & accessibility — smoke `?audio=1` & `?access=1` + regresi (plain/quest/journal/decision/tps)

## PHASE 10 — PWA + Mobile ✅
- [x] Installable PWA — manifest lengkap (`id`, `display: standalone`, `categories`), iOS meta (apple-mobile-web-app-*), `apple-touch-icon` 180x180 fisik, `start_url`/`scope` subpath-safe
- [x] Offline cache Service Worker — `sw.js` v2: precache 140 URL (app shell + 65 modul ES + 65 data JSON + ikon + Phaser CDN), navigate network-first → fallback `index.html`, aset cache-first (modul/data/gambar/CDN), JSON gagal offline → 504 aman (bukan HTML), prune cache versi lama; offline boot terverifikasi (server dimatikan, game tetap boot penuh dari cache)
- [x] Responsive mobile polish — safe-area (`env(safe-area-inset-*)`), `user-select`/`touch-callout` none, `display-mode: standalone` + `:fullscreen` styles, landscape query; `?sw=1` untuk paksa SW di localhost DEBUG
- [ ] iPad/Android/iOS test — QA perangkat nyata (manual, instalasi + offline) via `assets:audit` & smoke
- [x] Test offline & install — smoke `?pwa=1` (SW register+active, cache 140 entri: shell/module/data/icon/Phaser) + smoke offline boot `pwa=1` (server dimatikan, `worldBuilt` penuh)

## PHASE 11 — Production & Deployment ✅
- [x] Optimization & performance — tab hidden: game loop `sleep()` + `AudioContext.suspend()` (lanjut saat kembali), `roundPixels` untuk pixel-art tajam
- [x] Bug fixing — production gate `Config.DEBUG` nonaktif default (`?debug=1` / `__DEMOKRASI_DEBUG__`), registrasi SW production-clean (non-localhost selalu, localhost perlu `?sw=1`); akses jurnal via badge HUD bisa diketuk/diklik (mobile) — menyelesaikan sisa Phase 6
- [x] Dokumentasi lengkap — README (fitur, dev, test, deploy), `CHANGELOG.md`, `docs/DEPLOYMENT.md`
- [x] GitHub Pages deployment — workflow Actions `deploy.yml` (root repo → Pages), `.nojekyll`
- [x] Release & user documentation — mode production boot bersih (0 error console), versi `1.7.0`; smoke `&debug=1` hijau seluruhnya

---

## Definition of Done (per fase)
Fase selesai jika:
- [ ] Fitur berjalan
- [ ] Tidak ada error console
- [ ] Kode modular
- [ ] Mobile tidak rusak
- [ ] Desktop tidak rusak
- [ ] Data tidak hardcoded jika seharusnya configurable
- [ ] Dokumentasi diperbarui
- [ ] Testing dilakukan
- [ ] Tidak merusak fitur sebelumnya

## Progress Tracker
| Fase | Status |
|------|--------|
| Phase 0 | ✅ selesai |
| Phase 1 | ✅ selesai |
| Phase 2 | 🔄 sebagian (sisa: audio footsteps + QA perangkat nyata) |
| Phase 3 | ✅ selesai (commit `e30ef4b`) — sisa ringan: NPCSchedule, NPC trust |
| Phase 4 | ✅ selesai (quest) — dieksekusi & diverifikasi bareng Phase 5 |
| Phase 5 | ✅ selesai (progression) |
| Phase 6 | ✅ selesai (journal & education) — sisa: akses journal via tombol sentuh/mobile |
| Phase 7 | ✅ selesai (decision system & skenario verifikasi pasar) |
| Phase 8 | ✅ selesai (TPS simulation: 8 langkah, kandidat fiktif, review, reward, misi 03) |
| Phase 9 | ✅ selesai (polish: audio WebAudio 6 channel, particle, UI micro-animation, aksesibilitas reduced-motion/subtitle/teks-instan) |
| Phase 10 | ✅ selesai (PWA & mobile: installable manifest+iOS meta+apple-touch-icon, offline cache SW v2 140 URL, safe-area/standalone CSS, smoke `?pwa=1` + offline boot) — sisa: QA perangkat nyata (iPad/Android/iOS) |
| Phase 11 | ✅ selesai (production & deployment: DEBUG gate `?debug=1`, SW registrasi production-clean, perf tab-hidden + roundPixels, bugfix jurnal mobile, CI Pages deploy + `.nojekyll`, README/CHANGELOG/DEPLOYMENT) — sisa: deploy live + QA device manual |

## Proteksi
Tidak melompat ke fase berikutnya sebelum fase berjalan & laporan fase dikirim. Tunggu instruksi `LANJUT PHASE <n>`.