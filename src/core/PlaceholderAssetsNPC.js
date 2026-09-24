/**
 * PlaceholderAssetsNPC — placeholder prosedural minimal untuk 5 NPC desa.
 * Texture key yang dihasilkan (sesuai data/npcs/*.json):
 *   npc_<id>          — badan NPC (untuk sprite world)
 *   portrait_npc_<id> — wajah untuk panel dialog
 * Dijalankan dari PreloadScene._finalize() setelah generatePlaceholderTextures(scene).
 *
 * Semua NPC fiktif & netral; placeholder berupa bentuk geometris sederhana
 * agar jelas "belum ada asset final" tanpa mewakili karakter nyata.
 */

const ROLE_COLOR = {
  warga: 0x8d6e63,
  guru: 0x8e44ad,
  pedagang: 0xe67e22,
  pemuda: 0x27ae60,
  perangkat: 0x7f8c8d,
};
const SKIN = 0xf0c191;
const HAIR = 0x4e342e;

const NPCS = [
  ["npc_warga", "warga"],
  ["npc_guru", "guru"],
  ["npc_pedagang", "pedagang"],
  ["npc_pemuda", "pemuda"],
  ["npc_perangkat", "perangkat"],
  ["npc_warga_pasar", "pedagang"],
];

function body(scene, id, role) {
  const W = 56;
  const H = 80;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const c = ROLE_COLOR[role] || ROLE_COLOR.warga;

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(W / 2, H - 6, W - 8, 8);
  g.fillStyle(0x3e2723);
  g.fillRect(16, 56, 10, 24);
  g.fillRect(30, 56, 10, 24);
  g.fillStyle(0x8d6e63);
  g.fillRoundedRect(12, 40, 32, 12, 3);
  g.fillStyle(c);
  g.fillRoundedRect(12, 26, 32, 18, 45);
  g.fillStyle(SKIN);
  g.fillRoundedRect(19, 4, 18, 22, 7);
  g.fillStyle(HAIR);
  g.fillRoundedRect(16, 0, 24, 10, 5);
  g.fillRect(16, 10, 5, 12);
  g.fillRect(35, 10, 5, 12);

  g.generateTexture(id, W, H);
  g.destroy();
}

function portrait(scene, id, role) {
  const S = 80;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const c = ROLE_COLOR[role] || ROLE_COLOR.warga;

  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(S / 2, S - 4, S - 10, 8);
  g.fillStyle(HAIR);
  g.fillRoundedRect(12, 4, S - 24, 14, 8);
  g.fillRoundedRect(8, 14, 10, 30, 5);
  g.fillRoundedRect(S - 18, 14, 10, 30, 5);
  g.fillStyle(SKIN);
  g.fillRoundedRect(18, 12, S - 36, S - 28, 8);
  g.fillStyle(0x2c3e50);
  g.fillCircle(30, 38, 4);
  g.fillCircle(S - 30, 38, 4);
  g.fillStyle(c);
  g.fillRoundedRect(30, 52, S - 60, 7, 3);

  g.generateTexture(id, S, S);
  g.destroy();
}

/**
 * @param {Phaser.Scene} scene — PreloadScene (memiliki scene.make.graphics).
 * @param {Array<{id:string, role:string}>} [list] — default semua pelaku desa.
 */
export function generateNPCPlaceholderTextures(scene, list) {
  const items = list && list.length ? list : NPCS;
  for (const [id, role] of items) {
    body(scene, id, role);
    portrait(scene, "portrait_" + id, role);
  }
}
