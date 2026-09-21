/**
 * NPCState — state global NPC yang sedang berinteraksi/ter-load (Phase 3).
 * Singleton murni data yang merefleksikan NPC aktif ke DebugState.
 * Semua NPC fiktif & netral (netralitas konten tetap dijaga).
 */

import { DebugState } from "./DebugState.js";

class NPCStateClass {
  constructor() {
    this.current = null;
  }

  /** Tandai NPC sebagai yang sedang berinteraksi/berbicara. */
  setNPC({ npcId, state, facing }) {
    this.current = { npcId, state, facing };
    DebugState.npcId = npcId || "-";
    DebugState.npcState = state || "-";
    DebugState.npcFacing = facing || "-";
    return this.current;
  }

  /** Bersihkan NPC yang sedang berbicara. */
  clearLoadedNPC() {
    this.current = null;
    DebugState.npcId = "-";
    DebugState.npcState = "-";
    DebugState.npcFacing = "-";
  }
}

export const NPCState = new NPCStateClass();