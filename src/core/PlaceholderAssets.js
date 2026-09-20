/**
 * PlaceholderAssets — menghasilkan semua texture placeholder saat preload.
 * Semua asset final dapat menggantikan texture ini tanpa mengubah gameplay logic.
 * Konvensi nama: lihat docs/ART_DIRECTION.md & docs/PLAYER_ASSET_SPEC.md.
 */

import { Config } from "./Config.js";
import { TILESET_ID, TILESET_COLUMNS, TILES } from "../map/TilesetDefs.js";

const COLORS = {
  skin: 0xf3c98b,
  hair: 0x5d4037,
  shirt: 0x3498db,
  pants: 0x2c3e50,
  gold: 0xf1c40f,
  goldDark: 0xd4ac0d,
  blue: 0x3498db,
};

export function generatePlaceholderTextures(scene) {
  _generateTiles(scene);
  _generateObstacles(scene);
  _generateTilesetAtlas(scene);
  _generateBuildings(scene);
  _generateObjects(scene);
  _generatePlayerSheet(scene);
  _generateIcons(scene);
  _generateJoystickTextures(scene);
  _generateMarker(scene);
}

function _rect(scene, key, w, h, color, line = null) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color);
  g.fillRect(0, 0, w, h);
  if (line) {
    g.lineStyle(line.width, line.color, line.alpha || 0.3);
    g.strokeRect(0, 0, w, h);
  }
  g.generateTexture(key, w, h);
  g.destroy();
}

function _circle(scene, key, r, { fill, stroke } = {}) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  if (fill && fill.color !== undefined) {
    g.fillStyle(fill.color, fill.alpha ?? 1);
    g.fillCircle(r, r, r);
  }
  if (stroke) {
    g.lineStyle(stroke.width, stroke.color, stroke.alpha ?? 1);
    g.strokeCircle(r, r, r);
  }
  g.generateTexture(key, r * 2, r * 2);
  g.destroy();
}

function _generateTiles(scene) {
  _rect(scene, "tile_grass", Config.TILE.SIZE, Config.TILE.SIZE, 0x5b8c5a);
  _rect(scene, "tile_path", Config.TILE.SIZE, Config.TILE.SIZE, 0xd4b896);
  _rect(scene, "tile_wall", Config.TILE.SIZE, Config.TILE.SIZE, 0x7f8c8d);
  _rect(scene, "tile_water", Config.TILE.SIZE, Config.TILE.SIZE, 0x5dade2);
  _rect(scene, "tile_floor", Config.TILE.SIZE, Config.TILE.SIZE, 0xcdb4a0);
  _rect(scene, "tile_roof", Config.TILE.SIZE, Config.TILE.SIZE, 0xc0392b);
  // tile dengan aksen agar jalur terlihat
  _rect(scene, "tile_grass_accent", Config.TILE.SIZE, Config.TILE.SIZE, 0x54824f);
}

function _generateObstacles(scene) {
  // Pohon placeholder
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(32, 62, 44, 8);
    g.fillStyle(0x6d4c41);
    g.fillRect(28, 34, 8, 28);
    g.fillStyle(0x2e7d32);
    g.fillCircle(32, 22, 18);
    g.fillStyle(0x43a047);
    g.fillCircle(24, 28, 12);
    g.fillCircle(40, 26, 11);
    g.generateTexture("tree_placeholder", 64, 66);
    g.destroy();
  }

  // Batu placeholder
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(24, 30, 36, 6);
    g.fillStyle(0x7f8c8d);
    g.fillEllipse(24, 22, 30, 18);
    g.fillStyle(0x95a5a6);
    g.fillEllipse(20, 18, 18, 10);
    g.generateTexture("rock_placeholder", 48, 32);
    g.destroy();
  }

  // Bangunan placeholder (rumah kampung)
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.12);
    g.fillRect(6, 74, 84, 8);
    g.fillStyle(0xd4b896); // dinding
    g.fillRect(12, 34, 72, 44);
    g.fillStyle(0x8d6e63); // frame jendela
    g.fillRect(20, 46, 20, 18);
    g.fillRect(56, 46, 20, 18);
    g.fillStyle(0x5dade2); // kaca
    g.fillRect(22, 48, 16, 14);
    g.fillRect(58, 48, 16, 14);
    g.fillStyle(0xc0392b); // atap genting
    g.fillTriangle(48, 6, 6, 34, 90, 34);
    g.fillTriangle(48, 10, 36, 34, 60, 34);
    g.fillStyle(0x6d4c41); // pintu
    g.fillRect(38, 52, 20, 26);
    g.generateTexture("building_placeholder", 96, 82);
    g.destroy();
  }

  // Tembok/pagar placeholder
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.12);
    g.fillRect(2, 30, 60, 6);
    g.fillStyle(0x7f8c8d);
    g.fillRect(4, 6, 52, 28);
    g.fillStyle(0x95a5a6);
    g.fillRect(4, 6, 52, 8);
    g.fillStyle(0x606c74);
    g.fillRect(4, 22, 52, 4);
    g.generateTexture("wall_placeholder", 60, 34);
    g.destroy();
  }
}

