'use strict';

/**
 * Craftera VersionRepository (AP-2.5).
 *
 * JSON-Persistenz für ExperienceVersionen, gruppiert pro Experience.
 * Jede Version liegt unter `<dataDir>/versions/<experienceId>/<versionId>.json`.
 *
 * API: create, get, list (Versionen einer Experience).
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class VersionRepository {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.versionsDir = path.join(dataDir, 'versions');
  }

  /** Verzeichnis der Versionen einer Experience. */
  _experienceDir(experienceId) {
    return path.join(this.versionsDir, experienceId);
  }

  /** Pfad zur JSON-Datei einer Version. */
  _filePath(experienceId, versionId) {
    return path.join(this._experienceDir(experienceId), `${versionId}.json`);
  }

  /**
   * Speichert eine Version (create oder update).
   * @param {object} version - Version-Objekt mit `versionId` und `experienceId`.
   */
  async save(version) {
    if (!version || !version.versionId || !version.experienceId) {
      throw new Error('save: Version benötigt versionId und experienceId');
    }
    const dir = this._experienceDir(version.experienceId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = this._filePath(version.experienceId, version.versionId);
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(version, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
    return version;
  }

  /** Erstellt eine neue Version (Alias für save). */
  async create(version) {
    return this.save(version);
  }

  /**
   * Lädt eine Version einer Experience.
   * @returns {object|null} Version oder null, wenn nicht vorhanden.
   */
  async get(experienceId, versionId) {
    try {
      const raw = await fs.readFile(this._filePath(experienceId, versionId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /** Listet alle Versionen einer Experience. */
  async list(experienceId) {
    const dir = this._experienceDir(experienceId);
    let entries;
    try {
      entries = await fs.readdir(dir);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
    const versions = [];
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(dir, entry), 'utf8');
      versions.push(JSON.parse(raw));
    }
    return versions;
  }
}

module.exports = { VersionRepository };
