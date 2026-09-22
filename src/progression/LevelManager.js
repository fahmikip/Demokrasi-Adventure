/**
 * LevelManager — perhitungan murni level dari tabel Konfigurasi (Phase 5).
 * Tidak menyimpan state; semua kalkulasi deterministik dari Config.PROGRESSION.LEVELS.
 */

import { Config } from "../core/Config.js";

class LevelManagerClass {
  /** Level untuk jumlah XP tertentu (clamp ke MAX_LEVEL). */
  levelForXP(xp) {
    const levels = Config.PROGRESSION.LEVELS;
    let current = levels[0];
    for (const entry of levels) {
      if (xp >= entry.xpRequired) current = entry;
      else break;
    }
    return current.level;
  }

  entry(level) {
    return (
      Config.PROGRESSION.LEVELS.find((e) => e.level === level) || null
    );
  }

  name(level) {
    const e = this.entry(level);
    return e ? e.name : "";
  }

  xpRequired(level) {
    const e = this.entry(level);
    return e ? e.xpRequired : 0;
  }

  nextEntry(level) {
    const levels = Config.PROGRESSION.LEVELS;
    const idx = levels.findIndex((e) => e.level === level);
    return idx >= 0 ? levels[idx + 1] || null : null;
  }

  /** XP yang masih dibutuhkan untuk naik level berikutnya (0 jika level maks). */
  xpToNext(xp, level) {
    const next = this.nextEntry(level);
    if (!next) return 0;
    return Math.max(0, next.xpRequired - xp);
  }

  /** Progress 0..1 menuju level berikutnya. */
  progress(xp, level) {
    const next = this.nextEntry(level);
    if (!next) return 1;
    const cur = this.xpRequired(level);
    const span = next.xpRequired - cur;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, (xp - cur) / span));
  }

  get maxLevel() {
    return Config.PROGRESSION.MAX_LEVEL;
  }
}

export const LevelManager = new LevelManagerClass();