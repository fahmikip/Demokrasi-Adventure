# DEMOKRASI ADVENTURE — Roadmap 12 Fase

Setiap fase harus memenuhi **Definition of Done** (lihat bawah) sebelum lanjut. Kerjakan satu fase pada satu waktu. Laporkan hasil tiap fase lalu tunggu instruksi `LANJUT PHASE <n>`.

## PHASE 0 — Project Audit & Game Foundation Plan ✅ (sedang berjalan)
- [x] Inspect repository (kosong → fresh start)
- [x] Buat struktur folder
- [x] `docs/GAME_DESIGN.md`
- [x] `docs/ART_DIRECTION.md`
- [x] `docs/TECHNICAL_ARCHITECTURE.md`
- [x] `docs/CONTENT_GUIDELINES.md`
- [x] `docs/ROADMAP.md`
- [ ] Foundation minimal Phase 1 (index.html, boot, preload, menu, responsive canvas)
- [ ] Identifikasi dependency (Phaser 3) & keputusan teknis

## PHASE 1 — Project Foundation
- [ ] Struktur folder final sesuai Technical Architecture
- [ ] Phaser setup (`src/core/Game.js`, `src/main.js`)
- [ ] BootScene
- [ ] PreloadScene (asset placeholder)
- [ ] MenuScene (PLAY, SETTINGS, kredit)
- [ ] Scene dasar World + UIScene shell
- [ ] Responsive canvas desktop & mobile
- [ ] Base path compatible GitHub Pages
- [ ] AudioManager placeholder
- [ ] PWA dasar: manifest.json + sw.js (+ register)
- [ ] docs/TEST_PLAN.md dibuat

## PHASE 2 — Player
- [ ] PlayerController (WASD/Arrow, mobile joystick)
- [ ] Animasi idle/walk (placeholder)
- [ ] Collision & world bounds
- [ ] Camera follow + smoothing + zoom
- [ ] PlayerState (IDLE/WALK/…)
- [ ] Footsteps placeholder
- [ ] Test pergerakan & collision

## PHASE 3 — World (Desa Harmoni)
- [ ] Tilemap Desa Harmoni (data JSON + spritesheet placeholder)
- [ ] Buildings, objects, collision
- [ ] Transisi antar area (school, pasar) — stub akhir dulu
- [ ] Interaction points (papan informasi, dll)
- [ ] Test map & transitions

## PHASE 4 — NPC & Dialogue
- [ ] NPC base + NPCManager + NPCSchedule
- [ ] DialogueManager + DialogueBox + choices
- [ ] Portrait & emotion placeholder
- [ ] Interaksi radius, E / tap untuk bicara
- [ ] NPC relaasi (trust variable)
- [ ] Test dialog & interaksi

## PHASE 5 — Quest
- [ ] Quest data (JSON) + QuestManager + Objective
- [ ] Main Quest Misi 01 "Hari yang Semakin Dekat"
- [ ] Quest tracker di HUD
- [ ] Reward (XP/Coins/Journal)
- [ ] Test quest flow

## PHASE 6 — Progression
- [ ] XPManager, LevelManager
- [ ] Democracy Coins
- [ ] AchievementManager (15+)
- [ ] Collectible system
- [ ] HUD lengkap (XP/Coins/Level)
- [ ] Achievement UI
- [ ] Test progression

## PHASE 7 — Journal & Education
- [ ] JournalManager
- [ ] Journal UI (7 kategori)
- [ ] Educational cards dengan source
- [ ] Collectible → journal entry
- [ ] Test update konten tanpa ubah engine

## PHASE 8 — Decision System
- [ ] Choices branching real
- [ ] Consequence: NPC relationship, quest, story
- [ ] Skenario verifikasi informasi (Pasar Rakyat)
- [ ] Test branching & konsekuensi

## PHASE 9 — TPS Simulation
- [ ] Mini-game TPS lengkap (alur 8 langkah)
- [ ] Kandidat fiktif/abstrak
- [ ] Review & feedback literasi
- [ ] Completion reward
- [ ] Test simulasi

## PHASE 10 — Polish
- [ ] Animasi & animasi transisi
- [ ] Audio lengkap (music/sfx/ambient/ui/footsteps)
- [ ] Particle (daun, debu)
- [ ] UI polish & micro-animation
- [ ] Accessibility (reduced motion, subtitle, skip dialog, volume)
- [ ] Test polish & accessibility

## PHASE 11 — PWA + Mobile
- [ ] Installable PWA
- [ ] Offline cache Service Worker
- [ ] Responsive mobile QA (touch, safe-area, landscape)
- [ ] iPad/Android/iOS test
- [ ] Test offline & install

## PHASE 12 — Production & Deployment
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
| Phase 0 | 🔄 dikerjakan |
| Phase 1–12 | ⏳ menunggu |

## Proteksi
Tidak melompat ke fase berikutnya sebelum fase berjalan & laporan fase dikirim. Tunggu instruksi `LANJUT PHASE <n>`.