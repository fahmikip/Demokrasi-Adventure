/**
 * CoinManager — sumber kebenaran koin (Democracy Coins) pemain (Phase 5).
 * Merchant / fitur belanja dapat memakai coins & totalEarned di kemudian hari.
 */

import { EventBus } from "../core/EventBus.js";

class CoinManagerClass {
  constructor() {
    this.coins = 0;
    this.totalEarned = 0;
  }

  addCoins(amount, source = "quest") {
    if (!amount || amount <= 0) return;
    this.coins += amount;
    this.totalEarned += amount;
    EventBus.emit("COIN_CHANGED", {
      amount,
      source,
      coins: this.coins,
      totalEarned: this.totalEarned,
    });
  }

  setCoins(value) {
    this.coins = Math.max(0, Number(value) || 0);
  }

  reset() {
    this.coins = 0;
    this.totalEarned = 0;
  }

  snapshot() {
    return { coins: this.coins, totalEarned: this.totalEarned };
  }
}

export const CoinManager = new CoinManagerClass();