function _generateTilesetAtlas(scene) {
  const ts = Config.TILE.SIZE;
  const cols = TILESET_COLUMNS;
  const rows = Math.ceil((TILES.length - 1) / cols);
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  for (let gid = 1; gid < TILES.length; gid++) {
    const col = (gid - 1) % cols;
    const row = Math.floor((gid - 1) / cols);
    _drawTile(g, gid, col * ts, row * ts, ts);
  }

  g.generateTexture(TILESET_ID, cols * ts, rows * ts);
  g.destroy();
}

function _drawTile(g, gid, ox, oy, ts) {
  const id = TILES[gid].id;
  const B = {
    grass: 0x5b8c5a,
    grass_accent: 0x5f965c,
    grass_dark: 0x4a7a49,
    grass_flowers: 0x5b8c5a,
    dirt: 0xb5926a,
    dirt_accent: 0xa88a61,
    sand: 0xe4d5a8,
    sand_accent: 0xdccf9f,
    stone: 0x9aa7ae,
    stone_accent: 0x93a1a9,
    stone_decor: 0x9aa7ae,
    road: 0x6f7a80,
    road_h: 0x6f7a80,
    road_v: 0x6f7a80,
    road_soil: 0x7d6b4f,
    water: 0x47a3d8,
    water_edge_top: 0x47a3d8,
    water_edge_bottom: 0x47a3d8,
    water_edge_left: 0x47a3d8,
    water_edge_right: 0x47a3d8,
    water_corner_tl: 0x47a3d8,
    water_corner_tr: 0x47a3d8,
    water_corner_bl: 0x47a3d8,
    water_corner_br: 0x47a3d8,
    water_plants: 0x47a3d8,
  }[id] ?? TILES[gid][0];

  g.fillStyle(B, 1);
  g.fillRect(ox, oy, ts, ts);

  const speck = (n, base, light, dark) => {
    for (let k = 0; k < n; k++) {
      const hsh = ((gid * 31 + k * 17 + ox * 7 + oy * 13) % 97) / 97;
      const c = hsh < 0.5 ? dark : light;
      g.fillStyle(c, 0.5);
      g.fillRect(ox + ((k * 13 + gid * 3) % (ts - 3)), oy + ((k * 29 + gid * 5) % (ts - 3)), 3, 3);
    }
    void base;
  };

  switch (id) {
    case "grass":
      speck(4, null, 0x6da06a, 0x4f7d4e);
      break;
    case "grass_accent":
      speck(6, null, 0x6da06a, 0x4f7d4e);
      g.fillStyle(0x6da06a, 0.5);
      g.fillRect(ox + 6, oy + 6, 4, 4);
      break;
    case "grass_dark":
      g.fillStyle(0x4a7a49, 1);
      g.fillRect(ox, oy, ts, ts);
      speck(5, null, 0x54824f, 0x3d683c);
      break;
    case "grass_flowers": {
      speck(3, null, 0x6da06a, 0x4f7d4e);
      g.fillStyle(0xefa24b, 1);
      g.fillCircle(ox + 8, oy + 8, 2);
      g.fillStyle(0xe05d5b, 1);
      g.fillCircle(ox + 24, oy + 20, 2);
      g.fillStyle(0xf4d03f, 1);
      g.fillCircle(ox + 18, oy + 28, 2);
      break;
    }
    case "dirt":
      speck(5, null, 0xc4a178, 0x9c7c56);
      break;
    case "dirt_accent":
      speck(7, null, 0xc0a079, 0x95754f);
      break;
    case "sand":
      speck(5, null, 0xecdab0, 0xd3c194);
      break;
    case "sand_accent":
      speck(8, null, 0xecdab0, 0xcdb98c);
      break;
    case "stone":
    case "stone_accent":
    case "stone_decor": {
      g.lineStyle(1, 0x87949d, 1);
      const cell = ts / 2;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          g.strokeRect(ox + c * cell, oy + r * cell, cell, cell);
        }
      }
      if (id === "stone_accent") {
        g.fillStyle(0xb8c3c9, 1);
        g.fillRect(ox + 12, oy + 12, 8, 8);
      }
      if (id === "stone_decor") {
        g.fillStyle(0x7a8a93, 1);
        g.fillCircle(ox + 8, oy + 24, 3);
        g.fillCircle(ox + 26, oy + 10, 2);
      }
      break;
    }
    case "road_h": {
      _drawRoad(g, ox, oy, ts, "h");
      break;
    }
    case "road_v": {
      _drawRoad(g, ox, oy, ts, "v");
      break;
    }
    case "road_cross": {
      _drawRoad(g, ox, oy, ts, "h");
      _drawRoad(g, ox, oy, ts, "v");
      break;
    }
    case "road_corner_tl":
    case "road_corner_tr":
    case "road_corner_bl":
    case "road_corner_br":
    case "road_edge_top":
    case "road_edge_bottom":
    case "road_edge_left":
    case "road_edge_right": {
      _drawRoadEdge(g, id, ox, oy, ts);
      break;
    }
    case "water":
      _drawWater(g, ox, oy, ts, false);
      break;
    case "water_plants":
      _drawWater(g, ox, oy, ts, true);
      break;
    case "water_edge_top":
    case "water_edge_bottom":
    case "water_edge_left":
    case "water_edge_right":
    case "water_corner_tl":
    case "water_corner_tr":
    case "water_corner_bl":
    case "water_corner_br": {
      _drawWaterEdge(g, id, ox, oy, ts);
      break;
    }
    default:
      speck(3, null, 0x6da06a, 0x4f7d4e);
  }
}

