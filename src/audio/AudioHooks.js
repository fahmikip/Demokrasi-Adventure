/**
 * AudioHooks — jembatan EventBus → AudioManager (Phase 9).
 * Sistem gameplay tetap murni; efek suara dipicu dari event yang sudah ada:
 *   ITEM_COLLECTED → collect
 *   QUEST_COMPLETED → quest
 *   ACHIEVEMENT_UNLOCKED → achievement
 *   LEVEL_UP → levelup
 * Dipanggil sekali saat boot (main.js / Game.js).
 */

import { EventBus } from "../core/EventBus.js";
import { AudioManager } from "./AudioManager.js";

let _installed = false;

export function installAudioHooks() {
  if (_installed) return;
  _installed = true;

  EventBus.on("ITEM_COLLECTED", () => AudioManager.play("collect"));
  EventBus.on("QUEST_COMPLETED", () => AudioManager.play("quest"));
  EventBus.on("ACHIEVEMENT_UNLOCKED", () => AudioManager.play("achievement"));
  EventBus.on("LEVEL_UP", () => AudioManager.play("levelup"));
}