# Changelog

Format: `Versi — tl;dr perubahan`. Detail per fase di `docs/ROADMAP.md`.

## 1.7.0 — Phase 11: Production & Deployment (2026-09-25)
- **Production gate** — `Config.DEBUG` default nonaktif; diaktifkan via `?debug=1` (atau `window.__DEMOKRASI_DEBUG__=true`). Mode production boot bersih tanpa smoke/debug overlay/physics debug.
- **Service Worker** — aturan registrasi production-clean: di origin non-localhost selalu ter-register; localhost perlu `?sw=1` (dev bebas cache).
- **Perf** — tab hidden: game loop di-tidurkan + `AudioContext` di-suspend (lanjut saat kembali); `roundPixels` untuk render pixel-art yang tajam.
- **Bug fix mobile** — indikator jurnal di HUD kini bisa diketuk/diklik (bukan hanya tombol `J`); menyelesaikan sisa Phase 6.
- **CI & deployment** — workflow GitHub Actions `deploy.yml` (Pages via Actions), `.nojekyll`.
- **Dokumentasi** — README lengkap, `CHANGELOG.md`, `docs/DEPLOYMENT.md`.
- Smoke `?debug=1` : plain/quest/journal/decision/tps/audio/access/pwa ✅.

## 1.6.0 — Phase 10: PWA & Mobile (2026-09-25)
- Manifest lengkap (`id`, `display: standalone`, `categories`) + iOS meta + `apple-touch-icon` 180px.
- Service Worker `v2`: precache 140 URL (shell + 65 modul + 65 data + ikon + Phaser CDN); navigasi network-first → `index.html`; aset cache-first; JSON offline → 504 aman.
- Offline boot terverifikasi: kunjungan online sekali → server mati → game tetap boot penuh.
- CSS mobile: safe-area, user-select none, display-mode standalone, :fullscreen.
- Smoke `?sw=1&pwa=1` + regresi ✅.

## 1.5.0 — Phase 9: Polish (2026-09-25)
- Audio lengkap: AudioManager sintesis WebAudio (13 suara, 6 channel), pemicu gameplay, persisten via SettingsManager.
- Particle debu kaki + daun; UI micro-animation (button press, panel, toggle, blip).
- Aksesibilitas: Kurangi Gerakan / Subtitle / Teks Instan di panel AKSESIBILITAS.
- Smoke `?audio=1` & `?access=1`.

## 1.4.0 — Phase 8: TPS Simulation (2026-09-24)
- TPSScene: simulasi pemungutan suara 8 langkah (kandidat fiktif/abstrak), review & reward, Misi 03, 2-3 achievement.
- Smoke `?tps=1`.

## 1.3.0 — Phase 7: Decision System (2026-09-24)
- DecisionManager (flags/decisions/relationships/jurnal), skenario verifikasi kabar di pasar, branching via conditions.
- Smoke `?decision=1`.

## 1.2.0 — Phase 6: Journal & Education (2026-09-23)
- Journal + 18 kartu edukasi (7 kategori), collectible → entri ber-sumber, HUD `📖 Jurnal N`.
- Smoke `?journal=1`.

## 1.1.0 — Phase 5: Progression (2026-09-23)
- XP/Level/Coin + achievement + collectible fisik, HUD stat, quest misi 01.
- Smoke `?progression=1` / `?quest=1`.

## 1.0.0 — Phase 0–4: Fondasi (2026-09-17 … 2026-09-22)
- Boot, Preload (placeholder procedural), Menu, World (tilemap, player, kamera follow, kolision), UIScene (HUD, pause, touch controls), Pause, Save stub, PWA dasar (manifest + sw + register), NPC + Dialogue engine, Quest registry + tracker.