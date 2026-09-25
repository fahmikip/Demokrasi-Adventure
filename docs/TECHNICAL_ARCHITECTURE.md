# DEMOKRASI ADVENTURE — Technical Architecture Document

## 1. Stack

- **HTML5 + CSS3** — shell aplikasi & UI overlay
- **JavaScript ES Modules** — kode utama
- **Phaser 3** — game engine 2D (WebGL fallback Canvas)
- **JSON** — seluruh data game (maps, quests, NPC, dialogue, items, education)
- **LocalStorage** — save sederhana (data < 5MB)
- **IndexedDB** — cadangan untuk data besar (jika diperlukan)
- **Web Audio API / Phaser Audio** — audio
- **PWA + Service Worker** — installable & offline

Tidak ada framework frontend berat di luar Phaser.

## 2. Prinsip Arsitektur

1. **Modular** — satu tanggung jawab per modul.
2. **Data-driven** — engine tidak tahu detail materi edukasi.
3. **Event-driven** — komunikasi antar sistem lewat event bus.
4. **State machine** — game state & player state terpusat, bukan boolean acak.
5. **Configurable** — magic numbers dikelola di `Config.js`.
6. **Asset-agnostic** — sprite bisa diganti tanpa mengubah logic.

## 3. Game State Machine

```
BOOT → PRELOAD → MAIN_MENU
                    ↓
                  PLAYING ⇄ DIALOGUE
                    ⇄ QUEST
                    ⇄ CUTSCENE
                    ⇄ ACHIEVEMENTS
                    ⇄ PAUSE
                    ⇄ JOURNAL
                    ⇄ INVENTORY
                    ⇄ MAP
                    ⇄ SETTINGS
                    ⇄ TPS_SIMULATION
```

Implementasi: `src/core/GameState.js` (state registry tunggal), bukan boolean acak.
Konstanta state siap pakai di-export sebagai `GAME_STATES` (`Object.freeze`). Perubahan state mengirim event `GAME_STATE_CHANGED` ke EventBus.

## 4. Event Bus

`src/core/EventBus.js` — pub/sub ringan.

Event inti (aktif):
```
GAME_STATE_CHANGED, ASSETS_LOADED, PROGRESS_CHANGED, PLAYER_STATE_CHANGED
DIALOGUE_STARTED, DIALOGUE_COMPLETED,
QUEST_STARTED, QUEST_PROGRESSED, QUEST_COMPLETED,
ITEM_COLLECTED, XP_GAINED, LEVEL_UP, COIN_CHANGED,
ACHIEVEMENT_UNLOCKED, AREA_ENTERED, JOURNAL_UPDATED
```
Rencana event fase berikutnya:
```
PLAYER_MOVED, INTERACTION_REQUESTED, NPC_INTERACTED,
AREA_UNLOCKED,
SAVE_REQUESTED, LOAD_REQUESTED
```

## 5. Struktur Folder

