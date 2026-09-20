/**
 * DialogueRunner — traversal node dialog berbasis data (Phase 3).
 * Mengetik line secara progresif; Advance per baris; Menangani choices.
 * Tidak tergantung Phaser — murni state machine agar mudah dites.
 */

import { DialogueState } from "./DialogueState.js";

export class DialogueRunner {
  constructor(dialogue, npc) {
    this.state = new DialogueState(dialogue, npc);
    this.revealed = false; // seluruh teks baris sudah tampil
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
    const hasChoices = this.state.advance();
    this.revealed = false;
    return this.state.node;
  }

  select(chIdx) {
    this.state.choose(chIdx);
    this.revealed = false;
    return this.state.node;
  }
}
