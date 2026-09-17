import { Game } from "./core/Game.js";
import { Config } from "./core/Config.js";

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhost && Config.DEBUG) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(Config.BASE_PATH + "sw.js").catch((err) => {
      console.warn("[PWA] Service Worker registration failed:", err);
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  window.__DEMOKRASI = { config: Config };
  window.__DEMOKRASI.game = new Game("game-root");
  registerServiceWorker();
});