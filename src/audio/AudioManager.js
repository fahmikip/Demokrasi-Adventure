/**
 * AudioManager — sistem audio (Phase 9).
 * Sintesis placeholder via WebAudio (tanpa file audio), dikelompokkan per
 * channel: music / sfx / ambient / ui / footsteps + master gain & mute.
 * Nilai volume tersimpan via SettingsManager (localStorage) sehingga bertahan
 * lintas sesi. Gagal/absent WebAudio (mis. headless) tidak pernah crash —
 * play() mengambilkan null dan hanya mengeluarkan warning sekali.
 *
 * API:
 *   play(name, { channel, volume, loop }) -> AudioBufferSourceNode|null
 *   stop(name) / stopAll()
 *   setMaster(v) / setMusic(v) / setSfx(v) / setAmbient(v) / setUi(v) / setFootsteps(v)
 *   toggleMute() / muted / master / music / ...
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";
import { SettingsManager } from "../core/SettingsManager.js";

const CHANNELS = ["music", "sfx", "ambient", "ui", "footsteps"];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

class AudioManagerClass {
  constructor() {
    this.master = SettingsManager.get("master");
    this.music = SettingsManager.get("music");
    this.sfx = SettingsManager.get("sfx");
    this.ambient = SettingsManager.get("ambient");
    this.ui = SettingsManager.get("ui");
    this.footsteps = SettingsManager.get("footsteps");
    this.muted = SettingsManager.get("muted");

    this._ctx = null;
    this._masterGain = null;
    this._buffers = {};
    this._active = [];
    this._bank = this._defineBank();
    this._warnedNoAudio = false;
  }

  _defineBank() {
    return {
      click: (ctx) => this._tone(ctx, 820, 0.07, "square", 0.11),
      hover: (ctx) => this._tone(ctx, 640, 0.05, "sine", 0.05),
      blip: (ctx) => this._tone(ctx, 760, 0.03, "sine", 0.09),
      correct: (ctx) => this._arp(ctx, [660, 990], 0.08, "triangle", 0.15),
      wrong: (ctx) => this._tone(ctx, 150, 0.22, "sawtooth", 0.11),
      collect: (ctx) => this._arp(ctx, [880, 1318], 0.07, "triangle", 0.16),
      quest: (ctx) => this._arp(ctx, [523, 659, 784], 0.12, "triangle", 0.18),
      achievement: (ctx) => this._arp(ctx, [659, 784, 988], 0.1, "triangle", 0.14),
      levelup: (ctx) => this._arp(ctx, [392, 523, 659, 784], 0.1, "triangle", 0.14),
      footstep: (ctx) => this._noise(ctx, 0.08, 0.4),
      transition: (ctx) => this._tone(ctx, 392, 0.3, "sine", 0.09),
      ambient: (ctx) => this._pad(ctx, 0.05),
      music: (ctx) => this._pad(ctx, 0.043),
    };
  }

  toggleMute() {
    this.muted = !this.muted;
    SettingsManager.set("muted", this.muted);
    this._applyVolumes();
    EventBus.emit("AUDIO_MUTE_CHANGED", this.muted);
  }

  /** Suspend AudioContext saat tab hidden (perf & baterai). */
  suspend() {
    if (this._ctx && this._ctx.state === "running") {
      this._ctx.suspend().catch(() => {});
    }
  }

  /** Resume AudioContext saat tab kembali terlihat. */
  resume() {
    if (this._ctx && this._ctx.state === "suspended") {
      this._ctx.resume().catch(() => {});
    }
  }

  setMaster(v) {
    this.master = clamp01(v);
    this._persist("master");
  }

  setMusic(v) {
    this.music = clamp01(v);
    this._persist("music");
  }

  setSfx(v) {
    this.sfx = clamp01(v);
    this._persist("sfx");
  }

  setAmbient(v) {
    this.ambient = clamp01(v);
    this._persist("ambient");
  }

  setUi(v) {
    this.ui = clamp01(v);
    this._persist("ui");
  }

  setFootsteps(v) {
    this.footsteps = clamp01(v);
    this._persist("footsteps");
  }

  _persist(key) {
    SettingsManager.set(key, this[key]);
    this._applyVolumes();
    EventBus.emit("AUDIO_VOLUME_CHANGED", { type: key, value: this[key] });
  }

  /** Nada tunggal dengan envelope attack/release sederhana. */
  _tone(ctx, freq, dur, type, vol) {
    const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    const attack = 1 - Math.exp(-1 / (0.006 * ctx.sampleRate));
    let env = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate;
      env += (Math.min(vol * 2, 1) - env) * attack;
      const release = Math.max(0, 1 - t / dur);
      d[i] = env * release * Math.sin(2 * Math.PI * freq * t) * vol;
    }
    return buf;
  }

  /** Rangkaian nada (arpeggio) digabung ke satu buffer. */
  _arp(ctx, notes, stepSec, type, vol) {
    const total = notes.length * stepSec + 0.15;
    const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * total)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    notes.forEach((freq, k) => {
      const n0 = Math.floor(k * stepSec * ctx.sampleRate);
      const attack = 1 - Math.exp(-1 / (0.004 * ctx.sampleRate));
      let env = 0;
      for (let i = 0; i < d.length - n0; i++) {
        const t = i / ctx.sampleRate;
        const release = Math.max(0, 1 - t / 0.14);
        env += (Math.min(vol * 3, 1) - env) * attack;
        d[n0 + i] += env * release * Math.sin(2 * Math.PI * freq * t) * vol;
      }
    });
    return buf;
  }

  /** White-noise terkupas (efek footstep / gesekan). */
  _noise(ctx, dur, vol) {
    const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const env = Math.max(0, 1 - i / (ctx.sampleRate * dur));
      last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
      d[i] = last * env * vol;
    }
    return buf;
  }

  /** Pad lembut melingkar untuk musik/ambience (terhidup sebagai chord). */
  _pad(ctx, vol) {
    const dur = 6;
    const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    const freqs = [220, 277.18, 329.63, 440];
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate;
      const trem = 0.75 + 0.25 * Math.sin(2 * Math.PI * t * 0.22);
      let s = 0;
      for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
      const env = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.2);
      d[i] = vol * env * trem * (s / freqs.length);
    }
    return buf;
  }

  _ensureCtx() {
    if (this._ctx) return this._ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this._ctx = new AC();
      this._masterGain = this._ctx.createGain();
      this._masterGain.connect(this._ctx.destination);
      this._applyVolumes();
      if (this._ctx.state === "suspended") {
        const resume = () => {
          if (this._ctx && this._ctx.state === "suspended") this._ctx.resume().catch(() => {});
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      }
      return this._ctx;
    } catch (err) {
      if (!this._warnedNoAudio) {
        this._warnedNoAudio = true;
        console.warn("[AudioManager] WebAudio tidak tersedia:", err);
      }
      return null;
    }
  }

  _applyVolumes() {
    if (!this._masterGain) return;
    try {
      this._masterGain.gain.value = this.muted ? 0 : this.master;
    } catch {
      /* context mungkin sudah ditutup */
    }
  }

  _buffer(name, ctx) {
    if (this._buffers[name]) return this._buffers[name];
    const gen = this._bank[name];
    if (!gen) {
      this._buffers[name] = null;
      return null;
    }
    try {
      this._buffers[name] = gen(ctx);
      return this._buffers[name];
    } catch (err) {
      this._buffers[name] = null;
      console.warn("[AudioManager] Gagal sintesis:", name, err);
      return null;
    }
  }

  play(name, opts = {}) {
    const cfg = Config.AUDIO.BANK[name] || {};
    const channel = opts.channel || cfg.channel || "sfx";
    const volume = opts.volume ?? 1;
    const loop = !!opts.loop;

    const ctx = this._ensureCtx();
    if (!ctx) return null;
    const buffer = this._buffer(name, ctx);
    if (!buffer) return null;

    try {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = loop;
      const gain = ctx.createGain();
      const chanVol = this[channel] != null ? this[channel] : 1;
      gain.gain.value = chanVol * volume;
      src.connect(gain).connect(this._masterGain || ctx.destination);
      src.start(0, 0, loop ? undefined : buffer.duration);

      const rec = { src, name, channel };
      this._active.push(rec);
      src.onended = () => {
        const i = this._active.indexOf(rec);
        if (i >= 0) this._active.splice(i, 1);
      };
      return src;
    } catch (err) {
      console.warn("[AudioManager] play gagal:", name, err);
      return null;
    }
  }

  stop(name) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const rec = this._active[i];
      if (rec.name === name) {
        try {
          rec.src.stop();
        } catch { /* sudah berhenti */ }
        this._active.splice(i, 1);
      }
    }
  }

  stopAll() {
    for (let i = this._active.length - 1; i >= 0; i--) {
      try {
        this._active[i].src.stop();
      } catch { /* sudah berhenti */ }
    }
    this._active = [];
  }
}

export const AudioManager = new AudioManagerClass();