```
src/
├── main.js                 — entry point
├── core/
│   ├── Game.js             — Phaser.Game instance & bootstrap
│   ├── GameState.js        — global state machine (+ GAME_STATES konstanta)
│   ├── EventBus.js         — pub/sub
│   ├── Config.js           — constants, tuning, debug flags
│   ├── DebugState.js       — nilai debug runtime (fps, posisi, input)
│   ├── ProgressState.js    — data runtime Level/XP/Coins (placeholder)
│   └── PlaceholderAssets.js— generator texture placeholder & animasi player
├── scenes/
│   ├── BootScene.js
│   ├── PreloadScene.js     — loading screen; generate placeholder → MenuScene
│   ├── MenuScene.js        — PLAY / SETTINGS / ABOUT
│   ├── WorldScene.js       — world placeholder (ground/path/obstacle), player, camera
│   └── UIScene.js          — HUD, tombol pause, interaksi aksi, overlay debug
├── player/
│   ├── Player.js           — sprite player (state, facing, anim, interact)
│   ├── PlayerController.js — baca input → velocity (normalisasi diagonal)
│   └── PlayerState.js      — state machine player (IDLE/WALK/INTERACT/DISABLED)
├── input/
│   ├── InputManager.js     — abstraksi keyboard + akses joystick (dibuat UIScene)
│   └── VirtualJoystick.js  — joystick virtual (touch/mobile)
├── ui/
│   ├── HUD.js              — panel Level/XP/Coins + progress bar XP + tombol pause
│   ├── Panel.js            — panel modal reusable (stepper/toggle/close)
│   ├── PauseMenu.js        — menu pause (LANJUT/PRESTASI/PENGATURAN/KEMBALI)
│   ├── AchievementUI.js    — overlay daftar achievement (scrollable, mask)
│   ├── JournalUI.js        — overlay jurnal edu (7 kategori, scrollable, mask)
│   ├── DebugOverlay.js     — overlay debug (F1)
│   ├── widgets.js          — helper tombol & teks
│   ├── QuestTracker.js     — tracker quest di HUD
│   └── WorldMapUI.js       — peta dunia (F7)
├── tests/
│   └── smoke.js            — smoke test otomatis (DEBUG + ?selftest=1)
├── npc/
│   ├── NPC.js
│   ├── NPCManager.js
│   └── NPCState.js
├── dialogue/
│   ├── DialogueManager.js
│   ├── DialogueRunner.js
│   ├── DialogueState.js
│   └── DialogueUI.js
├── quest/
│   ├── QuestManager.js
│   ├── Quest.js
│   ├── Objective.js
│   └── QuestData.js        — loader data quest (data/quests/*.json)
├── inventory/              — (fase berikutnya)
│   ├── InventoryManager.js
│   └── Item.js
├── progression/
│   ├── LevelManager.js     — level table (Config.PROGRESSION.LEVELS)
│   ├── XPManager.js        — XP + passive XP (dialog/POI/area, dedup)
│   ├── CoinManager.js      — koin + totalEarned
│   ├── AchievementData.js  — loader data achievement
│   └── AchievementManager.js — evaluator & unlock (mode count/distinct/match/value)
├── collectibles/
│   ├── CollectibleData.js  — loader registry item
│   └── CollectibleManager.js — spawn & klaim collectible (singleton)
├── journal/
│   ├── JournalData.js      — loader data edukasi (data/education/*.json)
│   └── JournalManager.js   — koleksi entri jurnal (quest + collectible, singleton)
├── map/
│   ├── MapManager.js
│   ├── WorldBuilder.js
│   ├── TransitionManager.js
│   ├── POIManager.js
│   └── TilesetDefs.js
├── save/                   — (fase berikutnya)
│   ├── SaveManager.js
│   └── SaveMigration.js
└── audio/
    └── AudioManager.js
```

Data (JSON) terpisah di `data/`, asset di `assets/`.

## 6. Alur Boot

1. `main.js` membuat stub `Config` dari base-path & mode (`window.__DEMOKRASI_BASE__`).
2. `Game.js` instantiate Phaser (renderer WebGL/Canvas, Scale.FIT, group physics arcade) dengan scenes; instance di-expose ke `window.__DEMOKRASI.phaser`.
3. `BootScene` → `PreloadScene` menampilkan loading bar simulasi, lalu `PlaceholderAssets.generatePlaceholderTextures()` membuat semua placeholder (player sheet 4×4 + frame individual, tile, obstacle, icon, joystick, marker) dan mendaftarkan animasi idle/walk 4 arah → `MenuScene`.
   - Catatan: placeholder memakai **frame-texture individual** (`player_frame_0..15`) untuk animasi karena `addSpriteSheet` dari canvas source menghasilkan texture kosong di beberapa target (headless/test). Layout sheet 4×4 tetap dipertahankan untuk spesifikasi asset final (`docs/PLAYER_ASSET_SPEC.md`).
4. `MenuScene` → PLAY → `WorldScene` (world placeholder) + `UIScene` (HUD/pause/input/debug).
   - `UIScene` membuat `InputManager`; `WorldScene` mengambilnya lazy via `ui.getInputManager()`.
5. Sistem game (quest, inventory, progression, dll) ditambahkan pada fase berikutnya dan terhubung ke EventBus.

## 6b. Player, Input & UI (Phase 1)

