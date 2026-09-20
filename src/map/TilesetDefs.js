/**
 * TilesetDefs — definisi tileset "tileset_village" (single source of truth).
 * Modul data murni (tanpa Phaser) sehingga dapat dipakai oleh:
 *  - browser  : PlaceholderAssets (men-generate atlas) & WorldBuilder (collision)
 *  - node     : tools/build-maps.js (men-generate data/maps/*.json)
 *
 * gid = index 1-based (gid 0 = empty/void).
 * Atlas disusun dalam grid TILESET_COLUMNS kolom.
 */

export const TILESET_ID = "tileset_village";
export const TILESET_COLUMNS = 8;
export const TILE_COUNT = 32;

export const TILES = [
  null, // gid 0 — void/empty
  { id: "grass", walkable: true, layer: ["ground"] },
  { id: "grass_accent", walkable: true, layer: ["ground"] },
  { id: "grass_dark", walkable: true, layer: ["ground"] },
  { id: "dirt", walkable: true, layer: ["ground"] },
  { id: "dirt_accent", walkable: true, layer: ["ground"] },
  { id: "sand", walkable: true, layer: ["ground"] },
  { id: "sand_accent", walkable: true, layer: ["ground"] },
  { id: "stone", walkable: true, layer: ["ground"] },
  { id: "stone_accent", walkable: true, layer: ["ground"] },
  { id: "road_h", walkable: true, layer: ["road"] },
  { id: "road_v", walkable: true, layer: ["road"] },
  { id: "road_corner_tl", walkable: true, layer: ["road"] },
  { id: "road_corner_tr", walkable: true, layer: ["road"] },
  { id: "road_corner_bl", walkable: true, layer: ["road"] },
  { id: "road_corner_br", walkable: true, layer: ["road"] },
  { id: "road_cross", walkable: true, layer: ["road"] },
  { id: "road_edge_top", walkable: true, layer: ["road"] },
  { id: "road_edge_bottom", walkable: true, layer: ["road"] },
  { id: "road_edge_left", walkable: true, layer: ["road"] },
  { id: "road_edge_right", walkable: true, layer: ["road"] },
  { id: "water", walkable: false, layer: ["water"] },
  { id: "water_edge_top", walkable: false, layer: ["water"] },
  { id: "water_edge_bottom", walkable: false, layer: ["water"] },
  { id: "water_edge_left", walkable: false, layer: ["water"] },
  { id: "water_edge_right", walkable: false, layer: ["water"] },
  { id: "water_corner_tl", walkable: false, layer: ["water"] },
  { id: "water_corner_tr", walkable: false, layer: ["water"] },
  { id: "water_corner_bl", walkable: false, layer: ["water"] },
  { id: "water_corner_br", walkable: false, layer: ["water"] },
  { id: "water_plants", walkable: false, layer: ["water"] },
  { id: "stone_decor", walkable: true, layer: ["ground"] },
  { id: "grass_flowers", walkable: true, layer: ["ground"] },
];

export const GID = Object.fromEntries(
  TILES.map((t, i) => (t ? [t.id, i] : null)).filter(Boolean)
);

/** daftar gid yang tidak bisa dilalui (untuk collision tilemap). */
export function collisionGids() {
  const list = [];
  for (let i = 1; i < TILES.length; i++) {
    if (!TILES[i].walkable) list.push(i);
  }
  return list;
}