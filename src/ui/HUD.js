/**
 * HUD — bilah UI atas (Level, XP, Coins).
 * Belum ada XP manager pada Phase 1; nilai placeholder mudah diganti nanti.
 */

import { Config } from "../core/Config.js";

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._build();
    this.setStats({ level: 1, xp: 0, coins: 0 });
  }

  setStats({ level, xp, coins }) {
    this.lvlText.setText(`LVL ${level}`);
    this.xpText.setText(`${xp}`);
    this.coinsText.setText(`${coins}`);
  }

  _build() {
    const scene = this.scene;
    const w = 300;
    const h = 40;
    const x = 12;
    const y = 12;

    this.panel = scene.add.container(0, 0).setDepth(8500);

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(1, 0xffffff, 0.18);
    g.strokeRoundedRect(x, y, w, h, 12);
    this.panel.add(g);

    this.lvlText = this._stat(x + 52, y + h / 2, "#ffffff");
    this.xpText = this._stat(x + 142, y + h / 2, "#f1c40f");
    this.coinsText = this._stat(x + 232, y + h / 2, "#f1c40f");

    scene.add.image(x + 34, y + h / 2, "icon_lvl").setScrollFactor(0).setDepth(8500).setScale(0.8);
    scene.add.image(x + 124, y + h / 2, "icon_xp").setScrollFactor(0).setDepth(8500).setScale(0.8);
    scene.add.image(x + 214, y + h / 2, "icon_coins").setScrollFactor(0).setDepth(8500).setScale(0.8);
  }

  _stat(x, y, color) {
    return this.scene.add
      .text(x, y, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "bold",
        color,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(8500);
  }
}