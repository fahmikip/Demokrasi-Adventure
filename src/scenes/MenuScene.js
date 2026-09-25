/**
 * MenuScene — main menu (PLAY, SETTINGS, ABOUT) + panel modal.
 */

import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { SettingsManager } from "../core/SettingsManager.js";
import { ProgressState } from "../core/ProgressState.js";
import { AchievementManager } from "../progression/AchievementManager.js";
import { CollectibleManager } from "../collectibles/CollectibleManager.js";
import { QuestManager } from "../quest/QuestManager.js";
import { AreaState } from "../map/AreaState.js";
import { Panel } from "../ui/Panel.js";
import { openSettingsPanel } from "../ui/SettingsPanels.js";
import { makeButton } from "../ui/widgets.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    GameState.set("MAIN_MENU");
    this.cameras.main.setBackgroundColor(0xfdf6e3);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // judul dua baris agar proporsional
    this.add
      .text(cx, cy - 150, "DEMOKRASI", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "52px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 98, "ADVENTURE", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "52px",
        fontStyle: "bold",
        color: "#2c3e50",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 46, "Jelajahi. Temukan. Pahami.", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "18px",
        color: "#7f8c8d",
      })
      .setOrigin(0.5);

    makeButton(this, cx, cy + 24, "PLAY", () => this._startGame(), {
      width: 220,
      height: 56,
      color: Config.UI.COLOR_PRIMARY,
      hoverColor: Config.UI.COLOR_PRIMARY_HOVER,
      fontSize: 24,
    });

    makeButton(this, cx, cy + 92, "SETTINGS", () => this._openSettings(), {
      width: 220,
      height: 50,
      color: Config.UI.COLOR_DARK,
      hoverColor: Config.UI.COLOR_DARK_HOVER,
    });

    makeButton(this, cx, cy + 154, "ABOUT", () => this._openAbout(), {
      width: 220,
      height: 50,
      color: 0x7f8c8d,
      hoverColor: 0x6c7a85,
    });

    this.add
      .text(this.scale.width - 12, this.scale.height - 8, "v1.6.0", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "12px",
        color: "#95a5a6",
      })
      .setOrigin(1, 1);
  }

  _startGame() {
    GameState.set("PLAYING");
    this.scene.launch("UIScene");
    if (SettingsManager.prefersLessMotion()) {
      this.scene.start("WorldScene");
      return;
    }
    this.cameras.main.fadeOut(200, 26, 26, 26);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("WorldScene");
    });
  }

  _openSettings() {
    const panel = openSettingsPanel(this);

    panel.addButton("Reset Simpan", () => {
      ProgressState.reset();
      QuestManager.reset();
      AreaState.reset();
      AchievementManager.reset();
      CollectibleManager.reset();
      localStorage.removeItem(Config.SAVE.KEY);
      console.info("[MenuScene] Semua progresi game direset.");
    }, { color: 0x7f8c8d, hoverColor: 0x6c7a85, width: 260, height: 48 });

    panel.addButton("Tutup", () => panel.close(), { width: 120, height: 40 });
  }

  _openAbout() {
    const panel = new Panel(this, { title: "TENTANG", width: 460, height: 420 });

    panel.addLabel("DEMOKRASI ADVENTURE", { fontSize: 22, bold: true, color: "#c0392b" });
    panel.addLabel("Jelajahi Kotanya. Temukan Informasinya. Pahami Prosesnya.", { fontSize: 14, color: "#7f8c8d" });
    panel.addLabel("Game petualangan 2D edukasi tentang", { fontSize: 14, color: "#2c2c2c" });
    panel.addLabel("literasi demokrasi & pemilu untuk pemilih pemula.", { fontSize: 14, color: "#2c2c2c" });
    panel.addLabel("Versi 1.6.0 — Phase 10: PWA & Mobile", { fontSize: 14, color: "#2c2c2c" });
    panel.addLabel("Kredit: Tim Pengembang Demokrasi Adventure", { fontSize: 14, color: "#2c2c2c" });
    panel.addLabel("Phaser 3 • HTML5 • JavaScript ES Modules • PWA", { fontSize: 12, color: "#95a5a6" });

    panel.addButton("Tutup", () => panel.close(), { width: 120, height: 40 });
  }
}