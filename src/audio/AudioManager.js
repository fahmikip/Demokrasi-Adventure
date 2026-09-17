/**
 * AudioManager — placeholder untuk fase audio (Phase 10).
 * Mengelola master/music/sfx volume & mute.
 * Panggil Audio.load() dari PreloadScene nanti.
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";

class AudioManagerClass {
  constructor() {
    this.master = Config.AUDIO.MASTER_DEFAULT;
    this.music = Config.AUDIO.MUSIC_DEFAULT;
    this.sfx = Config.AUDIO.SFX_DEFAULT;
    this.muted = false;
  }

  toggleMute() {
    this.muted = !this.muted;
    EventBus.emit("AUDIO_MUTE_CHANGED", this.muted);
  }

  setMaster(v) {
    this.master = Math.max(0, Math.min(1, v));
    EventBus.emit("AUDIO_VOLUME_CHANGED", { type: "master", value: this.master });
  }

  setMusic(v) {
    this.music = Math.max(0, Math.min(1, v));
    EventBus.emit("AUDIO_VOLUME_CHANGED", { type: "music", value: this.music });
  }

  setSfx(v) {
    this.sfx = Math.max(0, Math.min(1, v));
    EventBus.emit("AUDIO_VOLUME_CHANGED", { type: "sfx", value: this.sfx });
  }

  play(_key, _opts) {
    if (this.muted) return null;
    console.log("[AudioManager] play placeholder:", _key);
    return null;
  }

  stop(_key) {
    console.log("[AudioManager] stop placeholder:", _key);
  }

  stopAll() {
    console.log("[AudioManager] stopAll placeholder");
  }
}

export const AudioManager = new AudioManagerClass();