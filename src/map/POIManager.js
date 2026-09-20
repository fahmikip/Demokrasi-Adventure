/**
 * POIManager — Points of Interest: marker visual, label nama, proximity.
 * Interaksi penuh (NPC/dialog) datang di Phase 3; di sini hanya marker generik.
 */

import { Config } from "../core/Config.js";

const MARKER_TINT = 0xf1c40f;

export class POIManager {
  constructor(scene) {
    this.scene = scene;
    this.pois = [];
    this.markersVisible = false;
  }

  setup(pois, TILE) {
    this.clear();
    this.pois = pois.map((p) => {
      const px = (p.x + 0.5) * TILE;
      const py = (p.y + 0.5) * TILE;

      // bubble "!" kecil (isyarat landmark, selalu ringkas)
      const bubble = this.scene.add
        .circle(px, py - 26, 7, MARKER_TINT, 0.9)
        .setDepth(9000)
        .setStrokeStyle(2, 0xffffff, 0.9);
      const mark = this.scene.add
        .text(px, py - 26, "!", {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: "13px",
          fontStyle: "bold",
          color: "#1a1a1a",
        })
        .setOrigin(0.5)
        .setDepth(9001);

      // label nama (F9 untuk toggle)
      const label = this.scene.add
        .text(px, py - 6, p.name, {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: "12px",
          color: "#ffffff",
          backgroundColor: "#00000088",
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(9002)
        .setVisible(false);

      const entry = {
        data: p,
        x: px,
        y: py,
        bubble,
        mark,
        label,
      };
      this._applyMarkerVisible(entry);
      return entry;
    });
  }

  get all() {
    return this.pois;
  }

  setMarkersVisible(value) {
    this.markersVisible = value;
    for (const poi of this.pois) this._applyMarkerVisible(poi);
  }

  _applyMarkerVisible(poi) {
    const on = this.markersVisible;
    poi.bubble.setAlpha(on ? 1 : 0.55);
    poi.label.setVisible(on);
    poi.bubble.setScale(on ? 1 : 0.72);
    poi.mark.setScale(on ? 1 : 0.72);
  }

  getNearest(x, y, maxDist) {
    let best = null;
    let bestD = maxDist;
    for (const poi of this.pois) {
      const d = Math.hypot(poi.x - x, poi.y - y);
      if (d < bestD) {
        bestD = d;
        best = poi;
      }
    }
    return best;
  }

  clear() {
    for (const poi of this.pois) {
      poi.bubble.destroy();
      poi.mark.destroy();
      poi.label.destroy();
    }
    this.pois = [];
  }

  destroy() {
    this.clear();
  }
}