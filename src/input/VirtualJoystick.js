/**
 * VirtualJoystick — kontrol sentuh virtual untuk mobile.
 * Menggunakan Phaser pointer events + deadzone, menghasilkan vektor ternormalisasi.
 */

import { Config } from "../core/Config.js";
import { GameState } from "../core/GameState.js";

export class VirtualJoystick {
  constructor(scene, container) {
    this.scene = scene;
    this.container = container;

    const w = scene.scale.width;
    const h = scene.scale.height;
    const pos = { x: Config.JOYSTICK.POS.x, y: Config.JOYSTICK.POS.y ?? h - 110 };

    this.pos = pos;
    this.radius = Config.JOYSTICK.RADIUS;
    this.deadZone = Config.JOYSTICK.DEAD_ZONE;
    this.active = false;
    this.vector = { x: 0, y: 0 };

    this.base = scene.add
      .image(pos.x, pos.y, "joystick_base")
      .setScrollFactor(0)
      .setDepth(9000)
      .setAlpha(Config.JOYSTICK.ALPHA);
    this.knob = scene.add
      .image(pos.x, pos.y, "joystick_knob")
      .setScrollFactor(0)
      .setDepth(9001)
      .setAlpha(Config.JOYSTICK.ALPHA);

    scene.input.on("pointerdown", this._onDown, this);
    scene.input.on("pointermove", this._onMove, this);
    scene.input.on("pointerup", this._onUp, this);
    scene.input.on("pointerupoutside", this._onUp, this);
  }

  get isActive() {
    return this.active;
  }

  get isVisible() {
    return this.base.visible;
  }

  setVisible(value) {
    this.base.setVisible(value);
    this.knob.setVisible(value);
    if (!value) this.reset();
  }

  destroy() {
    this.scene.input.off("pointerdown", this._onDown, this);
    this.scene.input.off("pointermove", this._onMove, this);
    this.scene.input.off("pointerup", this._onUp, this);
    this.scene.input.off("pointerupoutside", this._onUp, this);
    this.base.destroy();
    this.knob.destroy();
  }

  reset() {
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.knob.setPosition(this.pos.x, this.pos.y);
  }

  _onDown(pointer) {
    if (GameState.current !== "PLAYING") return;
    if (pointer.x > this.scene.scale.width * Config.INPUT.TOUCH_ZONE_RATIO) return;
    this.active = true;
    this._update(pointer);
  }

  _onMove(pointer) {
    if (!this.active) return;
    this._update(pointer);
  }

  _onUp() {
    this.reset();
  }

  _update(pointer) {
    let dx = pointer.x - this.pos.x;
    let dy = pointer.y - this.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.radius) {
      dx = (dx / dist) * this.radius;
      dy = (dy / dist) * this.radius;
    }

    this.knob.setPosition(this.pos.x + dx, this.pos.y + dy);

    let vx = dx / this.radius;
    let vy = dy / this.radius;
    const mag = Math.hypot(vx, vy);

    if (mag < this.deadZone) {
      vx = 0;
      vy = 0;
    } else if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }

    this.vector = { x: vx, y: vy };
  }
}