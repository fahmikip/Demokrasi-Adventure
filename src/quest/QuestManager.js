/**
 * QuestManager — otak sistem quest (Phase 4).
 * - Menerima event dari EventBus (DIALOGUE_STARTED, POI_INTERACTED, AREA_ENTERED, QUEST_FLAG)
 * - Mencocokkan objective, memancarkan QUEST_STARTED / QUEST_PROGRESSED / QUEST_COMPLETED
 * - Memberi reward (XP/Coins) melalui ProgressState
 */

import { EventBus } from "../core/EventBus.js";
import { ProgressState } from "../core/ProgressState.js";
import { QuestData } from "./QuestData.js";
import { Quest } from "./Quest.js";

class QuestManagerClass {
  constructor() {
    this.quests = new Map(); // id -> Quest (instance)
    this.active = []; // quest aktif (urut dimulai)
    this.completed = []; // id quest selesai
    this._eventTargets = {}; // id quest -> target value untuk identifikasi
    this._bound = false;
  }

  get currentQuest() {
    return this.active.length ? this.active[0] : null;
  }

  /** Muat data quest lalu sinkronkan instance. */
  async load() {
    await QuestData.load();
    this.quests.clear();
    for (const def of QuestData.all()) {
      const quest = new Quest(def);
      this.quests.set(quest.id, quest);
    }
    this._bind();
  }

  getQuest(id) {
    return this.quests.get(id);
  }

  start(id) {
    const quest = this.quests.get(id);
    if (!quest || quest.status) return null;
    quest.begin();
    this.active.push(quest);
    EventBus.emit("QUEST_STARTED", { quest: quest.snapshot() });
    return quest;
  }

  /** Mulai quest via giver khi pemain bicara ke NPC pemberi misi. */
  _tryAutoStart(npcId) {
    for (const quest of this.quests.values()) {
      if (quest.status) continue;
      if (quest.giver && quest.giver === npcId) {
        this.start(quest.id);
        return quest;
      }
    }
    return null;
  }

  /** Mulai quest otomatis berdasarkan aturan autoStart pada data quest. */
  _tryAutoStartByEvent(evtType, payload = {}) {
    for (const quest of this.quests.values()) {
      if (quest.status) continue;
      for (const rule of quest.autoStart || []) {
        if (rule.event !== evtType) continue;
        let ok = true;
        for (const [k, v] of Object.entries(rule)) {
          if (k === "event") continue;
          if (String(payload ? payload[k] : undefined) !== String(v)) {
            ok = false;
            break;
          }
        }
        if (ok) {
          this.start(quest.id);
          return;
        }
      }
    }
  }

  /** Proses satu event; status miles diselesaikan objective yang cocok. */
  handleEvent(evt) {
    if (!evt || !evt.type) return;
    let changed = false;
    let questChanged = null;

    for (const quest of this.active) {
      for (const obj of quest.objectives) {
        if (obj.isDone) continue;
        if (obj.completeIf(evt)) {
          changed = true;
          questChanged = quest;
          break;
        }
      }
      if (questChanged) break;
    }

    if (changed) {
      const q = questChanged;
      if (q.allDone) {
        this._complete(q);
      } else {
        EventBus.emit("QUEST_PROGRESSED", { quest: q.snapshot() });
      }
    }
  }

  /** Set flag quest manual (untuk objective tipe "flag"). */
  setFlag(name) {
    this.handleEvent({ type: "flag", flag: name });
  }

  _complete(quest) {
    quest.status = "completed";
    this.active = this.active.filter((q) => q.id !== quest.id);
    this.completed.push(quest.id);

    const { xp = 0, coins = 0 } = quest.reward || {};
    if (xp) ProgressState.addXP(xp);
    if (coins) ProgressState.addCoins(coins);

    EventBus.emit("QUEST_COMPLETED", {
      quest: quest.snapshot(),
      reward: { xp, coins },
      journalEntries: quest.journalEntries || [],
    });
  }

  _bind() {
    if (this._bound) return;
    this._bound = true;

    this._subs = [
      EventBus.on("DIALOGUE_STARTED", ({ npc, questId } = {}) => {
        const npcId = npc ? npc.npcId : null;
        if (!npcId) return;
        this._tryAutoStart(npcId);
        this.handleEvent({ type: "talk", npc: { npcId } });
        if (questId) this.handleEvent({ type: "flag", flag: questId });
      }),
      EventBus.on("POI_INTERACTED", ({ poi } = {}) => {
        if (!poi) return;
        this.handleEvent({ type: "interact", poi: { id: poi.id } });
      }),
      EventBus.on("AREA_ENTERED", ({ mapId } = {}) => {
        if (!mapId) return;
        this._tryAutoStartByEvent("AREA_ENTERED", { mapId });
        this.handleEvent({ type: "visit", mapId });
      }),
      EventBus.on("QUEST_FLAG", ({ flag } = {}) => {
        if (flag) this.setFlag(flag);
      }),
      EventBus.on("DECISION_MADE", ({ id } = {}) => {
        if (id) this.handleEvent({ type: "decision", id });
      }),
    ];
  }

  reset() {
    for (const quest of this.quests.values()) quest.status = null;
    this.active = [];
    this.completed = [];
  }

  snapshot() {
    return {
      active: this.active.map((q) => q.snapshot()),
      completed: [...this.completed],
    };
  }
}

export const QuestManager = new QuestManagerClass();