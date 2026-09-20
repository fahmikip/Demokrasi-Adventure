/**
 * WorldMapUI — overlay peta dunia (M / tombol MAP).
 * Menampilkan DEMOKRASI CITY dan daftar area; area yang belum dikunjungi
 * tampil sebagai locked/unrevealed. Minimap penuh: fitur masa depan.
 */

import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { MapManager } from "../map/MapManager.js";
import { AreaState } from "../map/AreaState.js";

export class WorldMapUI {
  constructor(scene) {
    this.scene = scene;
    this.root = null;
    this.rows = [];
    this.worldData = null;
  }

  async open() {
    if (this.root) return;
    GameState.set("MAP");

    if (!this.worldData) {
      this.worldData = await MapManager.load("world").catch((err) => {
        console.warn("[WorldMapUI] world.json gagal dimuat:", err);
        return null;
      });
    }

    const scene = this.scene;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const w = Math.min(scene.scale.width - 40, 480);
    const h = Math.min(scene.scale.height - 40, 430);

    this.root = scene.add.container(0, 0).setDepth(9750);

    const dim = scene.add
      .rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.6)
      .setDepth(-1);
    this.root.add(dim);

    const g = scene.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
    g.lineStyle(2, 0xc0392b, 0.6);
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
    this.root.add(g);

    scene.add
      .text(cx, cy - h / 2 + 34, "DEMOKRASI CITY", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "24px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);
    scene.add
      .text(cx, cy - h / 2 + 62, "Peta Dunia", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "13px",
        color: "#7f8c8d",
      })
      .setOrigin(0.5);

    const areas =
      (this.worldData && this.worldData.areas) ||
      [{ id: AreaState.current, name: AreaState.current || "Desa Harmoni", type: "?" }];

    let rowY = cy - h / 2 + 96;
    for (const area of areas) {
      const row = this._addAreaRow(area, cx, rowY, w - 60);
      this.rows.push(row);
      rowY += 48;
    }

    const closeBtn = this._btn(
      cx,
      rowY + 14,
      "TUTUP",
      () => this.close(),
      { width: 130, height: 42, color: Config.UI.COLOR_PRIMARY, hoverColor: Config.UI.COLOR_PRIMARY_HOVER }
    );
    this.root.add(closeBtn);

    this.root.setVisible(true);
    this._refresh();
  }

  close() {
    if (!this.root) return;
    this.root.destroy();
    this.root = null;
    this.rows = [];
    if (GameState.current === "MAP") GameState.set("PLAYING");
  }

  toggle() {
    if (this.root) this.close();
    else this.open();
  }

  get isOpen() {
    return !!this.root;
  }

  _addAreaRow(area, cx, y, w) {
    const s = this.scene;
    const current = AreaState.current === area.id;

    const name = s.add
      .text(cx - w / 2, y, `${current ? "◉" : "○"}  ${area.name}`, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "17px",
        fontStyle: current ? "bold" : "normal",
        color: current ? "#c0392b" : "#2c2c2c",
      })
      .setOrigin(0, 0.5);

    const state = s.add
      .text(cx + w / 2, y, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "13px",
        color: "#95a5a6",
      })
      .setOrigin(1, 0.5);

    const line = s.add.graphics();
    line.lineStyle(1, 0xc0392b, 0.18);
    line.lineBetween(cx - w / 2, y + 19, cx + w / 2, y + 19);

    this.root.add([name, state, line]);
    return { name, state, line, area };
  }

  _refresh() {
    for (const row of this.rows) {
      const visited = AreaState.has(row.area.id);
      const current = AreaState.current === row.area.id;
      row.state.setText(current ? "DI SINI" : visited ? "TERBUKA" : "?");
    }
  }

  _btn(x, y, label, onClick, opts) {
    const { width = 160, height = 44, color, hoverColor } = opts;
    const s = this.scene;
    const c = s.add.container(x, y).setSize(width, height);
    const g = s.add.graphics();
    const redraw = (col) => {
      g.clear();
      g.fillStyle(col, 1);
      g.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      g.lineStyle(2, 0xffffff, 0.35);
      g.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    };
    redraw(color);
    const t = s.add
      .text(0, 0, label, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    c.add([g, t]);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => redraw(hoverColor));
    c.on("pointerout", () => redraw(color));
    c.on("pointerup", onClick);
    return c;
  }

  destroy() {
    this.close();
  }
}