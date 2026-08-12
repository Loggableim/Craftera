'use strict';

/**
 * Craftera Package Builder (AP-9.2).
 *
 * Erzeugt aus einem GameProject ein Package-Verzeichnis mit der verbindlichen
 * Struktur (AP-9.1): `game/`, `assets/`, `runtime/`, `metadata/`,
 * `manifest.json`, `integrity.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { PACKAGE_STRUCTURE } = require('./packageStructure.js');

/**
 * Erzeugt ein Package aus einem GameProject.
 * @param {object} project - GameProject-Objekt.
 * @param {string} outputDir - Wurzelverzeichnis, in das das Package geschrieben wird.
 * @returns {Promise<string>} Pfad zum Package-Verzeichnis.
 */
async function buildPackage(project, outputDir) {
  if (!project || !project.projectId) {
    throw new Error('buildPackage: Projekt mit projectId ist erforderlich');
  }

  const packageDir = path.join(outputDir, `package_${project.projectId}`);
  await fs.mkdir(packageDir, { recursive: true });

  // Verzeichnisse anlegen.
  for (const dir of PACKAGE_STRUCTURE.directories) {
    await fs.mkdir(path.join(packageDir, dir), { recursive: true });
  }

  // Game-Daten: Projekt als game/game.project.json.
  await fs.writeFile(
    path.join(packageDir, 'game', 'game.project.json'),
    JSON.stringify(project, null, 2),
    'utf8'
  );

  // Manifest (minimal, AP-9.3 füllt es aus).
  const manifest = {
    formatVersion: project.formatVersion || 1,
    experienceId: project.experienceId || '',
    projectId: project.projectId,
    name: project.name,
  };
  await fs.writeFile(
    path.join(packageDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // integrity.json (minimal, AP-9.4 füllt Hashes ein).
  await fs.writeFile(
    path.join(packageDir, 'integrity.json'),
    JSON.stringify({ hashes: {} }, null, 2),
    'utf8'
  );

  return packageDir;
}

module.exports = { buildPackage };