- `InputManager` (dibuat di `UIScene`): keyboard WASD/Arrows + E (interaksi) + ESC (pause) + M (peta) + J (jurnal) + F1 (debug), expose `getVector()`, `consumeInteract()`, `consumePause()`, `consumeMap()`, `consumeJournal()`, `consumeDebug()`; menyediakan joystick virtual bila perangkat touch.
- `PlayerController` membaca vector input → menormalkan diagonal → set velocity pada `Player` (SPEED 180) bila `ui.isPlayable()`.
- `Player`: state machine (IDLE/WALK/INTERACT/DISABLED), `facing` (up/down/left/right), animasi `idle_*` / `walk_*`, body 20×30, `collideWorldBounds`.
- `WorldScene`: `tileSprite` ground/path placeholder, static group obstacle (tree/rock/building/wall) dengan collision body custom via `setSize`+`setOffset`, collider player↔obstacle, kamera follow (lerp 0.15, roundPixels), world edge bounds.
- `UIScene` layering (depth): HUD 9000 · PauseMenu root 9600 · Panel root 9650 · dim -1.
- `DebugOverlay` (F1) menampilkan FPS / posisi / state / facing / input via `DebugState`.
- `AudioManager` placeholder: mem-`play` key audio tak ada → warn tanpa crash.

## 7. Map System

- Map dideskripsikan dalam `data/maps/*.json`:

```json
{
  "id": "desa-harmoni",
  "tilemap": "assets/maps/desa-harmoni/desa-harmoni_tilemap.json",
  "tileset": "assets/maps/desa-harmoni/desa-harmoni_spritesheet.png",
  "spawn": { "x": 400, "y": 500 },
  "layers": ["ground", "objects"],
  "collisions": ["objects"],
  "transitions": [{ "id": "to-school", "x": ..., "y": ..., "target": "school-nusantara", "targetSpawn": "gate" }],
  "interactions": [{ "id": "notice_board", "x": ..., "y": ..., "radius": 40 }],
  "npcs": [{ "npcId": "npc_teacher_01", "x": ..., "y": ... }],
  "collectibles": [{ "itemId": "item_knowledge_01", "x": ..., "y": ... }]
}
```

- `MapManager` membaca JSON, memuat tilemap Phaser, menempatkan NPC/interaction/teleport.
- `TriggerManager` menangani zona trigger (quest trigger, area unlock).
- `InteractionManager` menangani objek interaksi & radius.

## 8. NPC System

- Data NPC di `data/npcs/*.json` (schedule, dialogue id, location).
- `NPCManager` spawns NPC ke map sesuai schedule.
- `NPCSchedule` menentukan posisi NPC berdasar waktu game.
- Relasi NPC disimpan sebagai variabel (0–100), dapat berubah lewat keputusan.

## 9. Dialogue Engine

- Data dialog di `data/dialogues/*.json` (lihat juga **Sistem Keputusan** di §11c).
- Fitur: speaker, portrait, text, emotion, choices, branching, conditions, quest trigger, reward, next dialogue, event.
- `DialogueManager` mensinkronkan state game ke `DIALOGUE`.
- Skip dialog didukung (accessibility).

## 10. Quest System

- Data quest di `data/quests/*.json`.
- Quest memiliki: id, title, description, type, giver, objectives, conditions, reward, nextQuest.
- `QuestManager` melacak objective, mengirim `QUEST_PROGRESSED`, `QUEST_COMPLETED`.
- Quest tracker di HUD.
- Tipe objective: `talk`, `interact`, `visit`, `flag`, `decision` (Phase 7 — terpenuhi saat `DECISION_MADE {id}`).

## 10b. Sistem Keputusan (Phase 7)

