'use strict';

/**
 * Craftera Package-Validierung (AP-9.5).
 *
 * Prüft, ob ein Package vollständig ist: Struktur (AP-9.1), Pflicht-Dateien
 * und referenzierte Assets vorhanden. Fehlende Datei → Fehler.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { PACKAGE_STRUCTURE } = require('./packageStructure.js');

/**
 * Prüft ein Package auf Vollständigkeit.
 * @param {string} packageDir - Wurzelverzeichnis des Packages.
 * @returns {Promise<{ ok: boolean, errors: string[] }>}
 */
async function validatePackage(packageDir) {
  const errors = [];

  // Pflicht-Dateien müssen existieren.
  for (const file of PACKAGE_STRUCTURE.requiredFiles) {
    try {
      await fs.access(path.join(packageDir, file));
    } catch {
      errors.push(`Fehlende Pflicht-Datei: ${file}`);
    }
  }

  // Pflicht-Verzeichnisse müssen existieren.
  for (const dir of PACKAGE_STRUCTURE.directories) {
    try {
      await fs.access(path.join(packageDir, dir));
    } catch {
      errors.push(`Fehlendes Verzeichnis: ${dir}`);
    }
  }

  // Referenzierte Assets müssen im assets/-Verzeichnis existieren.
  // Referenzen stehen im Manifest unter assets: [...].
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(packageDir, 'manifest.json'), 'utf8'));
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    for (const asset of assets) {
      try {
        await fs.access(path.join(packageDir, 'assets', asset));
      } catch {
        errors.push(`Fehlendes Asset: ${asset}`);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      errors.push(`Manifest nicht lesbar: ${err.message}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { validatePackage };
