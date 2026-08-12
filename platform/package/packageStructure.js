'use strict';

/**
 * Craftera Package-Struktur (AP-9.1).
 *
 * Definiert die verbindliche Verzeichnis-/Dateistruktur eines Craftera
 * Packages. `validateStructure` prüft, ob ein Verzeichnis die Struktur erfüllt.
 *
 * Struktur:
 *   package/
 *   ├── manifest.json     — Metadaten (formatVersion, experienceId, …)
 *   ├── game/             — Game-Szenen/-Daten
 *   ├── assets/           — Assets (Sprites, Sounds, …)
 *   ├── runtime/          — Laufzeit-Dateien
 *   ├── metadata/         — Zusätzliche Metadaten
 *   └── integrity.json    — SHA-256-Hashes der Inhalte
 */

const fs = require('node:fs/promises');
const path = require('node:path');

// Verbindliche Struktur: Verzeichnisse und Pflicht-Dateien.
const PACKAGE_STRUCTURE = {
  directories: ['game', 'assets', 'runtime', 'metadata'],
  requiredFiles: ['manifest.json', 'integrity.json'],
};

/**
 * Prüft, ob ein Verzeichnis die Package-Struktur erfüllt.
 * @param {string} packageDir - Wurzelverzeichnis des Packages.
 * @returns {Promise<{ ok: boolean, missingDirs: string[], missingFiles: string[] }>}
 */
async function validateStructure(packageDir) {
  const missingDirs = [];
  const missingFiles = [];

  for (const dir of PACKAGE_STRUCTURE.directories) {
    try {
      await fs.access(path.join(packageDir, dir));
    } catch {
      missingDirs.push(dir);
    }
  }

  for (const file of PACKAGE_STRUCTURE.requiredFiles) {
    try {
      await fs.access(path.join(packageDir, file));
    } catch {
      missingFiles.push(file);
    }
  }

  return {
    ok: missingDirs.length === 0 && missingFiles.length === 0,
    missingDirs,
    missingFiles,
  };
}

module.exports = { PACKAGE_STRUCTURE, validateStructure };
