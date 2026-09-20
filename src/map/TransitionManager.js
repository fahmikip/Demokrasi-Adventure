/**
 * TransitionManager — zona transisi antar area.
 * Zona berbentuk rect statis (arcade); saat player overlap → callback dipanggil.
 * Zona tidak boleh menentukan logic (logic ada di WorldScene).
 */

export class TransitionManager {
  constructor(scene) {
    this.scene = scene;
    this.zones = scene.physics.add.staticGroup();
    this._list = [];
    this._onTrigger = null;
    this._player = null;
  }

  get group() {
    return this.zones;
  }

  setup(transitions, TILE) {
    const scene = this.scene;
    this._list = transitions.map((t) => {
      const cx = (t.x + t.width / 2) * TILE;
      const cy = (t.y + t.height / 2) * TILE;
      const w = t.width * TILE;
      const h = t.height * TILE;

      const rect = scene.add.rectangle(cx, cy, w, h, 0x2ecc71, 0);
      rect.setDepth(4000);
      rect.setData("transition", t);
      scene.physics.add.existing(rect, true);
      this.zones.add(rect);
      return { data: t, rect };
    });
  }

  bindPlayer(player, onTrigger) {
    if (!player || this._player) return;
    this._player = player;
    this._onTrigger = onTrigger;
    this.scene.physics.add.overlap(player, this.zones, this._onOverlap, null, this);
  }

  _onOverlap(_player, zone) {
    if (typeof this._onTrigger !== "function") return;
    const data = zone.getData("transition");
    if (data) this._onTrigger(data);
  }

  setZonesVisible(visible) {
    const alpha = visible ? 0.16 : 0;
    for (const { rect } of this._list) rect.setAlpha(alpha);
  }

  destroy() {
    this.zones.clear(true, true);
    this._list = [];
  }
}