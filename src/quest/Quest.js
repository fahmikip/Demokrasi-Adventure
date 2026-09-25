/**
 * Quest — model quest (Phase 4).
 * Data-driven dari data/quests/*.json; state in-memory, belum persisten.
 */

import { Objective } from "./Objective.js";

export const QUEST_TYPES = Object.freeze({
  MAIN: "main",
  SIDE: "side",
  COMPETITION: "competition",
  ACHIEVEMENT: "achievement",
});

export class Quest {
  /**
   * @param {object} def — definisi quest (lihat docs/TECHNICAL_ARCHITECTURE.md §10)
   */
  constructor(def) {
    this.id = def.id || "";
    this.title = def.title || "Tanpa Judul";
    this.type = def.type || QUEST_TYPES.SIDE;
    this.giver = def.giver || "";
    this.description = def.description || "";
    this.conditions = def.conditions || {};
    this.autoStart = def.autoStart || []; // [{ event, <field>: value }] — mulai otomatis saat event cocok
    this.reward = def.reward || { xp: 0, coins: 0 };
    this.journalEntries = def.journalEntries || [];
    this.objectives = (def.objectives || []).map((o) => new Objective(o));
    this.nextQuest = def.nextQuest || null;
  }

  get active() {
    return this.status === "active";
  }

  get completed() {
    return this.status === "completed";
  }

  begin() {
    this.status = "active";
  }

  /** Semua objective selesai? */
  get allDone() {
    return this.objectives.every((o) => o.isDone);
  }

  countDone() {
    return this.objectives.filter((o) => o.isDone).length;
  }

  snapshot() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      status: this.status || "inactive",
      done: this.countDone(),
      total: this.objectives.length,
      objectives: this.objectives.map((o) => ({
        id: o.id,
        type: o.type,
        target: o.target,
        label: o.label,
        hint: o.hint,
        done: o.isDone,
      })),
    };
  }
}