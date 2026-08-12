'use strict';

/**
 * Craftera Play-Flow (AP-11.2).
 *
 * Ablauf: Check Local Version → Check Required → Install/Update → Verify →
 * Prepare → Start.
 *
 * Die Schritte bis "Prepare" sind ohne externe Runtime implementierbar und
 * real testbar. "Start" benötigt die Runtime (Godot), die nicht installiert
 * ist (AP-7.1 übersprungen) → liefert einen klaren Fehler.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { LocalExperienceRegistry } = require('../registry/localExperienceRegistry.js');
const { VersionRepository } = require('../experiences/versionRepository.js');
const { validatePackage } = require('../package/packageValidator.js');

/**
 * Führt den Play-Flow für eine Experience aus.
 * @param {string} dataDir - Datenverzeichnis.
 * @param {string} experienceId - ID der Experience.
 * @returns {Promise<object>} { steps, result }.
 */
async function playFlow(dataDir, experienceId) {
  const registry = new LocalExperienceRegistry(dataDir);
  const versionRepo = new VersionRepository(dataDir);
  const steps = [];

  // 1. Check Local Version.
  const versions = await versionRepo.list(experienceId);
  const localVersion = versions.length > 0 ? versions[versions.length - 1] : null;
  steps.push({ step: 'checkLocalVersion', ok: true, versionId: localVersion ? localVersion.versionId : null });

  // 2. Check Required (Experience muss existieren).
  const experience = await registry.experienceRepo.get(experienceId);
  if (!experience) {
    throw new Error(`playFlow: Experience "${experienceId}" nicht gefunden`);
  }
  steps.push({ step: 'checkRequired', ok: true });

  // 3. Install/Update (falls nicht installiert).
  const installedDir = path.join(dataDir, 'installed', experienceId);
  let installed = true;
  try {
    await fs.access(path.join(installedDir, 'manifest.json'));
  } catch {
    installed = false;
  }
  if (!installed) {
    await registry.install(experienceId);
  }
  steps.push({ step: 'installOrUpdate', ok: true, installed });

  // 4. Verify (Package vollständig).
  const verify = await validatePackage(installedDir);
  if (!verify.ok) {
    throw new Error(`playFlow: Package-Validierung fehlgeschlagen: ${verify.errors.join('; ')}`);
  }
  steps.push({ step: 'verify', ok: true });

  // 5. Prepare (Manifest + Projekt laden).
  const manifest = JSON.parse(await fs.readFile(path.join(installedDir, 'manifest.json'), 'utf8'));
  const project = JSON.parse(await fs.readFile(path.join(installedDir, 'game', 'game.project.json'), 'utf8'));
  steps.push({ step: 'prepare', ok: true, manifest, project });

  // 6. Start (Runtime nicht verfügbar).
  throw new Error('playFlow: Start benötigt die Runtime (Godot nicht installiert)');
}

module.exports = { playFlow };
