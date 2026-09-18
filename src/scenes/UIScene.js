/**
 * UIScene — overlay UI: HUD, pause, kontrol sentuh, debug overlay.
 * Menjadi pembuat InputManager yang dibagikan ke WorldScene.
 */

import { GameState, GAME_STATES } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";
import { InputManager } from "../input/InputManager.js";
import { HUD } from "../ui/HUD.js";
import { PauseMenu } from "../ui/PauseMenu.js";
import { DebugOverlay } from "../ui/DebugOverlay.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.inputManager = new InputManager(this);

    this._buildHUD();
    this._buildTouchControls();
    this._buildPause();
    this._buildDebug();

    this._subscriptions = [
      EventBus.on("PROGRESS_CHANGED", ({ level, xp, coins }) => {
        this.hud.setStats({ level, xp, coins });
      }),
      EventBus.on("DIALOGUE_STARTED", () => this._onUiBlocker(true)),
      EventBus.on("DIALOGUE_COMPLETED", () => this._onUiBlocker(false)),
    ];
  }

  update(time) {
    this.inputManager.update();
    DebugState.fps = this.game.loop.actualFps;

    if (this.inputManager.consumeDebug()) {
      this.debugOverlay.toggle();
    }

    if (this.inputManager.consumePause() && !this._isUiBlocked()) {
      this.togglePause();
    }

    this.debugOverlay.update(time);
  }

  shutdown() {
    if (this.inputManager) this.inputManager.destroy();
    for (const unsub of this._subscriptions || []) unsub();
  }

  getInputManager() {
    return this.inputManager;
  }

  togglePause() {
    if (GameState.current === "PLAYING") {
      this._pause();
    } else if (GameState.current === "PAUSE") {
      this._resume();
    }
  }

  _pause() {
    GameState.set("PAUSE");
    this.scene.pause("WorldScene");
    this.pauseMenu.show();
    this.inputManager.setControlsVisible(false);
  }

  _resume() {
    GameState.set("PLAYING");
    this.scene.resume("WorldScene");
    this.pauseMenu.hide();
    this.inputManager.setControlsVisible(true);
  }

  _quitToMenu() {
    this.pauseMenu.hide();
    if (GameState.current === "PAUSE") {
      this.scene.resume("WorldScene");
    }
    this.scene.stop("WorldScene");
    GameState.set("MAIN_MENU");
    this.scene.stop();
    this.scene.start("MenuScene");
  }

  _buildHUD() {
    this.hud = new HUD(this);
    this.hud.setStats({ level: 1, xp: 0, coins: 0 });
    this.hud.panel.setScrollFactor(0);
  }

  _buildPause() {
    this.pauseMenu = new PauseMenu(this, {
      onResume: () => this._resume(),
      onQuit: () => this._quitToMenu(),
    });
  }

  _buildDebug() {
    this.debugOverlay = new DebugOverlay(this);
  }

  _buildTouchControls() {
    const w = this.scale.width;
    const h = this.scale.height;

    // tombol pause (tampil di desktop & mobile)
    this.pauseBtn = this.add
      .image(w - 34, 34, "icon_pause")
      .setScrollFactor(0)
      .setDepth(8700)
      .setInteractive({ useHandCursor: true });
    this.pauseBtn.on("pointerup", () => {
      if (!this._isUiBlocked()) this.togglePause();
    });

    // tombol interaksi (mobile saja, bottom-right)
    if (this.inputManager.isTouch) {
      this.interactBtn = this.add
        .circle(w - 80, h - 80, 46, 0xc0392b, 0.9)
        .setScrollFactor(0)
        .setDepth(8700)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(w - 80, h - 80, "E", {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(8701);
      this.interactBtn.on("pointerdown", () => this.inputManager.requestInteract());
      this.interactBtn.on("pointerover", () => this.interactBtn.setFillStyle(0xa93226, 0.9));
      this.interactBtn.on("pointerout", () => this.interactBtn.setFillStyle(0xc0392b, 0.9));
    }
  }

  _isUiBlocked() {
    const blocked = [GAME_STATES.DIALOGUE, GAME_STATES.CUTSCENE].includes(GameState.current);
    return blocked;
  }

  _onUiBlocker(blocked) {
    this.inputManager.setControlsVisible(!blocked);
  }
}