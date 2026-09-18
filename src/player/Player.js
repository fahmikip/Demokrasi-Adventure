/**
 * Player — Sprite Phaser pembungkus untuk karakter pemain.
 * Menangani state, arah hadap, animasi, dan interaksi.
 * Movement di-handle oleh PlayerController.
 */

import { Config } from "../core/Config.js";
import { PlayerState, PlayerStateMachine } from "./PlayerState.js";

export const FACING = Object.freeze({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
});

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, Config.PLAYER.SHEET.KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.state = new PlayerStateMachine();
    this.facing = FACING.DOWN;
    this._interactUntil = 0;

    this.setDepth(10);
    this.setScale(Config.PLAYER.SCALE);
    this.setCollideWorldBounds(true);
    this.setSize(Config.PLAYER.BODY.WIDTH, Config.PLAYER.BODY.HEIGHT);

    this.state.set(PlayerState.IDLE);
    this.play(this._animationKey(), true);
  }

  get isMoving() {
    return this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
  }

  setFacing(dir) {
    if (this.facing === dir) return;
    this.facing = dir;
    this.play(this._animationKey(), true);
  }

  faceFromVector(v) {
    if (v.x !== 0 || v.y !== 0) {
      const dir = Math.abs(v.x) > Math.abs(v.y) ? (v.x < 0 ? FACING.LEFT : FACING.RIGHT) : v.y < 0 ? FACING.UP : FACING.DOWN;
      this.setFacing(dir);
    }
  }

  startInteract() {
    if (this.state.value === PlayerState.DISABLED) return;
    this.state.set(PlayerState.INTERACT);
    this._interactUntil = this.scene.time.now + Config.PLAYER.INTERACT_MS;
    this.play(`idle_${this.facing}`, true);
  }

  disable() {
    this.state.set(PlayerState.DISABLED);
    this.setVelocity(0, 0);
  }

  enable() {
    if (this.state.value === PlayerState.DISABLED) {
      this.state.set(PlayerState.IDLE);
    }
  }

  update(time) {
    if (this.state.value === PlayerState.INTERACT && time >= this._interactUntil) {
      this.state.set(PlayerState.IDLE);
    }
    const key = this._animationKey();
    if (!this.anims.isPlaying || this.anims.currentAnim.key !== key) {
      this.play(key, true);
    }
  }

  _animationKey() {
    if (this.state.value === PlayerState.INTERACT) {
      return `idle_${this.facing}`;
    }
    const type = this.state.value === PlayerState.WALK ? "walk" : "idle";
    return `${type}_${this.facing}`;
  }
}