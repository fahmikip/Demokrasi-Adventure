/**
 * AchievementData — memuat achievement dari data/achievements/*.json (Phase 5).
 * Mengikuti pola QuestData/MapManager: cache di memori, fetch saat pertama dipanggil.
 */

import { Config } from "../core/Config.js";

class AchievementDataClass {
  constructor() {
    this.registry = [];
    this.list = new Map(); // id -> definisi
    this._loaded = false;
  }

  get loaded() {
    return this._loaded;
  }

  get(id) {
    return this.list.get(id);
  }

  all() {
    return [...this.list.values()];
  }

  async load() {
    if (this._loaded) return;

    const base = Config.BASE_PATH + Config.PATHS.ACHIEVEMENTS;
    const res = await fetch(base + "achievement_registry.json");
    if (!res.ok) {
      throw new Error(`[AchievementData] Gagal memuat registry (${res.status})`);
    }
    const data = await res.json();
    this.registry = data.achievements || [];

    for (const entry of this.registry) {
      const file = entry.file || entry.id + ".json";
      const ares = await fetch(base + file);
      if (!ares.ok) {
        console.warn(`[AchievementData] "${entry.id}" gagal dimuat (${ares.status})`);
        continue;
      }
      const def = await ares.json();
      if (!def || !def.id) {
        console.warn(`[AchievementData] "${entry.id}" tidak valid`);
        continue;
      }
      this.list.set(def.id, def);
    }
    this._loaded = true;
  }

  clear() {
    this.registry = [];
    this.list.clear();
    this._loaded = false;
  }
}

export const AchievementData = new AchievementDataClass();