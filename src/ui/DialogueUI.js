/**
 * DialogueUI — panel dialog (dipasang di UIScene, Phase 3; ditulis ulang Phase 7).
 * Konsumsi event dari DialogueManager:
 *   DIALOGUE_STARTED {npc}       — tampilkan panel + nama
 *   DIALOGUE_TICK    {snapshot}  — progres ketikan (line.slice(0, visible))
 *   DIALOGUE_ROW     {snapshot}  — pilihan tampil, atau petunjuk "lanjut"
 *   DIALOGUE_CHOICE_SELECTED — (terbit saat pilihan diklik)
 *   DIALOGUE_COMPLETED           — tutup panel
 * Semua konten fiktif & netral.
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";

const DEPTH = 9500;

export class DialogueUI {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.panel = null;
    this.portrait = null;
    this.speaker = null;
    this.body = null;
    this.choiceBox = null;
    this.choices = [];
    this.hint = null;
    this._choiceOffset = 0;
    this._build();
    this._wire();
  }

  _wire() {
    EventBus.on("DIALOGUE_STARTED", (e) => this._open(e));
    EventBus.on("DIALOGUE_TICK", (e) => this._onTick(e.snapshot));
    EventBus.on("DIALOGUE_ROW", (e) => this._onRow(e.snapshot));
    EventBus.on("DIALOGUE_COMPLETED", () => this._close());
  }

  _build() {
    const W = Config.DIALOGUE.WIDTH;
    const H = Config.DIALOGUE.HEIGHT;
    const pos = this._pos();

    this.panel = this.scene.make.graphics({ x: pos.x, y: pos.y, add: true }).setDepth(DEPTH);
    this.panel.setVisible(false);

    this.portrait = this.scene.add
      .image(pos.x + 28, pos.y + H / 2, Config.DIALOGUE.DEFAULT_PORTRAIT)
      .setScale(Config.DIALOGUE.PORTRAIT_SCALE)
      .setVisible(false)
      .setDepth(DEPTH + 1);

    const nameStyle = {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: "16px",
      fontStyle: "bold",
      color: Config.DIALOGUE.NAME_COLOR,
    };
    this.speaker = this.scene.add
      .text(pos.x + 84, pos.y + 16, "", nameStyle)
      .setVisible(false)
      .setDepth(DEPTH + 1);

    const bodyStyle = {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: "15px",
      color: Config.DIALOGUE.TEXT_COLOR,
      wordWrap: { width: W - 84 - 28, useAdvancedWrap: true },
      lineSpacing: 4,
    };
    this.body = this.scene.add
      .text(pos.x + 84, pos.y + 46, "", bodyStyle)
      .setVisible(false)
      .setDepth(DEPTH + 1);

    this.choiceBox = this.scene.add
      .rectangle(
        pos.x + 8,
        pos.y + H + 8,
        W - 16,
        4,
        0x2c3e50,
        0
      )
      .setVisible(false)
      .setDepth(DEPTH + 1);

    this.hint = this.scene.add
      .text(pos.x + W - 16, pos.y + H - 12, "⟶ lanjut", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "12px",
        fontStyle: "italic",
        color: "#7f8c8d",
      })
      .setOrigin(1, 1)
      .setVisible(false)
      .setDepth(DEPTH + 1);
  }

  _open(e) {
    this.visible = true;
    this.panel.setVisible(true);
    this.speaker.setVisible(true).setText(e && e.npc && e.npc.name ? e.npc.name : "Warga");
    this.body.setVisible(true).setText("");
    const pc = e && e.npc && e.npc.portrait;
    if (pc && this.scene.textures.exists(pc)) {
      this.portrait.setTexture(pc);
    } else {
      this.portrait.setTexture(Config.DIALOGUE.DEFAULT_PORTRAIT);
    }
    this.portrait.setVisible(true);
    this.hint.setVisible(false);
    this._clearChoices();
    this._drawPanel();
  }

  _onTick(s) {
    if (!s || !this.visible) return;
    if (s.speaker && this.speaker.text !== s.speaker && s.speaker.trim()) {
      this.speaker.setText(s.speaker);
    }
    this.body.setText((s.line || "").slice(0, s.visible));
    if (!s.choices || s.choices.length === 0) this.hint.setVisible(false);
    this._drawPanel();
  }

  _onRow(s) {
    if (!s || !this.visible) return;
    this.body.setText((s.line || "").slice(0, s.visible));
    this._clearChoices();
    if (s.choices && s.choices.length) {
      this.hint.setVisible(false);
      s.choices.forEach((ch) => this._addChoice(ch));
    } else {
      this.hint.setText("⟶ lanjut (E)").setVisible(true);
    }
    this._drawPanel();
  }

  _addChoice(ch) {
    const W = Config.DIALOGUE.WIDTH;
    const st = {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: "15px",
      color: "#1a1a1a",
      backgroundColor: "#eaf2f8",
      padding: { x: 10, y: 6 },
    };
    const label = ch.note ? `${ch.label}  (${ch.note})` : ch.label;
    const px = this._pos().x + 8;
    const baseY = this._pos().y + Config.DIALOGUE.HEIGHT + 8;
    const t = this.scene.add
      .text(px, baseY + this._choiceOffset, `  ${ch.index + 1}. ${label}`, st)
      .setDepth(DEPTH + 2)
      .setInteractive({ useHandCursor: true });
    t.on("pointerup", () => EventBus.emit("DIALOGUE_CHOICE_SELECTED", { index: ch.index }));
    this.choices.push(t);

    const h = t.height + 4;
    this._choiceOffset += h;
    this.choiceBox.setPosition(px, baseY + this._choiceOffset / 2);
    this.choiceBox.setSize(W - 16, this._choiceOffset - 4).setVisible(true);
  }

  _clearChoices() {
    for (const t of this.choices) t.destroy();
    this.choices = [];
    this._choiceOffset = 0;
    if (this.choiceBox) this.choiceBox.setVisible(false);
  }

  _close() {
    this.visible = false;
    this.panel.setVisible(false);
    this.portrait.setVisible(false);
    this.speaker.setVisible(false);
    this.body.setVisible(false);
    this.hint.setVisible(false);
    this._clearChoices();
  }

  _drawPanel() {
    const g = this.panel;
    g.clear();
    const W = Config.DIALOGUE.WIDTH;
    const H = Config.DIALOGUE.HEIGHT;
    g.fillStyle(Config.DIALOGUE.BG, Config.DIALOGUE.BG_ALPHA);
    g.fillRoundedRect(0, 0, W, H, 8);
    g.lineStyle(Config.DIALOGUE.BORDER_WIDTH, Config.DIALOGUE.BORDER, 0.9);
    g.strokeRoundedRect(0, 0, W, H, 8);
  }

  _pos() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    return {
      x: (w - Config.DIALOGUE.WIDTH) / 2,
      y: h - Config.DIALOGUE.HEIGHT - 24,
    };
  }
}