/**
 * GameState — state machine terpusat untuk game.
 */

import { EventBus } from "./EventBus.js";

const VALID_STATES = [
  "BOOT",
  "PRELOAD",
  "MAIN_MENU",
  "PLAYING",
  "DIALOGUE",
  "QUEST",
  "CUTSCENE",
  "PAUSE",
  "JOURNAL",
  "INVENTORY",
  "MAP",
  "SETTINGS",
  "ACHIEVEMENTS",
  "TPS_SIMULATION",
  "GAME_OVER",
];

export const GAME_STATES = Object.freeze({
  BOOT: "BOOT",
  PRELOAD: "PRELOAD",
  MAIN_MENU: "MAIN_MENU",
  PLAYING: "PLAYING",
  DIALOGUE: "DIALOGUE",
  QUEST: "QUEST",
  CUTSCENE: "CUTSCENE",
  PAUSE: "PAUSE",
  JOURNAL: "JOURNAL",
  INVENTORY: "INVENTORY",
  MAP: "MAP",
  SETTINGS: "SETTINGS",
  ACHIEVEMENTS: "ACHIEVEMENTS",
  TPS_SIMULATION: "TPS_SIMULATION",
  GAME_OVER: "GAME_OVER",
});

class GameStateClass {
  constructor() {
    this._current = "BOOT";
    this._prev = null;
    this._stack = [];
  }

  get current() {
    return this._current;
  }

  get prev() {
    return this._prev;
  }

  get isPlaying() {
    return this._current === "PLAYING";
  }

  get canMove() {
    return this._current === "PLAYING";
  }

  get canInteract() {
    return this._current === "PLAYING";
  }

  get isPaused() {
    return this._current === "PAUSE";
  }

  set(state) {
    if (!VALID_STATES.includes(state)) {
      console.warn(`[GameState] Invalid state: "${state}"`);
      return;
    }
    if (state === this._current) return;
    this._prev = this._current;
    this._current = state;
    EventBus.emit("GAME_STATE_CHANGED", { prev: this._prev, current: this._current });
  }

  push(state) {
    this._stack.push(this._current);
    this.set(state);
  }

  pop() {
    if (this._stack.length === 0) return;
    this.set(this._stack.pop());
  }

  reset() {
    this._current = "BOOT";
    this._prev = null;
    this._stack = [];
  }
}

export const GameState = new GameStateClass();