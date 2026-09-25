/**
 * HUD — bilah UI atas (Level, XP bar, Coins) untuk Phase 5.
 * Sumber data: PROGRESS_CHANGED / setStats langsung dari UIScene.
 */

import { Config } from "../core/Config.js";

const X = 12;
const Y = 12;
const W = 340;
const H = 76;

export class HUD {
  constructor(scene, onJournalTap) {
    this.scene = scene;
    this._onJournalTap = onJournalTap || null;
    this._journalVisible = false;
    this._build();
    this.setStats({ level: 1, xp: 0, coins: 0, levelName: "", xpToNext: 0, progress: 0 });
  }

  setStats({ level, xp, coins, levelName = "", xpToNext = 0, progress = 0 }) {
    this.lvlText.setText(`LVL ${level}`);
    this.nameText.setText(levelName ? this._short(levelName) : "");
    this.xpText.setText(xpToNext > 0 ? `${xp} / ${xp + xpToNext}` : `${xp} XP`);
    this.coinsText.setText(`${coins}`);
    const p = Math.min(1, Math.max(0, progress || 0));
    this._drawBar(p);
  }

  setJournal(count) {
    const has = (count || 0) > 0;
    this._journalVisible = has;
    this.journalText.setText(has ? `📖 Jurnal ${count}` : "");
    this.journalText.setAlpha(has ? 1 : 0);
  }

  _short(name) {
    const max = 18;
    return name.length > max ? name.slice(0, max - 1) + "…" : name;
  }

  _drawBar(p) {
    this.barFill.clear();
    if (p <= 0) return;
    this.barFill.fillStyle(0xf1c40f, 1);
    this.barFill.fillRoundedRect(
      this.barX,
      this.barY,
      Math.max(3, Math.round(this.barW * p)),
      this.barH,
      3
    );
  }

  _build() {
    const scene = this.scene;
    const x = X;
    const y = Y;
    const w = W;
    const h = H;

    this.panel = scene.add.container(0, 0).setDepth(8500);

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(1, 0xffffff, 0.18);
    g.strokeRoundedRect(x, y, w, h, 12);
    this.panel.add(g);

    // bar XP
    this.barX = x + 16;
    this.barY = y + h - 22;
    this.barW = w - 32;
    this.barH = 7;
    const track = scene.add.graphics();
    track.fillStyle(0xffffff, 0.14);
    track.fillRoundedRect(this.barX, this.barY, this.barW, this.barH, 3);
    track.lineStyle(1, 0xffffff, 0.1);
    track.strokeRoundedRect(this.barX, this.barY, this.barW, this.barH, 3);
    this.barFill = scene.add.graphics();
    this.panel.add([track, this.barFill]);

    // baris stat
    this.lvlText = this._stat(x + 44, y + 28, "#ffffff", 16);
    this.nameText = this._stat(x + 14, y + 47, "#f1c40f", 12);
    this.xpText = this._stat(x + 178, y + 28, "#f1c40f", 13);
    this.coinsText = this._stat(x + 274, y + 28, "#f1c40f", 16);

    scene.add.image(x + 30, y + 28, "icon_lvl").setScrollFactor(0).setDepth(8500).setScale(0.72);
    scene.add.image(x + 164, y + 28, "icon_xp").setScrollFactor(0).setDepth(8500).setScale(0.72);
    scene.add.image(x + 258, y + 28, "icon_coins").setScrollFactor(0).setDepth(8500).setScale(0.72);

    this.journalText = scene.add
      .text(x, y + h + 6, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "12px",
        fontStyle: "bold",
        color: "#fff",
        backgroundColor: "#7f3ff2cc",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(8500)
      .setAlpha(0);

    // Phase 11 — jurnal bisa diketuk (mobile) atau diklik, bukan hanya tombol `J`.
    this.journalText
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        if (this._journalVisible) this.journalText.setAlpha(0.7);
      })
      .on("pointerout", () => {
        this.journalText.setAlpha(this._journalVisible ? 1 : 0);
      })
      .on("pointerup", () => {
        if (this._onJournalTap) this._onJournalTap();
      });
  }

  _stat(x, y, color, size) {
    return this.scene.add
      .text(x, y, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: `${size}px`,
        fontStyle: "bold",
        color,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(8500);
  }
}