- `DecisionManager` (`src/decisions/DecisionManager.js`, singleton) = otak konsekuensi lintas sesi: `flags` (Set), `decisions` (Map id→record), `relationships` (Map npcId→`{trust}`, clamp `-10..10`).
- `applyActions({flags, questFlags, relationship, xp, coins, decision, journalEntries})` — blok konsekuensi dari data JSON dialog → memancarkan `STORY_FLAG_SET`, `QUEST_FLAG`, `RELATIONSHIP_CHANGED`, `DECISION_MADE`, `DECISION_JOURNAL`.
- **Branching real:** dialog dialihkan ke `DialogueRunner`/`DialogueState` dengan `context = DecisionManager`. Pilihan difilter `conditions` (`flags`, `anyFlags`, `notFlags`, `relationship:{npc,min}`); konsekuensi pilihan & node dijalankan saat dipilih/dimasuki (dedup per sesi per node). `startSelector` pada akar dialog memilih node awal berdasar state (`[{requires:{flags:[...]}, node:...}, …]`).
- **Alur sesi:** `DialogueManager.startFromNpc(npc)` / `.startInfo(poi, lines, consequences)` → `DIALOGUE_STARTED` (hook quest/XP/UI) → ketik progresif (`DIALOGUE_TICK`) → pilihan / "lanjut" (`DIALOGUE_ROW`) → input `E`/angka 1-9/klik menu pilihan (`DIALOGUE_CHOICE_SELECTED`) → `DIALOGUE_COMPLETED` + GameState `DIALOGUE`→`PLAYING`.
- **Skenario verifikasi informasi:** Misi 02 "Kabar di Pasar" (`data/quests/misi_02_kabar_di_pasar.json`), NPC `npc_warga_pasar` Bu Sri (`data/dialogues/warga_pasar.json` dengan `startSelector`), POI `poi_papan_informasi_pasar` di `data/maps/pasar_rakyat.json` membawa `info` (4 baris) + `infoConsequences` (flag/decision/jurnal). Pemain bisa percaya rumor (relationship turun, jurnal "Bahaya Meneruskan Kabar Tanpa Cek") atau verifikasi (jurnal + decision + reward).
- **UI:** `DialogueUI` (panel, portrait, pilihan klik) dipasang di UIScene menunggangi event manager; `DialogueUI` diberi ukuran `Config.DIALOGUE.WIDTH/HEIGHT`.

## 11. Progression (Phase 5)

- `LevelManager`: level table di `Config.PROGRESSION.LEVELS` (`[{level:1,xpRequired:0,name:"Pemula"}, … , {level:5,xpRequired:500,name:"Penjelajah Demokrasi"}]`); pemetaan XP→level via `levelForXP`, plus `name/xpToNext/progress`. `Config.PROGRESSION.MAX_LEVEL` membatasi cap.
- `XPManager`: sumber kebenaran XP. `addXP` → `XP_GAINED` + `LEVEL_UP`; **passive XP** (event di `Config.PROGRESSION.EVENTS`: `dialogue_xp=10, poi_xp=8, area_xp=15, collectible_xp=10`) dengan dedup: dialog sekali per `npc.npcId`, POI sekali per `poi.id`, area hanya `firstVisit`. Reward quest TIDAK diduplikasi — QuestManager memanggil `ProgressState.addXP` langsung, XPManager tidak meng-hook `QUEST_COMPLETED`.
- `CoinManager`: koin (`coins`, `totalEarned`) → `COIN_CHANGED`.
- `ProgressState` = facade (API lama `level/xp/coins/addXP/addCoins/reset` + `snapshot`), memancarkan `PROGRESS_CHANGED {level, xp, coins, levelName, xpToNext, progress}` untuk HUD.
- `AchievementManager` (data di `data/achievements/*.json` + `achievement_registry.json`): evaluator kondisi `{event, mode: count|distinct|match|value, field, value, count, op}`; saat terpenuhi → `unlock()` (reward XP/Koin via ProgressState) + `ACHIEVEMENT_UNLOCKED`. Registry kini 18 achievement + `Config.ACHIEVEMENTS.MAX = 19` (Phase 5-8; `first_simulation` memakai ikon `icon_tps`).
- `CollectibleManager` (singleton, registry `data/collectibles/collectible_registry.json`, penempatan lewat key `collectibles` di `data/maps/*.json` yang digenerate `tools/build-maps.js`): klaim saat player dalam radius (`Config.PROGRESSION.COLLECTIBLES.RADIUS`), sekali per `mapId:itemId`, reward XP/Koin dari item, `ITEM_COLLECTED`.
- `AchievementUI`: overlay scrollable (mask + wheel); tombol trophy di HUD & menu PRESTASI di pause sambil tetap menyimpan state `ACHIEVEMENTS`.
- Debug shortcut: `F4` tambah XP (25), `F5` buka achievement acak (lihat §14).

## 11b. Journal & Education (Phase 6)

