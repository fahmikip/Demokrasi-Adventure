# DEMOKRASI ADVENTURE — Content Guidelines

Dokumen ini menjadi panduan untuk semua materi edukasi, dialog, quest, dan pilihan dalam game. **Wajib dibaca sebelum menulis konten.**

## 1. Tujuan Konten

Menyampaikan literasi demokrasi & pemilu melalui pengalaman bermain, bukan ceramah. Semua materi masuk lewat: dunia, NPC, cerita, quest, eksplorasi, keputusan, journal, dan simulasi.

## 2. Prinsip Neutrality (Mutlak)

**DILARANG:**
- Mempromosikan kandidat, partai, atau pilihan politik tertentu.
- Memberi reward karena preferensi politik pemain.
- Menjadikan kandidat/partai tertentu sebagai villain.
- Menggunakan propaganda.
- Menggunakan logo kandidat/partai sebagai elemen gameplay.
- Meminta pemain memilih kandidat nyata.
- Menyisipkan ajakan politik.

**USE:**
- Karakter dan pilihan fiktif.
- Pemilihan abstrak / kandidat simulasi.
- Fokus pada literasi, proses, informasi, eksplorasi, edukasi.

## 3. Fakta vs Opini

- **Fakta prosedural/regulasi:** harus terverifikasi, punya sumber, dan mudah diperbarui. Disimpan terpisah di `data/education/` dengan metadata sumber.
- **Opini/perspektif NPC:** ditampilkan sebagai opini karakter, bukan fakta, dan dapat diberi counter-check (misal NPC lain menjelaskan proses verifikasi).

## 4. Struktur Materi Edukasi

Setiap materi di `data/education/`:

```json
{
  "id": "edu_001",
  "title": "Apa itu Pemilih?",
  "content": "...",
  "source": "Sumber resmi + tautan",
  "lastUpdated": "YYYY-MM-DD"
}
```

- Engine tidak boleh berisi materi faktual hardcoded.
- Pembaruan konten cukup edit JSON `data/education/`, tanpa mengubah engine.
- Tim konten wajib meninjau `lastUpdated` dan sumber saat pemilu berikutnya mendekat.

## 5. Kategori Journal

```
Pemilu, Pemilih, Tahapan, Informasi, Literasi Digital, TPS, Penyelenggara
```

Setiap entry: title, description, source, dateUpdated.

## 6. Dialog

- Gunakan bahasa Indonesia yang natural dan ramah, konteks kampung/kota.
- Dialog bukan kuis. Pemain membuat keputusan dalam dunia.
- Tiap percakapan pendek (maks ~3 layar) agar tidak melelahkan.
- NPC punya voice & gaya sendiri (ibu guru, pedagang, anak kecil, lansia).

## 7. Quest & Keputusan

- Reward berdasarkan: literasi, verifikasi informasi, pemahaman proses, eksplorasi, penyelesaian quest.
- Keputusan membuka konsekuensi story/NPC relationship/journal — bukan penilaian benar-salah moral yang menggurui.
- Untuk skenario cek fakta: tujuan bukan "jawaban benar", melainkan pemain belajar MEMERIKSA (tanya sumber, bandingkan, tunggu konfirmasi).

## 8. TPS Simulation

- Alur: Datang → Interaksi → Verifikasi proses → Terima perlengkapan → Area pemungutan → Simulasi → Selesai → Review.
- Tidak ada nama/logo/partai/kandidat nyata.
- Pilihan dalam simulasi bersifat fiktif/abstrak.
- Review memberi feedback literasi, bukan judgement politik.

## 9. Tone

- Hangat, ramah, memberdayakan (empowering), bukan menggurui.
- Hindari jargon birokrasi berlebihan. Jelaskan istilah bila muncul.
- Tetap serius untuk bagian prosedural, tetap playful untuk eksplorasi.

## 10. Safety

- Tidak ada konten yang menyudutkan kelompok.
- Tidak ada SARA, ujaran kebencian, hoaks nyata yang diangkat sebagai nama.
- Contoh rumor berbahaya disebut anonim ("sebuah pesan di grup"), bukan kandidat nyata.

## 11. Tanggung Jawab Tim

- Admin konten menjaga akurasi & memperbarui tanggal.
- Jika ragu soal fakta → tulis opini NPC & dorong verifikasi.
- Semua konten faktual memiliki `source`.