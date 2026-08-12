'use strict';

/**
 * Craftera Serialisierung (AP-4.6).
 *
 * `saveProject`/`loadProject` serialisieren ein GameProject exakt
 * reproduzierbar als `game.project.json` und laden es zurück.
 * Der Roundtrip (save → load) ist verlustfrei.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { FORMAT_VERSION } = require('./project.js');

// Dateiname des serialisierten Projekts.
const PROJECT_FILENAME = 'game.project.json';

// Migrationspfad: von einer älteren formatVersion auf die aktuelle.
// Jede Migration ist eine Funktion (project) => project.
const MIGRATIONS = {
  // Beispiel: 0 → 1 (noch keine echte Migration nötig, da v1 die erste ist).
};

/**
 * Prüft die formatVersion eines Projekts und wirft bei unbekannter Version.
 * @param {object} project - GameProject-Objekt.
 * @throws {Error} Wenn die Version nicht unterstützt wird.
 */
function assertSupportedVersion(project) {
  const version = project && project.formatVersion;
  if (version === undefined) {
    throw new Error('Projekt hat keine formatVersion');
  }
  if (version > FORMAT_VERSION) {
    throw new Error(`Projekt-Format v${version} ist neuer als unterstützt (v${FORMAT_VERSION})`);
  }
  if (version < 1) {
    throw new Error(`Projekt-Format v${version} ist unbekannt`);
  }
}

/**
 * Migriert ein Projekt von einer älteren formatVersion auf die aktuelle.
 * @param {object} project - GameProject-Objekt.
 * @returns {object} Migriertes Projekt.
 */
function migrateProject(project) {
  let current = project;
  while (current.formatVersion < FORMAT_VERSION) {
    const migration = MIGRATIONS[current.formatVersion];
    if (!migration) {
      throw new Error(`Keine Migration von v${current.formatVersion} nach v${FORMAT_VERSION} definiert`);
    }
    current = migration(current);
  }
  return current;
}

/**
 * Serialisiert ein GameProject zu einem JSON-String (exakt reproduzierbar).
 * @param {object} project - GameProject-Objekt.
 * @returns {string} JSON-String.
 */
function serializeProject(project) {
  return JSON.stringify(project, null, 2);
}

/**
 * Deserialisiert einen JSON-String zu einem GameProject.
 * @param {string} json - JSON-String.
 * @returns {object} GameProject-Objekt.
 */
function deserializeProject(json) {
  return JSON.parse(json);
}

/**
 * Speichert ein GameProject als `game.project.json` in einem Verzeichnis.
 * @param {string} dir - Zielverzeichnis.
 * @param {object} project - GameProject-Objekt.
 */
async function saveProject(dir, project) {
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, PROJECT_FILENAME);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, serializeProject(project), 'utf8');
  await fs.rename(tmpPath, filePath);
  return filePath;
}

/**
 * Lädt ein GameProject aus `game.project.json` in einem Verzeichnis.
 * Prüft die formatVersion und migriert ältere Versionen (AP-4.7).
 * @param {string} dir - Quellverzeichnis.
 * @returns {object|null} GameProject oder null, wenn nicht vorhanden.
 */
async function loadProject(dir) {
  const filePath = path.join(dir, PROJECT_FILENAME);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const project = deserializeProject(raw);
    assertSupportedVersion(project);
    return migrateProject(project);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

module.exports = {
  serializeProject, deserializeProject, saveProject, loadProject, PROJECT_FILENAME,
  assertSupportedVersion, migrateProject, MIGRATIONS,
};
