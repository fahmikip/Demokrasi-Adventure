/**
 * MapManager — memuat & meng-cache peta berbasis JSON (data/maps/*.json).
 * Data murni; seluruh pembangunan dunia dilakukan oleh WorldBuilder.
 */

import { Config } from "../core/Config.js";

class MapManagerClass {
  constructor() {
    this.cache = new Map();
  }

  get loaded() {
    return [...this.cache.keys()];
  }

  getCached(mapId) {
    return this.cache.get(mapId);
  }

  async load(mapId) {
    if (this.cache.has(mapId)) return this.cache.get(mapId);

    const url = Config.BASE_PATH + Config.PATHS.MAPS + mapId + ".json";
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`[MapManager] Gagal memuat peta "${mapId}" (${res.status})`);
    }
    const data = await res.json();
    if (!data || !data.id) {
      throw new Error(`[MapManager] Data peta "${mapId}" tidak valid`);
    }
    this.cache.set(mapId, data);
    return data;
  }

  clear() {
    this.cache.clear();
  }
}

export const MapManager = new MapManagerClass();