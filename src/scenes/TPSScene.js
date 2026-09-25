/**
 * TPSScene — Simulasi pemungutan suara (Phase 8).
 * Alur 8 langkah data-driven dari `data/tps/sim_tps.json`:
 *   Datang → Interaksi → Verifikasi proses → Menerima perlengkapan →
 *   Masuk area pemungutan → Simulasi sesuai aturan (kandidat fiktif) →
 *   Selesai → Review & feedback literasi.
 * Kandidat pada langkah simulasi adalah simbol fiktif/abstrak (netral, tanpa
 * pihak atau nama nyata).
 *
 * Saat selesai → konsekuensi via DecisionManager (flag, decision, jurnal,
 * XP/Koin) dan memancarkan TPS_COMPLETED untuk quest & achievement.
 *
 * Catatan teknis: seluruh objek UI dibentuk sekali saat _buildBase lalu
 * dipakai ulang (setText/setVisible) — menghindari destroy/create objek WebGL
 * berulang yang menyebabkan crash "CanvasTexture.refresh null source" pada
 * renderer headless.
 */

import { Config } from "../core/Config.js";
import { EventBus } from "../core/EventBus.js";
import { GameState, GAME_STATES } from "../core/GameState.js";
import { DecisionManager } from "../decisions/DecisionManager.js";
import { makeButton, makeLabel } from "../ui/widgets.js";

const COLORS = {
  OVERLAY: 0x1a1a2e,
  PANEL_BG: 0xfdf6e3,
  BORDER: 0xc0392b,
  TITLE: "#2c3e50",
  PROMPT: "#2c2c2c",
  GOOD: "#1e8e5a",
  BAD: "#c0392b",
  MUTED: "#7f8c8d",
};

const PW = Config.TPS.PANEL.WIDTH;
const PH = Config.TPS.PANEL.HEIGHT;
const DIMMED_ALPHA = 0.4;

export class TPSScene extends Phaser.Scene {
  constructor() {
    super("TPSScene");
    this._steps = [];
    this._literacyReward = [];
    this._idx = 0;
    this._score = 0;
    this._answered = false;
    this._ready = false;
    this._done = false;
    this._optionButtons = [];
    this._reviewGfx = [];
  }

  create(data = {}) {
    this._mapId = data.mapId || "tps";
    this._cx = this.scale.width / 2;
    this._cy = this.scale.height / 2;
    this._buildBase();
    this._loadData();
  }

  async _loadData() {
    try {
      const url = Config.BASE_PATH + Config.PATHS.TPS + Config.TPS.SIM_FILE;
      const res = await fetch(url);
      const json = await res.json();
      this._steps = json.steps || [];
      this._literacyReward = json.literacyReward || [];
      this._idx = 0;
      this._ready = true;
      this._render();
    } catch (err) {
      console.warn("[TPSScene] Gagal memuat data simulasi:", err);
      this._prompt.setText("Gagal memuat data simulasi. Tutup dan coba lagi.");
    }
  }

