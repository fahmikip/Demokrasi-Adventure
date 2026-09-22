/**
 * AchievementManager — evaluasi & buka kunci achievement data-driven (Phase 5).
 * - Mendengarkan event dan mencocokkan kondisi tiap achievement (mode:
 *   count | distinct | match | value).
 * - Saat terpenuhi: unlock, beri reward (XP/Koin via ProgressState),
 *   dan pancarkan ACHIEVEMENT_UNLOCKED.
 * Debug: unlockRandomForDebug() dipakai tombol F5.
 */

import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { ProgressState } from "../core/ProgressState.js";
import { AchievementData } from "./AchievementData.js";

function resolvePath(obj, path) {
  if (!path) return obj;
  let cur = obj;
  for (const part of String(path).split(".")) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

class AchievementManagerClass {
  constructor() {
    this.list = [];
    this.locked = [];
    this.unlocked = new Map(); // id -> definisi
    this._stats = new Map();
    this._bound = false;
    this._loaded = false;
  }

  get count() {
    return this.list.length;
  }

  get unlockedCount() {
    return this.unlocked.size;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  async load() {
    if (this._loaded) return;
    try {
      await AchievementData.load();
    } catch (err) {
      console.warn("[AchievementManager] Gagal memuat data:", err);
      return;
    }
    this.list = AchievementData.all();
    this.locked = this.list.filter((a) => !this.unlocked.has(a.id));
    this._bind();
    this._loaded = true;
    console.info(`[AchievementManager] ${this.list.length} achievement dimuat.`);
  }

  _bind() {
    if (this._bound) return;
    this._bound = true;
    const events = new Set();
    for (const a of this.list) {
      const cond = a.condition;
      if (cond && cond.event) events.add(cond.event);
    }
    this._subs = [];
    for (const evt of events) {
      this._subs.push(EventBus.on(evt, (payload = {}) => this.handleEvent(evt, payload)));
    }
  }

  handleEvent(event, payload) {
    const cond = (a) => a.condition && a.condition.event === event;
    const candidates = this.locked.filter(cond);
    if (!candidates.length) return;

    let changed = false;
    for (const a of candidates) {
      if (this._satisfied(a, payload)) {
        this.unlock(a);
        changed = true;
      }
    }
    if (changed) this.locked = this.list.filter((a) => !this.unlocked.has(a.id));
  }

  _satisfied(a, payload) {
    const c = a.condition || {};
    const { mode = "value", field, value, count = 1, op = ">=" } = c;

    if (mode === "match") {
      if (!field) return false;
      return String(resolvePath(payload, field)) === String(value);
    }

    if (mode === "value") {
      if (!field) return false;
      const got = Number(resolvePath(payload, field)) || 0;
      const want = Number(value) || 0;
      if (op === "<=") return got <= want;
      if (op === "<") return got < want;
      if (op === "==") return got === want;
      if (op === ">") return got > want;
      return got >= want;
    }

    if (mode === "count") {
      const key = this._statKey(a);
      this._stats.set(key, (this._stats.get(key) || 0) + 1);
      return this._stats.get(key) >= count;
    }

    if (mode === "distinct") {
      const key = this._statKey(a);
      const v = field ? resolvePath(payload, field) : payload;
      if (v !== undefined && v !== null) {
        if (!this._stats.has(key)) this._stats.set(key, new Set());
        this._stats.get(key).add(String(v));
      }
      const set = this._stats.get(key);
      return !!(set && set.size >= count);
    }

    return false;
  }

  _statKey(a) {
    return `${a.condition.event}:${a.id}`;
  }

  unlock(a) {
    if (!a || this.unlocked.has(a.id)) return;
    this.unlocked.set(a.id, a);
    const { xp = 0, coins = 0 } = a.reward || {};
    if (xp) ProgressState.addXP(xp, "achievement");
    if (coins) ProgressState.addCoins(coins, "achievement");
    EventBus.emit("ACHIEVEMENT_UNLOCKED", {
      achievement: a,
      reward: { xp, coins },
    });
  }

  /** Debug F5: buka kunci achievement acak yang masih terkunci. */
  unlockRandomForDebug() {
    const locked = this.list.filter((a) => !this.unlocked.has(a.id));
    if (!locked.length) return null;
    const pick = locked[Math.floor(Math.random() * locked.length)];
    this.unlock(pick);
    return pick;
  }

  reset() {
    this.unlocked.clear();
    this._stats.clear();
    this.locked = [...this.list];
  }

  snapshot() {
    return {
      total: this.list.length,
      unlockedCount: this.unlocked.size,
      items: this.list.map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        description: a.description,
        icon: a.icon || "star",
        reward: a.reward || {},
        unlocked: this.unlocked.has(a.id),
      })),
    };
  }
}

export const AchievementManager = new AchievementManagerClass();
export { resolvePath };