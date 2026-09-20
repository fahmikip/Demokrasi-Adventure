/**
 * DialogueState — state global sesi dialog aktif (Phase 3).
 * Murni data: mencatat node aktif, line index, pilihan, dan flag.
 * Tidak menyentuh Phaser langsung agar mudah dites.
 */

export class DialogueState {
  constructor(dialogue, npc) {
    this.version = 1;
    this.dialogue = dialogue; // objek JSON dialog mentah
    this.npc = npc; // {id, name, role, portrait}
    this.nodeId = dialogue?.startNode || "start";
    this.lineIdx = 0;
    this.visible = 0; // karakter tampil utk efek mengetik
    this.choices = [];
    this.flags = new Set();
  }

  /** Node aktif dari struktur JSON. */
  get node() {
    return this.dialogue?.nodes?.[this.nodeId] || null;
  }

  get line() {
    const lines = this.node?.lines || [];
    return lines[this.lineIdx] || "";
  }

  /** Pindah ke pilihan/next setelah line terakhir node. */
  advance() {
    if (this.node.choices && this.node.choices.length) {
      this.choices = this.node.choices;
      return true;
    }
    const nxt = this.node.next;
    if (nxt) {
      this.nodeId = nxt;
      this.lineIdx = 0;
      this.visible = 0;
      return true;
    }
    return false; // dialog selesai
  }

  choose(chIdx) {
    const c = this.choices[chIdx];
    if (!c) return false;
    for (const f of c.setFlags || []) this.flags.add(f);
    if (c.next) {
      this.nodeId = c.next;
      this.lineIdx = 0;
      this.visible = 0;
      this.choices = [];
      return true;
    }
    return false; // pilihan mengakhiri percakapan
  }

  get finished() {
    return this.node && !this.node.lines && !this.node.choices && !this.node.next;
  }
}
