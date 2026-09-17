import { GameState } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this._buildHUDPlaceholder();

    this._unsub = EventBus.on("PLAYER_STATE_CHANGED", (state) => {
      this.events.emit("game-state-changed", state);
    });
  }

  destroy() {
    if (this._unsub) this._unsub();
    super.destroy();
  }

  _buildHUDPlaceholder() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(8, 8, 260, 40, 10);
    g.destroy();

    this.add
      .text(24, 16, "⭐ 0   🪙 0   Lv. 1", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "16px",
        fontWeight: "bold",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }
}