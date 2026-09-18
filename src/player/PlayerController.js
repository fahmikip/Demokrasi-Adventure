/**
 * PlayerController — membaca InputManager, menerjemahkan ke gerakan player.
 * Player membaca input abstrak, bukan keyboard/touch secara langsung.
 */

import { Config } from "../core/Config.js";
import { GameState } from "../core/GameState.js";
import { PlayerState } from "./PlayerState.js";

export class PlayerController {
  constructor(player, inputResolver) {
    this.player = player;
    this._resolveInput = inputResolver;
  }

  update(_time, _delta) {
    const player = this.player;

    if (!GameState.canMove || player.state.value === PlayerState.DISABLED) {
      player.setVelocity(0, 0);
      return;
    }

    const input = this._resolveInput();
    if (!input) return;

    const vector = input.getVector();

    const moving = vector.x !== 0 || vector.y !== 0;

    if (moving) {
      const speed = Config.PLAYER.SPEED;
      player.setVelocity(vector.x * speed, vector.y * speed);
      player.faceFromVector(vector);
      player.state.set(PlayerState.WALK);
    } else {
      player.setVelocity(0, 0);
      if (player.state.value === PlayerState.WALK) {
        player.state.set(PlayerState.IDLE);
      }
    }

    if (input.consumeInteract()) {
      player.startInteract();
    }
  }
}