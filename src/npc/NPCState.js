/**
 * NPCState — enum kunci state + facing untuk NPC fiktif (netral).
 * Konten fiktif; tidak mewakili orang/partai/pemilu nyata.
 */

export const NPC_STATES = Object.freeze({
  IDLE: "IDLE",
  WANDER: "WANDER",
  TALKING: "TALKING",
  DISABLED: "DISABLED",
});

export const NPC_FACING = Object.freeze({
  DOWN: "down",
  UP: "up",
  LEFT: "left",
  RIGHT: "right",
});

export const NPC_STATE_LABELS = Object.freeze({
  IDLE: "Diam",
  WANDER: "Berjalan santai",
  TALKING: "Sedang berbicara",
  DISABLED: "Nonaktif",
});
