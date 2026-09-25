/**
 * Game — bootstrap Phaser.Game dengan seluruh scene terdaftar.
 */

import { Config } from "./Config.js";
import { BootScene } from "../scenes/BootScene.js";
import { PreloadScene } from "../scenes/PreloadScene.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { WorldScene } from "../scenes/WorldScene.js";
import { UIScene } from "../scenes/UIScene.js";
import { TPSScene } from "../scenes/TPSScene.js";
import { installAudioHooks } from "../audio/AudioHooks.js";

export class Game {
  constructor(containerId = "game-root") {
    const container = document.getElementById(containerId);

    const forceCanvas =
      Config.DEBUG &&
      new URLSearchParams(window.location.search).get("renderer") === "canvas";
    const renderMode =
      forceCanvas || Config.GAME.RENDER_MODE === "canvas" ? Phaser.CANVAS : Phaser.AUTO;

    this.phaser = new Phaser.Game({
      type: renderMode,
      parent: container,
      width: Config.GAME.WIDTH,
      height: Config.GAME.HEIGHT,
      backgroundColor: Config.GAME.BACKGROUND,
      pixelArt: Config.GAME.PIXEL_ART,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: Config.DEBUG,
        },
      },
      scene: [BootScene, PreloadScene, MenuScene, WorldScene, UIScene, TPSScene],
    });

    window.__DEMOKRASI = window.__DEMOKRASI || {};
    window.__DEMOKRASI.phaser = this.phaser;

    installAudioHooks();
  }
}