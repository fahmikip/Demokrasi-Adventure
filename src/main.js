import { Game } from "./core/Game.js";
import { Config } from "./core/Config.js";
import { runSmoke } from "./tests/smoke.js";

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const params = new URLSearchParams(window.location.search);
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhost && Config.DEBUG && params.get("sw") !== "1") return;

  const reloadOnce = () => {
    if (params.has("selftest")) return;
    let reloaded = false;
    return () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
  };
  const onControllerChange = reloadOnce();

  if ("controller" in navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(Config.BASE_PATH + "sw.js", { updateViaCache: "none" })
      .then((reg) => {
        console.log(`[PWA] Service Worker terdaftar (scope ${reg.scope}, state ${reg.active?.state ?? "pending"})`);
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  window.__DEMOKRASI = { config: Config };
  const game = new Game("game-root");
  if (Config.DEBUG && new URLSearchParams(window.location.search).has("selftest")) {
    runSmoke(game.phaser);
  }
  registerServiceWorker();
});