/**
 * DialogueManager — orkestrasi sesi dialog (Phase 3, perluas Phase 7).
 * Singleton. Memuat data dialog via registry, mengunci GameState (DIALOGUE),
 * menerbitkan event ke UI & sistem lain:
 *   DIALOGUE_STARTED   {npc, dialogue, title}  — quest/XP hook + UI buka
 *   DIALOGUE_TICK      {snapshot}              — progres ketikan
 *   DIALOGUE_ROW       {snapshot}              — pilihan tampil / "lanjut"
 *   DIALOGUE_CHOICE_SELECTED {index}           — (diterima) pilihan diklik
 *   DIALOGUE_COMPLETED {endReason}             — dialog selesai
 * Phase 7: startNode bisa dipilih lewat `startSelector` (branching berbasis
 * state), pilihan difilter `conditions`, dan konsekuensi `consequences`
 * diproses oleh DecisionManager.
 */

import { EventBus } from "../core/EventBus.js";
import { GameState, GAME_STATES } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { SettingsManager } from "../core/SettingsManager.js";
import { DialogueRunner } from "./DialogueRunner.js";
import { DialogueDataLoader } from "./DialogueData.js";
import { DecisionManager } from "../decisions/DecisionManager.js";

class DialogueManagerClass {
  constructor() {
    this.active = false;
    this.runner = null;
    this.npc = null;
    this._time = 0;
    this._emitRowKey = null;
    this._bound = false;
  }

  get isActive() {
    return this.active;
  }

  bind() {
    if (this._bound) return;
    this._bound = true;
    EventBus.on("DIALOGUE_CHOICE_SELECTED", ({ index } = {}) => {
      if (this.active && this.runner) this.select(index);
    });
  }

  /** Mulai dialog NPC (data dari registry JSON). */
  async startFromNpc(npc) {
    await DialogueDataLoader.load();
    if (this.active) return false;
    if (!npc) return false;
    const data = DialogueDataLoader.get(npc.npcId || npc.id);
    if (!data) return false;
    return this._run(data, npc);
  }

  /** Mulai dialog info dari POI (tanpa file JSON; lines dari data peta). */
  startInfo(poi, lines, consequences = null) {
    const data = {
      id: `info:${poi.id}`,
      title: poi.name || "Informasi",
      startNode: "info",
      nodes: {
        info: {
          speaker: poi.name || "Informasi",
          lines: lines || ["Informasi singkat."],
          consequences: consequences || null,
          next: null,
        },
      },
    };
    const npc = {
      npcId: `poi:${poi.id}`,
      name: poi.name || "Informasi",
      role: "info",
      portrait: null,
    };
    return this._run(data, npc);
  }

  _run(data, npc) {
    if (this.active) return false;
    const startNode = this._pickStartNode(data);
    const dialogue = startNode === data.startNode ? data : { ...data, startNode };
    this.runner = new DialogueRunner(dialogue, npc, DecisionManager);
    this.npc = npc;
    this.active = true;
    this._time = 0;
    this._emitRowKey = null;
    GameState.set(GAME_STATES.DIALOGUE);

    EventBus.emit("DIALOGUE_STARTED", {
      npc: {
        npcId: npc.npcId || npc.id || null,
        name: npc.name || "",
        role: npc.role || "",
        portrait: npc.portrait || null,
      },
      dialogue: data.id,
      title: data.title,
    });

    if (this.runner.state.choices.length) {
      EventBus.emit("DIALOGUE_ROW", { snapshot: this._snapshot() });
    } else {
      EventBus.emit("DIALOGUE_TICK", { snapshot: this._snapshot() });
    }
    return true;
  }

  /** Pilih startNode via startSelector (branching berbasis state). */
  _pickStartNode(data) {
    const sel = Array.isArray(data.startSelector) ? data.startSelector : [];
    for (const cand of sel) {
      if (cand && cand.node && this._evalCond(cand.requires)) return cand.node;
    }
    return data.startNode || "start";
  }

  _evalCond(cond) {
    if (!cond || typeof cond !== "object") return true;
    if (cond.flags && !cond.flags.every((f) => DecisionManager.hasFlag(f))) return false;
    if (cond.notFlags && cond.notFlags.some((f) => DecisionManager.hasFlag(f))) return false;
    if (cond.relationship) {
      const t = DecisionManager.relationship(cond.relationship.npc);
      if (cond.relationship.min != null && t < cond.relationship.min) return false;
    }
    return true;
  }

  /** Ketik progresif berbasis delta. */
  update(time, delta) {
    if (!this.active || !this.runner) return;
    const cfg = Config.DIALOGUE;
    const s = this.runner.state;
    this._time += delta;
    const want = SettingsManager.instantText
      ? s.line.length
      : Math.min(
          s.line.length,
          Math.floor(Math.max(0, this._time) / cfg.TYPING_MS_PER_CHAR)
        );
    const cur = s.visible;
    this.runner.tick(want);
    if (s.visible !== cur) {
      EventBus.emit("DIALOGUE_TICK", { snapshot: this._snapshot() });
    }
    if (this.runner.revealed && s.choices.length === 0) {
      const key = `${s.nodeId}:${s.lineIdx}`;
      if (this._emitRowKey !== key) {
        this._emitRowKey = key;
        EventBus.emit("DIALOGUE_ROW", { snapshot: this._snapshot() });
      }
    }
  }

  /** E: skip ketik / lanjut ke baris-pilihan-node berikutnya. */
  advance() {
    if (!this.active || !this.runner) return false;
    if (!this.runner.revealed) {
      this.runner.next(); // skip ketik (tampilkan penuh)
      EventBus.emit("DIALOGUE_ROW", { snapshot: this._snapshot() }); // gampar petunjuk "lanjut"
      return true;
    }
    this.runner.next();
    this._emitPostAdvance();
    return true;
  }

  select(chIdx) {
    if (!this.active || !this.runner) return;
    if (!this.runner.state.choices[chIdx]) return;
    this.runner.select(chIdx);
    this._emitPostAdvance();
  }

  _emitPostAdvance() {
    const s = this.runner.state;
    if (s.finished) {
      this._complete("complete");
      return;
    }
    if (s.choices.length) {
      EventBus.emit("DIALOGUE_ROW", { snapshot: this._snapshot() });
      return;
    }
    this._time = 0;
    EventBus.emit("DIALOGUE_TICK", { snapshot: this._snapshot() });
  }

  _complete(endReason) {
    this.active = false;
    this.runner = null;
    this.npc = null;
    this._emitRowKey = null;
    GameState.set(GAME_STATES.PLAYING);
    EventBus.emit("DIALOGUE_COMPLETED", { endReason });
  }

  _snapshot() {
    const s = this.runner.state;
    return {
      nodeId: s.nodeId,
      lineIdx: s.lineIdx,
      visible: s.visible,
      line: s.line,
      revealed: this.runner.revealed,
      choices: s.choices.map((c, i) => ({
        index: i,
        label: c.label || `Pilihan ${i + 1}`,
        note: c.note || "",
      })),
      speaker: (s.node && s.node.speaker) || this.npc?.name || "",
      title: (s.dialogue && s.dialogue.title) || "",
      npc: this.npc
        ? { npcId: this.npc.npcId || this.npc.id, name: this.npc.name, role: this.npc.role }
        : null,
      flags: [...s.flags],
      finished: s.finished,
    };
  }
}

export const DialogueManager = new DialogueManagerClass();