/**
 * JournalManager — koleksi entri jurnal pemain (Phase 6).
 * Sumber entri:
 *   1. QUEST_COMPLETED  -> payload.journalEntries (kartu dari quest).
 *   2. ITEM_COLLECTED   -> item.journalId menunjuk kartu di data/education/.
 * Setiap entri menyimpan kategori, judul, teks, source & tanggal terbarui,
 * sehingga UI tinggal menyajikan. Manager menerbitkan JOURNAL_UPDATED saat
 * ada entri baru.
 */

import { EventBus } from "../core/EventBus.js";
import { JournalData } from "./JournalData.js";

class JournalManagerClass {
  constructor() {
    this.entries = new Map(); // id -> entri
    this._bound = false;
  }

  ensureBound() {
    if (this._bound) return;
    this._bound = true;
    EventBus.on("QUEST_COMPLETED", (payload) => this._onQuest(payload));
    EventBus.on("ITEM_COLLECTED", (payload) => this._onCollectible(payload));
  }

  get(id) {
    return this.entries.get(id);
  }

  count() {
    return this.entries.size;
  }

  all() {
    return [...this.entries.values()];
  }

  byCategory(category) {
    return this.all().filter((e) => e.category === category);
  }

  categoryTotals() {
    const list = JournalData.categories.length
      ? JournalData.categories
      : [...new Set(this.all().map((e) => e.category))];
    return list.map((category) => ({
      category,
      count: this.byCategory(category).length,
    }));
  }

  snapshot() {
    return {
      total: this.count(),
      categories: this.categoryTotals(),
      entries: this.all().map((e) => ({
        id: e.id,
        category: e.category,
        title: e.title,
        source: e.source || "",
        origin: e.origin,
      })),
    };
  }

  _onQuest(payload) {
    const quest = payload && payload.quest;
    const list = (payload && payload.journalEntries) || [];
    if (!quest) return;
    list.forEach((entry, i) => {
      if (!entry || !entry.title) return;
      this._add({
        id: `quest:${quest.id}:${i}`,
        category: entry.category || "Informasi",
        title: entry.title,
        text: entry.text || entry.content || "",
        source: entry.source || "",
        lastUpdated: entry.lastUpdated || "",
        origin: "quest",
        questId: quest.id,
      });
    });
  }

  _onCollectible(payload) {
    const item = payload && payload.item;
    if (!item || !item.id) return;
    const card = item.journalId ? JournalData.get(item.journalId) : null;
    if (card) {
      this._add({
        id: `collectible:${item.id}`,
        category: card.category || "Informasi",
        title: card.title || item.name,
        text: card.content || item.description || "",
        source: card.source || "",
        lastUpdated: card.lastUpdated || "",
        origin: "collectible",
        itemId: item.id,
        journalId: card.id,
      });
    } else {
      this._add({
        id: `collectible:${item.id}`,
        category: "Informasi",
        title: item.name || item.id,
        text: item.description || "",
        source: "Registry Item",
        lastUpdated: "",
        origin: "collectible",
        itemId: item.id,
      });
    }
  }

  _add(entry) {
    if (this.entries.has(entry.id)) return;
    this.entries.set(entry.id, entry);
    EventBus.emit("JOURNAL_UPDATED", { entry, total: this.count() });
  }

  reset() {
    this.entries.clear();
  }
}

export const JournalManager = new JournalManagerClass();