- `JournalData` (data di `data/education/education_registry.json` + `edu_*.json`): memuat **18 kartu edukasi** — `{id, category, title, content, source, lastUpdated}`; `categories` (7) dari registry. Konten sepenuhnya data-driven; update materi = edit/add file JSON tanpa sentuh engine.
- `JournalManager` (singleton, `src/journal/JournalManager.js`): mengumpulkan entri dari dua sumber — `QUEST_COMPLETED.journalEntries` (`id: quest:<questId>:<i>`) dan `ITEM_COLLECTED` (`item.journalId` → kartu `JournalData`, `id: collectible:<itemId>`). Setiap entri membawa `category/title/text/source/lastUpdated/origin`. Entri baru → `JOURNAL_UPDATED {entry, total}`. Dedup per id.
- Collectible registry (`data/collectibles/collectible_registry.json`) kini memuat key `journalId` yang menunjuk kartu (semua 20 item terikat, seluruh 7 kategori tercakup).
- `JournalUI` (`src/ui/JournalUI.js`): overlay scrollable (mask + wheel) dengan tab **Semua + 7 kategori** (masing-masing menampilkan count). Dibuka via tombol `J` (InputManager `consumeJournal`) atau state `JOURNAL`; `ESC`/TUTUP kembali ke `PLAYING`.
- HUD menampilkan counter `📖 Jurnal N — tekan J` (via `HUD.setJournal`).
- Debug shortcut: `J` toggle journal (F key di §14).

## 11c. TPS Simulation (Phase 8)

- **Data:** `data/tps/sim_tps.json` — `steps[]` (8 langkah, tiap `{step, kind: info|choice|review, prompt, options[] (label/correct/feedback), info}`, supports 1-3 pilihan) + `literacyReward[]` (bullets review). Satu-satunya sumber alur; tanpa sentuh engine.
- **Scene:** `TPSScene` (`src/scenes/TPSScene.js`, key `"TPSScene"`) — overlay minimal (rectangle semi-transparan + panel) di atas WorldScene; ukuran `Config.TPS.PANEL`. Masuk via POI `poi_tps_area` (`type:"tps"`): `WorldScene._updateInteraction` → `_launchTpsSimulation()` (GameState `TPS_SIMULATION` + `this.scene.launch("TPSScene", {mapId})`). UIScene mem-block input saat `TPS_SIMULATION` (`_isUiBlocked`).
- **Kandidat fiktif/abstrak & netral:** langkah simulasi memakai "Simbol Mentari / Roda / Bintang" (tanpa pihak atau nama nyata); semua pilihan sah — pemain bebas memilih:
  - `step_coblos`: 3 kandidat fiktif, semua `correct` (alur sah), `feedback` literasi.
  - Langkah lain (`interaksi`, `verifikasi`, `perlengkapan`, `selesai`): 1 benar + 1 salah → skor di review.
- **Deteksi pilihan & umpan balik:** `pick(i)` menandai jawaban, menampilkan `feedback` per opsi (hijau/merah), meredupkan pilihan lain; `advance()` (tombol "Lanjut"/`E`) ke langkah berikutnya. `ESC`/tombol tutup: keluar tanpa reward kecuali sudah di langkah review (finish).
- **Konsekuensi hanya saat selesai** (`_finish` di langkah review): `DecisionManager.applyActions` dengan flag `story_tps_selesai`, decision `dec_tps_selesai` (+meta skor), reward `Config.TPS.REWARD` (XP 30/Koin 10), journal `tps_simulasi` kategori `TPS`; mengirim `TPS_COMPLETED {completed, score, steps, mapId}`; mengembalikan GameState `PLAYING` + `scene.stop()`.
- **Sidebar:** Misi 03 "TPS untuk Semua Warga" (`data/quests/misi_03_tps_rakyat.json`) — objective `visit tps` + `decision dec_tps_selesai`; auto-start via tujuan generik `autoStart:[{event:"AREA_ENTERED", mapId:"tps"}]` pada `QuestManager._tryAutoStartByEvent`.
- **Achievement:** `first_simulation` (AREA_ENTERED tps) + `tps_selesai` "Pemilih Cerdas" (TPS_COMPLETED) → reward XP/Koin.
- **Renderer headless:** objek UI dibentuk sekali lalu dipakai ulang (`setText`/`setVisible`) — menghindari destroy/create objek WebGL berturut yang menyebabkan `CanvasTexture.refresh` null `source` crash pada Smoke (Chrome headless swiftshader).