function _drawRoad(g, ox, oy, ts, dir) {
  g.fillStyle(0x7d6b4f, 1);
  g.fillRect(ox, oy, ts, ts);
  g.fillStyle(0x6f7a80, 1);
  if (dir === "h") {
    g.fillRect(ox, oy + 4, ts, ts - 8);
  } else {
    g.fillRect(ox + 4, oy, ts - 8, ts);
  }
  g.lineStyle(1, 0xcfd8dc, 1);
  if (dir === "h") {
    g.strokeLineShape(new Phaser.Geom.Line(ox + 2, oy + 5, ox + ts - 2, oy + 5));
    g.strokeLineShape(new Phaser.Geom.Line(ox + 2, oy + ts - 6, ox + ts - 2, oy + ts - 6));
    g.fillStyle(0xd9d9d9, 1);
    g.fillRect(ox + 4, oy + 14, ts - 8, 2);
  } else {
    g.strokeLineShape(new Phaser.Geom.Line(ox + 5, oy + 2, ox + 5, oy + ts - 2));
    g.strokeLineShape(new Phaser.Geom.Line(ox + ts - 6, oy + 2, ox + ts - 6, oy + ts - 2));
    g.fillStyle(0xd9d9d9, 1);
    g.fillRect(ox + 14, oy + 4, 2, ts - 8);
  }
}

function _drawRoadEdge(g, id, ox, oy, ts) {
  g.fillStyle(0x7d6b4f, 1);
  g.fillRect(ox, oy, ts, ts);
  g.fillStyle(0x6f7a80, 1);
  switch (id) {
    case "road_edge_top":
      g.fillRect(ox, oy + 4, ts, 12);
      break;
    case "road_edge_bottom":
      g.fillRect(ox, oy + ts - 16, ts, 12);
      break;
    case "road_edge_left":
      g.fillRect(ox + 4, oy, 12, ts);
      break;
    case "road_edge_right":
      g.fillRect(ox + ts - 16, oy, 12, ts);
      break;
    case "road_corner_tl":
      g.fillRect(ox + 4, oy, 28, 12).fillRect(ox + 4, oy, 12, 28);
      break;
    case "road_corner_tr":
      g.fillRect(ox, oy, ts - 12, 12).fillRect(ox + ts - 16, oy, 12, 28);
      break;
    case "road_corner_bl":
      g.fillRect(ox + 4, oy + ts - 28, 12, 28).fillRect(ox + 4, oy + ts - 12, 28, 12);
      break;
    case "road_corner_br":
      g.fillRect(ox + ts - 16, oy + ts - 28, 12, 28).fillRect(ox, oy + ts - 12, ts - 12, 12);
      break;
  }
  g.lineStyle(1, 0xcfd8dc, 1);
  g.strokeRect(ox + 1, oy + 1, ts - 2, ts - 2);
}

function _drawWater(g, ox, oy, ts, plants) {
  g.lineStyle(2, 0x3b8fc0, 1);
  g.strokeLineShape(new Phaser.Geom.Line(ox + 2, oy + 10, ox + ts - 2, oy + 10));
  g.strokeLineShape(new Phaser.Geom.Line(ox + 4, oy + 22, ox + ts - 6, oy + 22));
  g.lineStyle(1, 0x5cb4e0, 0.8);
  g.strokeLineShape(new Phaser.Geom.Line(ox + 2, oy + 5, ox + ts - 2, oy + 5));
  if (plants) {
    g.fillStyle(0x2e7d32, 1);
    g.fillEllipse(ox + 22, oy + 16, 12, 8);
    g.fillStyle(0x3e8e41, 1);
    g.fillEllipse(ox + 26, oy + 18, 10, 6);
    g.fillEllipse(ox + 12, oy + 26, 10, 6);
    g.fillStyle(0xf4d03f, 0.9);
    g.fillCircle(ox + 26, oy + 17, 2);
  }
}

