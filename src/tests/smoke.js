import { GameState } from "../core/GameState.js";
import { QuestData } from "../quest/QuestData.js";
import { EventBus } from "../core/EventBus.js";
import { ProgressState } from "../core/ProgressState.js";
import { AchievementManager } from "../progression/AchievementManager.js";
import { CollectibleManager } from "../collectibles/CollectibleManager.js";
import { JournalData } from "../journal/JournalData.js";
import { JournalManager } from "../journal/JournalManager.js";
import { DecisionManager } from "../decisions/DecisionManager.js";
import { DialogueDataLoader } from "../dialogue/DialogueData.js";
import { DialogueManager } from "../dialogue/DialogueManager.js";
import { QuestManager } from "../quest/QuestManager.js";
import { GAME_STATES } from "../core/GameState.js";
import { AudioManager } from "../audio/AudioManager.js";
import { SettingsManager } from "../core/SettingsManager.js";
import { Config } from "../core/Config.js";

const ALLOWED_TARGETS = ["MenuScene", "WorldScene"];

export function runSmoke(game) {
  if (!game || !game.isBooted) return;
  if (game.loop.manualStep) return;

  const captureError = (label, err) => {
    const start = err && err.stack ? err.stack : String(err);
    document.title = `SMOKE_ERR:${label}:${start.slice(0, 700)}`;
    const pre = document.createElement("pre");
    pre.id = "smoke-error";
    pre.textContent = start;
    document.body.appendChild(pre);
    console.info(`[Smoke] ${label} ->`);
    console.info(start);
  };

  window.addEventListener("error", (ev) => {
    captureError("E", ev.error || ev.message);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    captureError("R", ev.reason);
  });

  window.__SMOKE_LOGS = [];
  for (const level of ["log", "warn", "error"]) {
    const orig = console[level];
    console[level] = (...args) => {
      window.__SMOKE_LOGS.push(
        `[${level}] ${args.map((a) => (a instanceof Error ? (a.stack || String(a)) : String(a))).join(" ")}`.slice(0, 400)
      );
      orig.apply(console, args);
    };
  }

  game.loop.manualStep = true;
  window.__DEMOKRASI_GS = () => GameState.current;

  const params = new URLSearchParams(window.location.search);
  const wanted = params.get("scene");
  const target = wanted && ALLOWED_TARGETS.includes(wanted) ? wanted : null;
  const testTransition = params.get("transition") === "1";
  const testInteract = params.get("interact") === "1";
  const testQuest = params.get("quest") === "1";
  const testProgression = params.get("progression") === "1";
  const testJournal = params.get("journal") === "1";
  const testDecision = params.get("decision") === "1";
  const testTps = params.get("tps") === "1";
  const testAudio = params.get("audio") === "1";
  const testAccess = params.get("access") === "1";
  const testPwa = params.get("pwa") === "1";
  if (target) {
    window.__DEMOKRASI_TEST_TARGET = target;
    console.info(`[Smoke] target scene: ${target}`);
  }

  let finished = false;
  let stepTime = 0;
  const driveStart = performance.now();
  const drive = () => {
    if (finished) return;
    if (performance.now() - driveStart > 60000) {
      finished = true;
      document.title = `SMOKE_TIMEOUT:phase=${phase}|tried=${transitionTriggered ? "yes" : "no"}|${JSON.stringify(
        window.__SMOKE_LAST__ || snapshot(game)
      )}`;
      console.info("[Smoke] wall-clock timeout (drive)");
      return;
    }
    stepTime += 16.7;
    game.loop.step(stepTime);
    setTimeout(drive, 0);
  };

  const check = () => {
    if (finished) return;
    const active = game.scene.getScenes(true).map((s) => s.scene.key);
    const reached = target
      ? active.includes(target)
      : active.some((k) => ["WorldScene", "MenuScene"].includes(k));

    if (target === "WorldScene" && !active.includes("UIScene")) {
      // tiru alur nyata (MenuScene → launch UIScene + start WorldScene)
      game.scene.start("UIScene");
    }

    if (reached) {
      finished = false;
      poll();
    } else {
      setTimeout(check, 200);
    }
  };

  let phase = "boot";
  let originalMap = null;
  let transitionTriggered = false;
  let testInteractDone = false;
  let questTestDone = false;
  let progressionTestDone = false;
  let journalTestDone = false;
  let decisionTestDone = false;
  let tpsTestDone = false;
  let audioTestDone = false;
  let accessTestDone = false;
  let pwaTestDone = false;

  function finish(data, attempts) {
    if (finished) return;
    finished = true;
    document.title = `SMOKE:${JSON.stringify(data)}`;
    console.info(`[Smoke] done (attempt ${attempts}) ->`, JSON.stringify(data));
  }

  function poll() {
    let attempts = 0;
    const maxAttempts = 360;
    const tick = () => {
      if (finished) return;
      attempts += 1;
      const data = snapshot(game);
      window.__SMOKE_LAST__ = data;
      const live = data && !data.snapshotError;

      if (live && phase === "boot") {
        const atMenu = data.active.includes("MenuScene");
        const atWorld =
          data.active.includes("WorldScene") && data.worldBuilt && data.hasPlayer &&
          data.gameState === "PLAYING";
        if (atWorld) {
          originalMap = data.worldMapId;
          if (testTransition) {
            const ws = game.scene.getScene("WorldScene");
            const zones = ws && ws.transitionManager && ws.transitionManager._list;
            if (!transitionTriggered) {
              if (zones && zones.length && ws._handleTransition(zones[0].data)) {
                transitionTriggered = true;
                console.info(`[Smoke] trigger transition -> ${zones[0].data.target}`);
                phase = "transition";
                attempts = 0;
              }
            }
          } else if (testQuest) {
            if (!questTestDone) {
              if (data.questLoaded) {
                questTestDone = true;
                driveQuest();
                phase = "quest";
                attempts = 0;
              }
            }
          } else if (testProgression) {
            if (!progressionTestDone) {
              if (data.questLoaded && data.achievementsLoaded) {
                progressionTestDone = true;
                driveProgression(game);
                phase = "progression";
                attempts = 0;
              }
            }
          } else if (testJournal) {
            if (!journalTestDone) {
              if (data.questLoaded && data.journalLoaded) {
                journalTestDone = true;
                driveJournal(game);
                phase = "journal";
                attempts = 0;
              }
            }
          } else if (testDecision) {
            if (!decisionTestDone) {
              if (data.questLoaded && data.dialogueLoaded) {
                decisionTestDone = true;
                driveDecision(game);
                phase = "decision";
                attempts = 0;
              }
            }
          } else if (testTps) {
            if (!tpsTestDone) {
              if (data.questLoaded && data.dialogueLoaded) {
                tpsTestDone = true;
                driveTPS(game);
                phase = "tps";
                attempts = 0;
              }
            }
          } else if (testAudio) {
            if (!audioTestDone) {
              if (data.worldBuilt) {
                audioTestDone = true;
                driveAudio(game);
                phase = "audio";
                attempts = 0;
              }
            }
          } else if (testAccess) {
            if (!accessTestDone) {
              if (data.worldBuilt && data.dialogueLoaded) {
                accessTestDone = true;
                driveAccess(game);
                phase = "access";
                attempts = 0;
              }
            }
          } else if (testPwa) {
            if (!pwaTestDone) {
              if (data.worldBuilt) {
                pwaTestDone = true;
                drivePwa();
                phase = "pwa";
                attempts = 0;
              }
            }
          } else {
            if (testInteract) {
              const ws = game.scene.getScene("WorldScene");
              ws.player.startInteract();
              testInteractDone = true;
            }
            finish(data, attempts);
            return;
          }
        } else if (atMenu) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "transition") {
        if (
          data.worldBuilt &&
          data.worldMapId &&
          data.worldMapId !== originalMap &&
          data.gameState === "PLAYING"
        ) {
          data.transitioned = true;
          data.fromMap = originalMap;
          data.toMap = data.worldMapId;
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "quest") {
        if (data.questCompleted) {
          data.questId = data.questCompletedId;
          const qm = data.questReward || {};
          data.questReward = qm;
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "progression") {
        if (data.progUnlocked >= 3 && data.progLevel >= 2 && data.collectibleClaimed >= 1) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "journal") {
        if (
          data.journalTotal >= 4 &&
          data.journalCollectible >= 3 &&
          data.journalQuest >= 1 &&
          data.journalCategories >= 3
        ) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "decision") {
        if (
          data.decisionCount >= 3 &&
          data.decisionFlags >= 3 &&
          data.decisionRelationships >= 1 &&
          data.decisionJournal >= 2 &&
          data.decisionQuestDone
        ) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "tps") {
        if (
          data.tpsDone &&
          data.tpsSteps >= 8 &&
          data.tpsScore >= 1 &&
          data.tpsFlag &&
          data.tpsQuestDone
        ) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "audio") {
        if (data.audioBank >= 9 && data.audioPlayed >= 11 && data.audioPersisted) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "access") {
        if (
          data.accessReducedMotion &&
          data.accessSubtitles &&
          data.accessInstantText &&
          data.accessRevealed &&
          data.accessCaption
        ) {
          finish(data, attempts);
          return;
        }
      } else if (live && phase === "pwa") {
        const p = window.__SMOKE_PWA || {};
        if (
          p.supported &&
          p.active &&
          p.shell &&
          p.module &&
          p.data &&
          p.icon &&
          p.phaser &&
          p.cacheSize > 0
        ) {
          finish(data, attempts);
          return;
        }
      }

      if (attempts >= maxAttempts) {
        if (phase === "transition") {
          data.transitioned = false;
          data.fromMap = originalMap;
        }
        finish(data, attempts);
        return;
      }
      setTimeout(tick, 300);
    };
    setTimeout(tick, 300);
  }

  setTimeout(check, 200);
  drive();
}

function driveQuest() {
  // Skenario Misi 01: bicara guru -> baca papan -> lapor perangkat
  const onComplete = ({ quest, reward }) => {
    window.__SMOKE_QUEST_COMPLETED = true;
    window.__SMOKE_QUEST_ID = quest ? quest.id : null;
    window.__SMOKE_QUEST_REWARD = reward || null;
    console.info(`[Smoke] quest selesai: ${quest ? quest.id : "?"}`);
  };
  EventBus.on("QUEST_COMPLETED", onComplete);

  console.info("[Smoke] quest: bicara dgn Bu Ratna");
  EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_guru" } });
  setTimeout(() => {
    console.info("[Smoke] quest: periksa papan informasi");
    EventBus.emit("POI_INTERACTED", { poi: { id: "poi_papan_informasi" } });
  }, 100);
  setTimeout(() => {
    console.info("[Smoke] quest: lapor ke Pak Dedi");
    EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_perangkat" } });
  }, 200);
}

function driveProgression(game) {
  EventBus.on("QUEST_COMPLETED", ({ quest, reward }) => {
    window.__SMOKE_QUEST_COMPLETED = true;
    window.__SMOKE_QUEST_ID = quest ? quest.id : null;
    window.__SMOKE_QUEST_REWARD = reward || null;
    console.info(`[Smoke] quest selesai (progression): ${quest ? quest.id : "?"}`);
  });
  EventBus.on("ACHIEVEMENT_UNLOCKED", ({ achievement }) => {
    if (!window.__SMOKE_ACH_ID && achievement) window.__SMOKE_ACH_ID = achievement.id;
  });
  window.__SMOKE_ACH_ID = window.__SMOKE_ACH_ID || null;

  console.info("[Smoke] progression: quest misi 01 + POI + collectible (player walk-in)");
  // Mulai + selesaikan Misi 01 (reward XP/Koin & achievement quest)
  EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_guru" } });
  setTimeout(() => EventBus.emit("POI_INTERACTED", { poi: { id: "poi_papan_informasi" } }), 80);
  setTimeout(() => EventBus.emit("POI_INTERACTED", { poi: { id: "poi_lapangan" } }), 160);
  setTimeout(() => EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_perangkat" } }), 240);

  // Klaim collectible nyata dengan menggeser player ke koordinat item
  const steps = [
    { itemId: "ctl_buku_pemilu", x: 9, y: 14 },
    { itemId: "ctl_koin_warga", x: 40, y: 44 },
  ];
  let delay = 320;
  const ws = game.scene.getScene("WorldScene");
  const T = ws && ws.mapData ? ws.mapData.tileSize : 32;
  for (const s of steps) {
    const ts = delay;
    setTimeout(() => {
      const scene = game.scene.getScene("WorldScene");
      if (scene && scene.player) scene.player.setPosition((s.x + 0.5) * T, (s.y + 0.5) * T);
      console.info(`[Smoke] pemain ke kollectible ${s.itemId}@(${s.x},${s.y})`);
    }, ts);
    delay += 200;
  }
}

function driveDecision(game) {
  // Skenario Misi 02 (branching sungguhan lewat DialogueManager):
  // 1) Bicara Bu Sri -> pilih "periksa papan" (jalur verifikasi)
  // 2) Baca Papan Informasi (startInfo) -> flag/decision/jurnal
  // 3) Bicara lagi -> startSelector memilih node "sudah_baca" ->
  //    pilih konfirmasi (dec_rumor_verified) -> quest misi_02 selesai
  const onComplete = ({ quest }) => {
    window.__SMOKE_DECISION_QUEST = true;
    window.__SMOKE_DECISION_QUEST_ID = quest ? quest.id : null;
    console.info(`[Smoke] decision: quest selesai ${quest ? quest.id : "?"}`);
  };
  EventBus.on("QUEST_COMPLETED", onComplete);
  EventBus.on("DECISION_MADE", ({ id }) => {
    console.info(`[Smoke] decision tercatat: ${id}`);
  });

  const driveToEnd = (pickOrder, label) => {
    let guard = 0;
    while (DialogueManager.isActive && guard++ < 300) {
      const s = DialogueManager.runner ? DialogueManager.runner.state : null;
      if (!s) break;
      if (s.choices.length) {
        const idx = pickOrder.shift();
        if (idx == null) break;
        DialogueManager.select(idx);
      } else {
        DialogueManager.advance();
      }
    }
    console.info(`[Smoke] decision: selesai sesi "${label}" (active=${DialogueManager.isActive})`);
  };

  console.info("[Smoke] decision: bicara Bu Sri (misi 02) — pilih jalur verifikasi");
  DialogueManager.startFromNpc({ npcId: "npc_warga_pasar" }).then(() => {
    driveToEnd([0, 0], "sapa->verifikasi");
    setTimeout(() => {
      console.info("[Smoke] decision: baca papan informasi pasar (startInfo)");
      EventBus.emit("POI_INTERACTED", { poi: { id: "poi_papan_informasi_pasar" } });
      DialogueManager.startInfo(
        { id: "poi_papan_informasi_pasar", name: "Papan Informasi Pasar" },
        [
          "PENGUMUMAN RESMI — Jadwal pemungutan suara TIDAK dipindah-pindah.",
          "Warga mencoblos di TPS sesuai alamat terdaftar pada surat undangan resmi.",
        ],
        {
          flags: ["flag_board_read"],
          questFlags: ["flag_board_read"],
          decision: "dec_board_read",
          journalEntries: [
            {
              category: "Informasi",
              title: "Papan Informasi Pasar Rakyat",
              source: "Papan Informasi Pasar Rakyat",
              text: "Jadwal pemungutan suara dan lokasi TPS sesuai ketentuan resmi penyelenggara.",
            },
          ],
        }
      );
      driveToEnd([], "info->papan");
      setTimeout(() => {
        console.info("[Smoke] decision: kembali ke Bu Sri (startSelector -> sudah_baca)");
        DialogueManager.startFromNpc({ npcId: "npc_warga_pasar" }).then(() => {
          driveToEnd([0], "sudah_baca->verified");
        });
      }, 160);
    }, 160);
  });
}

function driveJournal(game) {
  console.info("[Smoke] journal: quest misi 01 + 3 collectible desa -> entri jurnal dgn source");
  // Selesaikan Misi 01 (membawa journalEntries quest)
  EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_guru" } });
  setTimeout(() => EventBus.emit("POI_INTERACTED", { poi: { id: "poi_papan_informasi" } }), 80);
  setTimeout(() => EventBus.emit("DIALOGUE_STARTED", { npc: { npcId: "npc_perangkat" } }), 160);

  // Klaim collectible yang menunjuk kartu edukasi di data/education/
  const steps = [
    { itemId: "ctl_buku_pemilu", card: "edu_pemilu_01", x: 9, y: 14 },
    { itemId: "ctl_poster_kampanye", card: "edu_informasi_03", x: 18, y: 33 },
    { itemId: "ctl_lencana_relawan", card: "edu_tahapan_01", x: 66, y: 25 },
  ];
  const ws = game.scene.getScene("WorldScene");
  const T = ws && ws.mapData ? ws.mapData.tileSize : 32;
  let delay = 220;
  for (const s of steps) {
    const ts = delay;
    setTimeout(() => {
      const scene = game.scene.getScene("WorldScene");
      if (scene && scene.player) scene.player.setPosition((s.x + 0.5) * T, (s.y + 0.5) * T);
      console.info(`[Smoke] pemain ke collectible ${s.itemId} (${s.card})`);
    }, ts);
    delay += 200;
  }
}

function driveTPS(game) {
  console.info("[Smoke] tps: jalankan simulasi pemungutan suara (8 langkah)");
  // Mulai Misi 03 + objective "visit tps" + achievement first_simulation
  EventBus.emit("AREA_ENTERED", { mapId: "tps", name: "TPS" });
  GameState.set(GAME_STATES.TPS_SIMULATION);
  const ws = game.scene.getScene("WorldScene");
  if (ws && ws.scene && typeof ws.scene.launch === "function") {
    ws.scene.launch("TPSScene", { mapId: "tps", smoke: true });
  } else {
    const sm = game.scene;
    if (sm && typeof sm.launch === "function") sm.launch("TPSScene", { mapId: "tps", smoke: true });
  }

  let guard = 0;
  const drive = () => {
    if (guard++ > 400) return;
    const scene = game.scene.getScene("TPSScene");
    if (scene && scene.scene.isActive() && typeof scene.__smokeDrive === "function") {
      const progressed = scene.__smokeDrive();
      setTimeout(drive, progressed ? 30 : 80);
      return;
    }
    setTimeout(drive, 80);
  };
  setTimeout(drive, 80);
}

function driveAudio(game) {
  console.info("[Smoke] audio: bank + play + persisten volume");
  const am = AudioManager;
  am.setMaster(0.5);
  am.setMusic(0.4);
  am.setSfx(0.6);
  am.setAmbient(0.3);
  am.setUi(0.7);
  am.setFootsteps(0.5);
  const names = ["click", "hover", "blip", "correct", "wrong", "collect", "quest", "achievement", "levelup", "footstep", "transition"];
  let ok = true;
  try {
    for (const k of names) am.play(k);
  } catch {
    ok = false;
  }
  window.__SMOKE_AUDIO_PLAYED = ok ? names.length : 0;
  window.__SMOKE_AUDIO_BANK = Object.keys(am._bank || {}).length;
  try {
    const parsed = JSON.parse(localStorage.getItem(Config.SAVE.SETTINGS_KEY) || "{}");
    window.__SMOKE_AUDIO_PERSISTED = parsed.music === 0.4 && parsed.sfx === 0.6 && parsed.footsteps === 0.5;
  } catch {
    window.__SMOKE_AUDIO_PERSISTED = false;
  }
  // kembalikan default agar tidak bocor ke sesi smoke lain
  am.setMaster(Config.AUDIO.MASTER_DEFAULT);
  am.setMusic(Config.AUDIO.MUSIC_DEFAULT);
  am.setSfx(Config.AUDIO.SFX_DEFAULT);
  am.setAmbient(Config.AUDIO.AMBIENT_DEFAULT);
  am.setUi(Config.AUDIO.UI_DEFAULT);
  am.setFootsteps(Config.AUDIO.FOOTSTEPS_DEFAULT);
  console.info(`[Smoke] audio: bank=${window.__SMOKE_AUDIO_BANK} played=${window.__SMOKE_AUDIO_PLAYED} persisted=${window.__SMOKE_AUDIO_PERSISTED}`);
}

function drivePwa() {
  console.info("[Smoke] pwa: service worker + offline cache readiness");
  window.__SMOKE_PWA = { supported: !!("serviceWorker" in navigator) };
  const nsw = navigator.serviceWorker;
  if (!nsw || !window.caches) return;

  const base = Config.BASE_PATH;
  const urlOf = (u) => (u.startsWith("http") ? u : base + u);
  const wants = {
    shell: ["", "index.html"],
    module: [
      "src/main.js",
      "src/core/Game.js",
      "src/core/SettingsManager.js",
      "src/scenes/WorldScene.js",
    ],
    data: [
      "data/maps/desa_harmoni.json",
      "data/quests/quest_registry.json",
      "data/dialogues/guru_ratna.json",
      "data/achievements/first_step.json",
      "data/tps/sim_tps.json",
    ],
    icon: ["assets/ui/icon-192.png", "assets/ui/apple-touch-icon.png"],
    phaser: ["https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"],
  };

  nsw.ready
    .then(async (reg) => {
      const CACHE_RE = /^demokrasi-adventure-v\d+$/;
      const names = (await caches.keys()).filter((k) => CACHE_RE.test(k));
      window.__SMOKE_PWA.scope = reg.scope;
      window.__SMOKE_PWA.active = !!reg.active && reg.active.state === "activated";
      window.__SMOKE_PWA.cacheName = names.join(",");
      window.__SMOKE_PWA.cacheSize = 0;
      for (const [key, urls] of Object.entries(wants)) {
        let ok = false;
        let size = 0;
        for (const name of names) {
          const cache = await caches.open(name);
          const hits = await Promise.all(urls.map((u) => cache.match(urlOf(u))));
          size = Math.max(size, (await cache.keys()).length);
          if (hits.every(Boolean)) {
            ok = true;
            break;
          }
        }
        window.__SMOKE_PWA[key] = ok;
        window.__SMOKE_PWA.cacheSize = Math.max(window.__SMOKE_PWA.cacheSize, size);
      }
      console.info("[Smoke] pwa:", JSON.stringify(window.__SMOKE_PWA));
    })
    .catch((err) => {
      window.__SMOKE_PWA.error = String(err);
      console.warn("[Smoke] pwa: gagal menunggu SW ready:", err);
    });
}

function driveAccess(game) {
  console.info("[Smoke] access: reduced motion + subtitle + teks instan");
  const sf = SettingsManager;
  sf.set("reducedMotion", true);
  sf.set("subtitles", true);
  sf.set("instantText", true);
  window.__SMOKE_ACCESS_FLAGS = {
    reducedMotion: sf.prefersLessMotion(),
    subtitles: sf.subtitles,
    instantText: sf.instantText,
  };
  const ui = game.scene.getScene("UIScene");
  DialogueManager.startInfo(
    { id: "poi_access_test", name: "Uji Aksesibilitas" },
    ["Baris panjang untuk menguji teks instan dan subtitle terbuka otomatis."]
  );
  const s0 = DialogueManager.runner ? DialogueManager.runner.state : null;
  if (s0 && s0.line.length > 12) DialogueManager.update(0, 250);
  const s = DialogueManager.runner ? DialogueManager.runner.state : null;
  window.__SMOKE_ACCESS_REVEALED = !!s && s.visible === s.line.length;
  const dui = ui && ui.dialogueUI ? ui.dialogueUI : null;
  window.__SMOKE_ACCESS_CAPTION =
    !!(dui && dui.caption && dui.caption.visible && dui.caption.text && dui.caption.text.length > 0);
  let guard = 0;
  while (DialogueManager.isActive && guard++ < 25) DialogueManager.advance();
  // kembalikan default agar tidak bocor ke sesi lain
  sf.set("reducedMotion", Config.SETTINGS.REDUCED_MOTION);
  sf.set("subtitles", Config.SETTINGS.SUBTITLES);
  sf.set("instantText", Config.SETTINGS.INSTANT_TEXT);
  console.info(`[Smoke] access: flags=${JSON.stringify(window.__SMOKE_ACCESS_FLAGS)} revealed=${window.__SMOKE_ACCESS_REVEALED} caption=${window.__SMOKE_ACCESS_CAPTION}`);
}

function snapshot(game) {
  try {
    const active = game.scene.getScenes(true).map((s) => s.scene.key);
    const worldScene = game.scene.getScene("WorldScene");
    const uiScene = game.scene.getScene("UIScene");
    const obstacles = worldScene ? worldScene.obstacles : null;
    const hasPlayer =
      !!worldScene && !!worldScene.player && !!worldScene.player.texture;
    const idleAnim = game.anims.get("idle_down");
    const walkAnim = game.anims.get("walk_down");
    const worldBuilt =
      !!worldScene &&
      !!worldScene.mapData &&
      worldScene.children.getChildren().length > 10;
    return {
      booted: game.isBooted,
      active,
      hasWorld: active.includes("WorldScene"),
      worldMapId: worldScene && worldScene.mapData ? worldScene.mapData.id : null,
      worldBuilt,
      hasPlayer,
      playerTexture: worldScene && worldScene.player ? worldScene.player.texture.key : null,
      obstacleCount: obstacles ? obstacles.countActive() : 0,
      poiCount:
        worldScene && worldScene.poiManager ? worldScene.poiManager.all.length : 0,
      transitionCount:
        worldScene && worldScene.transitionManager
          ? worldScene.transitionManager._list.length
          : 0,
      worldChildren: worldScene ? worldScene.children.getChildren().length : 0,
      hasUI: !!uiScene && uiScene.scene.isActive(),
      gameState: GameState.current,
      questLoaded: QuestData.loaded,
      questCount: QuestData.all().length,
      questCompleted: window.__SMOKE_QUEST_COMPLETED || false,
      questCompletedId: window.__SMOKE_QUEST_ID || null,
      questReward: window.__SMOKE_QUEST_REWARD || null,
      achievementsLoaded: AchievementManager._loaded,
      achievementCount: AchievementManager.count,
      progLevel: ProgressState.snapshot().level,
      progLevelName: ProgressState.snapshot().levelName,
      progXp: ProgressState.snapshot().xp,
      progCoins: ProgressState.snapshot().coins,
      progTotalEarned: ProgressState.snapshot().totalEarned,
      progUnlocked: AchievementManager.unlockedCount,
      progFirstAchievement: window.__SMOKE_ACH_ID || null,
      collectibleClaimed: CollectibleManager.claimedCount(),
      journalLoaded: JournalData.loaded,
      journalCards: JournalData.all().length,
      journalCategories: JournalManager.categoryTotals().filter((c) => c.count > 0).length,
      journalTotal: JournalManager.count(),
      journalQuest: JournalManager.all().filter((e) => e.origin === "quest").length,
      journalCollectible: JournalManager.all().filter((e) => e.origin === "collectible").length,
      journalTitles: JournalManager.all().map((e) => e.title).slice(-8),
      journalWithSource: JournalManager.all().filter((e) => e.source && e.source.length > 0).length,
      dialogueLoaded: DialogueDataLoader.loaded,
      decisionFlags: DecisionManager.snapshot().flags.length,
      decisionCount: DecisionManager.snapshot().decisions.length,
      decisionRelationships: DecisionManager.snapshot().relationships.length,
      decisionJournal: JournalManager.all().filter((e) => e.origin === "decision").length,
      decisionQuestDone: window.__SMOKE_DECISION_QUEST || false,
      decisionQuestId: window.__SMOKE_DECISION_QUEST_ID || null,
      tpsDone: !!window.__DEMOKRASI_TPS_DONE,
      tpsScore: window.__DEMOKRASI_TPS_SCORE || 0,
      tpsSteps: window.__DEMOKRASI_TPS_STEPS || 0,
      tpsChoices: window.__DEMOKRASI_TPS_CHOICES || 0,
      tpsFlag: DecisionManager.hasFlag("story_tps_selesai"),
      tpsQuestDone: QuestManager.completed.includes("misi_03_tps_rakyat"),
      tpsUnlocked: AchievementManager.unlockedCount,
      audioBank: window.__SMOKE_AUDIO_BANK || 0,
      audioPlayed: window.__SMOKE_AUDIO_PLAYED || 0,
      audioPersisted: !!window.__SMOKE_AUDIO_PERSISTED,
      audioMuted: !!AudioManager.muted,
      accessReducedMotion: (window.__SMOKE_ACCESS_FLAGS && window.__SMOKE_ACCESS_FLAGS.reducedMotion) || false,
      accessSubtitles: (window.__SMOKE_ACCESS_FLAGS && window.__SMOKE_ACCESS_FLAGS.subtitles) || false,
      accessInstantText: (window.__SMOKE_ACCESS_FLAGS && window.__SMOKE_ACCESS_FLAGS.instantText) || false,
      accessRevealed: !!window.__SMOKE_ACCESS_REVEALED,
      accessCaption: !!window.__SMOKE_ACCESS_CAPTION,
      pwaSupported: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.supported),
      pwaScope: (window.__SMOKE_PWA && window.__SMOKE_PWA.scope) || null,
      pwaActive: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.active),
      pwaCacheName: (window.__SMOKE_PWA && window.__SMOKE_PWA.cacheName) || null,
      pwaShellCached: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.shell),
      pwaModuleCached: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.module),
      pwaDataCached: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.data),
      pwaIconCached: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.icon),
      pwaPhaserCached: !!(window.__SMOKE_PWA && window.__SMOKE_PWA.phaser),
      pwaCacheSize: (window.__SMOKE_PWA && window.__SMOKE_PWA.cacheSize) || 0,
      idleDownFrames: idleAnim ? idleAnim.frames.length : -1,
      walkDownFrames: walkAnim ? walkAnim.frames.length : -1,
      logs: (window.__SMOKE_LOGS || []).slice(-8),
    };
  } catch (err) {
    return { snapshotError: String(err) };
  }
}