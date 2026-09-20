/**
 * ObjectDefs — pustaka object & building lingkungan (single source of truth
 * untuk: texture key, ukuran sprite, dan kontrak collision).
 *
 * Semua sprite memakai anchor bottom-center (kaki/alas di posisi).
 * `body.bottomOffset` = jarak vertikal dari alas ke dasar body collision,
 * sehingga object "batang pohon kecil namun canopy besar" didukung.
 */

export const BUILDING_DEFS = {
  small_house: { key: "building_small_house", frameW: 96, frameH: 88, body: { w: 84, h: 14, bottomOffset: 8 } },
  large_house: { key: "building_large_house", frameW: 128, frameH: 104, body: { w: 116, h: 16, bottomOffset: 10 } },
  school: { key: "building_school", frameW: 192, frameH: 120, body: { w: 176, h: 18, bottomOffset: 10 } },
  village_hall: { key: "building_village_hall", frameW: 128, frameH: 112, body: { w: 116, h: 16, bottomOffset: 10 } },
  shop: { key: "building_shop", frameW: 96, frameH: 80, body: { w: 84, h: 14, bottomOffset: 8 } },
  warung: { key: "building_warung", frameW: 80, frameH: 72, body: { w: 68, h: 12, bottomOffset: 8 } },
  tent: { key: "building_tent", frameW: 96, frameH: 72, body: { w: 88, h: 12, bottomOffset: 6 } },
};

export const OBJECT_DEFS = {
  tree: { key: "tree_large", frameW: 64, frameH: 96, body: { w: 16, h: 14, bottomOffset: 8 } },
  tree_small: { key: "tree_small", frameW: 48, frameH: 72, body: { w: 12, h: 12, bottomOffset: 6 } },
  bush: { key: "bush", frameW: 40, frameH: 28, body: { w: 28, h: 10, bottomOffset: 3 } },
  flower: { key: "flower", frameW: 24, frameH: 24, body: null },
  rock: { key: "rock", frameW: 36, frameH: 24, body: { w: 30, h: 8, bottomOffset: 2 } },
  bench: { key: "bench", frameW: 40, frameH: 26, body: { w: 36, h: 8, bottomOffset: 2 } },
  lamp: { key: "lamp", frameW: 24, frameH: 80, body: { w: 8, h: 8, bottomOffset: 2 } },
  trash_bin: { key: "trash_bin", frameW: 24, frameH: 36, body: { w: 16, h: 12, bottomOffset: 2 } },
  fence: { key: "fence", frameW: 40, frameH: 34, body: { w: 28, h: 12, bottomOffset: 3 } },
  sign: { key: "sign", frameW: 32, frameH: 64, body: { w: 18, h: 10, bottomOffset: 2 } },
  notice_board: { key: "notice_board", frameW: 48, frameH: 64, body: { w: 34, h: 12, bottomOffset: 2 } },
  motorcycle: { key: "motorcycle", frameW: 48, frameH: 40, body: { w: 28, h: 18, bottomOffset: 4 } },
  bicycle: { key: "bicycle", frameW: 44, frameH: 40, body: { w: 24, h: 14, bottomOffset: 4 } },
  well: { key: "well", frameW: 40, frameH: 48, body: { w: 30, h: 12, bottomOffset: 2 } },
  halte: { key: "halte", frameW: 64, frameH: 88, body: { w: 22, h: 10, bottomOffset: 2 } },
};