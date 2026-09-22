/**
 * JournalData — memuat kartu edukasi jurnal dari data/education/*.json (Phase 6).
 * Konten (teks, source, kategori) seluruhnya dari file JSON; engine hanya
 * menyajikan, sehingga konten bisa diperbarui tanpa mengubah kode.
 */

import { Config } from "../core/Config.js";

class JournalDataClass {
  constructor() {
    this.registry = [];
    this.cards = new Map(); // id -> kartu
    this.categories = [];
    this._loaded = false;
  }

  get loaded() {
    return this._loaded;
  }

  get(id) {
    return this.cards.get(id);
  }

  all() {
    return [...this.cards.values()];
  }

  byCategory(category) {
    return this.all().filter((c) => c.category === category);
  }

  async load() {
    if (this._loaded) return;

    const base = Config.BASE_PATH + Config.PATHS.EDUCATION;
    const res = await fetch(base + "education_registry.json");
    if (!res.ok) {
      throw new Error(`[JournalData] Gagal memuat education_registry (${res.status})`);
    }
    const registry = await res.json();
    this.registry = registry.cards || [];
    this.categories = registry.categories || [];

    for (const entry of this.registry) {
      const file = entry.file || entry.id + ".json";
      const cardRes = await fetch(base + file);
      if (!cardRes.ok) {
        console.warn(`[JournalData] Kartu "${entry.id}" gagal dimuat (${cardRes.status})`);
        continue;
      }
      const card = await cardRes.json();
      if (!card || !card.id) {
        console.warn(`[JournalData] Kartu "${entry.id}" tidak valid`);
        continue;
      }
      this.cards.set(card.id, card);
    }
    this._loaded = true;
  }

  clear() {
    this.registry = [];
    this.cards.clear();
    this.categories = [];
    this._loaded = false;
  }
}

export const JournalData = new JournalDataClass();