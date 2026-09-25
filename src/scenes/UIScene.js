/**
 * UIScene — overlay UI: HUD, pause, peta dunia, kontrol sentuh, debug overlay.
 * Menjadi pembuat InputManager yang dibagikan ke WorldScene.
 */

import { GameState, GAME_STATES } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";
import { SettingsManager } from "../core/SettingsManager.js";
import { InputManager } from "../input/InputManager.js";
import { HUD } from "../ui/HUD.js";
import { PauseMenu } from "../ui/PauseMenu.js";
import { DebugOverlay } from "../ui/DebugOverlay.js";
import { WorldMapUI } from "../ui/WorldMapUI.js";
import { QuestTracker } from "../ui/QuestTracker.js";
import { AchievementUI } from "../ui/AchievementUI.js";
import { JournalUI } from "../ui/JournalUI.js";
import { DialogueUI } from "../ui/DialogueUI.js";
import { QuestManager } from "../quest/QuestManager.js";
import { JournalData } from "../journal/JournalData.js";
import { JournalManager } from "../journal/JournalManager.js";
import { DialogueDataLoader } from "../dialogue/DialogueData.js";
import { DialogueManager } from "../dialogue/DialogueManager.js";
import { XPManager } from "../progression/XPManager.js";
import { AchievementManager } from "../progression/AchievementManager.js";
import { ProgressState } from "../core/ProgressState.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.inputManager = new InputManager(this);

    this._buildHUD();
    this._buildAreaChip();
    this._buildToast();
    this._buildTouchControls();
    this._buildPause();
    this._buildDebug();
    this._buildQuestTracker();
    this.worldMapUI = new WorldMapUI(this);
    this.achievementUI = new AchievementUI(this);
    this.journalUI = new JournalUI(this);
    this.dialogueUI = new DialogueUI(this);
    DialogueManager.bind();
    this._setupDialogueKeys();

    DialogueDataLoader.load().catch((err) => {
      console.warn("[UIScene] DialogueData.load gagal:", err);
    });

    if (!this.questsLoaded) {
      this.questsLoaded = true;
      QuestManager.load().catch((err) => {
        console.warn("[UIScene] QuestManager.load gagal:", err);
      });
    }

    XPManager.ensureBound();
    AchievementManager.load().catch((err) => {
      console.warn("[UIScene] AchievementManager.load gagal:", err);
    });

    JournalData.load()
      .then(() => JournalManager.ensureBound())
      .catch((err) => {
        console.warn("[UIScene] JournalData.load gagal:", err);
      });

    this._subscriptions = [
      EventBus.on("PROGRESS_CHANGED", (stats) => {
        this.hud.setStats(stats);
      }),
      EventBus.on("XP_GAINED", () => {
        if (this.hud) this.hud.setStats(ProgressState.snapshot());
      }),
      EventBus.on("DIALOGUE_STARTED", () => this._onUiBlocker(true)),
      EventBus.on("DIALOGUE_COMPLETED", () => this._onUiBlocker(false)),
      EventBus.on("AREA_ENTERED", ({ name }) => this._announceArea(name)),
      EventBus.on("POI_INTERACTED", ({ poi }) =>
        this._showToast(`📍 ${poi.name || "Landmark"}`)
      ),
      EventBus.on("ITEM_COLLECTED", ({ item }) =>
        this._showToast(`${item ? item.name : "Collectible"} ditemukan!`)
      ),
      EventBus.on("ACHIEVEMENT_UNLOCKED", ({ achievement }) => {
        this._achievementToast(achievement);
        if (Config.DEBUG) console.info(`[Prestasi] ${achievement.title}`);
      }),
      EventBus.on("JOURNAL_UPDATED", ({ entry, total }) => {
        if (entry && entry.title && !this.journalUI.isOpen) {
          this._showToast(`📖 ${entry.title}`);
        }
        if (this.hud) this.hud.setJournal(total);
      }),
    ];
  }

  update(time) {
    this.inputManager.update();
    DebugState.fps = this.game.loop.actualFps;

    DialogueManager.update(time, 16.7);

    if (DialogueManager.isActive) {
      this._handleDialogueKeys();
      if (this.inputManager.consumeInteract()) {
        DialogueManager.advance();
      }
      this.debugOverlay.update(time);
      return;
    }

    if (this.inputManager.consumeDebug()) {
      this.debugOverlay.toggle();
    }

    if (this.inputManager.consumeMap()) {
      if (GameState.current === "MAP") {
        this.worldMapUI.close();
      } else if (GameState.current === "PLAYING" && !this._isUiBlocked()) {
        this.worldMapUI.open();
      }
    }

    if (this.inputManager.consumeJournal()) {
      if (this.journalUI.isOpen) {
        this.journalUI.close();
      } else if (GameState.current === "PLAYING" && !this._isUiBlocked()) {
        this.journalUI.open();
      }
    }

    if (this.inputManager.consumePause()) {
      if (this.worldMapUI.isOpen) {
        this.worldMapUI.close();
      } else if (this.achievementUI.isOpen) {
        this.achievementUI.close();
      } else if (this.journalUI.isOpen) {
        this.journalUI.close();
      } else if (!this._isUiBlocked()) {
        this.togglePause();
      }
    }

    this._handleDebugShortcuts();
    this.debugOverlay.update(time);
  }

  shutdown() {
    if (this.inputManager) this.inputManager.destroy();
    for (const unsub of this._subscriptions || []) unsub();
  }

  getInputManager() {
    return this.inputManager;
  }

  _setupDialogueKeys() {
    const kb = this.input.keyboard;
    if (!kb) return;
    this.dialogueKeys = kb.addKeys("ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE");
    this.dialogueKeyNames = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  }

  _handleDialogueKeys() {
    if (!this.dialogueKeys) return;
    for (let i = 0; i < this.dialogueKeyNames.length; i++) {
      const k = this.dialogueKeys[this.dialogueKeyNames[i]];
      if (k && Phaser.Input.Keyboard.JustDown(k)) {
        EventBus.emit("DIALOGUE_CHOICE_SELECTED", { index: i });
        return;
      }
    }
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

  _handleDebugShortcuts() {
    const im = this.inputManager;
    if (im.consumeDebugKey("F7")) DebugState.showCollision = !DebugState.showCollision;
    if (im.consumeDebugKey("F8")) DebugState.showGrid = !DebugState.showGrid;
    if (im.consumeDebugKey("F9")) DebugState.showPOI = !DebugState.showPOI;
    if (im.consumeDebugKey("F4")) {
      XPManager.addXP(25, "debug");
      this._showToast("+25 XP (debug)");
    }
    if (im.consumeDebugKey("F5")) {
      const unlocked = AchievementManager.unlockRandomForDebug();
      if (unlocked) this._showToast(`🏆 Debug: ${unlocked.title}`);
      else this._showToast("Semua prestasi sudah terbuka");
    }
  }

  // ==================== UI building ====================

  _buildHUD() {
    this.hud = new HUD(this, () => this._toggleJournal());
    this.hud.setStats({ level: 1, xp: 0, coins: 0 });
  }

  _toggleJournal() {
    if (this.journalUI.isOpen) {
      this.journalUI.close();
    } else if (GameState.current === "PLAYING" && !this._isUiBlocked()) {
      this.journalUI.open();
    }
  }

  _buildAreaChip() {
    const w = this.scale.width;
    this.areaChip = this.add
      .text(w / 2, 20, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#c0392bdd",
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(8550)
      .setAlpha(0);
    this.areaChip._hideTween = null;
  }

  _announceArea(name) {
    this.areaChip.setText(String(name || "").toUpperCase());
    if (SettingsManager.prefersLessMotion()) {
      this.tweens.killTweensOf(this.areaChip);
      if (this.areaChip._hideTween) this.time.removeEvent(this.areaChip._hideTween);
      this.areaChip.setAlpha(1);
      this.areaChip._hideTween = this.time.delayedCall(900, () => this.areaChip.setAlpha(0));
      return;
    }
    this.tweens.killTweensOf(this.areaChip);
    this.areaChip.setAlpha(1);
    this.areaChip._hideTween = this.time.delayedCall(2600, () => {
      this.tweens.add({ targets: this.areaChip, alpha: 0, duration: 600 });
    });
  }

  _buildToast() {
    this.toast = this.add
      .text(this.scale.width / 2, this.scale.height - 110, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "17px",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9560)
      .setAlpha(0);
  }

  _showToast(msg) {
    this.toast.setText(msg).setAlpha(1);
    if (SettingsManager.prefersLessMotion()) {
      this.tweens.killTweensOf(this.toast);
      this.time.delayedCall(1400, () => this.toast.setAlpha(0));
      return;
    }
    this.tweens.killTweensOf(this.toast);
    this.time.delayedCall(2200, () => {
      this.tweens.add({ targets: this.toast, alpha: 0, duration: 500 });
    });
  }

  _achievementToast(achievement) {
    const msg = achievement && achievement.title ? `🏆 Prestasi: ${achievement.title}` : "🏆 Prestasi terbuka!";
    const t = this.achToast || (this.achToast = this.add
      .text(this.scale.width / 2, 140, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "18px",
        fontStyle: "bold",
        color: "#2c3e50",
        backgroundColor: "#f1c40f",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9561)
      .setAlpha(0));
    t.setText(msg).setAlpha(1);
    if (SettingsManager.prefersLessMotion()) {
      this.tweens.killTweensOf(t);
      this.time.delayedCall(1600, () => t.setAlpha(0));
      return;
    }
    this.tweens.killTweensOf(t);
    this.time.delayedCall(3400, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 700 });
    });
  }

  _buildPause() {
    this.pauseMenu = new PauseMenu(this, {
      onResume: () => this._resume(),
      onQuit: () => this._quitToMenu(),
      onAchievements: () => {
        this._resume();
        this.achievementUI.open();
      },
    });
  }

  _buildDebug() {
    this.debugOverlay = new DebugOverlay(this);
  }

  _buildQuestTracker() {
    this.questTracker = new QuestTracker(this);
  }

  _buildTouchControls() {
    const w = this.scale.width;
    const h = this.scale.height;

    // tombol prestasi (trophy)
    this.achBtn = this.add
      .image(w - 134, 34, "icon_trophy")
      .setScrollFactor(0)
      .setDepth(8700)
      .setInteractive({ useHandCursor: true });
    this.achBtn.on("pointerup", () => {
      if (this.achievementUI.isOpen) {
        this.achievementUI.close();
      } else if (GameState.current === "PLAYING" && !this._isUiBlocked()) {
        this.achievementUI.open();
      }
    });

    // tombol peta (icon_map)
    this.mapBtn = this.add
      .image(w - 84, 34, "icon_map")
      .setScrollFactor(0)
      .setDepth(8700)
      .setScale(0.9)
      .setInteractive({ useHandCursor: true });
    this.mapBtn.on("pointerup", () => {
      if (GameState.current === "MAP") {
        this.worldMapUI.close();
      } else if (GameState.current === "PLAYING" && !this._isUiBlocked()) {
        this.worldMapUI.open();
      }
    });

    // tombol pause (tampil di desktop & mobile)
    this.pauseBtn = this.add
      .image(w - 34, 34, "icon_pause")
      .setScrollFactor(0)
      .setDepth(8700)
      .setInteractive({ useHandCursor: true });
    this.pauseBtn.on("pointerup", () => {
      if (this.worldMapUI.isOpen) {
        this.worldMapUI.close();
      } else if (!this._isUiBlocked()) {
        this.togglePause();
      }
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
    const blocked = [GAME_STATES.DIALOGUE, GAME_STATES.CUTSCENE, GAME_STATES.TPS_SIMULATION].includes(GameState.current);
    return blocked;
  }

  _onUiBlocker(blocked) {
    this.inputManager.setControlsVisible(!blocked);
  }
}