import { GameState } from "../core/GameState.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    GameState.set("MAIN_MENU");

    this.cameras.main.setBackgroundColor(0xfdf6e3);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add
      .text(cx, cy - 120, "DEMOKRASI ADVENTURE", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "40px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 70, "Jelajahi Kotanya. Temukan Informasinya. Pahami Prosesnya.", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "16px",
        color: "#2c2c2c",
      })
      .setOrigin(0.5);

    this._createButton(cx, cy + 20, "MULAI BERMAIN", "WorldScene", 0xc0392b);
    this._createButton(cx, cy + 90, "PENGATURAN", null, 0x2c3e50);

    this.add
      .text(this.scale.width - 12, this.scale.height - 8, "v0.1.0 - Phase 1 Foundation", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "12px",
        color: "#95a5a6",
      })
      .setOrigin(1, 1);
  }

  _createButton(x, y, label, sceneKey, color) {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#" + color.toString(16).padStart(6, "0"),
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setScale(1.06));
    btn.on("pointerout", () => btn.setScale(1));
    btn.on("pointerup", () => {
      if (sceneKey) {
        GameState.set("PLAYING");
        this.scene.start(sceneKey);
      }
    });

    return btn;
  }
}