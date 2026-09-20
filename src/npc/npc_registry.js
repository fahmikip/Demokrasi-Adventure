/**
 * NPC Registry — Phase 3 schema per spec §5-6.
 * Memetakan npcId → metadata + file data NPC.
 * Seluruh NPC fiktif; konten netral & edukatif (netralitas, no condong).
 */

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
