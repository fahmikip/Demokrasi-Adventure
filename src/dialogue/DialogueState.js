/**
 * DialogueState — state global sesi dialog aktif (Phase 3, diperluas Phase 7).
 * Murni data: mencatat node aktif, line index, pilihan, dan flag.
 * Phase 7 menambah:
 *   - `context` (DecisionManager) agar kondisi & konsekuensi membaca state
 *     lintas sesi (flags, relationship) — dialog "bercabang sungguhan".
 *   - Filter pilihan via `conditions` (requires/anyFlags/notFlags/relationship).
 *   - Konsekuensi `consequences` pada pilihan & node (flags, questFlags,
 *     relationship, xp, coins, decision, journalEntries).
 * Tidak menyentuh Phaser langsung agar mudah dites.
 */

export class DialogueState {
  constructor(dialogue, npc, context = null) {
    this.version = 2;
    this.dialogue = dialogue; // objek JSON dialog mentah
    this.npc = npc; // {id, name, role, portrait}
    this.context = context; // DecisionManager (opsional, untuk branching lintas sesi)
    this.nodeId = dialogue?.startNode || "start";
    this.lineIdx = 0;
    this.visible = 0;
    this.choices = [];
    this.ended = false; // true bila sesi dialog selesai
    this.flags = new Set(); // flag sesi dialog (fallback bila tanpa context)
    this._appliedNodes = new Set(); // dedup konsekuensi node per sesi dialog
  }

  /** Node aktif dari struktur JSON. */
  get node() {
    return this.dialogue?.nodes?.[this.nodeId] || null;
  }

  get line() {
    const lines = this.node?.lines || [];
    return lines[this.lineIdx] || "";
  }

  get finished() {
    return (
      this.ended ||
      (this.node && !this.node.lines && !this.node.choices && !this.node.next)
    );
  }

  /** Pindah ke pilihan/next setelah semua line trenak. */
  advance() {
    const lines = this.node?.lines || [];
    if (this.lineIdx < lines.length - 1) {
      this.lineIdx += 1;
      this.visible = 0;
      return true;
    }
    if (this.node.choices && this.node.choices.length) {
      this.choices = this._visibleChoices();
      return true;
    }
    const nxt = this.node.next;
    if (nxt) {
      this._enterNode(nxt);
      return true;
    }
    this.choices = [];
    this.ended = true; // ending tanpa next/choices
    return false;
  }

  choose(chIdx) {
    const c = this.choices[chIdx];
    if (!c) return false;
    this._applyConsequences(c.consequences);
    for (const f of c.setFlags || []) this._addFlag(f);
    if (c.next) {
      this._enterNode(c.next);
      return true;
    }
    this.choices = [];
    this.ended = true; // pilihan mengakhiri percakapan
    return false;
  }

  /**
   * Masuk node + terapkan konsekuensi node (dedup per sesi dialog).
   * Jika node punya `conditions` yang tidak terpenuhi, lompat ke
   * `fallbackNext` bila tersedia (branching berbasis state).
   */
  _enterNode(id) {
    this.nodeId = id;
    this.lineIdx = 0;
    this.visible = 0;
    this.choices = [];
    let node = this.node;
    let hops = 0;
    while (node && !this._evalConditions(node.conditions) && node.fallbackNext) {
      if (++hops > 16) break;
      this.nodeId = node.fallbackNext;
      this.lineIdx = 0;
      this.visible = 0;
      node = this.node;
    }
    if (node && node.consequences) {
      const key = this.nodeId;
      if (!this._appliedNodes.has(key)) {
        this._appliedNodes.add(key);
        this._applyConsequences(node.consequences);
      }
    }
  }

  /** Filter pilihan node berdasarkan conditions. */
  _visibleChoices() {
    return (this.node.choices || []).filter((c) => this._evalConditions(c.conditions));
  }

  _addFlag(f) {
    if (this.context && typeof this.context.setFlag === "function") {
      this.context.setFlag(f);
    } else {
      this.flags.add(f);
    }
  }

  _hasFlag(f) {
    if (this.context && typeof this.context.hasFlag === "function") {
      return this.context.hasFlag(f) || this.flags.has(f);
    }
    return this.flags.has(f);
  }

  _evalConditions(cond) {
    if (!cond || typeof cond !== "object") return true;
    if (cond.flags && !cond.flags.every((f) => this._hasFlag(f))) return false;
    if (cond.anyFlags && !cond.anyFlags.some((f) => this._hasFlag(f))) return false;
    if (cond.notFlags && cond.notFlags.some((f) => this._hasFlag(f))) return false;
    if (cond.relationship) {
      const t =
        this.context && typeof this.context.relationship === "function"
          ? this.context.relationship(cond.relationship.npc)
          : 0;
      if (cond.relationship.min != null && t < cond.relationship.min) return false;
    }
    return true;
  }

  _applyConsequences(cons) {
    if (!cons || typeof cons !== "object") return;
    if (this.context && typeof this.context.applyActions === "function") {
      this.context.applyActions(cons);
    } else {
      // tanpa context (unit test): setFlags saja
      for (const f of cons.flags || []) this.flags.add(f);
    }
  }
}