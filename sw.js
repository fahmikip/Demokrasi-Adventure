/*
 * Service Worker — PWA offline (Phase 10).
 *
 * Strategi:
 *  - PRECACHE (install): seluruh app shell + modul ES + data JSON + ikon + Phaser CDN
 *    (list di-generate dari glob `src` + `data` + modul CDN).
 *  - Navigasi: network-first → fallback `./index.html` (update shell selalu segar saat online).
 *  - Aset lain (modul, data, gambar, CDN): cache-first → miss di-fetch & di-cache.
 *    Gagal offline → Response 404 (aman untuk `res.json()` loaders, tidak mengirim HTML).
 *  - Update: versi kunci cache; SW lama di-prune saat activate; skipWaiting + clients.claim.
 */

const CACHE_VERSION = 2;
const CACHE_NAME = "demokrasi-adventure-v" + CACHE_VERSION;

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/styles/main.css",
  "./assets/ui/favicon.png",
  "./assets/ui/icon-192.png",
  "./assets/ui/icon-512.png",
  "./assets/ui/icon-maskable-512.png",
  "./assets/ui/apple-touch-icon.png",
  "./src/audio/AudioHooks.js",
  "./src/audio/AudioManager.js",
  "./src/collectibles/CollectibleData.js",
  "./src/collectibles/CollectibleManager.js",
  "./src/core/Config.js",
  "./src/core/DebugState.js",
  "./src/core/EventBus.js",
  "./src/core/Game.js",
  "./src/core/GameState.js",
  "./src/core/NPCState.js",
  "./src/core/PlaceholderAssets.js",
  "./src/core/PlaceholderAssetsNPC.js",
  "./src/core/ProgressState.js",
  "./src/core/SettingsManager.js",
  "./src/decisions/DecisionManager.js",
  "./src/dialogue/DialogueData.js",
  "./src/dialogue/DialogueManager.js",
  "./src/dialogue/DialogueRunner.js",
  "./src/dialogue/DialogueState.js",
  "./src/input/InputManager.js",
  "./src/input/VirtualJoystick.js",
  "./src/journal/JournalData.js",
  "./src/journal/JournalManager.js",
  "./src/main.js",
  "./src/map/AreaState.js",
  "./src/map/MapManager.js",
  "./src/map/ObjectDefs.js",
  "./src/map/POIManager.js",
  "./src/map/TilesetDefs.js",
  "./src/map/TransitionManager.js",
  "./src/map/WorldBuilder.js",
  "./src/npc/NPC.js",
  "./src/npc/NPCManager.js",
  "./src/npc/NPCState.js",
  "./src/npc/npc_registry.js",
  "./src/player/Player.js",
  "./src/player/PlayerController.js",
  "./src/player/PlayerState.js",
  "./src/progression/AchievementData.js",
  "./src/progression/AchievementManager.js",
  "./src/progression/CoinManager.js",
  "./src/progression/LevelManager.js",
  "./src/progression/XPManager.js",
  "./src/quest/Objective.js",
  "./src/quest/Quest.js",
  "./src/quest/QuestData.js",
  "./src/quest/QuestManager.js",
  "./src/scenes/BootScene.js",
  "./src/scenes/MenuScene.js",
  "./src/scenes/PreloadScene.js",
  "./src/scenes/TPSScene.js",
  "./src/scenes/UIScene.js",
  "./src/scenes/WorldScene.js",
  "./src/tests/smoke.js",
  "./src/ui/AchievementUI.js",
  "./src/ui/DebugOverlay.js",
  "./src/ui/DialogueUI.js",
  "./src/ui/HUD.js",
  "./src/ui/JournalUI.js",
  "./src/ui/Panel.js",
  "./src/ui/PauseMenu.js",
  "./src/ui/QuestTracker.js",
  "./src/ui/SettingsPanels.js",
  "./src/ui/WorldMapUI.js",
  "./src/ui/widgets.js",
  "./data/achievements/achievement_registry.json",
  "./data/achievements/adventure_complete.json",
  "./data/achievements/city_explorer.json",
  "./data/achievements/coin_collector.json",
  "./data/achievements/collectible_gatherer.json",
  "./data/achievements/complete_explorer.json",
  "./data/achievements/curious_mind.json",
  "./data/achievements/dialogue_explorer.json",
  "./data/achievements/explorer.json",
  "./data/achievements/first_collectible.json",
  "./data/achievements/first_simulation.json",
  "./data/achievements/first_step.json",
  "./data/achievements/hidden_discovery.json",
  "./data/achievements/information_hunter.json",
  "./data/achievements/knowledge_seeker.json",
  "./data/achievements/perfect_mission.json",
  "./data/achievements/quest_master.json",
  "./data/achievements/tps_selesai.json",
  "./data/achievements/village_helper.json",
  "./data/collectibles/collectible_registry.json",
  "./data/dialogues/dialogue_registry.json",
  "./data/dialogues/guru_ratna.json",
  "./data/dialogues/pedagang_slamet.json",
  "./data/dialogues/pemuda_ayu.json",
  "./data/dialogues/perangkat_dedi.json",
  "./data/dialogues/warga_karto.json",
  "./data/dialogues/warga_pasar.json",
  "./data/education/edu_informasi_01.json",
  "./data/education/edu_informasi_02.json",
  "./data/education/edu_informasi_03.json",
  "./data/education/edu_literasi_01.json",
  "./data/education/edu_literasi_02.json",
  "./data/education/edu_pemilih_01.json",
  "./data/education/edu_pemilih_02.json",
  "./data/education/edu_pemilih_03.json",
  "./data/education/edu_pemilih_04.json",
  "./data/education/edu_pemilih_05.json",
  "./data/education/edu_pemilu_01.json",
  "./data/education/edu_pemilu_02.json",
  "./data/education/edu_penyelenggara_01.json",
  "./data/education/edu_tahapan_01.json",
  "./data/education/edu_tahapan_02.json",
  "./data/education/edu_tps_01.json",
  "./data/education/edu_tps_02.json",
  "./data/education/edu_tps_03.json",
  "./data/education/education_registry.json",
  "./data/maps/desa_harmoni.json",
  "./data/maps/pasar_rakyat.json",
  "./data/maps/pusat_kota.json",
  "./data/maps/sekolah_nusantara.json",
  "./data/maps/tileset.json",
  "./data/maps/tps.json",
  "./data/maps/world.json",
  "./data/npcs/guru.json",
  "./data/npcs/npc_registry.json",
  "./data/npcs/pedagang.json",
  "./data/npcs/pemuda.json",
  "./data/npcs/perangkat_desa.json",
  "./data/npcs/warga.json",
  "./data/npcs/warga_pasar.json",
  "./data/quests/misi_01.json",
  "./data/quests/misi_02_kabar_di_pasar.json",
  "./data/quests/misi_03_tps_rakyat.json",
  "./data/quests/quest_registry.json",
  "./data/tps/sim_tps.json",
  "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"
];

const IGNORE_PRECACHE_FAIL = true;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE.map((url) =>
          fetch(url, { cache: "no-cache" })
            .then((res) => {
              if (res.ok || res.type === "opaque") cache.put(url, res);
              else if (res.type !== "error") cache.put(url, res);
            })
            .catch(() => {
              if (!IGNORE_PRECACHE_FAIL) throw new Error("precache gagal: " + url);
            })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => new Response(null, { status: 504, statusText: "Offline — item tidak ada di cache" }))
    )
  );
});