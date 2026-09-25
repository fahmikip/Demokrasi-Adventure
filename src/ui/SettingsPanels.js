/**
 * SettingsPanels — panel pengaturan terpusat (Phase 9).
 * Dipakai dari MenuScene (menu utama) dan PauseMenu (dalam game).
 * Layout:
 *   PENGATURAN → Master/Musik/Efek SFX steppers, toggle Suara Mati & Layar Penuh,
 *                 tombol "Aksesibilitas", Tutup.
 *   AKSESIBILITAS → Kurangi Gerakan, Subtitle, Teks Instan (tersimpan otomatis
 *                 via SettingsManager → localStorage).
 */

import { Config } from "../core/Config.js";
import { Panel } from "./Panel.js";
import { AudioManager } from "../audio/AudioManager.js";
import { SettingsManager } from "../core/SettingsManager.js";

const TOGGLE_LABELS = { labels: ["Tidak", "Aktif"] };

export function openSettingsPanel(scene, opts = {}) {
  const panel = new Panel(scene, { title: "PENGATURAN", width: 460, height: 430 });

  panel.addStepper("Master", () => AudioManager.master, (v) => AudioManager.setMaster(v));
  panel.addStepper("Musik", () => AudioManager.music, (v) => AudioManager.setMusic(v));
  panel.addStepper("Efek SFX", () => AudioManager.sfx, (v) => AudioManager.setSfx(v));

  panel.addToggle("Suara Mati", () => AudioManager.muted, (on) => {
    if (AudioManager.muted !== on) AudioManager.toggleMute();
  }, TOGGLE_LABELS);

  panel.addToggle("Layar Penuh", () => scene.scale.isFullscreen, (on) => {
    if (on) scene.scale.startFullscreen();
    else scene.scale.exitFullscreen();
  });

  panel.addButton("Aksesibilitas", () => {
    panel.close();
    openAccessibilityPanel(scene, opts);
  }, { width: 260, height: 46, color: Config.UI.COLOR_DARK, hoverColor: Config.UI.COLOR_DARK_HOVER });

  if (typeof opts.extra === "function") opts.extra(panel);

  panel.addButton("Tutup", () => panel.close(), { width: 120, height: 40 });
  return panel;
}

export function openAccessibilityPanel(scene, opts = {}) {
  const panel = new Panel(scene, { title: "AKSESIBILITAS", width: 460, height: 330 });

  panel.addToggle("Kurangi Gerakan", () => SettingsManager.prefersLessMotion(), (v) => SettingsManager.set("reducedMotion", v), TOGGLE_LABELS);
  panel.addToggle("Subtitle", () => SettingsManager.subtitles, (v) => SettingsManager.set("subtitles", v), TOGGLE_LABELS);
  panel.addToggle("Teks Instan", () => SettingsManager.instantText, (v) => SettingsManager.set("instantText", v), TOGGLE_LABELS);

  panel.addLabel("Kurangi gerakan menonaktifkan animasi UI & partikel.", { fontSize: 12, color: "#7f8c8d" });
  panel.addLabel("Subtitle menampilkan caption dialog di bawah layar.", { fontSize: 12, color: "#7f8c8d" });

  panel.addButton("Kembali", () => {
    panel.close();
    openSettingsPanel(scene, opts);
  }, { width: 120, height: 40 });

  return panel;
}