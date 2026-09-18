/**
 * PlaceholderAssets — menghasilkan semua texture placeholder saat preload.
 * Semua asset final dapat menggantikan texture ini tanpa mengubah gameplay logic.
 * Konvensi nama: lihat docs/ART_DIRECTION.md & docs/PLAYER_ASSET_SPEC.md.
 */

import { Config } from "./Config.js";

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