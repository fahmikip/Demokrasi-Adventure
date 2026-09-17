/**
 * Game — bootstrap Phaser.Game dengan seluruh scene terdaftar.
 */

import { Config } from "./Config.js";
import { BootScene } from "../scenes/BootScene.js";
import { PreloadScene } from "../scenes/PreloadScene.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { WorldScene } from "../scenes/WorldScene.js";
import { UIScene } from "../scenes/UIScene.js";

export class Game {
  constructor(containerId = "game-root") {
    const container = document.getElementById(containerId);

    this.phaser = new Phaser.Game({
      type: Config.GAME.RENDER_MODE === "canvas" ? Phaser.CANVAS : Phaser.AUTO,
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
      scene: [BootScene, PreloadScene, MenuScene, WorldScene, UIScene],
    });
  }
}