  _buildBase() {
    this.add.rectangle(this._cx, this._cy, this.scale.width, this.scale.height, COLORS.OVERLAY, 0.72);

    const g = this.add.graphics();
    g.fillStyle(COLORS.PANEL_BG, 1);
    g.fillRoundedRect(this._cx - PW / 2, this._cy - PH / 2, PW, PH, 14);
    g.lineStyle(3, COLORS.BORDER, 1);
    g.strokeRoundedRect(this._cx - PW / 2, this._cy - PH / 2, PW, PH, 14);

    this._header = makeLabel(this, this._cx, this._cy - PH / 2 + 26, "Simulasi Pemungutan Suara di TPS", {
      fontSize: 18,
      color: COLORS.TITLE,
      bold: true,
    });
    this._stepBadge = makeLabel(this, this._cx + PW / 2 - 20, this._cy - PH / 2 + 26, "", {
      fontSize: 13,
      color: COLORS.BORDER,
      bold: true,
    });
    this._stepBadge.setOrigin(1, 0.5);

    this._prompt = makeLabel(this, this._cx, this._cy - 110, "", {
      fontSize: 14,
      color: COLORS.PROMPT,
    });
    this._prompt.setOrigin(0.5, 0);
    this._prompt.setWordWrapWidth(PW - 90);
    this._prompt.setAlign("center");

    // Zona respons langkah (info/feedback)
    this._infoLabel = makeLabel(this, this._cx, this._cy + 44, "", {
      fontSize: 13,
      color: COLORS.MUTED,
    });
    this._infoLabel.setOrigin(0.5, 0.5);
    this._infoLabel.setWordWrapWidth(PW - 120);
    this._infoLabel.setAlign("center");
    this._infoLabel.setVisible(false);

    this._feedbackLabel = makeLabel(this, this._cx, this._cy + 112, "", { fontSize: 12 });
    this._feedbackLabel.setOrigin(0.5, 0.5);
    this._feedbackLabel.setWordWrapWidth(PW - 140);
    this._feedbackLabel.setAlign("center");
    this._feedbackLabel.setVisible(false);

    // Tiga tombol pilihan (dipakai ulang; jumlah pilihan bisa 1-3)
    this._optionButtons = [];
    const gap = 12;
    const stepH = 40 + gap;
    const startY = 64 - 2 * stepH; // posisi statis utk 3 baris (baris 2 dipakai utk 2 pilihan)
    for (let i = 0; i < 3; i++) {
      const btn = makeButton(this, this._cx, this._cy + startY + i * stepH, "", () => this.pick(i), {
        width: PW - 120,
        height: 40,
        fontSize: 15,
        depth: 4,
      });
      btn.setVisible(false);
      this._optionButtons.push(btn);
    }

    // Grup review (dipakai ulang)
    const scoreLine = makeLabel(this, this._cx, this._cy - 88, "", {
      fontSize: 14,
      color: COLORS.PROMPT,
      bold: true,
    });
    scoreLine.setVisible(false);
    this._scoreLine = scoreLine;

    this._bulletTexts = [];
    const bStart = this._cy - 64;
    for (let i = 0; i < 3; i++) {
      const t = makeLabel(this, this._cx - PW / 2 + 46, bStart + i * 26, "", {
        fontSize: 13,
        color: COLORS.MUTED,
      });
      t.setOrigin(0, 0.5);
      t.setWordWrapWidth(PW - 130);
      t.setVisible(false);
      this._bulletTexts.push(t);
    }

    this._rewardText = makeLabel(this, this._cx, bStart + 3 * 26 + 10, "", {
      fontSize: 15,
      color: COLORS.GOOD,
      bold: true,
    });
    this._rewardText.setVisible(false);

    this._langkahBtn = makeButton(this, this._cx + PW / 2 - 110, this._cy + PH / 2 - 48, "Lanjut", () => this.advance(), {
      width: 150,
      height: 44,
      fontSize: 16,
      depth: 6,
    });
    this._langkahBtn.setVisible(false);

    this.input.keyboard.on("keydown-ESC", () => this.closeSim());
    this.input.keyboard.on("keydown-E", () => this.advance());
  }

  _show(o, v) {
    if (o) o.setVisible(v);
  }

  _render() {
    if (!this._steps.length) return;

    const step = this._steps[this._idx];
    const total = this._steps.length;
    this._stepBadge.setText(`${Config.TPS.STEP_LABEL} ${step.step}/${total}`);
    this._header.setText("Simulasi Pemungutan Suara di TPS");

    this._show(this._infoLabel, false);
    this._show(this._feedbackLabel, false);

    if (step.kind === "choice") {
      this._renderChoices(step);
    } else if (step.kind === "review") {
      this._renderReview();
    } else {
      this._renderInfo(step);
    }
  }

  _renderInfo(step) {
    this._prompt.setText(step.prompt);
    if (step.info) {
      this._infoLabel.setText(step.info);
      this._show(this._infoLabel, true);
    }
    this._optionButtons.forEach((b) => this._show(b, false));
    this._hideReview();
    this._langkahBtn.setText("Lanjut");
    this._show(this._langkahBtn, true);
  }

  _renderChoices(step) {
    this._prompt.setText(step.prompt);
    const gap = 12;
    const stepH = 40 + gap;
    const len = step.options.length;
    const lowest = len === 1 ? 20 : len === 2 ? 44 : 64;
    const startY = lowest - (len - 1) * stepH;
    this._hideReview();
    this._optionButtons.forEach((btn, i) => {
      if (i < len) {
        btn.setText(step.options[i].label);
        btn.y = this._cy + startY + i * stepH;
        btn.setAlpha(1);
        this._show(btn, true);
      } else {
        this._show(btn, false);
      }
    });
    this._feedbackLabel.setText("");
    this._langkahBtn.setText("Lanjut");
    this._show(this._langkahBtn, false);
  }

