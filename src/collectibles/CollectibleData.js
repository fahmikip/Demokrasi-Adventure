/**
 * CollectibleData — memuat registry item collectible (Phase 5).
 * Registry memberi metadata item (kind, nama, texture, reward, hidden);
 * penempatan per peta ada di data/maps/<id>.json (`collectibles` array).
 */

import { Config } from "../core/Config.js";

class CollectibleDataClass {
  constructor() {
    this.registry = new Map(); // id -> definisi
    this._loaded = false;
  }

  get loaded() {
    return this._loaded;
  }

  get(id) {
    return this.registry.get(id);
  }

  all() {
    return [...this.registry.values()];
  }

  async load() {
    if (this._loaded) return;
    const base = Config.BASE_PATH + Config.PATHS.COLLECTIBLES;
    const res = await fetch(base + "collectible_registry.json");
    if (!res.ok) {
      throw new Error(`[CollectibleData] Gagal memuat registry (${res.status})`);
    }
    const data = await res.json();
    for (const def of data.collectibles || []) {
      if (def && def.id) this.registry.set(def.id, def);
    }
    this._loaded = true;
  }

  clear() {
    this.registry.clear();
    this._loaded = false;
  }
}

export const CollectibleData = new CollectibleDataClass();