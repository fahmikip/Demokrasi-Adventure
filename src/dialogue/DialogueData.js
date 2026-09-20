/**
 * DialogueManager.data — loader data dialog dari registry JSON.
 * Memuat data/dialogues/dialogue_registry.json lalu file per-npc,
 * sambil memvalidasi node, pilihan, dan referensi next.
 */

import { Config } from "../core/Config.js";

export class DialogueData {
  constructor() {
    this.registry = null;
    this.byNpc = new Map();
    this._promise = null;
  }

  load() {
    if (!this._promise) {
      this._promise = this._load();
    }
    return this._promise;
  }

  async _load() {
    this.registry = await this._json("dialogue_registry.json");
    for (const entry of this.registry.dialogues || []) {
      await this._loadFile(entry);
    }
    return this;
  }

  async _loadFile(entry) {
    const data = await this._json(entry.file || `${entry.id}.json`);
    this._validate(data, entry);
    this.byNpc.set(data.npcId, data);
  }

  _validate(d, entry) {
    if (!d || !d.nodes || typeof d.nodes !== "object") {
      console.warn(`[DialogueData] ${entry.id}: nodes hilang, dilewati.`);
      return;
    }
    if (!d.startNode || !d.nodes[d.startNode]) {
      console.warn(`[DialogueData] ${entry.id}: startNode invalid, pakai node pertama.`);
      d.startNode = Object.keys(d.nodes)[0];
    }
  }

  async _json(name) {
    const key = name.replace(/\.json$/, "");
    const url = Config.PATHS.DIALOGUES + name;
    let data = this.scene?.cache?.json?.get(key);
    if (!data) data = await fetch(url).then((r) => r.json());
    return data;
  }

  /** @param {string} npcId — mis. "npc_warga" */
  get(npcId) {
    return this.byNpc.get(npcId) || null;
  }

  has(npcId) {
    return this.byNpc.has(npcId);
  }
}

export const DialogueDataLoader = new DialogueData();