## 12. Save System

- `SaveManager` serialize ke LocalStorage.
- Format data:

```json
{
  "saveVersion": 1,
  "player": { "position": {x,y}, "currentMap": "..." },
  "level": 1, "xp": 0, "coins": 0,
  "inventory": [],
  "questProgress": {},
  "achievements": [],
  "collectibles": [],
  "journal": [],
  "npcRelationships": {},
  "unlockedAreas": [],
  "settings": {},
  "savedAt": "..."
}
```

- `SaveMigration.js` untuk migrasi versi lama → baru saat `saveVersion` naik.

## 13. Audio & Aksesibilitas (Phase 9)

- **AudioManager** (`src/audio/AudioManager.js`, singleton) — sintesis **WebAudio** (tanpa file audio): bank 13 suara (click, hover, blip, correct, wrong, collect, quest, achievement, levelup, footstep, transition, ambient, music) digenerate on-demand (`_tone`/`_arp`/`_noise`/`_pad`) dan di-cache per buffer.
- **Channel:** master + 5 kategori (music/sfx/ambient/ui/footsteps). Alur gain: source → (channelVol × playVol) → `masterGain` (mute = 0). `AudioContext` dibuat lazily + di-resume saat gesture pertama; semua `play()` di-guard try/catch dan mengambilkan `null` bila WebAudio absen (headless) — **tidak pernah crash**.
- **Pemicu gameplay:** footsteps via timer di `PlayerController` (`Config.AUDIO.FOOTSTEPS_INTERVAL_MS`); `AudioHooks` (`src/audio/AudioHooks.js`, dipasang di `Game`) menghubungkan event → sfx (`ITEM_COLLECTED`→collect, `QUEST_COMPLETED`→quest, `ACHIEVEMENT_UNLOCKED`→achievement, `LEVEL_UP`→levelup); makeButton/panel/DialogueUI (hover+click+blip), TPSScene (correct/wrong/selesai), transisi area.
- **Persistensi:** volume/mute tersimpan via `SettingsManager` ke localStorage (`Config.SAVE.SETTINGS_KEY`) → `AUDIO_VOLUME_CHANGED`/`AUDIO_MUTE_CHANGED`.
- **Settings UI terpusat** (`src/ui/SettingsPanels.js`): panel PENGATURAN (Master/Musik/Efek SFX steppers, Suara Mati, Layar Penuh) + sub-panel AKSESIBILITAS (Kurangi Gerakan, Subtitle, Teks Instan) — dipakai MenuScene & PauseMenu.
- **Accessibility:**
  - `SettingsManager.reducedMotion` dihormati di: tweens UI (button/press-scale, panel fade/scale, toast/areaChip fade, toggle), camera lerp (`snapCam=1`), fade scene (WorldScene fadeIn/fadeOut, MenuScene, PreloadScene), partikel (emitter berhenti), subtitles tetap akurat (mode akses menampilkan wizard dinamis). Hidup/mati via toggle & langsung tersimpan.
  - `subtitles` → caption strip di bawah layar (`DialogueUI.caption`) saat dialog aktif.
  - `instantText` → `DialogueManager.update` langsung reveal penuh (tanpa ketik).
  - Skip dialog tetap `E`/klik (buka penuh + lanjut).
- **Particle (Phase 9):** `particle_dust` (debu kaki — `WorldScene._emitAmbientParticles` saat player bergerak) & `particle_leaf` (daun gugur, emitter `scrollFactor 0` di layar). Dimatikan otomatis saat `reducedMotion`.

## 14. Debug Mode

- **Nonaktif default di production** (Phase 11). Diaktifkan via `?debug=1` atau `window.__DEMOKRASI_DEBUG__ === true` (didefinisikan sebelum `src/main.js`).
- `Config.DEBUG` menggerakkan: smoke test (`?selftest=1`), F1 debug overlay, physics debug (`arcade.debug`), paksa renderer Canvas (`?renderer=canvas`), beberapa `console.info`.
- Hotkeys (Phase 1): `F1` debug overlay ✅
  - `F2` teleport (rencana)
  - `F3` complete quest (rencana)
  - `F4` add XP (Phase 5) ✅
  - `F5` unlock achievement acak (Phase 5) ✅
  - `F6` reset save (rencana)
