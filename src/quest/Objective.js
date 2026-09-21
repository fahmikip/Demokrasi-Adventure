/**
 * Objective — satu langkah quest (Phase 4).
 * Murni data + status; tidak bergantung Phaser agar mudah dites.
 * Jenis: talk (bicara NPC), interact (poi), visit (masuk area), flag (event).
 */

export const OBJECTIVE_TYPES = Object.freeze({
  TALK: "talk",
  INTERACT: "interact",
  VISIT: "visit",
  FLAG: "flag",
});

export class Objective {
  /**
   * @param {object} def — {id, type, target, label, hint}
   */
  constructor(def) {
    this.id = def.id || "obj";
    this.type = def.type || OBJECTIVE_TYPES.FLAG;
    this.target = def.target || "";
    this.label = def.label || "";
    this.hint = def.hint || "";
    this.done = false;
  }

  get isDone() {
    return this.done;
  }

  /**
   * Cocokkan event dengan objective.
   * @param {object} evt — payload event (DIALOGUE_STARTED/POI_INTERACTED/AREA_ENTERED/QUEST_FLAG)
   */
  matches(evt = {}) {
    if (this.done) return false;
    switch (this.type) {
      case OBJECTIVE_TYPES.TALK:
        return evt.npc && evt.npc.npcId === this.target;
      case OBJECTIVE_TYPES.INTERACT:
        return evt.poi && evt.poi.id === this.target;
      case OBJECTIVE_TYPES.VISIT:
        return evt.mapId === this.target;
      case OBJECTIVE_TYPES.FLAG:
        return evt.flag === this.target;
      default:
        return false;
    }
  }

  complete() {
    this.done = true;
  }

  completeIf(evt) {
    if (this.matches(evt)) {
      this.complete();
      return true;
    }
    return false;
  }
}