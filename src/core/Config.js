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
    START_MAP: "desa_harmoni",
    INTERACT_RADIUS: 48,
    TRANSITION_MS: 400,
    FADE_IN_MS: 250,
    POST_TRANSITION_COOLDOWN_MS: 900,
    AMBIENT: "ambient_placeholder",
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

  NPC: {
    INTERACT_RADIUS: 80,
    WANDER_RADIUS: 72,
    WANDER_PAUSE_MS: 1500,
    WANDER_SPEED: 55,
    TALK_SPEED: 0,
  },

  DIALOGUE: {
    TYPING_MS_PER_CHAR: 22,
    TYPING_MIN_MS: 600,
    SKIP_ON_INTERACT: true,
    PORTRAIT_SCALE: 0.9,
    PANEL_PADDING: 18,
    MAX_VISIBLE_LINES: 3,
    BG: 0xfdf6e3,
    BG_ALPHA: 0.96,
    BORDER: 0x2c3e50,
    BORDER_WIDTH: 3,
    TEXT_COLOR: "#2c3e50",
    NAME_COLOR: "#c0392b",
    DEFAULT_PORTRAIT: "portrait_npc",
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

  PROGRESSION: {
    LEVELS: [
      { level: 1, name: "Pemula", xpRequired: 0 },
      { level: 2, name: "Penjelajah", xpRequired: 60 },
      { level: 3, name: "Pencari Informasi", xpRequired: 160 },
      { level: 4, name: "Literasi Digital", xpRequired: 300 },
      { level: 5, name: "Penjelajah Demokrasi", xpRequired: 500 },
    ],
    MAX_LEVEL: 5,
    EVENTS: {
      dialogue_xp: 10,
      poi_xp: 8,
      area_xp: 15,
      collectible_xp: 10,
    },
    COLLECTIBLES: {
      COIN_VALUE: 5,
      RADIUS: 28,
    },
  },

  ACHIEVEMENTS: {
    MAX: 18,
  },

  PATHS: {
    MAPS: "data/maps/",
    NPCS: "data/npcs/",
    QUESTS: "data/quests/",
    DIALOGUES: "data/dialogues/",
    ITEMS: "data/items/",
    ACHIEVEMENTS: "data/achievements/",
    COLLECTIBLES: "data/collectibles/",
    EDUCATION: "data/education/",
    ASSETS_CHARACTERS: "assets/characters/",
    ASSETS_MAPS: "assets/maps/",
    ASSETS_UI: "assets/ui/",
    ASSETS_AUDIO: "assets/audio/",
    ASSETS_PLACEHOLDER: "assets/placeholder/",
  },
};