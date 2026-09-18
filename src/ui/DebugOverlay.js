/**
 * DebugOverlay — panel debug (FPS, posisi, state, input).
 * Aktif hanya ketika Config.DEBUG=true dan F1 ditekan.
 */

import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";

export class DebugOverlay {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this._lastUpdate = 0;
    this._throttle = 120;

    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.55);
    g.fillRoundedRect(8, 56, 210, 120, 10);
    g.lineStyle(1, 0x3498db, 0.4);
    g.strokeRoundedRect(8, 56, 210, 120, 10);

    this.text = scene.add
      .text(18, 62, "", {
        fontFamily: Config.UI.FONT_PIXEL,
        fontSize: "13px",
        color: "#ecf0f1",
        lineSpacing: 3,
      })
      .setScrollFactor(0)
      .setDepth(9800)
      .setVisible(false);

    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(9799);
    this.root.add(g);
  }

  toggle() {
    this.visible = !this.visible;
    this.text.setVisible(this.visible);
    this.root.setVisible(this.visible);
  }

  update(time) {
    if (!this.visible || !Config.DEBUG) return;
    if (time - this._lastUpdate < this._throttle) return;
    this._lastUpdate = time;

    const lines = [
      `FPS      ${Math.round(DebugState.fps)}`,
      `POS      ${Math.round(DebugState.px)}, ${Math.round(DebugState.py)}`,
      `STATE    ${DebugState.pState}`,
      `FACING   ${DebugState.facing}`,
      `INPUT    (${DebugState.input.x.toFixed(2)}, ${DebugState.input.y.toFixed(2)})`,
    ];
    this.text.setText(lines.join("\n"));
  }
}