function _drawWaterEdge(g, id, ox, oy, ts) {
  _drawWater(g, ox, oy, ts, false);
  g.fillStyle(0xe4d5a8, 1);
  const shore = (pts) => g.fillPoints(pts, true);
  switch (id) {
    case "water_edge_top":
      shore([ox, oy, ox + ts, oy, ox + ts, oy + 10, ox, oy + 14]);
      break;
    case "water_edge_bottom":
      shore([ox, oy + ts, ox + ts, oy + ts, ox + ts, oy + ts - 10, ox, oy + ts - 14]);
      break;
    case "water_edge_left":
      shore([ox, oy, ox + 12, oy, ox + 10, oy + 16, ox, oy + 20]);
      break;
    case "water_edge_right":
      shore([ox + ts, oy, ox + ts - 12, oy, ox + ts - 10, oy + 16, ox + ts, oy + 20]);
      break;
    case "water_corner_tl":
      shore([ox, oy, ox + 16, oy, ox, oy + 20]);
      break;
    case "water_corner_tr":
      shore([ox + ts, oy, ox + ts - 16, oy, ox + ts, oy + 20]);
      break;
    case "water_corner_bl":
      shore([ox, oy + ts, ox + 16, oy + ts, ox, oy + ts - 20]);
      break;
    case "water_corner_br":
      shore([ox + ts, oy + ts, ox + ts - 16, oy + ts, ox + ts, oy + ts - 20]);
      break;
  }
  g.fillStyle(0x000000, 0.1);
  g.fillRect(ox, oy, ts, ts);
}

function _generateBuildings(scene) {
  _buildingSmallHouse(scene);
  _buildingLargeHouse(scene);
  _buildingSchool(scene);
  _buildingVillageHall(scene);
  _buildingShop(scene);
  _buildingWarung(scene);
  _buildingTent(scene);
}

function _buildingSmallHouse(scene) {
  const W = 96;
  const H = 88;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 84, 9);
  g.fillStyle(0xd9c5a3); // dinding
  g.fillRect(8, 34, 80, 50);
  g.fillStyle(0xc9ae84);
  g.fillRect(8, 34, 80, 8);
  g.fillStyle(0x5dade2); // jendela
  g.fillRect(16, 46, 20, 16);
  g.fillRect(60, 46, 20, 16);
  g.lineStyle(2, 0x8d6e63, 1);
  g.strokeRect(16, 46, 20, 16);
  g.strokeRect(60, 46, 20, 16);
  g.fillStyle(0x6d4c41); // pintu
  g.fillRect(38, 54, 20, 30);
  g.fillStyle(0x5b3a31);
  g.fillRect(53, 66, 3, 4);
  g.fillStyle(0xc0392b); // atap genteng
  g.fillTriangle(W / 2, 2, 6, 34, W - 6, 34);
  g.fillStyle(0xb0392b);
  g.fillTriangle(W / 2, 8, 34, 34, W - 34, 34);
  g.generateTexture("building_small_house", W, H);
  g.destroy();
}

function _buildingLargeHouse(scene) {
  const W = 128;
  const H = 104;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 116, 10);
  g.fillStyle(0xf0e4cc); // teras
  g.fillRect(6, 70, W - 12, 26);
  g.fillStyle(0x5b3a31);
  g.fillRect(6, 96, W - 12, 6);
  g.fillStyle(0xe0d0b4); // dinding
  g.fillRect(10, 34, W - 20, 40);
  g.fillRect(10, 34, W - 20, 8);
  g.fillStyle(0x5dade2);
  g.fillRect(18, 46, 20, 16);
  g.fillRect(90, 46, 20, 16);
  g.lineStyle(2, 0x8d6e63, 1);
  g.strokeRect(18, 46, 20, 16);
  g.strokeRect(90, 46, 20, 16);
  g.fillStyle(0x6d4c41); // pintu
  g.fillRect(52, 62, 26, 36);
  g.fillStyle(0x5b5b5b);
  g.fillRect(46, 60, 10, 12);
  g.fillStyle(0xc0392b); // atap
  g.fillTriangle(W / 2, 2, 8, 36, W - 8, 36);
  g.fillStyle(0xb0392b);
  g.fillTriangle(W / 2, 10, 40, 36, W - 40, 36);
  g.generateTexture("building_large_house", W, H);
  g.destroy();
}

function _buildingSchool(scene) {
  const W = 192;
  const H = 120;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 182, 11);
  g.fillStyle(0xf4ead6); // dinding
  g.fillRect(8, 40, W - 16, 72);
  g.fillStyle(0xead9bd);
  g.fillRect(8, 40, W - 16, 10);
  g.fillStyle(0x5dade2);
  for (let i = 0; i < 5; i++) {
    g.fillRect(16 + i * 34, 56, 22, 20);
    g.lineStyle(2, 0x8d6e63, 1);
    g.strokeRect(16 + i * 34, 56, 22, 20);
  }
  g.fillStyle(0x6d4c41); // pintu utama
  g.fillRect(84, 70, 26, 42);
  g.fillStyle(0xc0392b); // atap
  g.fillTriangle(W / 2, 2, 6, 42, W - 6, 42);
  g.fillStyle(0xb0392b);
  g.fillTriangle(W / 2, 12, 74, 42, W - 74, 42);
  g.fillStyle(0xf4ead6); // papan nama sekolah
  g.fillRect(W / 2 - 40, 116, 80, 4);
  g.fillRect(W / 2 - 34, 98, 68, 20);
  g.lineStyle(2, 0x8d6e63, 1);
  g.strokeRect(W / 2 - 34, 98, 68, 20);
  g.fillStyle(0x2c3e50);
  g.fillRect(W / 2 - 24, 104, 48, 4);
  g.fillRect(W / 2 - 24, 110, 36, 3);
  g.generateTexture("building_school", W, H);
  g.destroy();
}

