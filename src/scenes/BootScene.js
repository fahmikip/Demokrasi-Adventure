import { GameState } from "../core/GameState.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    GameState.set("BOOT");
    this.scene.start("PreloadScene");
  }
}