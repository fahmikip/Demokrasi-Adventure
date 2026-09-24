/**
 * DecisionManager — otak sistem keputusan & konsekuensi (Phase 7).
 * Mencatat:
 *   - `flags`        : flag cerita lintas sesi (hasil keputusan pemain).
 *   - `decisions`    : keputusan yang pernah diambil (record, bisa dibaca quest).
 *   - `relationships`: tingkat kepercayaan per NPC ({trust}).
 * Menyediakan `applyActions()` untuk menerapkan konsekuensi data-driven yang
 * dibawa oleh dialog (choices/nodes): flags, questFlags, relationship,
 * XP/Koin, decision record, dan entri jurnal. Semua sistem lain membaca via
 * EventBus (STORY_FLAG_SET, QUEST_FLAG, RELATIONSHIP_CHANGED, DECISION_MADE,
 * DECISION_JOURNAL).
 */

import { EventBus } from "../core/EventBus.js";
import { ProgressState } from "../core/ProgressState.js";

const MIN_TRUST = -10;
const MAX_TRUST = 10;

class DecisionManagerClass {
  constructor() {
    this.flags = new Set();
    this.decisions = new Map(); // id -> { madeAt }
    this.relationships = new Map(); // npcId -> { trust }
    this._journalApplied = new Set();
  }

  hasFlag(name) {
    return name ? this.flags.has(name) : false;
  }

  setFlag(name) {
    if (!name) return false;
    if (this.flags.has(name)) return false;
    this.flags.add(name);
    EventBus.emit("STORY_FLAG_SET", { flag: name });
    return true;
  }

  hasDecision(id) {
    return id ? this.decisions.has(id) : false;
  }

  recordDecision(id, extra = {}) {
    if (!id || this.decisions.has(id)) return false;
    this.decisions.set(id, { madeAt: Date.now(), ...extra });
    EventBus.emit("DECISION_MADE", { id, ...extra });
    return true;
  }

  relationship(npcId) {
    if (!npcId) return 0;
    const r = this.relationships.get(npcId);
    return r ? r.trust : 0;
  }

  relationshipsAll() {
    return [...this.relationships.entries()].map(([npc, r]) => ({
      npc,
      trust: r.trust,
    }));
  }

  modifyRelationship(npcId, delta) {
    if (!npcId || !delta) return;
    const cur = this.relationships.get(npcId) || { trust: 0 };
    cur.trust = Math.max(MIN_TRUST, Math.min(MAX_TRUST, cur.trust + delta));
    this.relationships.set(npcId, cur);
    EventBus.emit("RELATIONSHIP_CHANGED", {
      npc: npcId,
      trust: cur.trust,
      delta,
    });
  }

  /**
   * Terapkan blok konsekuensi dari data dialog (JSON).
   * @param {object} actions — {flags, questFlags, relationship, xp, coins, decision, journalEntries}
   */
  applyActions(actions = {}) {
    if (!actions || typeof actions !== "object") return;
    for (const f of actions.flags || []) this.setFlag(f);
    for (const qf of actions.questFlags || []) {
      if (qf) EventBus.emit("QUEST_FLAG", { flag: qf });
    }
    if (actions.relationship && actions.relationship.npc) {
      this.modifyRelationship(actions.relationship.npc, actions.relationship.delta || 0);
    }
    if (actions.xp) ProgressState.addXP(actions.xp, "decision");
    if (actions.coins) ProgressState.addCoins(actions.coins, "decision");
    if (actions.decision) this.recordDecision(actions.decision, (actions.decisionMeta || {}));
    for (const entry of actions.journalEntries || []) this.addJournalEntry(entry);
  }

  addJournalEntry(entry) {
    if (!entry || !entry.title) return;
    const id = `decision:${entry.id || entry.title}`;
    if (this._journalApplied.has(id)) return;
    this._journalApplied.add(id);
    EventBus.emit("DECISION_JOURNAL", { entry: { ...entry, _decisionId: id } });
  }

  snapshot() {
    return {
      flags: [...this.flags],
      decisions: [...this.decisions.keys()],
      relationships: this.relationshipsAll(),
      journalApplied: this._journalApplied.size,
    };
  }

  reset() {
    this.flags.clear();
    this.decisions.clear();
    this.relationships.clear();
    this._journalApplied.clear();
  }
}

export const DecisionManager = new DecisionManagerClass();