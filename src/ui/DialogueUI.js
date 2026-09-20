/**
 * DialogueUI — panel dialog layar-layar (dipasang ke UIScene pada Phase 3).
 * Menampilkan: potret NPC, nama, baris yang diketik berjalan, dan pilihan.
 *
 * Sumber data: EventBus events yang dipancarkan DialogueManager:
 *   DIALOGUE_STARTED   {npc, node}                     — tampilkan panel
 *   DIALOGUE_TICK      {chars, node, speaker}          — updating ketikan
 *   DIALOGUE_ROW       {row}                           — pilihan baru tayang
 *   DIALOGUE_CHOICE    {last}` (opsional)              — pilihan dipilih
 *   DIALOGUE_COMPLETED ()                              — tutup panel
 *
 * Semua NPC fiktif & netral; panel hanya placeholder visual.
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";

export class DialogueUI {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.panel = nulligure;
    this.portrait = null;
    this.speaker = null;
    this.text = null;
    this.choices = [];
    this._build();
    this._wire();
  }

  _wire() {
    EventBus.on("DIALOGUE_STARTED", (e) => this._open(e));
    EventBus.on("DIALOGUE_TICK", (e) => this._tick(e));
    EventBus.on("DIALOGUE_ROW", (e) => this._renderRow(e));
    EventBus.on("DIALOGUE_COMPLETED", (e) => this._close(e));
  }

  _build() {
    const { x, y } = _panelPos(this.scene);
    this.panel = this.scene.make.graphics({ x, y, add: true });
    this.panel.setVisible(false);
    this.panel.setDepth(5000);

    this.portrait = this.scene.add.image(x + 30, y + 30, "portrait_placeholder").setVisible(false);
    this.speaker = this.scene.add.text(x + 66, y + 10, "", Config.DIALOGUE.TEXT_STYLE).setVisible(false);
    this.text = this.scene.add.text(x + 66, y + 34, "", Config.DIALOGUE.TEXT_STYLE).setVisible(false);
    this.panel.depth = 5000;
  }

  _open(e) {
    this.visible = true;
    this.panel.setVisible(true);
    if (e.npc && e.npc.portrait) this.portrait.setTexture(e.npc.portrait);
    this.speaker.setText(e.npc ? e.npc.name : "").setVisible(true);
    this.text.setText("").setVisible(true);
    this._drawPanel();
  }

  _tick(e) {
    if (!this.visible) return;
    this.text.setText(e.chars);
    if (e.speaker && this.speaker.text !== e.speaker) this.speaker.setText(e.speaker);
    this._drawPanel();
  }

  _renderRow(e) {
    if (!this.visible) return;
    this._clearChoices();
    const r = e.row;
    if (r && r.choices && r.choices.length) {
      r.choices.forEach((ch, i) => this._addChoice(ch, i));
    } else {
      this._addHint("⟶ lanjut");
    }
    this._drawPanel();
  }

  _addHint(label) {
    const st = Object.assign({}, Config.DIALOGUE.TEXT_STYLE, { fontStyle: "italic" });
    const t = this.scene.add.text(this.panel.x + this.panelPrevW + 8, this.panel.y + this.panelPrevH + 4, label, st);
    t.setDepth(5001);
    this.choices.push(t);
    this.panelPrevW = this.panel.width + 24;
  }

  _addChoice(ch, i) {
    const st = Object.assign({}, Config.DIALOGUE.TEXT_STYLE, { fill: Config.DIALOGUE.CHOICE_COLOR });
    const t = this.scene.add.text(this.panel.x + 8, this.panel.y + this.panelPrevH + 4, `  ${i + 1}. ${ch.label}`, st);
    t.setDepth(5001);
    t.setInteractive();
    t.on("pointerdown", () => this._choose(i + 1));
    this.choices.push(t);
    this.panelPrevW = this.panel.width + 80;
    this.panelPrevH = this.panelPrevH + 24;
  }

  _choose(chIdx) {
    EventBus.emit("DIALOGUE_CHOICE_SELECTED", { index: chIdx });
  }

  _clearChoices() {
    for (const t of this.choices) t.destroy();
    this.choices = [];
    this.panelPrevW = 0;
    this.panelPrevH = 0;
  }

  _drawPanel() {
    const g = this.panel;
    g.clear();
    const W = Config.DIALOGUE.WIDTH;
    const H = Config.DIALOGUE.HEIGHT;
    g.fillStyle(Config.DIALOGUE.BG, Config.DIALOGUE.BG_ALPHA);
    g.fillRoundedRect(0, 0, W, H, 6);
    g.lineStyle(Config.DIALOGUE.BORDER_WIDTH, Config.DIALOGUE.BORDER, 0.9);
    g.strokeRoundedRect(0, 0, W, H, 6);
  }

  _close() {
    this.visible = false;
    this.panel.setVisible(false);
    this.portrait.setVisible(false);
    this.speaker.setVisible(false);
    this.text.setVisible(false);
    this._clearChoices();
  }
}

function _panelPos(scene) {
  const w = scene.sys.game.canvas.width;
  const h = scene.sys.game.canvas.height;
  const W = Config.DIALOGUE.WIDTH;
  const H = Config.DIALOGUE.HEIGHT;
  return { x: (w - W) / 2, y: h - H - 24 };
}
