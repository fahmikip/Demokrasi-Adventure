/**
 * ProgressState — data progresi placeholder.
 * Ganti dengan XPManager / LevelManager pada Phase 6.
 */

import { EventBus } from "./EventBus.js";

class ProgressStateClass {
  constructor() {
    this.level = 1;
    this.xp = 0;
    this.coins = 0;
  }

  addXP(amount) {
    this.xp += amount;
    EventBus.emit("PROGRESS_CHANGED", { level: this.level, xp: this.xp, coins: this.coins });
  }

  addCoins(amount) {
    this.coins += amount;
    EventBus.emit("PROGRESS_CHANGED", { level: this.level, xp: this.xp, coins: this.coins });
  }

  reset() {
    this.level = 1;
    this.xp = 0;
    this.coins = 0;
    EventBus.emit("PROGRESS_CHANGED", { level: this.level, xp: this.xp, coins: this.coins });
  }
}

export const ProgressState = new ProgressStateClass();