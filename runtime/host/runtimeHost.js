'use strict';

/**
 * Craftera Runtime Host (AP-11.3).
 *
 * `prepare(experienceId)` lädt Manifest + Projekt + Save für eine installierte
 * Experience und liefert die Daten an die Runtime. Ohne externe Runtime
 * (Godot) ist die Datenvorbereitung real testbar.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * Bereitet die Laufzeitdaten einer installierten Experience vor.
 * @param {string} dataDir - Datenverzeichnis.
 * @param {string} experienceId - ID der Experience.
 * @returns {Promise<object>} { manifest, project, save }.
 */
async function prepare(dataDir, experienceId) {
  const installedDir = path.join(dataDir, 'installed', experienceId);

  // Manifest laden.
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(path.join(installedDir, 'manifest.json'), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`prepare: Experience "${experienceId}" ist nicht installiert`);
    }
    throw err;
  }

  // Projekt laden.
  const project = JSON.parse(await fs.readFile(path.join(installedDir, 'game', 'game.project.json'), 'utf8'));

  // Save laden (falls vorhanden, sonst null).
  let save = null;
  try {
    save = JSON.parse(await fs.readFile(path.join(dataDir, 'userdata', experienceId, 'save.json'), 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  return { manifest, project, save };
}

module.exports = { prepare };
