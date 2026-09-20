/**
 * InputManager — abstraksi input pemain.
 * Menyembunyikan sumber input (keyboard vs touch) dari gameplay.
 * Player hanya membaca: movement vector, interact, pause.
 */

import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";
import { VirtualJoystick } from "./VirtualJoystick.js";

const STRING_KEYS = "W,A,S,D,E,ESC,F1,F7,F8,F9,F10,M";

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.useTouch = scene.sys.game.device.input.touch;

    this.keys = null;
    this.joystick = null;

    this._interact = false;
    this._pause = false;

    this._setupKeyboard();
    if (this.useTouch) {
      this._setupJoystick();
    }
  }

  get isTouch() {
    return this.useTouch;
  }

  getVector() {
    if (this.useTouch && this.joystick.isActive) {
      return this.joystick.vector;
    }
    return this._keyboardVector();
  }

  consumeInteract() {
    const value = this._interact;
    this._interact = false;
    return value;
  }

  consumePause() {
    const value = this._pause;
    this._pause = false;
    return value;
  }

  consumeDebug() {
    if (!this.keys) return false;
    return Phaser.Input.Keyboard.JustDown(this.keys.F1);
  }

  consumeMap() {
    if (!this.keys) return false;
    return Phaser.Input.Keyboard.JustDown(this.keys.M);
  }

  consumeDebugKey(name) {
    if (!this.keys || !this.keys[name]) return false;
    return Phaser.Input.Keyboard.JustDown(this.keys[name]);
  }

  requestInteract() {
    this._interact = true;
  }

  setControlsVisible(value) {
    if (this.joystick) this.joystick.setVisible(value);
  }

  update() {
    if (this.keys) {
      this._interact = this._interact || Phaser.Input.Keyboard.JustDown(this.keys.E);
      this._pause = this._pause || Phaser.Input.Keyboard.JustDown(this.keys.ESC);
    }

    const v = this.getVector();
    DebugState.input = { x: v.x, y: v.y };
  }

  destroy() {
    if (this.joystick) {
      this.joystick.destroy();
      this.joystick = null;
    }
    this.keys = null;
  }

  _setupKeyboard() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    const cursorKeys = kb.createCursorKeys();
    const mapped = kb.addKeys(STRING_KEYS);
    this.keys = { ...cursorKeys, ...mapped };
  }

  _setupJoystick() {
    this.joystick = new VirtualJoystick(this.scene);
    this.joystick.setVisible(true);
  }

  _keyboardVector() {
    if (!this.keys) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    if (this.keys.left.isDown || this.keys.A.isDown) x -= 1;
    if (this.keys.right.isDown || this.keys.D.isDown) x += 1;
    if (this.keys.up.isDown || this.keys.W.isDown) y -= 1;
    if (this.keys.down.isDown || this.keys.S.isDown) y += 1;

    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      return { x: x * inv, y: y * inv };
    }
    return { x, y };
  }
}