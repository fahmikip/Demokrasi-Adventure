/**
 * DebugState — data kecil yang dibaca oleh DebugOverlay.
 * Diupdate oleh WorldScene & InputManager setiap frame, dirender oleh UIScene.
 */

export const DebugState = {
  fps: 0,
  px: 0,
  py: 0,
  pState: "-",
  facing: "down",
  input: { x: 0, y: 0 },
};