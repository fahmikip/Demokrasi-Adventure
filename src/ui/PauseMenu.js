/**
 * PauseMenu — overlay pause game.
 * Dikelola oleh UIScene; dapat menampilkan panel settings dari pause.
 */

import { Config } from "../core/Config.js";
import { Panel } from "./Panel.js";
import { makeButton } from "./widgets.js";
import { AudioManager } from "../audio/AudioManager.js";
import { ProgressState } from "../core/ProgressState.js";

export class PauseMenu {
  constructor(scene, { onResume, onQuit }) {
    this.scene = scene;
    this.onResume = onResume;
    this.onQuit = onQuit;
    this.root = null;
    this.settingsPanel = null;

    this._build();
    this.root.setVisible(false);
    this.root.setActive(false);
  }

  show() {
    this.root.setVisible(true);
    this.root.setActive(true);
  }

  hide() {
    this.root.setVisible(false);
    this.root.setActive(false);
    this._removeSettings();
  }

  destroy() {
    this._removeSettings();
    if (this.root) this.root.destroy();
  }

  _build() {
    const scene = this.scene;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    this.root = scene.add.container(0, 0).setDepth(9600);

    const dim = scene.add
      .rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.6)
      .setDepth(-1);
    this.root.add(dim);

    const panelW = 300;
    const panelH = 340;
    const g = scene.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);
    g.lineStyle(2, 0xc0392b, 0.6);
    g.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 16);
    this.root.add(g);

    const title = scene.add
      .text(cx, cy - panelH / 2 + 30, "DIJEDA", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "22px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);
    this.root.add(title);

    const btnRes = makeButton(scene, cx, cy - 40, "LANJUT", () => this.onResume(), {
      width: 200,
      height: 48,
      color: Config.UI.COLOR_PRIMARY,
      hoverColor: Config.UI.COLOR_PRIMARY_HOVER,
    });
    const btnSet = makeButton(scene, cx, cy + 20, "PENGATURAN", () => this._openSettings(), {
      width: 200,
      height: 48,
      color: Config.UI.COLOR_DARK,
      hoverColor: Config.UI.COLOR_DARK_HOVER,
    });
    const btnQuit = makeButton(scene, cx, cy + 80, "KEMBALI KE MENU", () => this.onQuit(), {
      width: 200,
      height: 48,
      color: 0x7f8c8d,
      hoverColor: 0x6c7a85,
    });

    this.root.add([btnRes, btnSet, btnQuit]);
  }

  _openSettings() {
    if (this.settingsPanel) return;
    const scene = this.scene;
    const panel = new Panel(scene, { title: "PENGATURAN", width: 400, height: 350 });

    panel.addStepper("Musik", () => AudioManager.music, (v) => AudioManager.setMusic(v));
    panel.addStepper("Efek SFX", () => AudioManager.sfx, (v) => AudioManager.setSfx(v));

    panel.addToggle("Layar Penuh", () => scene.scale.isFullscreen, (on) => {
      if (on) scene.scale.startFullscreen();
      else scene.scale.exitFullscreen();
    });

    const saved = localStorage.getItem(Config.SAVE.KEY);
    if (saved) {
      panel.addLabel("Data disimpan tersedia. Reset dengan FITUR SAVE pada Phase 5+.", { color: "#7f8c8d" });
    } else {
      panel.addLabel("Belum ada data disimpan.", { color: "#7f8c8d" });
    }

    this.settingsPanel = panel;
  }

  _removeSettings() {
    if (this.settingsPanel) {
      this.settingsPanel.close();
      this.settingsPanel = null;
    }
  }
}