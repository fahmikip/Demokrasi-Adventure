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
                    ⇄ PAUSE
                    ⇄ JOURNAL
                    ⇄ INVENTORY
                    ⇄ MAP
                    ⇄ SETTINGS
                    ⇄ TPS_SIMULATION
```

Implementasi: `src/core/GameState.js` (state registry tunggal), bukan boolean acak.

## 4. Event Bus

`src/core/EventBus.js` — pub/sub ringan.

Event inti:
```
PLAYER_MOVED, INTERACTION_REQUESTED, NPC_INTERACTED,
DIALOGUE_STARTED, DIALOGUE_COMPLETED,
QUEST_STARTED, QUEST_PROGRESSED, QUEST_COMPLETED,
ITEM_COLLECTED, XP_GAINED, LEVEL_UP,
ACHIEVEMENT_UNLOCKED, AREA_UNLOCKED,
JOURNAL_UPDATED, PLAYER_STATE_CHANGED, SAVE_REQUESTED, LOAD_REQUESTED
```

## 5. Struktur Folder

```
src/
├── main.js                 — entry point
├── core/
│   ├── Game.js             — Phaser.Game instance & bootstrap
│   ├── GameState.js        — global state machine
│   ├── EventBus.js         — pub/sub
│   └── Config.js           — constants, tuning, debug flags
├── scenes/
│   ├── BootScene.js
│   ├── PreloadScene.js
│   ├── MenuScene.js
│   ├── WorldScene.js
│   └── UIScene.js
├── player/
│   ├── Player.js
│   ├── PlayerController.js
│   └── PlayerState.js
├── npc/
│   ├── NPC.js
│   ├── NPCManager.js
│   └── NPCSchedule.js
├── dialogue/
│   ├── DialogueManager.js
│   ├── DialogueBox.js
│   └── DialogueChoice.js
├── quest/
│   ├── QuestManager.js
│   ├── Quest.js
│   └── Objective.js
├── inventory/
│   ├── InventoryManager.js
│   └── Item.js
├── progression/
│   ├── XPManager.js
│   ├── LevelManager.js
│   └── AchievementManager.js
├── journal/
│   └── JournalManager.js
├── map/
│   ├── MapManager.js
│   ├── InteractionManager.js
│   └── TriggerManager.js
├── save/
│   ├── SaveManager.js
│   └── SaveMigration.js
├── audio/
│   └── AudioManager.js
└── ui/
    ├── HUD.js
    ├── QuestTracker.js
    ├── JournalUI.js
    ├── InventoryUI.js
    └── AchievementUI.js
```

Data (JSON) terpisah di `data/`, asset di `assets/`.

## 6. Alur Boot

1. `main.js` membuat `Config` dari base-path & mode.
2. `Game.js` instantiate Phaser dengan scenes.
3. `BootScene` → `PreloadScene` load asset inti → `MenuScene`.
4. `MenuScene` → PLAY → `WorldScene` (map pertama) + `UIScene` (overlay HUD).
5. Sistem game (quest, inventory, progression, dll) diinisialisasi oleh WorldScene dan terhubung ke EventBus.

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

- Data dialog di `data/dialogues/*.json`.
- Fitur: speaker, portrait, text, emotion, choices, branching, conditions, quest trigger, reward, next dialogue, event.
- `DialogueManager` mensinkronkan state game ke `DIALOGUE`.
- Skip dialog didukung (accessibility).

## 10. Quest System

- Data quest di `data/quests/*.json`.
- Quest memiliki: id, title, description, type, giver, objectives, conditions, reward, nextQuest.
- `QuestManager` melacak objective, mengirim `QUEST_PROGRESSED`, `QUEST_COMPLETED`.
- Quest tracker di HUD.

## 11. Progression

- `XPManager`: XP dari dialog/quest/exploration/collectible/challenge.
- `LevelManager`: naik level dari XP (formula di Config).
- `AchievementManager`: 15+ achievement dari event.
- Semua reward data-driven (JSON), tidak ada hardcoded reward dalam logic.

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

## 13. Audio

- `AudioManager` mengelola Music/SFX/Ambient/UI/Footsteps.
- Volume master, music, sfx, mute — tersimpan di settings/save.
- Placeholder audio mudah diganti (dokumentasi path di Config).

## 14. Debug Mode

- Aktif via `Config.DEBUG = true` (development only).
- Shortcuts:
  - `F1` debug overlay
  - `F2` teleport
  - `F3` complete quest
  - `F4` add XP
  - `F5` unlock achievement
  - `F6` reset save
- Tidak diaktifkan pada production build.

## 15. Performance & Cleanliness

- Tilemap Phaser (batch-friendly).
- Object pooling untuk objek berulang.
- Lazy loading area saat transisi (bukan load semua map).
- Hindari DOM manipulation dalam game loop.
- Hindari duplicate event listeners (hapus saat destroy).

## 16. Error Handling

- Fallback + `console.warn` berformat jelas: `[QuestSystem] Quest quest_001 not found`.
- Save corrupt → backup & reset friendly.
- Asset tidak ada → placeholder.

## 17. Deployment / Base Path

- Dukungan GitHub Pages subpath via `Config.BASE_PATH` (dideteksi dari `location`).
- Semua asset path relatif terhadap `Config.BASE_PATH`.

## 18. Dependency

- **Phaser 3** (satu-satunya library runtime wajib).
- Tidak ada dependency lain pada V1.