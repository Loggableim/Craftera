'use strict';

/**
 * Craftera ExperienceRepository (AP-2.4).
 *
 * JSON-Persistenz für Experiences. Jede Experience wird als eigene
 * JSON-Datei unter `<dataDir>/experiences/<experienceId>.json` gespeichert.
 *
 * API: create, get, list, save.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class ExperienceRepository {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.experiencesDir = path.join(dataDir, 'experiences');
  }

  /** Stellt sicher, dass das Experiences-Verzeichnis existiert. */
  async _ensureDir() {
    await fs.mkdir(this.experiencesDir, { recursive: true });
  }

  /** Pfad zur JSON-Datei einer Experience. */
  _filePath(experienceId) {
    return path.join(this.experiencesDir, `${experienceId}.json`);
  }

  /**
   * Speichert eine Experience (create oder update).
   * @param {object} experience - Experience-Objekt mit `experienceId`.
   */
  async save(experience) {
    if (!experience || !experience.experienceId) {
      throw new Error('save: Experience benötigt eine experienceId');
    }
    await this._ensureDir();
    const filePath = this._filePath(experience.experienceId);
    // Atomisch schreiben: erst in Temp-Datei, dann umbenennen.
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(experience, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
    return experience;
  }

  /** Erstellt eine neue Experience (Alias für save). */
  async create(experience) {
    return this.save(experience);
  }

  /**
   * Lädt eine Experience anhand ihrer ID.
   * @returns {object|null} Experience oder null, wenn nicht vorhanden.
   */
  async get(experienceId) {
    try {
      const raw = await fs.readFile(this._filePath(experienceId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /** Listet alle Experiences. */
  async list() {
    await this._ensureDir();
    const entries = await fs.readdir(this.experiencesDir);
    const experiences = [];
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(this.experiencesDir, entry), 'utf8');
      experiences.push(JSON.parse(raw));
    }
    return experiences;
  }
}

module.exports = { ExperienceRepository };