function _buildingVillageHall(scene) {
  const W = 128;
  const H = 112;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 116, 10);
  g.fillStyle(0xe7d7bb); // dinding
  g.fillRect(10, 40, W - 20, 66);
  g.fillStyle(0xd6c29d);
  g.fillRect(10, 40, W - 20, 10);
  g.fillStyle(0x5dade2);
  g.fillRect(18, 56, 20, 18);
  g.fillRect(90, 56, 20, 18);
  g.lineStyle(2, 0x8d6e63, 1);
  g.strokeRect(18, 56, 20, 18);
  g.strokeRect(90, 56, 20, 18);
  g.fillStyle(0x6d4c41); // pintu ganda
  g.fillRect(50, 68, 16, 38);
  g.fillRect(66, 68, 16, 38);
  g.fillStyle(0x8d6e63);
  g.fillRect(66, 84, 2, 8);
  g.fillStyle(0x8d4a3c); // atap balai (lebih lebar)
  g.fillTriangle(W / 2 - 6, 2, 6, 42, W - 6, 42);
  g.fillStyle(0x7d4236);
  g.fillTriangle(W / 2 - 6, 12, 38, 42, W - 38, 42);
  // tiang bendera
  g.fillStyle(0x000000, 0.2);
  g.fillRect(8, 74, 5, 34);
  g.fillStyle(0x2c3e50);
  g.fillRect(9, 16, 4, 90);
  g.fillStyle(0xc0392b);
  g.fillRect(13, 16, 22, 12);
  g.generateTexture("building_village_hall", W, H);
  g.destroy();
}

function _buildingShop(scene) {
  const W = 96;
  const H = 80;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 84, 8);
  g.fillStyle(0xe3d1b0);
  g.fillRect(8, 34, 80, 40);
  g.fillRect(8, 34, 80, 8);
  g.fillStyle(0x5dade2);
  g.fillRect(14, 44, 18, 16);
  g.fillRect(64, 44, 18, 16);
  g.lineStyle(2, 0x8d6e63, 1);
  g.strokeRect(14, 44, 18, 16);
  g.strokeRect(64, 44, 18, 16);
  g.fillStyle(0x6d4c41); // pintu toko
  g.fillRect(38, 48, 20, 26);
  g.fillStyle(0xc0392b); // awning
  g.fillRect(4, 18, W - 8, 16);
  g.fillStyle(0xa93226);
  for (let i = 0; i < 6; i++) g.fillRect(8 + i * 14, 18, 6, 16);
  g.fillStyle(0xc0392b);
  g.fillTriangle(W / 2 + 18, 2, 4, 18, W - 4, 18);
  g.generateTexture("building_shop", W, H);
  g.destroy();
}

function _buildingWarung(scene) {
  const W = 80;
  const H = 72;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 72, 8);
  g.fillStyle(0xe8c99a); // lapak
  g.fillRect(8, 40, W - 16, 28);
  g.fillStyle(0x8d6e63);
  g.fillRect(8, 60, W - 16, 8);
  g.fillStyle(0x6d4c41); // pilar
  g.fillRect(10, 20, 6, 44);
  g.fillRect(W - 16, 20, 6, 44);
  g.fillStyle(0xe67e22); // tenda warung
  g.fillTriangle(W / 2, 2, 6, 22, W - 6, 22);
  g.fillStyle(0xf39c12);
  g.fillTriangle(W / 2, 6, 20, 22, W - 20, 22);
  g.fillStyle(0xf4d03f); // barang dagangan
  g.fillRect(16, 44, 8, 6);
  g.fillRect(28, 44, 8, 6);
  g.fillRect(40, 44, 8, 6);
  g.fillRect(52, 44, 8, 6);
  g.generateTexture("building_warung", W, H);
  g.destroy();
}

function _buildingTent(scene) {
  const W = 96;
  const H = 72;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 4, 88, 8);
  g.fillStyle(0xf5f5f5);
  g.fillTriangle(W / 2, 2, 8, H - 6, W - 8, H - 6);
  g.fillStyle(0xe8e8e8);
  g.fillTriangle(W / 2, 16, 22, H - 6, W - 22, H - 6);
  g.fillStyle(0xc0392b);
  g.fillRect(W / 2 - 30, 4, 60, 6);
  g.fillStyle(0x6d4c41);
  g.fillRect(W / 2 - 14, H - 16, 8, 10);
  g.fillRect(W / 2 + 6, H - 16, 8, 10);
  g.fillStyle(0xc8c8c8);
  g.fillRect(W / 2 - 20, H - 8, 40, 4);
  g.generateTexture("building_tent", W, H);
  g.destroy();
}

