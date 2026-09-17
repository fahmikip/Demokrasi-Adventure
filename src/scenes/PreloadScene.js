import { GameState } from "../core/GameState.js";
import { EventBus } from "../core/EventBus.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create() {
    GameState.set("PRELOAD");
    this._generatePlaceholderTextures();
    EventBus.emit("ASSETS_LOADED");
    this.scene.start("MenuScene");
  }

  _generatePlaceholderTextures() {
    this._rect("player_placeholder", 32, 48, 0x3498db);
    this._rect("npc_placeholder", 32, 48, 0xe67e22);
    this._rect("tile_grass", 32, 32, 0x4a7c59);
    this._rect("tile_path", 32, 32, 0xd4b896);
    this._rect("tile_wall", 32, 32, 0x7f8c8d);
    this._rect("tile_water", 32, 32, 0x5dade2);
    this._rect("tile_floor", 32, 32, 0xcdb4a0);
    this._rect("tile_roof", 32, 32, 0xc0392b);
    this._rect("interact_marker", 32, 32, 0xf1c40f);
    this._rect("collectible_placeholder", 16, 16, 0xf1c40f);
    this._circle("npc_portrait", 48, 0xe67e22);
    this._circle("player_portrait", 48, 0x3498db);
  }

  _rect(key, w, h, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, w, h);
    g.lineStyle(1, 0x000000, 0.3);
    g.strokeRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  _circle(key, r, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color);
    g.fillCircle(r, r, r);
    g.lineStyle(2, 0x000000, 0.3);
    g.strokeCircle(r, r, r);
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();
  }
}