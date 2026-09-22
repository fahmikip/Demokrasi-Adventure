/**
 * XPManager — sumber kebenaran XP pemain (Phase 5).
 * - addXP: menambah XP, mendeteksi level-up, memancarkan XP_GAINED & LEVEL_UP.
 * - Passive XP: dialog/POI/area (sekali per NPC/POI per sesi, area hanya saat
 *   kunjungan pertama) mengikuti Config.PROGRESSION.EVENTS.
 * Reward quest TIDAK diduplikasi: QuestManager memanggil ProgressState.addXP
 * langsung, dan XPManager hanya meng-hook event non-quest.
 */

import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { LevelManager } from "./LevelManager.js";

class XPManagerClass {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this._bound = false;
    this._awardedDialogues = new Set();
    this._awardedPOIs = new Set();
  }

  addXP(amount, source = "quest") {
    if (!amount || amount <= 0) return;
    this.xp += amount;
    const newLevel = LevelManager.levelForXP(this.xp);
    if (newLevel > this.level) {
      const prevLevel = this.level;
      this.level = newLevel;
      EventBus.emit("LEVEL_UP", {
        level: this.level,
        levelName: LevelManager.name(this.level),
        prevLevel,
        xp: this.xp,
        source,
      });
    }
    this._emitGain(amount, source);
  }

  /** Set XP langsung (mis. load save) tanpa reward ganda. */
  setXP(value) {
    this.xp = Math.max(0, Number(value) || 0);
    this.level = LevelManager.levelForXP(this.xp);
  }

  ensureBound() {
    if (this._bound) return;
    this._bound = true;

    const EVENTS = Config.PROGRESSION.EVENTS;
    this._subs = [
      EventBus.on("DIALOGUE_STARTED", ({ npc } = {}) => {
        const key = npc ? npc.npcId : null;
        if (!key || this._awardedDialogues.has(key)) return;
        this._awardedDialogues.add(key);
        this.addXP(EVENTS.dialogue_xp, "dialogue");
      }),
      EventBus.on("POI_INTERACTED", ({ poi } = {}) => {
        const key = poi ? poi.id : null;
        if (!key || this._awardedPOIs.has(key)) return;
        this._awardedPOIs.add(key);
        this.addXP(EVENTS.poi_xp, "poi");
      }),
      EventBus.on("AREA_ENTERED", ({ firstVisit } = {}) => {
        if (!firstVisit) return;
        this.addXP(EVENTS.area_xp, "area");
      }),
    ];
  }

  _emitGain(amount, source) {
    EventBus.emit("XP_GAINED", {
      amount,
      source,
      xp: this.xp,
      level: this.level,
      levelName: LevelManager.name(this.level),
      xpToNext: LevelManager.xpToNext(this.xp, this.level),
      progress: LevelManager.progress(this.xp, this.level),
    });
  }

  reset() {
    this.xp = 0;
    this.level = 1;
    this._awardedDialogues.clear();
    this._awardedPOIs.clear();
  }

  snapshot() {
    return {
      xp: this.xp,
      level: this.level,
      levelName: LevelManager.name(this.level),
      xpToNext: LevelManager.xpToNext(this.xp, this.level),
      progress: LevelManager.progress(this.xp, this.level),
    };
  }
}

export const XPManager = new XPManagerClass();