function _generateObjects(scene) {
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(32, 90, 46, 8);
    g.fillStyle(0x6d4c41);
    g.fillRect(28, 44, 9, 48);
    g.fillStyle(0x2e7d32);
    g.fillCircle(32, 26, 20);
    g.fillStyle(0x43a047);
    g.fillCircle(22, 32, 12);
    g.fillCircle(42, 30, 12);
    g.fillStyle(0x388e3c);
    g.fillCircle(32, 18, 10);
    g.generateTexture("tree_large", 64, 96);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(24, 66, 36, 6);
    g.fillStyle(0x6d4c41);
    g.fillRect(21, 36, 6, 32);
    g.fillStyle(0x388e3c);
    g.fillCircle(24, 22, 16);
    g.fillStyle(0x43a047);
    g.fillCircle(16, 27, 9);
    g.fillCircle(31, 25, 9);
    g.generateTexture("tree_small", 48, 72);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(20, 25, 34, 5);
    g.fillStyle(0x4a7a49);
    g.fillEllipse(20, 18, 34, 16);
    g.fillStyle(0x54824f);
    g.fillEllipse(12, 22, 16, 9);
    g.fillEllipse(28, 20, 18, 10);
    g.generateTexture("bush", 40, 28);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x2e7d32);
    g.fillRect(11, 8, 3, 14);
    g.fillStyle(0xe05d5b);
    g.fillCircle(8, 6, 4);
    g.fillCircle(18, 6, 4);
    g.fillStyle(0xf4d03f);
    g.fillCircle(13, 3, 4);
    g.generateTexture("flower", 24, 24);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(18, 22, 32, 5);
    g.fillStyle(0x7f8c8d);
    g.fillEllipse(18, 17, 28, 15);
    g.fillStyle(0x95a5a6);
    g.fillEllipse(13, 14, 16, 8);
    g.fillStyle(0x6c7a85);
    g.fillEllipse(24, 19, 10, 6);
    g.generateTexture("rock", 36, 24);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(20, 23, 34, 5);
    g.fillStyle(0x8d6e63);
    g.fillRect(4, 16, 32, 6);
    g.fillStyle(0x6d4c41);
    g.fillRect(6, 22, 4, 4);
    g.fillRect(30, 22, 4, 4);
    g.fillStyle(0xa1887f);
    g.fillRect(4, 14, 32, 4);
    g.generateTexture("bench", 40, 26);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(12, 76, 20, 4);
    g.fillStyle(0x37474f);
    g.fillRect(9, 18, 6, 60);
    g.fillRect(4, 74, 16, 5);
    g.fillStyle(0xf4d03f);
    g.fillRect(8, 8, 8, 12);
    g.fillStyle(0x546e7a);
    g.fillRect(10, 10, 4, 8);
    g.generateTexture("lamp", 24, 80);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(12, 33, 20, 4);
    g.fillStyle(0x546e7a);
    g.fillRect(6, 12, 12, 18);
    g.fillRect(4, 30, 16, 5);
    g.fillStyle(0x78909c);
    g.fillRect(7, 6, 10, 8);
    g.fillStyle(0x37474f);
    g.fillRect(6, 16, 12, 3);
    g.generateTexture("trash_bin", 24, 36);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(20, 30, 34, 5);
    g.fillStyle(0x795548);
    g.fillRect(6, 10, 4, 22);
    g.fillRect(30, 10, 4, 22);
    g.fillStyle(0xa1887f);
    g.fillRect(4, 14, 32, 5);
    g.fillRect(4, 22, 32, 5);
    g.generateTexture("fence", 40, 34);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(16, 60, 28, 4);
    g.fillStyle(0x6d4c41);
    g.fillRect(14, 14, 4, 46);
    g.fillRect(28, 20, 4, 38);
    g.fillStyle(0x8d6e63);
    g.fillTriangle(16, 26, 34, 22, 34, 34);
    g.fillStyle(0xf4d03f);
    g.fillTriangle(34, 22, 42, 28, 34, 32);
    g.generateTexture("sign", 32, 64);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(24, 60, 40, 5);
    g.fillStyle(0x6d4c41);
    g.fillRect(20, 12, 5, 48);
    g.fillRect(30, 12, 4, 48);
    g.fillStyle(0x8d6e63);
    g.fillRect(4, 20, 40, 22);
    g.fillStyle(0xfdf6e3);
    g.fillRect(8, 25, 32, 12);
    g.fillStyle(0x95a5a6);
    g.fillRect(10, 28, 16, 3);
    g.fillRect(10, 33, 12, 2);
    g.generateTexture("notice_board", 48, 64);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(24, 36, 40, 5);
    g.fillStyle(0xe67e22);
    g.fillEllipse(20, 30, 28, 12);
    g.fillStyle(0x34495e);
    g.fillRect(24, 22, 9, 10);
    g.fillStyle(0x95a5a6);
    g.fillCircle(18, 32, 5);
    g.fillCircle(34, 32, 5);
    g.fillStyle(0x2c3e50);
    g.fillRect(18, 14, 3, 20);
    g.generateTexture("motorcycle", 48, 40);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(22, 34, 36, 5);
    g.lineStyle(3, 0x37474f, 1);
    g.strokeCircle(12, 26, 7);
    g.strokeCircle(34, 26, 7);
    g.lineStyle(3, 0x546e7a, 1);
    g.strokeLineShape(new Phaser.Geom.Line(12, 26, 34, 26));
    g.strokeLineShape(new Phaser.Geom.Line(12, 26, 22, 14));
    g.strokeLineShape(new Phaser.Geom.Line(34, 26, 22, 14));
    g.strokeLineShape(new Phaser.Geom.Line(12, 26, 6, 20));
    g.fillStyle(0x8d6e63);
    g.fillRect(20, 6, 5, 9);
    g.generateTexture("bicycle", 44, 40);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(20, 44, 32, 5);
    g.fillStyle(0x6c7a85);
    g.fillRect(6, 16, 28, 18);
    g.fillStyle(0x95a5a6);
    g.fillRect(8, 12, 24, 6);
    g.fillStyle(0x37474f);
    g.fillRect(4, 34, 32, 4);
    g.fillStyle(0x5dade2);
    g.fillRect(10, 22, 8, 8);
    g.fillStyle(0x6d4c41);
    g.fillRect(20, 14, 3, 22);
    g.fillRect(18, 32, 8, 6);
    g.generateTexture("well", 40, 48);
    g.destroy();
  }
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(32, 84, 54, 6);
    g.fillStyle(0x37474f);
    g.fillRect(8, 30, 5, 54);
    g.fillRect(48, 30, 5, 54);
    g.fillRect(12, 80, 40, 6);
    g.fillStyle(0x607d8b);
    g.fillRect(4, 16, 56, 18);
    g.fillStyle(0x78909c);
    g.fillTriangle(12, 30, 24, 10, 36, 30);
    g.fillStyle(0x546e7a);
    g.fillRect(10, 2, 44, 7);
    g.generateTexture("halte", 64, 88);
    g.destroy();
  }
}

