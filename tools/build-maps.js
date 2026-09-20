/**
 * build-maps — generator data peta (build-time tool, dijalankan via `npm run maps`).
 * Menghasilkan seluruh data/maps/*.json dari layout prosedural deterministik.
 * Kode ini BUKAN runtime game; peta hasilnya murni data JSON.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TILESET_ID, TILES, TILESET_COLUMNS } from "../src/map/TilesetDefs.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "maps");
const G = {};
TILES.forEach((t, i) => {
  if (t) G[t.id] = i;
});

function grid(w, h, v) {
  return Array.from({ length: h }, () => Array(w).fill(v));
}
function rect(g, x, y, w, h, v) {
  for (let j = y; j < Math.min(y + h, g.length); j++) {
    for (let i = x; i < Math.min(x + w, g[0].length); i++) g[j][i] = v;
  }
}
function hline(g, y, x0, x1, v) {
  for (let i = x0; i <= x1; i++) if (g[y] && g[y][i] !== undefined) g[y][i] = v;
}
function vline(g, x, y0, y1, v) {
  for (let j = y0; j <= y1; j++) if (g[j] && g[j][x] !== undefined) g[j][x] = v;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sprinkle(ground, rnd, w, h, list, chance) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (ground[j][i] === G.grass && rnd() < chance) {
        ground[j][i] = list[Math.floor(rnd() * list.length)];
      }
    }
  }
}
function inBounds(x, y, w, h) {
  return x >= 0 && y >= 0 && x < w && y < h;
}
function tx(x) {
  return x; // koordinat tile
}

function emitMap({ id, name, w, h, spawn, build }) {
  const ground = grid(w, h, G.grass);
  const road = grid(w, h, 0);
  const water = grid(w, h, 0);
  const out = { buildings: [], objects: [], pois: [], transitions: [] };
  build({ ground, road, water, out, w, h, rnd: mulberry32(hash(id)) });
  const env = {
    weather: "clear",
    tod: "day",
    lighting: "day",
  };
  return {
    version: 1,
    id,
    name,
    tileSize: 32,
    size: { width: w, height: h },
    environment: env,
    spawn,
    tiles: { ground, road, water },
    buildings: out.buildings,
    objects: out.objects,
    pois: out.pois,
    transitions: out.transitions,
    createdBy: "tools/build-maps.js",
  };
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h) >>> 0;
}
function addObject(list, type, x, y, extra = {}) {
  list.push({ type, x, y, ...extra });
}

const maps = {};

maps.desa_harmoni = emitMap({
  id: "desa_harmoni",
  name: "Desa Harmoni",
  w: 80,
  h: 60,
  spawn: { x: 38, y: 44 },
  build(ctx) {
    const { ground, road, water, out, w, h, rnd } = ctx;
    const G_ = G;

    sprinkle(ground, rnd, w, h, [G.grass_accent, G.grass_flowers, G.grass_dark], 0.09);

    // === Sungai (timur) ===
    for (let j = 0; j < h; j++) {
      vline(ground, 72, j, j, G.sand);
      vline(ground, 79, j, j, G.sand);
      for (let i = 73; i <= 78; i++) {
        water[j][i] = G_.water;
      }
    }
    // vegetasi air & tepian sand acak
    for (let j = 0; j < h; j++) {
      if (rnd() < 0.14) water[j][74 + Math.floor(rnd() * 4)] = G_.water_plants;
      if (rnd() < 0.2) ground[j][72] = G_.sand_accent;
      if (rnd() < 0.2) ground[j][79] = G_.sand_accent;
    }

    // === Jalan besar (timur-barat) di y=30 ===
    hline(road, 30, 0, 71, G_.road_h);
    hline(road, 29, 0, 71, G_.road_edge_top);
    hline(road, 31, 0, 71, G_.road_edge_bottom);

    // === Jalan utama (utara-selatan) x=20 ===
    vline(road, 20, 0, 59, G_.road_v);
    vline(road, 19, 1, 59, G_.road_edge_left);
    vline(road, 21, 1, 59, G_.road_edge_right);
    // simpangan
    road[30][20] = G_.road_cross;
    road[29][21] = G_.road_edge_top;
    road[31][21] = G_.road_edge_bottom;
    road[29][19] = G_.road_edge_top;
    road[31][19] = G_.road_edge_bottom;

    // === Plaza balai desa ===
    rect(ground, 6, 11, 12, 5, G_.stone);
    for (let j = 11; j <= 15; j++) {
      for (let i = 6; i <= 17; i++) {
        if ((i + j) % 5 === 0 && ground[j][i] === G_.stone) ground[j][i] = G_.stone_accent;
      }
    }

    // === Lapangan (tanah) ===
    rect(ground, 32, 38, 15, 10, G_.dirt);
    for (let j = 38; j <= 47; j++) {
      for (let i = 32; i <= 46; i++) {
        if ((i * 7 + j * 13) % 6 === 0) ground[j][i] = G_.dirt_accent;
      }
    }

    // === Jalan setapak ke sekolah ===
    vline(ground, 56, 12, 29, G_.dirt);
    hline(ground, 29, 54, 58, G_.dirt_accent);

    // === Pad rumah/warung/toko ===
    rect(ground, 15, 33, 3, 3, G_.stone);
    rect(ground, 58, 32, 5, 4, G_.stone);

    // === Bangunan ===
    out.buildings.push(
      { type: "village_hall", x: 12, y: 9 },
      { type: "school", x: 55, y: 8 },
      { type: "warung", x: 16, y: 34 },
      { type: "shop", x: 60, y: 33 },
      { type: "small_house", x: 8, y: 38 },
      { type: "small_house", x: 24, y: 44 },
      { type: "large_house", x: 30, y: 52 },
      { type: "small_house", x: 48, y: 48 },
      { type: "small_house", x: 12, y: 20 },
      { type: "large_house", x: 26, y: 14 },
      { type: "small_house", x: 42, y: 12 }
    );

    // === Object dekorasi & keseharian ===
    const O = (type, x, y) => addObject(out.objects, type, x, y);
    O("notice_board", 13, 14);
    O("well", 5, 40);
    O("motorcycle", 17, 32);
    O("bicycle", 52, 13);
    O("sign", 40, 30);
    O("halte", 27, 31);

    const benches = [
      [8, 13], [15, 13], [10, 17], [15, 18], [33, 40], [45, 40], [34, 46], [44, 46],
    ];
    for (const [bx, by] of benches) O("bench", bx, by);

    const lamps = [
      [21, 26], [21, 34], [35, 27], [52, 27], [13, 30], [13, 38], [57, 21],
    ];
    for (const [lx, ly] of lamps) O("lamp", lx, ly);

    const bins = [[2, 31], [63, 31], [23, 12], [38, 49]];
    for (const [x, y] of bins) O("trash_bin", x, y);

    // pagar sekolah
    for (let i = 48; i <= 62; i++) {
      if (i !== 56) O("fence", i, 3);
      if (i !== 56) O("fence", i, 13);
    }

    // pohon
    const trees = [
      [70, 4], [66, 4], [64, 22], [68, 28], [70, 34], [70, 42], [68, 50], [70, 56],
      [3, 4], [4, 6], [3, 26], [2, 42], [3, 52], [5, 56],
      [30, 4], [34, 4], [38, 4], [44, 20], [46, 16], [52, 24], [46, 34], [50, 40],
      [28, 26], [30, 24], [24, 52], [16, 48], [14, 50],
    ];
    for (const [x, y] of trees) O("tree", x, y);

    const treesSmall = [
      [66, 8], [60, 18], [69, 48], [70, 22], [6, 12], [5, 16], [7, 20], [27, 6], [36, 22], [40, 26], [34, 36], [52, 42],
    ];
    for (const [x, y] of treesSmall) O("tree_small", x, y);

    const bushes = [
      [64, 10], [66, 12], [63, 16], [71, 10], [5, 8], [7, 9], [4, 30], [6, 32],
      [26, 28], [24, 26], [48, 34], [51, 38], [57, 44], [54, 46], [12, 44], [14, 42],
    ];
    for (const [x, y] of bushes) O("bush", x, y);

    const flowers = [
      [9, 11], [11, 12], [14, 11], [16, 12], [8, 16], [13, 16], [25, 16], [27, 16],
      [33, 42], [35, 42], [37, 44], [42, 42], [44, 44], [58, 34], [62, 34], [3, 36],
      [5, 38], [4, 49], [6, 53], [30, 55], [32, 54],
    ];
    for (const [x, y] of flowers) O("flower", x, y);

    // batu tepi sungai
    const rocks = [
      [71, 6], [71, 20], [70, 28], [71, 38], [71, 48], [71, 54], [79, 10], [79, 26], [79, 44],
    ];
    for (const [x, y] of rocks) O("rock", x, y);

    // === POI ===
    out.pois.push(
      { id: "poi_balai_desa", name: "Balai Desa", type: "public", x: 12, y: 9 },
      { id: "poi_school", name: "Sekolah Nusantara", type: "education", x: 55, y: 8 },
      { id: "poi_lapangan", name: "Lapangan Desa", type: "recreation", x: 39, y: 42 },
      { id: "poi_warung", name: "Warung Bu Rina", type: "commerce", x: 16, y: 34 },
      { id: "poi_papan_informasi", name: "Papan Informasi", type: "information", x: 13, y: 14 },
      { id: "poi_jalan_utama", name: "Jalan Utama", type: "transport", x: 40, y: 30 }
    );

    // === Transisi ===
    out.transitions.push(
      { id: "to_sekolah", label: "Sekolah Nusantara", x: 46, y: 0, width: 9, height: 3, target: "sekolah_nusantara", targetSpawn: { x: 30, y: 35 } },
      { id: "to_pusat_kota", label: "Pusat Kota", x: 0, y: 26, width: 3, height: 9, target: "pusat_kota", targetSpawn: { x: 8, y: 8 } },
      { id: "to_pasar_rakyat", label: "Pasar Rakyat", x: 16, y: 58, width: 9, height: 2, target: "pasar_rakyat", targetSpawn: { x: 30, y: 4 } },
      { id: "to_tps", label: "TPS", x: 18, y: 4, width: 4, height: 4, target: "tps", targetSpawn: { x: 24, y: 24 } }
    );
    void tx;
  },
});

maps.sekolah_nusantara = emitMap({
  id: "sekolah_nusantara",
  name: "Sekolah Nusantara",
  w: 60,
  h: 40,
  spawn: { x: 30, y: 35 },
  build(ctx) {
    const { ground, out, w, h, rnd } = ctx;
    sprinkle(ground, rnd, w, h, [G.grass_accent, G.grass_dark, G.grass_flowers], 0.08);
    rect(ground, 18, 16, 24, 7, G.stone);
    rect(ground, 8, 26, 12, 8, G.grass_dark);
    hline(ground, 15, 18, 41, G.dirt);

    out.buildings.push({ type: "school", x: 29, y: 10 });

    const O = (type, x, y) => addObject(out.objects, type, x, y);
    for (let i = 16; i <= 38; i += 2) O("fence", i, 4);
    for (let i = 16; i <= 38; i += 2) O("fence", i, 15);
    for (const [x, y] of [[17, 10], [39, 10], [17, 19], [39, 19]]) O("fence", x, y);
    O("notice_board", 26, 16);
    O("bicycle", 32, 14);
    O("bench", 24, 18);
    O("bench", 34, 18);
    const trees = [[6, 6], [10, 4], [6, 30], [11, 33], [52, 6], [54, 30], [48, 32]];
    for (const [x, y] of trees) O("tree", x, y);
    const bushes = [];
    for (let i = 9; i <= 15; i += 2) bushes.push([i, 27]);
    for (const [x, y] of bushes) O("bush", x, y);
    const flowers = [];
    for (let i = 0; i < 14; i++) flowers.push([6 + Math.floor(rnd() * 14), 28 + Math.floor(rnd() * 4)]);
    for (const [x, y] of flowers) O("flower", x, y);
    O("trash_bin", 21, 16);
    O("trash_bin", 39, 16);

    out.pois.push(
      { id: "poi_aula", name: "Aula Sekolah", type: "education", x: 29, y: 10 },
      { id: "poi_lapangan_upacara", name: "Lapangan Upacara", type: "recreation", x: 30, y: 19 }
    );

    out.transitions.push(
      { id: "to_desa", label: "Desa Harmoni", x: 26, y: 38, width: 9, height: 2, target: "desa_harmoni", targetSpawn: { x: 50, y: 4 } }
    );
  },
});

maps.pasar_rakyat = emitMap({
  id: "pasar_rakyat",
  name: "Pasar Rakyat",
  w: 60,
  h: 40,
  spawn: { x: 30, y: 4 },
  build(ctx) {
    const { ground, out, w, h, rnd } = ctx;
    rect(ground, 0, 0, w, h, G.dirt);
    sprinkle(ground, rnd, w, h, [G.dirt_accent], 0.18);
    vline(ground, 30, 0, 39, G.stone);
    hline(ground, 20, 0, 59, G.stone);
    ground[30][30] = G.stone_accent;

    const stalls = [[18, 14], [26, 14], [34, 14], [42, 14], [18, 26], [26, 26], [34, 26], [42, 26]];
    for (const [x, y] of stalls) {
      out.buildings.push({ type: "warung", x, y });
    }
    out.buildings.push({ type: "tent", x: 30, y: 8 }, { type: "shop", x: 8, y: 20 }, { type: "shop", x: 52, y: 20 });

    const O = (type, x, y) => addObject(out.objects, type, x, y);
    const bins = [[15, 13], [25, 13], [33, 27], [45, 27], [4, 22], [56, 22]];
    for (const [x, y] of bins) O("trash_bin", x, y);
    O("motorcycle", 24, 20);
    O("motorcycle", 36, 20);
    const trees = [[4, 4], [8, 36], [52, 4], [56, 36], [12, 10], [46, 30]];
    for (const [x, y] of trees) O("tree", x, y);

    out.pois.push({ id: "poi_pasar_pusat", name: "Pasar Rakyat", type: "commerce", x: 30, y: 20 });
    out.transitions.push(
      { id: "to_desa", label: "Desa Harmoni", x: 26, y: 0, width: 9, height: 2, target: "desa_harmoni", targetSpawn: { x: 19, y: 55 } }
    );
  },
});

maps.pusat_kota = emitMap({
  id: "pusat_kota",
  name: "Pusat Kota",
  w: 60,
  h: 44,
  spawn: { x: 8, y: 8 },
  build(ctx) {
    const { ground, road, out, w, h, rnd } = ctx;
    sprinkle(ground, rnd, w, h, [G.stone, G.stone_accent], 0.25);
    hline(road, 16, 0, 59, G.road_h);
    hline(road, 15, 0, 59, G.road_edge_top);
    hline(road, 17, 0, 59, G.road_edge_bottom);
    hline(road, 32, 0, 59, G.road_h);
    hline(road, 31, 0, 59, G.road_edge_top);
    hline(road, 33, 0, 59, G.road_edge_bottom);
    for (const x of [14, 30, 46]) {
      vline(road, x, 0, 43, G.road_v);
      vline(road, x - 1, 1, 42, G.road_edge_left);
      vline(road, x + 1, 1, 42, G.road_edge_right);
    }
    const crosses = [[14, 16], [30, 16], [46, 16], [14, 32], [30, 32], [46, 32]];
    for (const [x, y] of crosses) {
      road[y][x] = G.road_cross;
      road[y][x - 1] = G.road_cross;
      road[y][x] = G.road_cross;
      road[y - 1][x] = G.road_cross;
      road[y + 1][x] = G.road_cross;
    }
    rect(ground, 40, 20, 14, 11, G.grass);
    rect(ground, 41, 21, 12, 9, G.grass_dark);

    out.buildings.push(
      { type: "village_hall", x: 30, y: 9 },
      { type: "shop", x: 15, y: 22 },
      { type: "shop", x: 47, y: 22 },
      { type: "small_house", x: 8, y: 34 },
      { type: "large_house", x: 38, y: 34 },
      { type: "small_house", x: 52, y: 34 }
    );

    const O = (type, x, y) => addObject(out.objects, type, x, y);
    O("halte", 14, 18);
    O("halte", 46, 26);
    const lamps = [[13, 14], [29, 14], [45, 14], [13, 34], [29, 34], [45, 34]];
    for (const [x, y] of lamps) O("lamp", x, y);
    const benches = [[34, 22], [38, 24], [42, 26], [46, 28], [49, 22]];
    for (const [x, y] of benches) O("bench", x, y);
    const trees = [[24, 4], [36, 4], [8, 40], [20, 40], [55, 40], [42, 22], [48, 22], [4, 18], [4, 26], [58, 26]];
    for (const [x, y] of trees) O("tree", x, y);
    const bins = [[17, 16], [43, 16], [12, 34], [36, 40]];
    for (const [x, y] of bins) O("trash_bin", x, y);
    O("motorcycle", 22, 16);
    O("bicycle", 36, 33);

    out.pois.push(
      { id: "poi_gedung_pelayanan", name: "Gedung Pelayanan", type: "public", x: 30, y: 9 },
      { id: "poi_taman_kota", name: "Taman Kota", type: "recreation", x: 47, y: 25 },
      { id: "poi_halte", name: "Halte Kota", type: "transport", x: 14, y: 19 }
    );

    out.transitions.push(
      { id: "to_desa", label: "Desa Harmoni", x: 0, y: 12, width: 2, height: 9, target: "desa_harmoni", targetSpawn: { x: 5, y: 29 } }
    );
  },
});

maps.tps = emitMap({
  id: "tps",
  name: "TPS",
  w: 48,
  h: 32,
  spawn: { x: 24, y: 24 },
  build(ctx) {
    const { ground, out, rnd } = ctx;
    rect(ground, 10, 8, 28, 16, G.stone);
    for (let j = 8; j <= 23; j++) {
      for (let i = 10; i <= 37; i++) {
        if ((i + j) % 6 === 0) ground[j][i] = G.stone_accent;
      }
    }
    sprinkle(ground, rnd, 48, 32, [G.grass_accent, G.grass_dark], 0.1);

    out.buildings.push({ type: "tent", x: 24, y: 12 });

    const O = (type, x, y) => addObject(out.objects, type, x, y);
    for (let i = 10; i <= 37; i++) {
      if (i !== 24) O("fence", i, 7);
      if (i !== 24) O("fence", i, 24);
    }
    for (const [x, y] of [[10, 16], [10, 20], [37, 16], [37, 20]]) O("fence", x, y);
    O("sign", 16, 8);
    O("sign", 32, 24);
    O("bench", 16, 20);
    O("bench", 24, 20);
    O("trash_bin", 20, 8);
    O("trash_bin", 30, 24);
    const trees = [[4, 4], [6, 28], [42, 4], [44, 28]];
    for (const [x, y] of trees) O("tree", x, y);

    out.pois.push({ id: "poi_tps_area", name: "Area TPS", type: "tps", x: 24, y: 12 });
    out.transitions.push(
      { id: "to_desa", label: "Desa Harmoni", x: 18, y: 30, width: 13, height: 2, target: "desa_harmoni", targetSpawn: { x: 20, y: 9 } }
    );
  },
});

// === World index ===
const world = {
  version: 1,
  id: "demokrasi_city",
  name: "DEMOKRASI CITY",
  startArea: "desa_harmoni",
  areas: [
    { id: "desa_harmoni", name: "Desa Harmoni", type: "village", start: true },
    { id: "sekolah_nusantara", name: "Sekolah Nusantara", type: "education" },
    { id: "pasar_rakyat", name: "Pasar Rakyat", type: "market" },
    { id: "pusat_kota", name: "Pusat Kota", type: "public" },
    { id: "tps", name: "TPS", type: "simulation" },
  ],
};

// === tileset.json document ===
const tilesetDoc = {
  version: 1,
  id: TILESET_ID,
  tileSize: 32,
  columns: TILESET_COLUMNS,
  tileCount: TILES.length - 1,
  collisionGids: TILES.map((t, i) => (t && !t.walkable ? i : 0)).filter(Boolean),
  tiles: TILES.map((t, i) =>
    t
      ? { gid: i, id: t.id, walkable: t.walkable, layer: t.layer[0] }
      : null
  ).filter(Boolean),
};

function write(name, obj) {
  const file = join(OUT, name);
  writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`[maps] ${file}`);
}

mkdirSync(OUT, { recursive: true });
write("world.json", world);
write("tileset.json", tilesetDoc);
for (const key of Object.keys(maps)) {
  write(`${key}.json`, maps[key]);
}
console.log(
  `[maps] selesai: ${Object.keys(maps).length} peta + world.json + tileset.json`
);