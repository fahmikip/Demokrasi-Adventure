/**
 * DialogueRunner — traversal node dialog berbasis data (Phase 3, perluas Phase 7).
 * Mengetik line secara progresif; Advance per baris; Menangani choices.
 * Menerima `context` (DecisionManager) sehingga kondisi & konsekuensi
 * berjalan sungguhan (branching & perubahan state). Murni state machine
 * agar mudah dites tanpa Phaser.
 */

import { DialogueState } from "./DialogueState.js";

export class DialogueRunner {
  constructor(dialogue, npc, context = null) {
    this.state = new DialogueState(dialogue, npc, context);
    this.revealed = false; // seluruh teks baris sudah tampil
    if (this.state.node && this.state.node.consequences) {
      this.state._enterNode(this.state.nodeId); // konsekuensi node awal (dedup)
    }
  }

  get finished() {
    return this.state.finished;
  }

  /** Kemajuan mengetik baris aktif. @param {number} chars — karakter yg tampil. */
  tick(chars) {
    const max = this.state.line.length;
    this.state.visible = Math.min(max, chars);
    this.revealed = this.state.visible >= max;
  }

  /** Lanjut: baris berikut / pilihan / node-next. */
  next() {
    if (!this.revealed) {
      this.state.visible = this.state.line.length; // skip ketik
      this.revealed = true;
      return this.state.node;
    }
    this.state.advance();
    this.revealed = false;
    return this.state.node;
  }

  select(chIdx) {
    this.state.choose(chIdx);
    this.revealed = false;
    return this.state.node;
  }
}