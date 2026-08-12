'use strict';

/**
 * Craftera Datenverzeichnis-Konvention (AP-2.6).
 *
 * Alle lokalen Laufzeit-Daten liegen unter `<repo-root>/.data/` und sind
 * per `.gitignore` von Git ausgeschlossen. Dieses Modul ist die zentrale
 * Quelle für den dataDir-Pfad, damit Repositories (ExperienceRepository,
 * VersionRepository) konsistent darauf zugreifen.
 *
 * Überschreibbar über die Umgebungsvariable CRAFTERA_DATA_DIR (z.B. für Tests).
 */

const path = require('node:path');

// Repo-Wurzel: zwei Ebenen über diesem Modul (server/src/dataDir.js).
const REPO_ROOT = path.resolve(__dirname, '..', '..');

/** Liefert den Pfad zum Datenverzeichnis. */
function getDataDir() {
  return process.env.CRAFTERA_DATA_DIR
    ? path.resolve(process.env.CRAFTERA_DATA_DIR)
    : path.join(REPO_ROOT, '.data');
}

module.exports = { getDataDir, REPO_ROOT };
