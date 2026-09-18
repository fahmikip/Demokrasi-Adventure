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
    BACKGROUND: 0x1a1a1a,
  },

  WORLD: {
    WIDTH: 2400,
    HEIGHT: 1600,
    PLAYER_SPAWN: { x: 1200, y: 800 },
    OBSTACLES: [
      { type: "tree", x: 350, y: 700 },
      { type: "tree", x: 300, y: 200 },
      { type: "tree", x: 1500, y: 300 },
      { type: "tree", x: 2100, y: 500 },
      { type: "tree", x: 900, y: 1300 },
      { type: "tree", x: 2200, y: 1400 },
      { type: "rock", x: 600, y: 1200 },
      { type: "rock", x: 1850, y: 1400 },
      { type: "building", x: 700, y: 300 },
      { type: "building", x: 1800, y: 1100 },
      { type: "wall", x: 1400, y: 1300 },
    ],
  },

  PLAYER: {
    SPEED: 180,
    SCALE: 1,
    TILE_SIZE: 32,
    FRAME: 48,
    SHEET: {
      KEY: "player",
      FRAME_W: 48,
      FRAME_H: 48,
      COLS: 4,
      ROWS: 4,
    },
    ANIMS: {
      IDLE_FPS: 2,
      WALK_FPS: 10,
    },
    INTERACT_MS: 500,
    BODY: { WIDTH: 20, HEIGHT: 30 },
  },

  CAMERA: {
    ZOOM: 1,
    LERP: 0.15,
    ROUND_PIXELS: true,
  },

  TILE: {
    SIZE: 32,
  },

  INPUT: {
    TOUCH_ZONE_RATIO: 0.55,
  },

  JOYSTICK: {
    RADIUS: 52,
    DEAD_ZONE: 0.16,
    POS: { x: 120, y: null }, // y dihitung dari tinggi layar
    ALPHA: 0.65,
  },

  DEBUG: {
    OVERLAY_KEY: "F1",
  },

  UI: {
    FONT_FAMILY: '"Segoe UI", system-ui, sans-serif',
    FONT_PIXEL: '"Courier New", monospace',
    COLOR_PRIMARY: 0xc0392b,
    COLOR_PRIMARY_HOVER: 0xa93226,
    COLOR_DARK: 0x2c3e50,
    COLOR_DARK_HOVER: 0x1f2c38,
    COLOR_CREAM: 0xfdf6e3,
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
    ASSETS_PLACEHOLDER: "assets/placeholder/",
  },
};