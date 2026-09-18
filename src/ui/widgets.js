/**
 * widgets — helper UI yang dapat dipakai ulang (button, label).
 * Menghindari duplikasi styling antar komponen.
 */

import { Config } from "../core/Config.js";

export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const {
    width = 220,
    height = 52,
    color = Config.UI.COLOR_PRIMARY,
    hoverColor = Config.UI.COLOR_PRIMARY_HOVER,
    fontSize = 20,
    depth = 9000,
    textColor = "#ffffff",
  } = opts;

  const container = scene.add.container(x, y).setDepth(depth).setSize(width, height);
  const g = scene.add.graphics();
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: `${fontSize}px`,
      fontStyle: "bold",
      color: textColor,
    })
    .setOrigin(0.5);

  const redraw = (c) => {
    g.clear();
    g.fillStyle(c, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    g.lineStyle(2, 0xffffff, 0.35);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
  };

  redraw(color);
  container.add([g, text]);
  container.setInteractive({ useHandCursor: true });

  container.on("pointerover", () => redraw(hoverColor));
  container.on("pointerout", () => redraw(color));
  container.on("pointerup", () => {
    if (typeof onClick === "function") onClick();
  });

  container.setText = (value) => text.setText(value);
  return container;
}

export function makeLabel(scene, x, y, label, opts = {}) {
  const { fontSize = 18, color = "#2c2c2c", depth = 9000, bold = false } = opts;
  return scene.add
    .text(x, y, label, {
      fontFamily: Config.UI.FONT_FAMILY,
      fontSize: `${fontSize}px`,
      fontStyle: bold ? "bold" : "normal",
      color,
    })
    .setOrigin(0.5, 0.5)
    .setDepth(depth);
}