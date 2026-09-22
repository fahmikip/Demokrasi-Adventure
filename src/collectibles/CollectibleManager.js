/**
 * CollectibleManager — spawn & pengambilan item collectible di dunia (Phase 5).
 * - setup(scene, mapData): spawn sprite collectible dari `mapData.collectibles`.
 * - update(playerX, playerY): klaim saat pemain cukup dekat, sekali per sesi
 *   (set _claimed), lalu beri reward XP/Koin & pancarkan ITEM_COLLECTED.
 * Singleton agar status _claimed bertahan lintas transisi area.
 */

import { Config } from "../core/Config.js";
import { GameState, GAME_STATES } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";
import { ProgressState } from "../core/ProgressState.js";
import { CollectibleData } from "./CollectibleData.js";

class CollectibleManagerClass {
  constructor() {
    this.scene = null;
    this.entries = [];
    this._claimed = new Set();
    this._dataPromise = null;
  }

  /** Spawn semua collectible milik peta; kembalikan array sprite (untuk y-sort). */
  async setup(scene, mapData) {
    this.scene = scene;
    this.clearSprites();
    if (!mapData || !mapData.collectibles || !mapData.collectibles.length) return [];

    if (!CollectibleData.loaded) {
      if (!this._dataPromise) {
        this._dataPromise = CollectibleData.load().catch((err) => {
          console.warn("[CollectibleManager] Gagal memuat registry:", err);
        });
      }
      await this._dataPromise;
    }

    const TILE = Config.TILE.SIZE;
    const sprites = [];
    for (const entry of mapData.collectibles || []) {
      const def = CollectibleData.get(entry.itemId);
      if (!def) {
        console.warn(`[CollectibleManager] Item tak dikenal: "${entry.itemId}"`);
        continue;
      }
      const px = (entry.x + 0.5) * TILE;
      const py = (entry.y + 0.5) * TILE;
      const sprite = scene.add
        .sprite(px, py, def.texture)
        .setDepth(py)
        .setScale(def.scale || 1);
      this.entries.push({ key: `${mapData.id}:${entry.itemId}`, item: def, entry, sprite });
      sprites.push(sprite);
    }
    return sprites;
  }

  update(playerX, playerY) {
    if (GameState.current !== GAME_STATES.PLAYING || !this.scene) return;
    const R = Config.PROGRESSION.COLLECTIBLES.RADIUS + Config.PLAYER.TILE_SIZE;
    for (const e of this.entries) {
      if (!e.sprite || !e.sprite.active) continue;
      const px = this.scene.mapData && e.entry ? (e.entry.x + 0.5) * Config.TILE.SIZE : e.sprite.x;
      const py = this.scene.mapData && e.entry ? (e.entry.y + 0.5) * Config.TILE.SIZE : e.sprite.y;
      if (Math.hypot(playerX - px, playerY - py) <= R) {
        this._claim(e);
      }
    }
  }

  _claim(e) {
    if (this._claimed.has(e.key)) return;
    this._claimed.add(e.key);
    if (e.sprite) {
      e.sprite.destroy();
      e.sprite = null;
    }

    const mapId = this.scene && this.scene.mapData ? this.scene.mapData.id : null;
    EventBus.emit("ITEM_COLLECTED", {
      itemId: e.item.id,
      item: e.item,
      mapId,
      kind: e.item.kind,
      hidden: !!e.item.hidden,
    });

    const xp = e.item.xp ?? Config.PROGRESSION.EVENTS.collectible_xp;
    const coins = e.item.coins || 0;
    if (xp) ProgressState.addXP(xp, "collectible");
    if (coins) ProgressState.addCoins(coins, "collectible");
  }

  claimedCount() {
    return this._claimed.size;
  }

  clearSprites() {
    for (const e of this.entries) {
      if (e.sprite) e.sprite.destroy();
    }
    this.entries = [];
  }

  reset() {
    this.clearSprites();
    this._claimed.clear();
    this.scene = null;
  }

  snapshot() {
    return { claimed: this.claimedCount(), items: this.entries.length };
  }
}

export const CollectibleManager = new CollectibleManagerClass();