function _generatePlayerSheet(scene) {
  const frameW = Config.PLAYER.SHEET.FRAME_W;
  const frameH = Config.PLAYER.SHEET.FRAME_H;
  const cols = Config.PLAYER.SHEET.COLS;
  const rows = Config.PLAYER.SHEET.ROWS;
  const sheetW = frameW * cols;
  const sheetH = frameH * rows;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      _drawPlayerFrame(g, col, row, frameW, frameH);
    }
  }

  const key = Config.PLAYER.SHEET.KEY;
  g.generateTexture(key, sheetW, sheetH);
  g.destroy();

  // Frame individual (diperlukan: addSpriteSheet dari canvas source
  // menghasilkan texture kosong di beberapa target/browser headless).
  // Animasi placeholder memakai frame-texture ini.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const gf = scene.make.graphics({ x: -col * frameW, y: -row * frameH, add: false });
      _drawPlayerFrame(gf, col, row, frameW, frameH);
      gf.generateTexture(`${key}_frame_${row * cols + col}`, frameW, frameH);
      gf.destroy();
    }
  }

  _registerPlayerAnimations(scene, cols);
}

function _registerPlayerAnimations(scene, cols) {
  const key = Config.PLAYER.SHEET.KEY;
  const hasFrameTextures = scene.textures.exists(`${key}_frame_0`);

  const frames = (indexes) =>
    hasFrameTextures
      ? indexes.map((i) => ({ key: `${key}_frame_${i}` }))
      : scene.anims.generateFrameNumbers(key, { start: indexes[0], end: indexes[indexes.length - 1] });

  const create = (animKey, indexes, rate) => {
    if (scene.anims.exists(animKey)) return;
    scene.anims.create({
      key: animKey,
      frames: frames(indexes),
      frameRate: rate,
      repeat: -1,
    });
  };

  const facingRows = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  for (const [dir, row] of Object.entries(facingRows)) {
    const base = row * cols;
    create(`idle_${dir}`, [base, base + 1], Config.PLAYER.ANIMS.IDLE_FPS);
    create(`walk_${dir}`, [base + 1, base + 2, base + 3], Config.PLAYER.ANIMS.WALK_FPS);
  }
}

