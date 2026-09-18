/**
 * WorldScene — environment placeholder untuk pengujian.
 * Ground efisien dengan TileSprite, obstacle static, player + camera.
 * Struktur siap diganti tilemap data-driven pada Phase 3.
 */

import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";
import { Player } from "../player/Player.js";
import { PlayerController } from "../player/PlayerController.js";
import { AudioManager } from "../audio/AudioManager.js";

const OBSTACLE_BODY_SIZE = {
  tree: { w: 36, h: 18, ox: 0, oy: 20 },
  rock: { w: 38, h: 8, ox: 0, oy: 12 },
  building: { w: 90, h: 46, ox: 0, oy: 16 },
  wall: { w: 54, h: 24, ox: 0, oy: 4 },
};

export class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create() {
    GameState.set("PLAYING");

    const { WIDTH, HEIGHT } = Config.WORLD;

    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT, true, true, true, true);

    this._buildGround();
    this._buildObstacles();
    this._spawnPlayer();
    this._setupCamera();
    this._buildDecor();

    AudioManager.play("ambient_placeholder");

    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }
  }

  update(time, delta) {
    const input = this._resolveInput();
    if (this.controller) this.controller.update(time, delta);
    if (this.player) this.player.update(time);

    if (this.player) {
      DebugState.px = this.player.x;
      DebugState.py = this.player.y;
      DebugState.pState = this.player.state.value;
      DebugState.facing = this.player.facing;
    }
    if (input) {
      const v = input.getVector();
      DebugState.input = { x: v.x, y: v.y };
    }
  }

  shutdown() {
    if (this._unsubUi) this._unsubUi();
  }

  _buildGround() {
    const { WIDTH, HEIGHT } = Config.WORLD;

    this.ground = this.add
      .tileSprite(0, 0, WIDTH, HEIGHT, "tile_grass")
      .setOrigin(0)
      .setDepth(-50);

    // jalur tanah sederhana
    this.add
      .tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH * 0.5, 96, "tile_path")
      .setOrigin(0.5)
      .setDepth(-49)
      .setPosition(1200, 800);
    this.add
      .tileSprite(WIDTH / 2, HEIGHT / 2, 96, HEIGHT * 0.5, "tile_path")
      .setOrigin(0.5)
      .setDepth(-49)
      .setPosition(1200, 800);
  }

  _buildObstacles() {
    this.obstacles = this.physics.add.staticGroup();

    for (const item of Config.WORLD.OBSTACLES) {
      const key = `${item.type}_placeholder`;
      if (!this.textures.exists(key)) {
        console.warn(`[WorldScene] Texture tidak ditemukan: ${key}`);
        continue;
      }
      const obj = this.obstacles.create(item.x, item.y, key);
      const size = OBSTACLE_BODY_SIZE[item.type];
      if (size) {
        const body = obj.body;
        body.setSize(size.w, size.h, false);
        body.setOffset(-size.w / 2 + size.ox, obj.height - size.oy - size.h);
        body.updateFromGameObject();
      }
      obj.setDepth(5);
    }
  }

  _spawnPlayer() {
    const { x, y } = Config.WORLD.PLAYER_SPAWN;
    this.player = new Player(this, x, y);
    this.physics.add.collider(this.player, this.obstacles);
    this.controller = new PlayerController(this.player, () => this._resolveInput());
  }

  _setupCamera() {
    const { WIDTH, HEIGHT } = Config.WORLD;
    this.cameras.main
      .setBounds(0, 0, WIDTH, HEIGHT)
      .setZoom(Config.CAMERA.ZOOM)
      .startFollow(this.player, true, Config.CAMERA.LERP, Config.CAMERA.LERP);
    this.cameras.main.roundPixels = Config.CAMERA.ROUND_PIXELS;
  }

  _buildDecor() {
    const { WIDTH, HEIGHT } = Config.WORLD;
    this.add
      .text(WIDTH / 2, 60, "DESA HARMONI — AREA PLACEHOLDER", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "20px",
        fontStyle: "bold",
        color: "#3d4a3a",
        backgroundColor: "#00000033",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(WIDTH / 2, 110, "Gunakan WASD / Arrow / Joystick. E = interaksi (test). ESC = pause.", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "14px",
        color: "#eaf2ea",
        backgroundColor: "#00000055",
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  _resolveInput() {
    if (this._input) return this._input;
    const ui = this.scene.get("UIScene");
    if (ui && typeof ui.getInputManager === "function") {
      this._input = ui.getInputManager();
    }
    return this._input || null;
  }
}