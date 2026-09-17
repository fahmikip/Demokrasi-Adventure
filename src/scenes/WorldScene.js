import { GameState } from "../core/GameState.js";
import { Config } from "../core/Config.js";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create() {
    GameState.set("PLAYING");

    this.physics.world.setBounds(
      0,
      0,
      Config.GAME.WIDTH,
      Config.GAME.HEIGHT,
      true,
      true,
      true,
      true
    );

    this._buildPlaceholderGround();
    this._spawnPlaceholderPlayer();
    this._setupCamera();

    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    this.add
      .text(Config.GAME.WIDTH / 2, 60, "DESA HARMONI - placeholder world", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "20px",
        fontStyle: "bold",
        color: "#fdf6e3",
        backgroundColor: "#00000066",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(Config.GAME.WIDTH / 2, 100, "Gunakan WASD / Arrow untuk bergerak. (Placeholder)", {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: "14px",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  _buildPlaceholderGround() {
    const cols = Math.ceil(Config.GAME.WIDTH / Config.TILE.SIZE);
    const rows = Math.ceil(Config.GAME.HEIGHT / Config.TILE.SIZE);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const isPath = x % 3 === 0 || y % 3 === 0;
        this.add
          .image(x * Config.TILE.SIZE, y * Config.TILE.SIZE, isPath ? "tile_path" : "tile_grass")
          .setOrigin(0)
          .setDepth(-10);
      }
    }
  }

  _spawnPlaceholderPlayer() {
    this.player = this.physics.add.sprite(
      Config.GAME.WIDTH / 2,
      Config.GAME.HEIGHT / 2,
      "player_placeholder"
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,ESC");
  }

  _setupCamera() {
    this.cameras.main
      .setBounds(0, 0, Config.GAME.WIDTH, Config.GAME.HEIGHT)
      .startFollow(this.player, true, Config.CAMERA.SMOOTH, Config.CAMERA.SMOOTH)
      .setZoom(Config.CAMERA.ZOOM);
  }

  update() {
    if (!GameState.canMove || !this.player) return;

    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }
    this.player.setVelocity(vx * Config.PLAYER.SPEED, vy * Config.PLAYER.SPEED);

    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.scene.pause();
    }
  }
}