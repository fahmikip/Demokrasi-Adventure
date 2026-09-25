# DEMOKRASI ADVENTURE

**Jelajahi Kotanya. Temukan Informasinya. Pahami Prosesnya.**

Game petualangan 2D edukasi berbasis browser tentang literasi demokrasi & pemilu untuk pemilih pemula.
Dibangun dengan HTML5 + JavaScript ES Modules + Phaser 3, data-driven (JSON), installable sebagai PWA,
dan dapat berjalan **offline penuh**.

---

## Fitur

- **Dunia terbuka** — 5 area (Desa Harmoni, Sekolah, Pasar Rakyat, Pusat Kota, TPS), tilemap + kamera follow + kolision.
- **NPC & Dialogue** — percakapan bercabang (`conditions`, `startSelector`), subtitle & teks instan (aksesibilitas).
- **Quest** — 3 misi berjenjang dengan tracker HUD (objective talk/interact/collect).
- **Decision system** — skenario verifikasi kabar di pasar: keputusan tercatat (flags, hubungan, jurnal).
- **TPS Simulation** — mini-game pemungutan suara 8 langkah dengan kandidat fiktif/abstrak + review literasi.
- **Progression** — XP/Level/Coin, 18 achievement, 20 collectible.
- **Journal & Education** — 18 kartu edukasi (7 kategori: Pemilu, TPS, Pemilih, Informasi, Literasi, Tahapan, Penyelenggara).
- **Audio sintesis WebAudio** — 13 suara, 6 channel (master/music/sfx/ambient/ui/footsteps), tanpa file audio.
- **Aksesibilitas** — Kurangi Gerakan, Subtitle, Teks Instan (tersimpan lintas sesi).
- **PWA** — installable (manifest + iOS meta + apple-touch-icon), offline via Service Worker.

## Tech Stack

- HTML5 / CSS3 / JavaScript (ES Modules) — tanpa framework frontend lain
- Phaser 3 (2D game engine, WebGL fallback Canvas)
- JSON — seluruh data game (maps, quests, NPC, dialogue, education, TPS)
- Web Audio API — audio sintesis
- LocalStorage — pengaturan & save
- Service Worker — offline cache
- GitHub Actions — deploy ke GitHub Pages

## Cara Menjalankan

```bash
# serve statis di folder project
npx serve .
# atau
python -m http.server 8080
```

Lalu buka `http://localhost:8080`.

> Phaser dimuat dari CDN, namun Service Worker (Phase 10) otomatis meng-cache-nya
> (`https://cdnjs.cloudflare.com/.../phaser.min.js`) — game tetap jalan penuh offline
> setelah kunjungan online pertama. Opsional: unduh ke `vendor/` bila ingin tanpa CDN sama sekali.

### Mode development

```bash
# aktifkan debug (smoke test, F1 overlay, physics debug) — default nonaktif di production
# buka http://localhost:8080/?debug=1
```

## Kontrol

- **Desktop:** WASD / Arrow Keys — gerak · `E` — interaksi · `M` — peta dunia · `J` — jurnal · `Esc` — pause
- **Mobile:** virtual joystick + tombol interaksi; badge jurnal di HUD bisa diketuk; tombol prestasi/peta/pause di kanan atas
- **Dialogue:** `E` / klik lanjut, tombol angka / klik untuk pilihan, `E` untuk skip

## Test

Automated smoke test (headless Chrome) — detail lengkap di `docs/TEST_PLAN.md`:

```bash
python -m http.server 8000
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-sandbox \
  --use-angle=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=20000 --dump-dom \
  "http://127.0.0.1:8000/index.html?scene=WorldScene&selftest=1&debug=1"
# (keluaran divalidasi via <title>SMOKE:{...}</title>)
```

Parameter: `&quest=1` `&journal=1` `&decision=1` `&tps=1` `&audio=1` `&access=1` `&sw=1&pwa=1`.

## Deployment

GitHub Pages otomatis via GitHub Actions (`.github/workflows/deploy.yml`) — setiap push ke `main`.
Panduan lengkap: `docs/DEPLOYMENT.md`. Contoh live: `https://<user>.github.io/<repo>/`.

## Dokumentasi

- `docs/GAME_DESIGN.md` — desain game & fitur
- `docs/ART_DIRECTION.md` — standar visual & asset
- `docs/TECHNICAL_ARCHITECTURE.md` — arsitektur kode
- `docs/CONTENT_GUIDELINES.md` — aturan konten & neutralitas
- `docs/ROADMAP.md` — roadmap fase
- `docs/TEST_PLAN.md` — rencana & hasil pengujian
- `docs/DEPLOYMENT.md` — panduan deploy GitHub Pages
- `CHANGELOG.md` — riwayat rilis

## Prinsip

Fun → Exploration → Story → Interaction → Education → Progression.
Gameplay engine dipisahkan dari konten edukasi (data-driven) agar materi mudah diperbarui tanpa mengubah kode.