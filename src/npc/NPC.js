/**
 * NPC — representasi karakter non-pemain (fiktif, netral) di dunia.
 * Berisi posisi, arah hadap, sprite, dan fasilitas interaksi.
 * Semua NPC bersifat fiktif dan tidak mewakili orang/entitas nyata.
 */

import { Config } from "../core/Config.js";
import { NPC_STATES, NPC_FACING } from "./NPCState.js";
import { NPCState } from "../core/NPCState.js";

export class NPC extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} def — data dari registry + koordinat peta
   */
  constructor(scene, def) {
    super(scene, def.x || 0, def.y || 0);

    this.scene = scene;
    this.npcId = def.npcId || def.id || "npc_unknown";
    this.netralId = def.netralId || `npc_${this.npcId}`;

    this.displayName = def.name || def.npcId || "Warga";
    this.role = def.role || "warga";
    this.bio = def.bio || "";

    this.state = def.state || NPC_STATES.IDLE;
    this.facing = def.facing || NPC_FACING.DOWN   ;

    this.interactRadius = def.interactRadius || Config.NPC.INTERACT_RADIUS;
    this.interactPrompt = def.prompt || "Bicara";

    // koordinat tile (spawn)
    this.tileX = def.tileX != null ? def.tileX : Math.floor(def.x / Config.TILE.SIZE);
    this.tileY = def.tileY != null ? def.tileY : Math.floor(def.y / Config.TILE.SIZE);

    this._buildSprite(scene, def);

    this.setSize(Config.TILE.SIZE, Config.TILE.SIZE);
    scene.add.existing(this);
  }

  _buildSprite(scene, def) {
    const key = def.texture || `npc_${this.role || "default"}`;
    this.sprite = scene.add.image(0, 0, key).setDepth(1);
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
  }

  setFacing(dir) {
    this.facing = Object.values(NPC_FACING).includes(dir) ? dir : NPC_FACING.DOWN;
    // placeholder: tidak ada flip animasi; hanya metadata
    return this;
  }

  setState(s) {
    this.state = NPC_STATES[s] ? s : NPC_STATES.IDLE;
    return this;
  }

  setTalkMode() {
    this.setState(NPC_STATES.TALKING);
    NPCState.setNPC({ npcId: this.npcId, state: "TALKING", facing: this.facing });
  }

  setTalkDone() {
    this.setState(NPC_STATES.IDLE);
    NPCState.clearLoadedNPC();
  }

  get worldX() {
    return this.x;
  }

  get worldY() {
    return this.y;
  }
}
