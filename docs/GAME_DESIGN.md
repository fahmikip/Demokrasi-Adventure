# DEMOKRASI ADVENTURE — Game Design Document

## 1. Ringkasan

**Genre:** 2D Top-Down Stylized Adventure (Edukasi)

**Tagline:** *Jelajahi Kotanya. Temukan Informasinya. Pahami Prosesnya.*

**Platform:** Web (Desktop + Mobile), dapat di-install sebagai PWA, deploy ke GitHub Pages.

**Target Pemain:** Remaja dan pemilih pemula.

**Tema:** Sosialisasi pemilu dan literasi demokrasi yang dikemas sebagai petualangan, bukan kuis.

---

## 2. Vision

Pemain harus merasa seperti sedang memainkan adventure game sungguhan dengan eksplorasi, NPC, dialog bercabang, quest, dan progresi — bukan membaca materi sosialisasi yang dirangkai sebagai kuis.

Semua materi edukasi masuk secara natural melalui: **dunia → NPC → cerita → quest → eksplorasi → keputusan → journal → simulasi.**

Prioritas: **Fun → Exploration → Story → Interaction → Education → Progression.**

---

## 3. Dunia

### DemoKrasi City

Dunia utama dengan beberapa area tematik:

| Area | Konten | Tema Edukasi |
|------|--------|--------------|
| **Desa Harmoni** | Rumah warga, jalan kampung, warung, taman, lapangan, balai desa, papan informasi, sekolah kecil | Pengenalan pemilu, pemilih, informasi resmi |
| **Sekolah Nusantara** | Ruang kelas, lapangan, perpustakaan, kantin, guru, siswa | Pemilih pemula, literasi informasi, verifikasi |
| **Pasar Rakyat** | Toko, warung, pedagang, jalan ramai, kendaraan, papan iklan | Rumor, informasi belum terverifikasi, memeriksa sumber |
| **Pusat Kota** | Jalan besar, taman kota, kantor pelayanan, gedung publik, halte, toko | Tahapan pemilu, informasi publik, akses informasi |
| **TPS** | Area simulasi khusus | Proses pemungutan suara |

---

## 4. Pemain

- Kontrol: WASD / Arrow Keys, E (interaksi), Esc (menu). Mobile: virtual joystick + tombol aksi.
- State: IDLE, WALK, INTERACT, DIALOGUE, QUEST, CUTSCENE, MENU.
- Pemain **tidak boleh bergerak** saat dialog/cutscene/menu.
- Progresi: XP, Level, Democracy Coins, Achievement, Collectible, Journal.

---

## 5. Sistem Inti

### 5.1 Quest
- **Main Quest:** dorongan cerita utama.
- **Side Quest:** tambahan opsional.
- **Exploration Quest:** mencari objek/lokasi.
- **Knowledge Quest:** mempelajari informasi.
- **Challenge Quest:** skenario pemecahan masalah.

### 5.2 Keputusan
Keputusan pemain memengaruhi dialog, quest, relasi NPC, journal, achievement, dan reward kosmetik. **Tidak ada reward berbasis preferensi kandidat/partai.** Fokus: literasi, verifikasi informasi, pemahaman proses, eksplorasi, penyelesaian quest.

### 5.3 Progresi

| Level | Nama |
|-------|------|
| 1 | Pemula |
| 2 | Penjelajah |
| 3 | Pencari Informasi |
| 4 | Literasi Digital |
| 5 | Penjelajah Demokrasi |

Level adalah representasi progress game, bukan penilaian moral/politik.

### 5.4 Mata Uang
**Democracy Coins** — hanya untuk kosmetik (emote, outfit, aksesori, dekorasi).

### 5.5 Inventory
Item edukasi, collectible, badge, key item, cosmetic item.

### 5.6 Journal
**DEMOCRACY JOURNAL** dengan kategori: Pemilu, Pemilih, Tahapan, Informasi, Literasi Digital, TPS, Penyelenggara. Setiap entry memiliki source & tanggal pembaruan.

---

## 6. Simulasi TPS

Mini-game khusus dengan alur:

```
Datang → Interaksi → Verifikasi proses → Menerima perlengkapan
→ Masuk area pemungutan → Simulasi sesuai aturan → Selesai → Review
```

- **Tidak ada kandidat nyata.**
- **Tidak meminta pemain memilih kandidat nyata.**
- Gunakan pilihan fiktif/simulasi abstrak.

---

## 7. Neutralitas & Keamanan Konten

- Tidak mempromosikan kandidat/partai.
- Tidak ada reward karena preferensi politik.
- Tidak ada kandidat sebagai villain.
- Tidak ada propaganda atau logo partai sebagai elemen gameplay.
- Konten faktual/prosedural harus terverifikasi & mudah diperbarui.
- Fakta prosedural dipisahkan dari opini.

---

## 8. Fitur Utama

- Eksplorasi dunia + tilemap + collision + transisi antar area
- NPC dengan schedule & relasi
- Dialog bercabang dengan kondisi
- Quest dengan objective & reward
- XP, Level, Achievement (min 15), Collectible
- Inventory & Democracy Coins
- Journal edukasi dengan metadata sumber
- Simulasi TPS
- Save/Load (LocalStorage, versioned save)
- Audio modular (music, sfx, ambient, ui, footsteps)
- PWA + Service Worker + offline cache
- Responsive desktop & mobile
- Accessibility: keyboard, touch, reduced motion, subtitle, volume control

---

## 9. Achievement (Minimal 15)

First Step, Explorer, Curious Mind, Information Hunter, Knowledge Seeker, Village Helper, City Explorer, Journal Collector, Quest Master, Complete Explorer, First Simulation, Hidden Discovery, Perfect Mission, Dialogue Explorer, Adventure Complete.

---

## 10. Kriteria Sukses

- Dapat diselesaikan dari awal hingga akhir tanpa error.
- Mobile & desktop tetap berfungsi setara.
- Materi edukasi tersampaikan secara natural melalui gameplay.
- Arsitektur modular & data-driven.

---

## 11. Roadmap

Lihat `docs/ROADMAP.md` untuk detail 12 fase pengembangan.