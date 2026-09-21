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

## PHASE 4 — Quest
- [x] Quest data (JSON) + QuestManager + Objective
- [x] Main Quest Misi 01 "Hari yang Semakin Dekat"
- [x] Quest tracker di HUD
- [x] Reward (XP/Coins/Journal) — Journal dicollect via `QUEST_COMPLETED.journalEntries`
- [x] Test quest flow (smoke.js param `quest` + unit harness) — belum eksekusi di browser manual

## PHASE 5 — Progression
- [ ] XPManager, LevelManager
- [ ] Democracy Coins
- [ ] AchievementManager (15+)
- [ ] Collectible system
- [ ] HUD lengkap (XP/Coins/Level)
- [ ] Achievement UI
- [ ] Test progression

## PHASE 6 — Journal & Education
- [ ] JournalManager
- [ ] Journal UI (7 kategori)
- [ ] Educational cards dengan source
- [ ] Collectible → journal entry
- [ ] Test update konten tanpa ubah engine

## PHASE 7 — Decision System
- [ ] Choices branching real
- [ ] Consequence: NPC relationship, quest, story
- [ ] Skenario verifikasi informasi (Pasar Rakyat)
- [ ] Test branching & konsekuensi

## PHASE 8 — TPS Simulation
- [ ] Mini-game TPS lengkap (alur 8 langkah)
- [ ] Kandidat fiktif/abstrak
- [ ] Review & feedback literasi
- [ ] Completion reward
- [ ] Test simulasi

## PHASE 9 — Polish
- [ ] Animasi & animasi transisi
- [ ] Audio lengkap (music/sfx/ambient/ui/footsteps)
- [ ] Particle (daun, debu)
- [ ] UI polish & micro-animation
- [ ] Accessibility (reduced motion, subtitle, skip dialog, volume)
- [ ] Test polish & accessibility

## PHASE 10 — PWA + Mobile
- [ ] Installable PWA
- [ ] Offline cache Service Worker
- [ ] Responsive mobile QA (touch, safe-area, landscape)
- [ ] iPad/Android/iOS test
- [ ] Test offline & install

## PHASE 11 — Production & Deployment
- [ ] Optimization & performance
- [ ] Bug fixing
- [ ] Dokumentasi lengkap (README)
- [ ] GitHub Pages deployment
- [ ] Release & user documentation

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
| Phase 4 | 🔄 dikerjakan (Quest) — sistem quest berjalan; sisa: eksekusi smoke di browser + commit |
| Phase 5–11 | ⏳ menunggu |

## Proteksi
Tidak melompat ke fase berikutnya sebelum fase berjalan & laporan fase dikirim. Tunggu instruksi `LANJUT PHASE <n>`.