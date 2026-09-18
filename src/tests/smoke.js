import { GameState } from "../core/GameState.js";

const ALLOWED_TARGETS = ["MenuScene", "WorldScene"];

export function runSmoke(game) {
  if (!game || !game.isBooted) return;
  if (game.loop.manualStep) return;

  window.addEventListener("error", (ev) => {
    const err = ev.error || ev.message;
    const text = String(err && err.stack ? err.stack : err);
    document.title = `SMOKE_ERR:${text.slice(0, 900)}`;
    console.info(`[Smoke] error captured -> ${text.slice(0, 900)}`);
  });

  game.loop.manualStep = true;
  window.__DEMOKRASI_GS = () => GameState.current;

  const params = new URLSearchParams(window.location.search);
  const wanted = params.get("scene");
  const target = wanted && ALLOWED_TARGETS.includes(wanted) ? wanted : null;
  if (target) {
    window.__DEMOKRASI_TEST_TARGET = target;
    console.info(`[Smoke] target scene: ${target}`);
  }

  let finished = false;
  let stepTime = 0;
  const drive = () => {
    if (finished) return;
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
    if (reached) {
      finished = false;
      poll();
    } else {
      setTimeout(check, 200);
    }
  };

  function poll() {
    let attempts = 0;
    const maxAttempts = 120;
    const tick = () => {
      if (finished) return;
      attempts += 1;
      const data = snapshot(game);
      const live = data && !data.snapshotError;
      const complete =
        live &&
        (data.active.includes("WorldScene") ||
          data.active.includes("MenuScene"));
      if (complete || attempts >= maxAttempts) {
        finished = true;
        document.title = `SMOKE:${JSON.stringify(data)}`;
        console.info(`[Smoke] done (attempt ${attempts}) ->`, JSON.stringify(data));
        return;
      }
      setTimeout(tick, 300);
    };
    setTimeout(tick, 300);
  }

  setTimeout(check, 200);
  drive();
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
    return {
      booted: game.isBooted,
      active,
      hasWorld: active.includes("WorldScene"),
      hasPlayer,
      playerTexture: worldScene && worldScene.player ? worldScene.player.texture.key : null,
      obstacleCount: obstacles ? obstacles.countActive() : 0,
      worldChildren: worldScene ? worldScene.children.getChildren().length : 0,
      hasUI: !!uiScene && uiScene.scene.isActive(),
      gameState: GameState.current,
      idleDownFrames: idleAnim ? idleAnim.frames.length : -1,
      walkDownFrames: walkAnim ? walkAnim.frames.length : -1,
    };
  } catch (err) {
    return { snapshotError: String(err) };
  }
}