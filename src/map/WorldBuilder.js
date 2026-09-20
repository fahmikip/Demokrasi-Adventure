/**
 * WorldBuilder — membangun dunia dari data peta (JSON) ke dalam scene Phaser.
 * Bertanggung jawab atas: tilemap, collision tile, bangunan, object lingkungan,
 * POI, dan zona transisi. WorldScene hanya meng-orkestrasi lifecycle-nya.
 */

import { Config } from "../core/Config.js";
import { TILESET_ID, collisionGids } from "./TilesetDefs.js";
import { BUILDING_DEFS, OBJECT_DEFS } from "./ObjectDefs.js";
import { POIManager } from "./POIManager.js";
import { TransitionManager } from "./TransitionManager.js";

export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  build(mapData) {
    const scene = this.scene;
    const TILE = Config.TILE.SIZE;

    const worldW = mapData.size.width * TILE;
    const worldH = mapData.size.height * TILE;

    const ground = this.createTilemap(mapData);

    const obstacles = scene.physics.add.staticGroup();
    const sorted = [];

    for (const b of mapData.buildings || []) {
      this.place(b, BUILDING_DEFS[b.type], obstacles, sorted, TILE, worldW, worldH);
    }
    for (const o of mapData.objects || []) {
      this.place(o, OBJECT_DEFS[o.type], obstacles, sorted, TILE, worldW, worldH);
    }

    const pois = new POIManager(scene);
    pois.setup(mapData.pois || [], TILE);

    const transitions = new TransitionManager(scene);
    transitions.setup(mapData.transitions || [], TILE);

    return {
      worldW,
      worldH,
      ground,
      waterLayer: ground.water,
      obstacles,
      sorted,
      pois,
      transitions,
    };
  }

  createTilemap(mapData) {
    const scene = this.scene;
    const TILE = Config.TILE.SIZE;
    const tiles = mapData.tiles;

    // map dibangun dari layer ground (2D array) + putTilesAt untuk road/water.
    const map = scene.make.tilemap({
      data: tiles.ground,
      tileWidth: TILE,
      tileHeight: TILE,
    });
    const tileset = map.addTilesetImage(TILESET_ID, TILESET_ID, TILE, TILE, 0, 0);

    const groundLayer = map.createLayer(0, tileset, 0, 0).setDepth(-130);
    const roadLayer = map.createBlankLayer("road", tileset, 0, 0).setDepth(-120);
    const waterLayer = map.createBlankLayer("water", tileset, 0, 0).setDepth(-110);

    roadLayer.putTilesAt(tiles.road, 0, 0);
    waterLayer.putTilesAt(tiles.water, 0, 0);
    waterLayer.setCollision(collisionGids());

    return { map, tileset, ground: groundLayer, road: roadLayer, water: waterLayer };
  }

  place(entry, def, group, sorted, TILE, worldW, worldH) {
    const scene = this.scene;
    if (!def) {
      console.warn(`[WorldBuilder] Tipe asset tak dikenal: "${entry.type}"`);
      return;
    }
    if (!scene.textures.exists(def.key)) {
      console.warn(`[WorldBuilder] Texture placeholder tidak ada: ${def.key}`);
      return;
    }

    const px = (entry.x + 0.5) * TILE;
    const py = (entry.y + 0.5) * TILE;

    let sprite;
    if (def.body) {
      sprite = group.create(px, py, def.key);
      sprite.setOrigin(0.5, 1);
      const b = def.body;
      sprite.body.setSize(b.w, b.h, false);
      sprite.body.setOffset((def.frameW - b.w) / 2, def.frameH - b.h - b.bottomOffset);
    } else {
      sprite = scene.add.sprite(px, py, def.key).setOrigin(0.5, 1);
    }

    // depth = y untuk y-sorting natural (di depan/belakang object lain)
    sprite.setDepth(py);
    sorted.push(sprite);
    void worldW;
    void worldH;
  }
}