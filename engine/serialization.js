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

// Dateiname des serialisierten Projekts.
const PROJECT_FILENAME = 'game.project.json';

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
 * @param {string} dir - Quellverzeichnis.
 * @returns {object|null} GameProject oder null, wenn nicht vorhanden.
 */
async function loadProject(dir) {
  const filePath = path.join(dir, PROJECT_FILENAME);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return deserializeProject(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

module.exports = { serializeProject, deserializeProject, saveProject, loadProject, PROJECT_FILENAME };
