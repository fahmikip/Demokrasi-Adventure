# DEMOKRASI ADVENTURE

**Jelajahi Kotanya. Temukan Informasinya. Pahami Prosesnya.**

Game petualangan 2D edukasi berbasis browser tentang literasi demokrasi & pemilu. Dibangun dengan HTML5 + JavaScript ES Modules + Phaser 3, data-driven (JSON), dan dapat di-install sebagai PWA.

---

## Tech Stack

- HTML5 / CSS3 / JavaScript (ES Modules)
- Phaser 3 (2D game engine)
- JSON data (maps, quests, NPCs, dialogues, items, education)
- LocalStorage (save), Service Worker (offline)
- GitHub Pages compatible

## Cara Menjalankan

```bash
# serve statis di folder project
npx serve .
# atau
python -m http.server 8080
```

Lalu buka `http://localhost:8080`.

> Phaser dimuat dari CDN. Untuk mode offline total, unduh `phaser.min.js` ke `vendor/` dan sesuaikan `index.html`.

## Struktur

Lihat `docs/TECHNICAL_ARCHITECTURE.md`.

## Dokumentasi

- `docs/GAME_DESIGN.md` — desain game & fitur
- `docs/ART_DIRECTION.md` — standar visual & asset
- `docs/TECHNICAL_ARCHITECTURE.md` — arsitektur kode
- `docs/CONTENT_GUIDELINES.md` — aturan konten & neutralitas
- `docs/ROADMAP.md` — roadmap 12 fase
- `docs/TEST_PLAN.md` — rencana pengujian

## Kontrol

- **Desktop:** WASD / Arrow Keys — gerak, `E` — interaksi, `Esc` — pause
- **Mobile:** virtual joystick + tombol interaksi

## Prinsip

Fun → Exploration → Story → Interaction → Education → Progression.
Gameplay engine dipisahkan dari konten edukasi (data-driven) agar materi mudah diperbarui tanpa mengubah kode.