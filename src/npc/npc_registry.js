/**
 * NPC Registry — Phase 3 schema per spec §5-6.
 * Memetakan npcId → metadata + penempatan per peta (fiktif).
 * Seluruh NPC fiktif; konten netral & edukatif (netralitas, no condong).
 */

import { Config } from "../core/Config.js";

const T = () => Config.TILE.SIZE;

export const NPC_REGISTRY = {
  version: 1,
  updated: "2026-09-18",
  description:
    "Registri NPC Demokrasi-Adventure. Semua tokoh fiktif, bukan tokoh nyata. Konten netral (§54).",
  npcs: [
    {
      id: "npc_warga",
      name: "Mbah Karto",
      role: "warga",
      alias: "Pensiunan guru, tokoh warga desa",
      file: "warga.json",
      sprite: { key: "npc_warga", frame: 0 },
      portrait: { key: "portrait_npc_warga" },
      defaultMap: "desa_harmoni",
      fictional: true,
    },
    {
      id: "npc_guru",
      name: "Bu Ratna",
      role: "guru",
      alias: "Guru SDN Nusantara",
      file: "guru.json",
      sprite: { key: "npc_guru", frame: 0 },
      portrait: { key: "portrait_npc_guru" },
      defaultMap: "desa_harmoni",
      fictional: true,
    },
    {
      id: "npc_pedagang",
      name: "Pak Slamet",
      role: "pedagang",
      alias: "Pedagang Pasar Rakyat",
      file: "pedagang.json",
      sprite: { key: "npc_pedagang", frame: 0 },
      portrait: { key: "portrait_npc_pedagang" },
      defaultMap: "desa_harmoni",
      fictional: true,
    },
    {
      id: "npc_pemuda",
      name: "Ayu",
      role: "pemuda",
      alias: "Aktivis pemuda desa",
      file: "pemuda.json",
      sprite: { key: "npc_pemuda", frame: 0 },
      portrait: { key: "portrait_npc_pemuda" },
      defaultMap: "desa_harmoni",
      fictional: true,
    },
    {
      id: "npc_perangkat",
      name: "Pak Dedi",
      role: "perangkat_desa",
      alias: "Sekretaris Desa (PPK pemilu desa)",
      file: "perangkat_desa.json",
      sprite: { key: "npc_perangkat", frame: 0 },
      portrait: { key: "portrait_npc_perangkat" },
      defaultMap: "desa_harmoni",
      fictional: true,
    },
  ],
};

// Penempatan NPC per peta (semua koordinat tile).
const PLACEMENTS = [
  { map: "desa_harmoni", npcId: "npc_warga", x: 6, y: 12, facing: "right" },
  { map: "desa_harmoni", npcId: "npc_guru", x: 55, y: 10, facing: "down" },
  { map: "desa_harmoni", npcId: "npc_pemuda", x: 26, y: 36, facing: "left" },
  { map: "desa_harmoni", npcId: "npc_pedagang", x: 17, y: 34, facing: "up" },
  { map: "desa_harmoni", npcId: "npc_perangkat", x: 13, y: 11, facing: "down" },
];

const _byId = new Map(NPC_REGISTRY.npcs.map((n) => [n.id, n]));

export const NPCRegistry = {
  get npcs() {
    return NPC_REGISTRY.npcs;
  },
  get(npcId) {
    return _byId.get(npcId) || null;
  },
  /** Penempatan (dengan metadata) untuk satu peta, dalam koordinat piksel. */
  forMap(mapId) {
    return PLACEMENTS.filter((p) => p.map === mapId).map((p) => {
      const meta = _byId.get(p.npcId) || {};
      return {
        npcId: p.npcId,
        name: meta.name,
        role: meta.role,
        alias: meta.alias,
        x: (p.x + 0.5) * T(),
        y: (p.y + 0.5) * T(),
        facing: p.facing,
        texture: meta.sprite && meta.sprite.key,
        portrait: (meta.portrait && meta.portrait.key) || null,
        prompt: "Bicara",
        fictional: meta.fictional ?? true,
      };
    });
  },
};
