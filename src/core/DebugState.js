/**
 * DebugState — data kecil yang dibaca oleh DebugOverlay & WorldScene.
 * Diupdate oleh WorldScene & InputManager setiap frame, dirender oleh UIScene.
 * Flag F7/F8/F9 di-toggle oleh UIScene, diterapkan WorldScene.
 */

export const DebugState = {
  fps: 0,
  px: 0,
  py: 0,
  pState: "-",
  facing: "down",
  input: { x: 0, y: 0 },
  map: "-",
  area: "-",
  layer: "ground",
  weather: "clear",
  tod: "day",
  showCollision: false,
  showGrid: false,
  showPOI: false,
  showNPC: false,

  npcCount: 0,
  npcId: "-",
  npcName: "-",
  npcRole: "-",
  npcState: "-",
  npcFacing: "-",
  npcInteractable: false,
  nearestNpcId: "-",
  nearestNpcDist: -1,
  dialogueId: "-",
  dialogueNode: "-",
  dialogueTyping: "-",
};