  _renderReview() {
    const totalChoices = this._steps.filter((s) => s.kind === "choice").length;
    this._header.setText("Review & Feedback Literasi");
    this._prompt.setText("Simulasi selesai. Cek alur dan pelajarilah sebagai bekal literasi pemilu yang sehat.");
    this._prompt.setY(this._cy - 120);

    this._scoreLine.setText(`Tindakan benar: ${this._score}/${totalChoices}`);
    this._show(this._scoreLine, true);
    this._bulletTexts.forEach((t, i) => {
      if (i < this._literacyReward.length) {
        t.setText("•  " + this._literacyReward[i]);
        this._show(t, true);
      } else {
        this._show(t, false);
      }
    });
    const reward = Config.TPS.REWARD;
    this._rewardText.setText(`Reward: +${reward.xp} XP  ·  +${reward.coins} Koin`);
    this._show(this._rewardText, true);

    this._optionButtons.forEach((b) => this._show(b, false));
    this._infoLabel.setVisible(false);
    this._feedbackLabel.setVisible(false);
    this._langkahBtn.setText("Selesai");
    this._show(this._langkahBtn, true);
  }

  _hideReview() {
    this._show(this._scoreLine, false);
    this._bulletTexts.forEach((t) => this._show(t, false));
    this._show(this._rewardText, false);
    this._prompt.setY(this._cy - 110);
  }

  pick(i) {
    if (this._answered || this._done) return;
    const step = this._steps[this._idx];
    if (!step || !step.options) return;
    const opt = step.options[i];
    if (!opt) return;
    this._answered = true;
    this._answers = this._answers || [];
    this._answers.push({ label: opt.label, correct: !!opt.correct });
    if (opt.correct) this._score += 1;
    this._feedbackLabel.setText(opt.feedback);
    this._feedbackLabel.setColor(opt.correct ? COLORS.GOOD : COLORS.BAD);
    this._show(this._feedbackLabel, true);
    this._optionButtons.forEach((b, j) => {
      if (j !== i) b.setAlpha(DIMMED_ALPHA);
    });
    this._show(this._langkahBtn, true);
  }

  advance() {
    if (this._done || !this._ready) return false;
    const step = this._steps[this._idx];
    if (!step) return false;
    if (step.kind === "choice" && !this._answered) return false;
    if (step.kind === "review") return this._finish();
    this._idx += 1;
    this._answered = false;
    this._optionsReset = false;
    this._optionButtons.forEach((b) => b.setAlpha(1));
    this._render();
    return true;
  }

  closeSim() {
    if (this._done || !this._ready) return;
    const step = this._steps[this._idx];
    if (step && step.kind === "review") {
      this._finish();
    } else {
      this._cleanupStop();
    }
  }

  _finish() {
    if (this._done) return;
    this._done = true;

    DecisionManager.applyActions({
      flags: [Config.TPS.FLAG],
      decision: Config.TPS.DECISION,
      decisionMeta: { score: this._score },
      xp: Config.TPS.REWARD.xp,
      coins: Config.TPS.REWARD.coins,
      journalEntries: [
        {
          id: "tps_simulasi",
          category: Config.TPS.JOURNAL_CATEGORY,
          title: "Simulasi Pemungutan Suara di TPS",
          text: "Alur 8 langkah: datang, verifikasi, terima surat suara, coblos di bilik, masukkan ke kotak, tinta sebagai tanda. Pilihan bebas & rahasia.",
          source: "Simulasi resmi TPS (netral)",
          lastUpdated: "",
        },
      ],
    });

    if (window.__DEMOKRASI !== undefined) {
      window.__DEMOKRASI_TPS_DONE = true;
      window.__DEMOKRASI_TPS_SCORE = this._score;
      window.__DEMOKRASI_TPS_STEPS = this._steps.length;
      window.__DEMOKRASI_TPS_CHOICES = this._steps.filter((s) => s.kind === "choice").length;
    }

    EventBus.emit("TPS_COMPLETED", {
      completed: true,
      score: this._score,
      steps: this._steps.length,
      mapId: this._mapId,
    });

    this._cleanupStop();
  }

  _cleanupStop() {
    GameState.set(GAME_STATES.PLAYING);
    this.scene.stop();
  }

  /** Titik masuk otomasi smoke test: maju satu langkah (pilih/advance) bila siap. */
  __smokeDrive() {
    if (this._done || !this._ready) return false;
    const step = this._steps[this._idx];
    if (!step) return false;
    if (step.kind === "choice" && !this._answered) {
      const idx = step.options.findIndex((o) => o.correct);
      this.pick(idx >= 0 ? idx : 0);
      return true;
    }
    return this.advance();
  }
}

export default TPSScene;