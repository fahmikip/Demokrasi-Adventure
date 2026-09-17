/**
 * Config — pusat konfigurasi game, tuning, dan path.
 * Semua "magic number" yang semestinya configurable diletakkan di sini.
 */

function resolveBasePath() {
  if (window.__DEMOKRASI_BASE__) return window.__DEMOKRASI_BASE__;

  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  const isFile = pathname.includes(".");

  if (isFile) {
    segments.pop();
    return origin + "/" + (segments.length ? segments.join("/") + "/" : "");
  }
  return origin + "/" + (segments.length ? segments.join("/") + "/" : "");
}

export const Config = {
  DEBUG: true,

  BASE_PATH: resolveBasePath(),

  GAME: {
    WIDTH: 960,
    HEIGHT: 540,
    RENDER_MODE: "auto",
    PIXEL_ART: true,
    ZOOM: 1,
    BACKGROUND: 0x1a1a1a,
  },

  PLAYER: {
    SPEED: 180,
    SCALE: 2,
    TILE_SIZE: 32,
  },

  CAMERA: {
    SMOOTH: 0.15,
    ZOOM: 1,
  },

  TILE: {
    SIZE: 32,
  },

  UI: {
    FONT_FAMILY: '"Segoe UI", system-ui, sans-serif',
    FONT_PIXEL: '"Courier New", monospace',
  },

  TIME: {
    DAY_CYCLE_MINUTES: 24,
  },

  SAVE: {
    KEY: "demokrasi-adventure-save",
    VERSION: 1,
  },

  AUDIO: {
    MASTER_DEFAULT: 1,
    MUSIC_DEFAULT: 0.7,
    SFX_DEFAULT: 1,
  },

  ACHIEVEMENTS: {
    MAX: 15,
  },

  PATHS: {
    MAPS: "data/maps/",
    NPCS: "data/npcs/",
    QUESTS: "data/quests/",
    DIALOGUES: "data/dialogues/",
    ITEMS: "data/items/",
    ACHIEVEMENTS: "data/achievements/",
    EDUCATION: "data/education/",
    ASSETS_CHARACTERS: "assets/characters/",
    ASSETS_MAPS: "assets/maps/",
    ASSETS_UI: "assets/ui/",
    ASSETS_AUDIO: "assets/audio/",
  },
};