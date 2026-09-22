import { GameState } from "../core/GameState.js";
import { QuestData } from "../quest/QuestData.js";
import { EventBus } from "../core/EventBus.js";
import { ProgressState } from "../core/ProgressState.js";
import { AchievementManager } from "../progression/AchievementManager.js";
import { CollectibleManager } from "../collectibles/CollectibleManager.js";

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
      idleDownFrames: idleAnim ? idleAnim.frames.length : -1,
      walkDownFrames: walkAnim ? walkAnim.frames.length : -1,
      logs: (window.__SMOKE_LOGS || []).slice(-8),
    };
  } catch (err) {
    return { snapshotError: String(err) };
  }
}