- Gameplay keys: `E` interaksi · `M` peta dunia · `J` jurnal (Phase 6) ✅
- Smoke test otomatis (`?selftest=1`) hanya aktif saat `Config.DEBUG`.
- Tidak diaktifkan pada production build.

## 15. Performance & Cleanliness

- Tilemap Phaser (batch-friendly).
- Object pooling untuk objek berulang.
- Lazy loading area saat transisi (bukan load semua map).
- **Tab hidden (Phase 11):** `Game._bindVisibility()` — saat `document.hidden` game loop di-`sleep()` dan `AudioContext` di-`suspend()`; lanjutkan (`wake()`/`resume()`) saat tab kembali terlihat (hemat CPU & baterai).
- **`roundPixels: true`** (`Config.GAME.ROUND_PIXELS`) — sampling piksel tajam untuk render pixel-art.
- Hindari DOM manipulation dalam game loop.
- Hindari duplicate event listeners (hapus saat destroy).

## 16. Error Handling

- Fallback + `console.warn` berformat jelas: `[QuestSystem] Quest quest_001 not found`.
- Save corrupt → backup & reset friendly.
- Asset tidak ada → placeholder.

## 17. Deployment / Base Path

- Dukungan GitHub Pages subpath via `Config.BASE_PATH` (dideteksi dari `location`).
- Semua asset path relatif terhadap `Config.BASE_PATH`.

## 17b. PWA & Offline (Phase 10)

- **Manifest** (`manifest.json`): `id`, `name/short_name`, `lang: id`, `start_url: "./?source=pwa"`, `scope: "./"` (relatif → subpath-safe), `display: standalone`, `theme_color`/`background_color`, 3 ikon (`icon-192` any, `icon-512` any, `icon-maskable-512`); iOS via meta `index.html` (`apple-mobile-web-app-capable`, status-bar `black-translucent`, `apple-mobile-web-app-title`) + `apple-touch-icon.png` 180x180 fisik (`assets/ui/`, terdaftar di Asset Register).
- **Service Worker** (`sw.js`, cache `demokrasi-adventure-v2`):
  - `PRECACHE` 140 URL — app shell (`.`, `index.html`, `manifest.json`, CSS, 5 ikon) + **seluruh modul ES `src/**`** (65) + **seluruh data JSON `data/`** (65, tanpa `data/assets/`) + **Phaser CDN**. Install memakai `Promise.allSettled(fetch+put)` — satu URL gagal tidak menggagalkan instal.
  - Navigasi: **network-first → fallback `./index.html`** (shell selalu segar saat online).
  - Aset lain (modul/data/gambar/CDN): **cache-first** → miss di-fetch & di-cache (termasuk opaque CDN). JSON yang gagal saat offline → `Response 504` (aman untuk `res.json()` loader — bukan HTML).
  - `activate`: prune semua cache ≠ versi sekarang; `skipWaiting` + `clients.claim`. Versi naik manual via konstanta.
  - Registrasi (`src/main.js`): `updateViaCache: "none"`, log scope, `controllerchange` → reload sekali (di-guard `?selftest`). Aturan production-clean (Phase 11): di origin **non-localhost selalu ter-register**; di localhost dilewati agar dev bebas cache, paksa via `?sw=1` (untuk testing offline).
- **CSS mobile** (`src/styles/main.css`): `env(safe-area-inset-*)` (notch/gesture bar), `user-select`/`-webkit-touch-callout` none, `touch-action: none`, `:fullscreen` + `::backdrop`, `@media (display-mode: standalone)`, landscape query pendek.
- **Offline proof:** stategi diverifikasi headless — online sekali → matikan server → reload: game boot penuh dari cache (SW menangani Phaser CDN + seluruh modul + data, tanpa kebutuhan vendor lokal).
- **Catatan:** progress non-settings (XP/quest/achievement) tetap session-only (in-memory); persistensi permanen bukan scope Phase 10.

## 18. Dependency

- **Phaser 3** (satu-satunya library runtime wajib).
- Tidak ada dependency lain pada V1.