function _drawPlayerFrame(g, col, row, frameW, frameH) {
  const fx = col * frameW;
  const fy = row * frameH;
  const cx = fx + frameW / 2;
  const vy = fy + frameH;

  const walkPhase = col; // 0 = idle, 1..3 = walk
  const bob = walkPhase === 2 ? 2 : 0;

  // shadow
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(cx, vy - 5, 34, 6);

  // kaki (pants) - bergerak saat walk
  const legY = vy - 16 - bob;
  const swing = walkPhase === 0 ? 0 : (walkPhase === 2 ? 2 : 1);
  const lx = cx - 9 + (swing === 1 ? -2 : swing === 3 ? 2 : 0);
  const rx = cx + 5 + (swing === 1 ? 2 : swing === 3 ? -2 : 0);
  g.fillStyle(COLORS.pants);
  g.fillRect(lx, legY, 5, 12);
  g.fillRect(rx, legY, 5, 12);

  // torso (shirt)
  g.fillStyle(COLORS.shirt);
  g.fillRoundedRect(cx - 11, fy + 30 - bob, 22, 18, 3);

  // lengan
  g.fillStyle(COLORS.shirt);
  g.fillRect(cx - 15, fy + 31 - bob, 4, 12);
  g.fillRect(cx + 11, fy + 31 - bob, 4, 12);

  // kepala
  g.fillStyle(COLORS.skin);
  g.fillRoundedRect(cx - 9, fy + 12 - bob, 18, 20, 5);

  // rambut & wajah sesuai arah
  if (row === 0) {
    // down
    g.fillStyle(COLORS.hair);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 18, 6, 3);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 4, 16, 2);
    g.fillRoundedRect(cx + 5, fy + 10 - bob, 4, 16, 2);
    g.fillStyle(0x1a1a1a);
    g.fillRect(cx - 4, fy + 20 - bob, 3, 3);
    g.fillRect(cx + 2, fy + 20 - bob, 3, 3);
  } else if (row === 1) {
    // left
    g.fillStyle(COLORS.hair);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 18, 6, 3);
    g.fillRoundedRect(cx + 5, fy + 10 - bob, 4, 18, 2);
    g.fillStyle(0x1a1a1a);
    g.fillRect(cx - 3, fy + 20 - bob, 3, 3);
  } else if (row === 2) {
    // right
    g.fillStyle(COLORS.hair);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 18, 6, 3);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 4, 18, 2);
    g.fillStyle(0x1a1a1a);
    g.fillRect(cx + 1, fy + 20 - bob, 3, 3);
  } else {
    // up (belakang kepala)
    g.fillStyle(COLORS.hair);
    g.fillRoundedRect(cx - 9, fy + 10 - bob, 18, 6, 3);
    g.fillRect(cx - 9, fy + 14 - bob, 18, 6);
  }
}

function _generateIcons(scene) {
  // icon XP (bintang)
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const pts = _starPoints(16, 16, 13, 6, 5);
    g.fillStyle(COLORS.gold);
    g.fillPoints(pts, true);
    g.lineStyle(2, COLORS.goldDark, 1);
    g.strokePoints(pts, true);
    g.generateTexture("icon_xp", 32, 32);
    g.destroy();
  }

  // icon coins (koin)
  _circle(scene, "icon_coins", 16, {
    fill: { color: COLORS.gold },
    stroke: { width: 3, color: COLORS.goldDark, alpha: 1 },
  });

  // icon level (medali sederhana)
  _circle(scene, "icon_lvl", 16, {
    fill: { color: COLORS.blue },
    stroke: { width: 3, color: 0x21618c, alpha: 1 },
  });

  // icon pause
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 12, 4, 16);
    g.fillRect(22, 12, 4, 16);
    g.generateTexture("icon_pause", 40, 40);
    g.destroy();
  }

  // icon map
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(20, 20, 18);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeRect(10, 12, 20, 16);
    g.lineStyle(1, 0xffffff, 1);
    g.strokeLineShape(new Phaser.Geom.Line(10, 12, 30, 28));
    g.strokeLineShape(new Phaser.Geom.Line(30, 12, 10, 28));
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 20, 3);
    g.generateTexture("icon_map", 40, 40);
    g.destroy();
  }
}

function _generateJoystickTextures(scene) {
  _circle(scene, "joystick_base", 52, {
    fill: { color: 0xffffff, alpha: 0.12 },
    stroke: { width: 3, color: 0xffffff, alpha: 0.55 },
  });
  _circle(scene, "joystick_knob", 26, {
    fill: { color: 0xffffff, alpha: 0.4 },
    stroke: { width: 2, color: 0xffffff, alpha: 0.8 },
  });
}

function _generateMarker(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(COLORS.gold);
  g.fillTriangle(16, 2, 30, 16, 16, 30);
  g.fillTriangle(2, 16, 16, 30, 16, 16);
  g.fillStyle(0xffffff);
  g.fillRect(14, 10, 4, 8);
  g.fillRect(14, 20, 4, 3);
  g.generateTexture("interact_marker", 32, 32);
  g.destroy();
}

function _starPoints(cx, cy, outer, inner, points) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}