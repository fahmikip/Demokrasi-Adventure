# Deployment — GitHub Pages

## 1. Aktifkan GitHub Pages (sekali saja)

1. Repo → **Settings** → **Pages**.
2. **Build and deployment** → *Source*: pilih **GitHub Actions**.
   (Workflow `.github/workflows/deploy.yml` akan men-deploy root repo otomatis.)

## 2. Alur deploy otomatis

- Setiap **push ke `main`** memicu workflow `deploy.yml`:
  `checkout` → `configure-pages` → `upload-pages-artifact` (path `.` = root repo) → `deploy-pages`.
- Hasil live di `https://<user>.github.io/<repo>/` (arti `url` pada ringkasan workflow).

## 3. Kenapa berjalan di subpath (tanpa konfigurasi)

- `Config.BASE_PATH` (`src/core/Config.js`) dideteksi otomatis dari `location` — di GitHub Pages menghasilkan
  `https://<user>.github.io/<repo>/`.
- `manifest.json`: `start_url: "./"` & `scope: "./"` relatif → ikut menunjuk ke subpath.
- Service Worker diregistrasi dengan `Config.BASE_PATH + "sw.js"` (absolut) → scope benar.
- `sw.js` memakai URL relatif → cache keys membentuk path absolut yang konsisten.

## 4. Offline & PWA setelah deploy

- Kunjungan online pertama → SW `v2` meng-install precache (shell + modul + data + Phaser CDN).
- Selanjutnya **offline sepenuhnya bekerja**: navigasi network-first → fallback cache `index.html`;
  seluruh aset cache-first.
- **Menambah versi SW/punya perubahan caching** → naikkan `CACHE_VERSION` di `sw.js`
  + perbarui `PRECACHE` (via glob `src/` + `data/`). Cache lama otomatis di-prune saat activate.
- **Instalasi** — Chrome/Android: ikon instal di address bar / menu; iOS Safari: **Share → Add to Home Screen**
  (memakai `apple-mobile-web-app-*` meta + `apple-touch-icon.png` 180px).

## 5. QA rilis (checklist)

- [ ] Boot production di `https://<user>.github.io/<repo>/` — canvas tampil, tanpa error console
      (debug nonaktif: `Config.DEBUG` default `false`).
- [ ] Ada < 3 detik, cek tambahan `?debug=1` aktif untuk smoke.
- [ ] Smoke: `?scene=WorldScene&selftest=1&debug=1&quest=1` dsb. (lihat `docs/TEST_PLAN.md`).
- [ ] Offline: buka sekali online → matikan jaringan → refresh → game tetap boot (uji di device nyata).
- [ ] Instalasi PWA di Android + iOS + iPad (manual QA, fase 10 sisa).
- [ ] Lighthouse/audit: icon manifest ≥144px, `theme-color`, viewport, dsb.

## 6. Rollback

- Deploy ulang commit sebelumnya (push / `git revert` ke `main`), atau atur *Source* Pages ke branch lain.