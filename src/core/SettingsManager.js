/**
 * SettingsManager — penyimpanan pengaturan lintas sesi (Phase 9).
 * Sumber kebenaran untuk: volume audio (master/music/sfx/ambient/ui/footsteps),
 * mute, dan preferensi aksesibilitas (reducedMotion, subtitles, instantText).
 * Dipersistentkan ke localStorage (key Config.SAVE.SETTINGS_KEY) sehingga
 * berlaku lintas reload & device yang sama.
 */

import { Config } from "./Config.js";
import { EventBus } from "./EventBus.js";

const AUDIO_KEYS = [
  "master",
  "music",
  "sfx",
  "ambient",
  "ui",
  "footsteps",
  "muted",
];
const TOGGLE_KEYS = ["reducedMotion", "subtitles", "instantText"];

function defaults() {
  return {
    master: Config.AUDIO.MASTER_DEFAULT,
    music: Config.AUDIO.MUSIC_DEFAULT,
    sfx: Config.AUDIO.SFX_DEFAULT,
    ambient: Config.AUDIO.AMBIENT_DEFAULT,
    ui: Config.AUDIO.UI_DEFAULT,
    footsteps: Config.AUDIO.FOOTSTEPS_DEFAULT,
    muted: false,
    reducedMotion: Config.SETTINGS.REDUCED_MOTION,
    subtitles: Config.SETTINGS.SUBTITLES,
    instantText: Config.SETTINGS.INSTANT_TEXT,
  };
}

class SettingsManagerClass {
  constructor() {
    this.data = this._load();
  }

  _load() {
    const base = defaults();
    try {
      const raw = localStorage.getItem(Config.SAVE.SETTINGS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        for (const key of AUDIO_KEYS) {
          if (typeof saved[key] === "number" && saved[key] >= 0 && saved[key] <= 1) {
            base[key] = saved[key];
          } else if (key === "muted" && typeof saved[key] === "boolean") {
            base[key] = saved[key];
          }
        }
        for (const key of TOGGLE_KEYS) {
          if (typeof saved[key] === "boolean") base[key] = saved[key];
        }
      }
    } catch {
      /* localStorage rusak → pakai default */
    }
    return base;
  }

  _save() {
    try {
      localStorage.setItem(Config.SAVE.SETTINGS_KEY, JSON.stringify(this.data));
    } catch {
      /* storage penuh/di-blokir → abaikan */
    }
  }

  get reducedMotion() {
    return !!this.data.reducedMotion;
  }

  get subtitles() {
    return !!this.data.subtitles;
  }

  get instantText() {
    return !!this.data.instantText;
  }

  get muted() {
    return !!this.data.muted;
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    if (!(key in this.data)) return;
    const prev = this.data[key];
    this.data[key] = value;
    this._save();
    EventBus.emit("SETTINGS_CHANGED", { key, value, prev });
  }

  /** Guard gerak berlebihan: helper menyatukan cek semua tempat. */
  prefersLessMotion() {
    return this.reducedMotion;
  }
}

export const SettingsManager = new SettingsManagerClass();