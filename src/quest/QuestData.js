/**
 * QuestData — memuat quest dari data/quests/*.json.
 * Mengikuti pola MapManager: cache di memori, fetch saat pertama dipanggil.
 */

import { Config } from "../core/Config.js";

class QuestDataClass {
  constructor() {
    this.registry = [];
    this.quests = new Map(); // id -> Quest
    this._loaded = false;
  }

  get loaded() {
    return this._loaded;
  }

  getQuest(questId) {
    return this.quests.get(questId);
  }

  all() {
    return [...this.quests.values()];
  }

  async load() {
    if (this._loaded) return;

    const base = Config.BASE_PATH + Config.PATHS.QUESTS;
    const res = await fetch(base + "quest_registry.json");
    if (!res.ok) {
      throw new Error(`[QuestData] Gagal memuat quest_registry (${res.status})`);
    }
    const registry = await res.json();
    this.registry = registry.quests || [];

    for (const entry of this.registry) {
      const file = entry.file || entry.id + ".json";
      const qres = await fetch(base + file);
      if (!qres.ok) {
        console.warn(`[QuestData] Quest "${entry.id}" gagal dimuat (${qres.status})`);
        continue;
      }
      const def = await qres.json();
      if (!def || !def.id) {
        console.warn(`[QuestData] Quest "${entry.id}" tidak valid`);
        continue;
      }
      this.quests.set(def.id, def);
    }
    this._loaded = true;
  }

  clear() {
    this.registry = [];
    this.quests.clear();
    this._loaded = false;
  }
}

export const QuestData = new QuestDataClass();