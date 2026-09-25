/**
 * Panel — modal panel generik (digunakan untuk SETTINGS & ABOUT).
 * Menyediakan: title, tombol, stepper volume, toggle.
 * Phase 9: micro-animation buka/tutup (reduced-motion aware).
 */

import { Config } from "../core/Config.js";
import { SettingsManager } from "../core/SettingsManager.js";
import { AudioManager } from "../audio/AudioManager.js";
import { makeButton } from "./widgets.js";

export class Panel {
  constructor(scene, { title = "", width = 440, height = 320 } = {}) {
    this.scene = scene;
    this.title = title;
    this.width = width;
    this.height = height;
    this._rowY = 0;

    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    this.root = scene.add.container(0, 0).setDepth(9650);

    this.dim = scene.add
      .rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.6)
      .setDepth(-1);
    this.root.add(this.dim);

    const g = scene.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRoundedRect(cx - width / 2, cy - height / 2, width, height, 16);
    g.lineStyle(2, 0xc0392b, 0.6);
    g.strokeRoundedRect(cx - width / 2, cy - height / 2, width, height, 16);
    this.root.add(g);

    this.titleText = scene.add
      .text(cx, cy - height / 2 + 34, title, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "22px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);
    this.root.add(this.titleText);

    this._rowY = cy - height / 2 + 96;

    this.closeBtn = makeButton(scene, cx + width / 2 - 22, cy - height / 2 + 26, "✕", () => this.close(), {
      width: 36,
      height: 36,
      color: 0x95a5a6,
      hoverColor: 0x7f8c8d,
      fontSize: 18,
      depth: 9500,
    });
    this.root.add(this.closeBtn);

    this.content = scene.add.container(0, 0).setDepth(9501);
    this.root.add(this.content);
    scene.add.existing(this.root);

    AudioManager.play("click", { volume: 0.4 });
    if (!SettingsManager.prefersLessMotion()) {
      this.root.setAlpha(0);
      scene.tweens.add({
        targets: this.root,
        alpha: 1,
        duration: 160,
        ease: "Quad.easeOut",
      });
      this.content.setScale(0.97);
      scene.tweens.add({
        targets: this.content,
        scale: 1,
        duration: 180,
        ease: "Back.easeOut",
      });
    }
  }

  addButton(label, onClick, opts = {}) {
    const cx = this.scene.scale.width / 2;
    const y = this._rowY;
    this._rowY += (opts.height || 52) + 14;
    const btn = makeButton(this.scene, cx, y, label, onClick, {
      width: opts.width || 260,
      height: opts.height || 52,
      color: opts.color || Config.UI.COLOR_PRIMARY,
      hoverColor: opts.hoverColor || Config.UI.COLOR_PRIMARY_HOVER,
      depth: 9500,
    });
    this.content.add(btn);
    return btn;
  }

  addLabel(text, opts = {}) {
    const cx = this.scene.scale.width / 2;
    const y = this._rowY;
    this._rowY += (opts.height || 28) + 6;
    const label = this.scene.add
      .text(cx, y, text, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: `${opts.fontSize || 16}px`,
        color: opts.color || "#2c2c2c",
      })
      .setOrigin(0.5)
      .setDepth(9500);
    this.content.add(label);
    return label;
  }

  addStepper(label, getValue, setValue, { min = 0, max = 1, step = 0.1 } = {}) {
    const cx = this.scene.scale.width / 2;
    const y = this._rowY + 8;
    this._rowY += 56;

    const name = this.scene.add
      .text(cx - 130, y, label, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        color: "#2c2c2c",
      })
      .setOrigin(0.5)
      .setDepth(9500);
    const valueText = this.scene.add
      .text(cx + 2, y, `${Math.round(getValue() * 100)}%`, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "bold",
        color: "#2c2c2c",
        backgroundColor: "#ffffff",
        padding: { x: 12, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(9500);

    const refresh = () => valueText.setText(`${Math.round(getValue() * 100)}%`);

    const minus = makeButton(this.scene, cx - 64, y, "−", () => {
      setValue(clamp(getValue() - step, min, max));
      refresh();
    }, { width: 40, height: 44, color: Config.UI.COLOR_DARK, hoverColor: Config.UI.COLOR_DARK_HOVER, fontSize: 20, depth: 9500 });

    const plus = makeButton(this.scene, cx + 64, y, "+", () => {
      setValue(clamp(getValue() + step, min, max));
      refresh();
    }, { width: 40, height: 44, color: Config.UI.COLOR_PRIMARY, hoverColor: Config.UI.COLOR_PRIMARY_HOVER, fontSize: 20, depth: 9500 });

    this.content.add([name, valueText, minus, plus]);
  }

  addToggle(label, getState, onToggle, { labels = ["OFF", "ON"] } = {}) {
    const cx = this.scene.scale.width / 2;
    const y = this._rowY + 8;
    this._rowY += 56;

    const name = this.scene.add
      .text(cx - 100, y, label, {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        color: "#2c2c2c",
      })
      .setOrigin(0.5)
      .setDepth(9500);

    const valueText = this.scene.add
      .text(cx + 12, y, labels[0], {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#7f8c8d",
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(9500);

    const refresh = () => {
      const on = getState();
      valueText.setText(labels[on ? 1 : 0]);
      valueText.setBackgroundColor(on ? "#27ae60" : "#7f8c8d");
    };

    valueText.setInteractive({ useHandCursor: true });
    valueText.on("pointerup", () => {
      AudioManager.play("click", { volume: 0.5 });
      onToggle(!getState());
      refresh();
      if (!SettingsManager.prefersLessMotion()) {
        this.scene.tweens.add({
          targets: valueText,
          scale: 1.1,
          duration: 70,
          yoyo: true,
          ease: "Quad.easeOut",
        });
      }
    });

    this.content.add([name, valueText]);

    refresh();
    return valueText;
  }

  close() {
    this.root.destroy();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}