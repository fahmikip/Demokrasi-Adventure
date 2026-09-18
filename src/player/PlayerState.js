/**
 * PlayerState — state machine ringan untuk player.
 * Nilai state: IDLE, WALK, INTERACT, DISABLED.
 * Dapat diperluas dengan DIALOGUE, CUTSCENE, MENU pada phase berikutnya.
 */

export const PlayerState = Object.freeze({
  IDLE: "IDLE",
  WALK: "WALK",
  INTERACT: "INTERACT",
  DISABLED: "DISABLED",
});

export class PlayerStateMachine {
  constructor() {
    this._value = PlayerState.IDLE;
    this._prev = null;
    this.onChange = null;
  }

  get value() {
    return this._value;
  }

  get previous() {
    return this._prev;
  }

  get canMove() {
    return this._value === PlayerState.IDLE || this._value === PlayerState.WALK;
  }

  set(value) {
    if (!Object.values(PlayerState).includes(value)) {
      console.warn(`[PlayerState] Invalid state: "${value}"`);
      return;
    }
    if (value === this._value) return;
    this._prev = this._value;
    this._value = value;
    if (typeof this.onChange === "function") {
      this.onChange(value, this._prev);
    }
  }

  reset() {
    this._value = PlayerState.IDLE;
    this._prev = null;
  }
}