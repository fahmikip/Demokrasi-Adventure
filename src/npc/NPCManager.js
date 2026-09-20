/**
 * NPCManager — sumber tempat & kendali NPC di scene dunia.
 * Membaca data/npcs/npc_registry.json (placement fiktif per peta),
 * membuat container Phaser per NPC (body = texture "npc_<id>"),
 * dan menyediakan "nearest NPC" untuk prioritas interaksi.
 */

import { EventBus } from "../core/EventBus.js";
import { Config } from "../core/Config.js";
import { NPC } from "../npc/NPC.js";
import { NPCRegistry } from "../npc/NPCRegistry.js";

export class NPCManager {
  /**
   * @param {Phaser.Scene} scene — WorldScene
   * @param {string} mapId — map aktif
   */
  constructor(scene, mapId) {
    this.scene = scene;
    this.mapId = mapId;
    this.npcs = [];
    this.registry = NPCRegistry; // mapping npcId -> data, diterapkan PDST
  }

  /**
   * Buat semua NPC yang ditempatkan di mapId saat ini (dari registry).
   * NPC tidak berinteraksi dengan orang/pihak nyata; semua fiktif.
   */
  spawnForMap() {
    const placements = NPCRegistry.forMap(this.mapId);
    for (const p of placements) {
      const npc = new NPC(this.scene, p);
      this.scene.add.existing(npc);
      this.npcs.push(npc);
    }
    return this.npcs;
  }

  /**
   * NPC terdekat dari (x, y) dalam radius interaksi.
   * @returns {NPC|null}
   */
  nearest(x, y, radius = Config.NPC.INTERACT_RADIUS) {
    let best = null;
    let bestD = radius * radius;
    for (const npc of this.npcs) {
      if (!npc.active || npc.state.isDisabled()) continue;
      const dx = npc.x - x;
      const dy = npc.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD) {
        bestD = d2;
        best = npc;
      }
    }
    return best;
  }

  update(time, delta) {
    for (const npc of this.npcs) npc.update(time, delta);
  }
}
