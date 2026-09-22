/**
 * ProgressState — facade progresi (Phase 5).
 * Data sebenarnya dikelola XPManager & CoinManager; facade ini menjaga
 * API lama (level/xp/coins + addXP/addCoins/reset) dan memancarkan
 * PROGRESS_CHANGED agar HUD & sistem lain tetap berjalan tanpa perubahan.
 */

import { EventBus } from "./EventBus.js";
import { LevelManager } from "../progression/LevelManager.js";
import { XPManager } from "../progression/XPManager.js";
import { CoinManager } from "../progression/CoinManager.js";

class ProgressStateClass {
  get level() {
    return XPManager.level;
  }

  get xp() {
    return XPManager.xp;
  }

  get coins() {
    return CoinManager.coins;
  }

  addXP(amount, source = "quest") {
    XPManager.addXP(amount, source);
    this._emit();
  }

  addCoins(amount, source = "quest") {
    CoinManager.addCoins(amount, source);
    this._emit();
  }

  _emit() {
    const level = LevelManager.levelForXP(this.xp);
    EventBus.emit("PROGRESS_CHANGED", {
      level,
      xp: this.xp,
      coins: this.coins,
      levelName: LevelManager.name(level),
      xpToNext: LevelManager.xpToNext(this.xp, level),
      progress: LevelManager.progress(this.xp, level),
    });
  }

  reset() {
    XPManager.reset();
    CoinManager.reset();
    this._emit();
  }

  snapshot() {
    const level = LevelManager.levelForXP(this.xp);
    return {
      level,
      levelName: LevelManager.name(level),
      xp: this.xp,
      xpToNext: LevelManager.xpToNext(this.xp, level),
      progress: LevelManager.progress(this.xp, level),
      coins: CoinManager.coins,
      totalEarned: CoinManager.totalEarned,
    };
  }
}

export const ProgressState = new ProgressStateClass();