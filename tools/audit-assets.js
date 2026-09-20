/**
 * audit-assets — verifikasi Asset Source of Truth.
 *
 * Membaca data/assets/ASSET_REGISTRY.json lalu memindai assets/**:
 *   1. Setiap file fisik di assets/ harus terdaftar di registry.
 *   2. Setiap entri fisik (origin=physical) harus ada file-nya, hash cocok.
 *   3. Setiap entri procedural menunjuk file sumber yang ada.
 *   4. Tidak ada id duplikat / id format salah / status tidak valid.
 *
 * Menulis data/assets/asset-manifest.json dan print PASS/FAIL (exit code).
 *
 * Usage: node tools/audit-assets.js   (atau npm run assets:audit)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "data", "assets", "ASSET_REGISTRY.json");
const MANIFEST_PATH = path.join(ROOT, "data", "assets", "asset-manifest.json");
const ASSETS_DIR = path.join(ROOT, "assets");

const ID_FORMAT = /^[a-z0-9]+(?:_[a-z0-9]+)+$/;
const VALID_STATUS = ["approved", "placeholder"];
const VALID_ORIGIN = ["physical", "procedural"];

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, base, out);
    else out.push({ abs: p, rel: path.relative(base, p).replace(/\\/g, "/") });
  }
  return out;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function main() {
  const issues = [];
  const warnings = [];

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`FAIL — registry tidak ditemukan: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  } catch (err) {
    console.error(`FAIL — registry bukan JSON valid: ${err.message}`);
    process.exit(1);
  }

  const assets = registry.assets || [];
  const byId = new Map();
  const filesOnDisk = walk(ASSETS_DIR, ROOT).filter((f) => !f.rel.endsWith(".gitkeep"));

  // ---- validasi struktur registry ----
  const seenIds = new Map();
  for (const a of assets) {
    if (!a.id) {
      issues.push(`registry: entri tanpa "id"`);
      continue;
    }
    if (seenIds.has(a.id)) {
      issues.push(`registry: id duplikat "${a.id}"`);
    }
    seenIds.set(a.id, a);
    byId.set(a.id, a);

    if (!ID_FORMAT.test(a.id)) {
      issues.push(`registry: id format tidak valid "${a.id}" (harus <cat>_<name>[_<variant>])`);
    }
    if (!VALID_STATUS.includes(a.status)) {
      issues.push(`registry: id "${a.id}" status tidak valid "${a.status}"`);
    }
    if (!VALID_ORIGIN.includes(a.origin)) {
      issues.push(`registry: id "${a.id}" origin tidak valid "${a.origin}"`);
    }
    if (a.origin === "physical" && !a.path) {
      issues.push(`registry: id "${a.id}" origin=physical tanpa "path"`);
    }
    if (a.origin === "procedural" && !a.generatedBy) {
      issues.push(`registry: id "${a.id}" origin=procedural tanpa "generatedBy"`);
    }
  }

  // ---- validasi entri fisik ----
  const registeredPaths = new Map(); // relpath -> asset id
  for (const a of assets) {
    if (a.origin !== "physical") continue;
    const rel = a.path.replace(/\\/g, "/");
    if (registeredPaths.has(rel)) {
      issues.push(`registry: path ganda "${rel}" (${registeredPaths.get(rel)}, ${a.id})`);
    }
    registeredPaths.set(rel, a.id);

    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      issues.push(`registry: file fisik hilang "${rel}" (id ${a.id})`);
      continue;
    }
    const h = sha256(abs);
    if (a.sha256 && a.sha256 !== h) {
      issues.push(`registry: checksum berbeda untuk "${rel}" (id ${a.id})`);
    }
    a.sha256 = a.sha256 || h;
  }

  // ---- validasi entri procedural ----
  for (const a of assets) {
    if (a.origin !== "procedural") continue;
    const genFile = String(a.generatedBy || "").split("::")[0];
    const abs = path.join(ROOT, genFile);
    if (!fs.existsSync(abs)) {
      issues.push(`registry: generatedBy hilang untuk "${a.id}" -> ${a.generatedBy}`);
    } else {
      warnings.push(`registry: "${a.id}" = placebo procedural (${a.generatedBy})`);
    }
  }

  // ---- setiap file di disk harus terdaftar ----
  const manifestFiles = [];
  for (const f of filesOnDisk) {
    const id = registeredPaths.get(f.rel);
    if (!id) {
      issues.push(`disk: file tidak terdaftar di registry "${f.rel}"`);
      continue;
    }
    const asset = byId.get(id);
    manifestFiles.push({
      path: f.rel,
      size: fs.statSync(f.abs).size,
      sha256: sha256(f.abs),
      registryId: id,
      status: asset ? asset.status : "unknown",
      ok: true,
    });
  }

  // ---- manifest ----
  const manifest = {
    generatedAt: new Date().toISOString(),
    registryVersion: registry.version,
    totalRegistryEntries: assets.length,
    totalFilesOnDisk: filesOnDisk.length,
    registeredFiles: manifestFiles.length,
    summary: {
      issues: issues.length,
      warnings: warnings.length,
      missingRegistryFiles: issues.filter((i) => i.startsWith("registry: file fisik hilang")).length,
      unregisteredDiskFiles: issues.filter((i) => i.startsWith("disk:")).length,
      duplicateIds: issues.filter((i) => i.includes("id duplikat")).length,
    },
    files: manifestFiles.sort((a, b) => a.path.localeCompare(b.path)),
    issues,
    warnings,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

  const pass = issues.length === 0;
  console.log("=============================================");
  console.log(" Asset Source of Truth — AUDIT");
  console.log("=============================================");
  console.log(` Entri registry       : ${assets.length}`);
  console.log(` File di disk (assets/): ${filesOnDisk.length} (terdaftar ${manifestFiles.length})`);
  console.log(` Warnings             : ${warnings.length}`);
  console.log(` Issues               : ${issues.length}`);
  console.log("---------------------------------------------");
  if (issues.length) {
    for (const i of issues) console.log(" [FAIL] " + i);
  }
  for (const w of warnings) console.log(" [warn] " + w);
  console.log("---------------------------------------------");
  console.log(` Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(` Result  : ${pass ? "PASS ✓" : "FAIL ✗"}`);
  console.log("=============================================");
  process.exit(pass ? 0 : 1);
}

main();