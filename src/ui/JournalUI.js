/**
 * JournalUI — overlay jurnal edukasi (Phase 6).
 * Menampilkan 7 kategori (dari data/education) + filter "Semua", daftar entri
 * yang sudah dikumpulkan pemain (judul, isi, source, tanggal). Memakai mask +
 * scroll wheel, mengikuti pola AchievementUI.
 */

import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { makeButton } from "./widgets.js";
import { JournalManager } from "../journal/JournalManager.js";
import { JournalData } from "../journal/JournalData.js";

export class JournalUI {
  constructor(scene, { onClose } = {}) {
    this.scene = scene;
    this.onClose = onClose || (() => {});
    this.root = null;
    this.rows = [];
    this.tabs = [];
    this._category = "Semua";
    this._w = 640;
    this._h = 470;
    this._tabY = 0;
    this._scrolled = 0;
    this._maxScroll = 0;
    this._build();
    this.hide();
  }

  open() {
    GameState.set("JOURNAL");
    this.refresh();
    this.root.setVisible(true);
    this.root.setActive(true);
  }

  close() {
    this.hide();
    if (GameState.current === "JOURNAL") GameState.set("PLAYING");
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

  selectCategory(category) {
    this._category = category;
    this._scrolled = 0;
    this.refresh();
  }

  _build() {
    const scene = this.scene;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const w = Math.min(scene.scale.width - 40, 640);
    const h = Math.min(scene.scale.height - 60, 470);
    this._w = w;
    this._h = h;
    this._cx = cx;
    this._cy = cy;

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
      .text(cx, cy - h / 2 + 30, "JURNAL DEMOKRASI", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "22px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);
    this.root.add(this.title);

    this.countText = scene.add
      .text(cx, cy - h / 2 + 56, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "12px",
        color: "#7f8c8d",
      })
      .setOrigin(0.5);
    this.root.add(this.countText);

    // strip kategori
    this.tabStrip = scene.add.container(0, 0).setDepth(9582);
    this.root.add(this.tabStrip);

    const tabY = cy - h / 2 + 82;
    this._tabY = tabY;
    this._buildTags(w, h, tabY);

    // area konten (scrollable)
    const areaX = cx - w / 2 + 20;
    const areaY = tabY + 30;
    this.content = scene.add.container(areaX, areaY).setDepth(9583);
    this.root.add(this.content);

    const maskGraphics = scene.make.graphics({ add: false });
    maskGraphics.fillStyle(0xffffff, 1);
    maskGraphics.fillRect(areaX - 6, areaY - 4, w - 28, h - 160);
    this.mask = new Phaser.Display.Masks.GeometryMask(scene, maskGraphics);
    this.content.setMask(this.mask);

    this.scrollTop = areaY;
    this.scrollBottom = cy + h / 2 - 66;
    this.viewH = this.scrollBottom - this.scrollTop;

    const closeBtn = makeButton(this.scene, cx, cy + h / 2 - 26, "TUTUP", () => this.close(), {
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

  _buildTags(w, h, tabY) {
    for (const t of this.tabs) t.destroy();
    this.tabs = [];

    const totals = new Map(JournalManager.categoryTotals().map((c) => [c.category, c.count]));
    const categories = ["Semua", ...JournalData.categories];
    const jump = 6;
    const fontSize = 13;
    const padH = 12;
    const padV = 7;

    let x = this.scene.scale.width / 2 - w / 2 + 20;
    for (const category of categories) {
      const isSel = category === this._category;
      const count = category === "Semua" ? JournalManager.count() : totals.get(category) || 0;
      const label = category === "Semua" ? "Semua" : `${category} (${count})`;

      const text = this.scene.add
        .text(0, 0, label, {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: `${fontSize}px`,
          fontStyle: isSel ? "bold" : "normal",
          color: isSel ? "#ffffff" : "#2c3e50",
          padding: { x: padH, y: padV },
        })
        .setOrigin(0, 0);
      const tabW = text.width + padH * 2;
      const tabH = text.height + padV * 2;

      const bg = this.scene.add.graphics();
      bg.fillStyle(isSel ? 0xc0392b : 0xe9e2d0, isSel ? 1 : 0.6);
      bg.fillRoundedRect(x, tabY - padV, tabW, tabH, 8);

      text.setPosition(x + padH, tabY - padV + (tabH - text.height) / 2);
      const hit = this.scene.add
        .zone(x, tabY - padV, tabW, tabH)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerup", () => this.selectCategory(category));

      this.tabs.push({ container: this.scene.add.container(0, 0).add([bg, text, hit]) });
      x += tabW + jump;
    }
  }

  refresh() {
    const snap = JournalManager.snapshot();
    const catMatch = this._category === "Semua"
      ? snap.entries
      : snap.entries.filter((e) => e.category === this._category);

    this.countText.setText(
      `Total ${snap.total} entri · ${snap.total ? snap.categories.filter((c) => c.count > 0).length : 0} kategori terbuka`
    );
    this._buildTags(this._w, this._h, this._tabY);

    for (const row of this.rows) row.container.destroy(true);
    this.rows = [];

    if (!snap.entries.length) {
      this._addEmpty("Belum ada entri jurnal. Ambil collectible dan selesaikan misi!");
      return;
    }
    if (!catMatch.length) {
      this._addEmpty("Belum ada entri pada kategori ini.");
      return;
    }

    let y = 0;
    for (const item of catMatch) {
      const row = this._addRow(item, y);
      this.rows.push(row);
      this.content.add(row.container);
      y += row.height + 10;
    }
    this._maxScroll = Math.max(0, y - this.viewH);
    this._scrollTo(0);
  }

  _addEmpty(msg) {
    const s = this.scene;
    const t = s.add
      .text(0, 24, msg, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "14px",
        color: "#7f8c8d",
      })
      .setOrigin(0, 0);
    this.rows.push({ container: this.scene.add.container(0, 0).add([t]), height: 40 });
    this._maxScroll = 0;
    this._scrollTo(0);
  }

  _addRow(item, y) {
    const s = this.scene;
    const w = 600;

    const full = this.entriesOf(item);

    const container = s.add.container(0, y);
    const g = s.add.graphics();
    g.fillStyle(0xffffff, 0.8);
    g.fillRoundedRect(0, 0, w, 46, 10);
    g.lineStyle(1, 0xc0392b, 0.25);
    g.strokeRoundedRect(0, 0, w, 46, 10);

    const chip = s.add
      .text(12, 9, item.category, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "10px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#c0392b",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0, 0);

    const title = s.add
      .text(14, 22, item.title, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "14px",
        fontStyle: "bold",
        color: "#2c3e50",
        wordWrap: { width: w - 100 },
      })
      .setOrigin(0, 0);

    const body = s.add
      .text(14, 22 + title.height + 8, full.text, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "13px",
        color: "#34495e",
        lineSpacing: 3,
        wordWrap: { width: w - 28 },
      })
      .setOrigin(0, 0);

    const footer = s.add
      .text(14, body.y + body.height + 8, this._footerText(item, full), {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "11px",
        fontStyle: "italic",
        color: "#7f8c8d",
      })
      .setOrigin(0, 0);

    const h = footer.y + footer.height + 12;
    container.add([g, chip, title, body, footer]);
    g.clear();
    g.fillStyle(0xffffff, 0.8);
    g.fillRoundedRect(0, 0, w, h, 10);
    g.lineStyle(1, 0xc0392b, 0.25);
    g.strokeRoundedRect(0, 0, w, h, 10);
    container.setSize(w, h);
    return { container, height: h };
  }

  entriesOf(item) {
    const found = JournalManager.get(item.id);
    return {
      text: (found && found.text) || "",
      source: (found && found.source) || "",
      date: (found && found.lastUpdated) || "",
      origin: (found && found.origin) || item.origin,
    };
  }

  _footerText(item, full) {
    const parts = [];
    if (item.source) parts.push(`Sumber: ${item.source}`);
    if (full.date) parts.push(full.date);
    if (full.origin) parts.push(full.origin === "quest" ? "Dari misi" : "Dari collectible");
    return parts.join(" · ");
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