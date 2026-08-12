'use strict';

/**
 * Craftera Platform API (AP-11.4).
 *
 * Stellt der Runtime eine Plattform-API bereit:
 *   getCurrentUser() — liefert den aktuellen lokalen Benutzer
 *   saveData(experienceId, data) — speichert Save-Daten einer Experience
 *   loadData(experienceId) — lädt Save-Daten einer Experience
 *
 * Saves liegen isoliert unter `<dataDir>/userdata/<experience-id>/save.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class PlatformApi {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
  }

  /** Liefert den aktuellen lokalen Benutzer. */
  async getCurrentUser() {
    return { id: 'local-user', name: 'Lokaler Benutzer' };
  }

  /** Pfad zur Save-Datei einer Experience. */
  _savePath(experienceId) {
    return path.join(this.dataDir, 'userdata', experienceId, 'save.json');
  }

  /** Speichert Save-Daten einer Experience. */
  async saveData(experienceId, data) {
    if (!experienceId) throw new Error('saveData: experienceId ist erforderlich');
    const filePath = this._savePath(experienceId);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
    return data;
  }

  /** Lädt Save-Daten einer Experience (oder null). */
  async loadData(experienceId) {
    if (!experienceId) throw new Error('loadData: experienceId ist erforderlich');
    try {
      const raw = await fs.readFile(this._savePath(experienceId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }
}

module.exports = { PlatformApi };
