/**
 * QuestTracker — tracker quest kecil di sudut kiri bawah (Phase 4).
 * Menampilkan quest aktif + daftar objective (centang = selesai).
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";

export class QuestTracker {
  constructor(scene) {
    this.scene = scene;
    this.current = null;
    this._build();
    this._subscribe();
    this.hide();
  }

  _build() {
    const w = 248;
    const x = 12;
    const y = this.scene.scale.height - 150;

    this.container = this.scene.add.container(x, y).setDepth(8450);

    this.bg = this.scene.add.graphics();
    this.container.add(this.bg);

    this.titleText = this.scene.add
      .text(14, 10, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "15px",
        fontStyle: "bold",
        color: "#fdf6e3",
      })
      .setOrigin(0, 0.5);
    this.container.add(this.titleText);

    this.bodyText = this.scene.add.text(14, 24, "", {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: "12px",
      color: "#ffffff",
      lineSpacing: 4,
      wordWrap: { width: w - 28 },
    });
    this.container.add(this.bodyText);
  }

  _subscribe() {
    this.scene.eventBus = EventBus;
    this.unsubs = [
      EventBus.on("QUEST_STARTED", ({ quest }) => this.setQuest(quest)),
      EventBus.on("QUEST_PROGRESSED", ({ quest }) => this.setQuest(quest)),
      EventBus.on("QUEST_COMPLETED", () => this.hide()),
    ];
  }

  setQuest(snapshot) {
    this.current = snapshot;
    if (!snapshot) return this.hide();

    const lines = snapshot.objectives.map((o) => (o.done ? "✓ " : "□ ") + o.label);
    this.titleText.setText("✦ " + snapshot.title);
    this.bodyText.setText(lines.join("\n"));

    const maxW = Math.max(this.titleText.width + 28, this.bodyText.width + 28);
    const H = 34 + lines.length * 19;
    this.container.width = maxW;
    this.container.height = H;

    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.55);
    this.bg.fillRoundedRect(0, 0, maxW, H, 12);
    this.bg.lineStyle(1, 0xffffff, 0.15);
    this.bg.strokeRoundedRect(0, 0, maxW, H, 12);

    this.container.setVisible(true);
  }

  hide() {
    this.current = null;
    this.container.setVisible(false);
  }

  get isVisible() {
    return this.container.visible;
  }

  destroy() {
    for (const unsub of this.unsubs || []) unsub();
    this.container.destroy();
  }
}