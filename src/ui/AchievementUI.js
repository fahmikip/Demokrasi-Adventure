/**
 * AchievementUI — overlay daftar prestasi (Phase 5).
 * Memakai mask + scroll wheel; state setiap achievement di-refresh saat dibuka.
 */

import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { makeButton } from "./widgets.js";
import { AchievementManager } from "../progression/AchievementManager.js";

export class AchievementUI {
  constructor(scene, { onClose } = {}) {
    this.scene = scene;
    this.onClose = onClose || (() => {});
    this.root = null;
    this.rows = [];
    this._scrolled = 0;
    this._maxScroll = 0;
    this._build();
    this.hide();
  }

  open() {
    GameState.set("ACHIEVEMENTS");
    this.refresh();
    this.root.setVisible(true);
    this.root.setActive(true);
  }

  close() {
    this.hide();
    if (GameState.current === "ACHIEVEMENTS") GameState.set("PLAYING");
    this.onClose();
  }

  hide() {
    if (this.root) {
      this.root.setVisible(false);
      this.root.setActive(false);
    }
  }

  toggle() {
    if (this.root && this.root.visible) this.close();
    else this.open();
  }

  get isOpen() {
    return !!(this.root && this.root.visible);
  }

  destroy() {
    if (this.root) this.root.destroy();
    this.root = null;
  }

  _build() {
    const scene = this.scene;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const w = Math.min(scene.scale.width - 40, 540);
    const h = Math.min(scene.scale.height - 60, 430);

    this.root = scene.add.container(0, 0).setDepth(9580);

    const dim = scene.add
      .rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.65)
      .setDepth(-1);
    this.root.add(dim);

    const g = scene.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
    g.lineStyle(2, 0xc0392b, 0.6);
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
    this.root.add(g);

    this.title = scene.add
      .text(cx, cy - h / 2 + 32, "PRESTASI", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "24px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);
    this.root.add(this.title);

    this.countText = scene.add
      .text(cx, cy - h / 2 + 60, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "13px",
        color: "#7f8c8d",
      })
      .setOrigin(0.5);
    this.root.add(this.countText);

    // area konten (scrollable)
    const areaX = cx - w / 2 + 20;
    const areaY = cy - h / 2 + 80;
    this.content = scene.add.container(areaX, areaY).setDepth(9581);
    this.root.add(this.content);

    const maskGraphics = scene.make.graphics({ add: false });
    maskGraphics.fillStyle(0xffffff, 1);
    maskGraphics.fillRect(areaX - 6, areaY - 4, w - 28, h - 160);
    this.mask = new Phaser.Display.Masks.GeometryMask(scene, maskGraphics);
    this.content.setMask(this.mask);

    this.scrollTop = areaY;
    this.scrollBottom = cy + h / 2 - 76;
    this.viewH = this.scrollBottom - this.scrollTop;

    const closeBtn = makeButton(this.scene, cx, cy + h / 2 - 28, "TUTUP", () => this.close(), {
      width: 130,
      height: 42,
      color: Config.UI.COLOR_PRIMARY,
      hoverColor: Config.UI.COLOR_PRIMARY_HOVER,
      depth: 9585,
      fontSize: 16,
    });
    this.root.add(closeBtn);

    scene.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      if (this.isOpen) this._scrollBy(deltaY || 0);
    });
  }

  refresh() {
    const snap = AchievementManager.snapshot();
    for (const row of this.rows) row.container.destroy(true);
    this.rows = [];
    this.countText.setText(`Terbuka ${snap.unlockedCount} dari ${snap.total} achievement`);

    let y = 0;
    for (const item of snap.items) {
      const row = this._addRow(item, y);
      this.rows.push(row);
      this.content.add(row.container);
      y += row.height + 8;
    }
    this._maxScroll = Math.max(0, y - this.viewH);
    this._scrollTo(0);
  }

  _addRow(item, y) {
    const s = this.scene;
    const w = 440;
    const h = 58;
    const unlocked = item.unlocked;

    const container = s.add.container(0, y);
    const g = s.add.graphics();
    g.fillStyle(unlocked ? 0xf1c40f : 0xffffff, unlocked ? 0.12 : 0.7);
    g.fillRoundedRect(0, 0, w, h, 10);
    g.lineStyle(1, unlocked ? 0xf1c40f : 0xc0392b, unlocked ? 0.6 : 0.3);
    g.strokeRoundedRect(0, 0, w, h, 10);

    const mark = s.add
      .text(18, h / 2, unlocked ? "★" : "☆", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "22px",
        color: unlocked ? "#f1c40f" : "#95a5a6",
      })
      .setOrigin(0.5);

    const title = s.add
      .text(44, 12, item.title, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "15px",
        fontStyle: "bold",
        color: unlocked ? "#fdf6e3" : "#2c2c2c",
      })
      .setOrigin(0, 0);

    const desc = s.add
      .text(44, 33, item.description || "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "11px",
        color: unlocked ? "#cfd8dc" : "#7f8c8d",
        wordWrap: { width: w - 130 },
      })
      .setOrigin(0, 0);

    const reward = s.add
      .text(w - 12, h / 2, this._rewardText(item.reward), {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "11px",
        fontStyle: "bold",
        color: unlocked ? "#f1c40f" : "#bdc3c7",
      })
      .setOrigin(1, 0.5);

    container.add([g, mark, title, desc, reward]);
    container.setSize(w, h);
    return { container, height: h };
  }

  _rewardText(reward = {}) {
    const parts = [];
    if (reward.xp) parts.push(`XP +${reward.xp}`);
    if (reward.coins) parts.push(`Koin +${reward.coins}`);
    return parts.length ? parts.join(" · ") : "";
  }

  _scrollBy(delta) {
    const step = Math.max(10, Math.min(60, Math.abs(delta) * 0.5));
    this._scrollTo(this._scrolled + (delta > 0 ? step : -step));
  }

  _scrollTo(value) {
    this._scrolled = Math.min(this._maxScroll, Math.max(0, value));
    this.content.y = this.scrollTop - this._scrolled;
  }
}