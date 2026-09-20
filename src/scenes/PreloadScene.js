/**
 * PreloadScene — loading screen + placeholder asset generation.
 * Progress diputar secara simulasi sampai minimal durasi, lalu generate
 * semua placeholder texture (player sheet, tiles, obstacles, icons).
 * Asset loading data-driven asli (JSON/tileset) dihubungkan pada Phase 3.
 */

import { GameState } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { generatePlaceholderTextures } from "../core/PlaceholderAssets.js";
import { generateNPCPlaceholderTextures } from "../core/PlaceholderAssetsNPC.js";

const LOAD_DURATION = 1600;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create() {
    GameState.set("PRELOAD");
    this._startTime = this.time.now;
    this._done = false;

    this._buildLoadingUI();

    this.load.on("loaderror", (file) => {
      console.warn(`[Preload] Asset load error: ${file.key} (${file.url})`);
    });
  }

  update(time) {
    if (this._done) return;
    const t = Phaser.Math.Clamp((time - this._startTime) / LOAD_DURATION, 0, 1);
    const eased = Phaser.Math.Easing.Sine.Out(t);

    this.progressBar.clear();
    this.progressBar.fillStyle(0xc0392b, 1);
    this.progressBar.fillRoundedRect(
      this._barX,
      this._barY,
      Math.max(this._barW * eased, 1),
      this._barH,
      11
    );
    this.percentText.setText(`${Math.round(eased * 100)}%`);

    if (t >= 1) {
      this._done = true;
      this._finalize();
    }
  }

  _finalize() {
    this.percentText.setText("100%");
    this.labelText.setText("Siap!");

    generatePlaceholderTextures(thisscience);
    generateNPCPlaceholderTextures(this);

    EventBus.emit("ASSETS_LOADED");

    const testTarget = window.__DEMOKRASI_TEST_TARGET;
    if (testTarget) {
      this.scene.start(testTarget);
      return;
    }

    this.time.delayedCall(250, () => {
      this.cameras.main.fadeOut(300, 26, 26, 26);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MenuScene");
      });
    });
  }

  _buildLoadingUI() {
    this.cameras.main.setBackgroundColor(0x1a1a1a);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const title = this.add
      .text(cx, cy - 70, "DEMOKRASI ADVENTURE", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "32px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);

    this.labelText = this.add
      .text(cx, cy + 10, "Loading...", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        color: "#ecf0f1",
      })
      .setOrigin(0.5);

    // progress bar
    const barW = 420;
    const barH = 22;
    const barX = cx - barW / 2;
    const barY = cy + 40;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2c3e50, 1);
    barBg.fillRoundedRect(barX, barY, barW, barH, 11);
    barBg.lineStyle(2, 0xffffff, 0.2);
    barBg.strokeRoundedRect(barX, barY, barW, barH, 11);

    this.progressBar = this.add.graphics();
    this._barX = barX;
    this._barY = barY;
    this._barW = barW;
    this._barH = barH;

    this.percentText = this.add
      .text(cx, cy + 80, "0%", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ecf0f1",
      })
      .setOrigin(0.5, 0);
  }
}