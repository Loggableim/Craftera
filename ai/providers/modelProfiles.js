'use strict';

/**
 * Craftera Model Profiles (AP-8.8).
 *
 * Konfigurierbare Zuordnung von Aufgaben zu Modellen/Providern.
 * Profile werden lokal persistiert (Settings speichert Profile).
 *
 * Beispiel:
 *   { "chat": { "provider": "openai", "model": "gpt-4o" },
 *     "codegen": { "provider": "anthropic", "model": "claude-3-5-sonnet" } }
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class ModelProfiles {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.filePath = path.join(dataDir, 'modelProfiles.json');
  }

  /** Lädt alle Profile aus der Datei. */
  async _load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
  }

  /** Speichert alle Profile in die Datei. */
  async _save(profiles) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(profiles, null, 2), 'utf8');
    await fs.rename(tmpPath, this.filePath);
  }

  /**
   * Setzt ein Profil für eine Aufgabe.
   * @param {string} task - Aufgaben-Name (z.B. "chat", "codegen").
   * @param {object} profile - { provider, model }.
   */
  async setProfile(task, profile) {
    if (!task || !profile || !profile.provider || !profile.model) {
      throw new Error('setProfile: task, profile.provider und profile.model sind erforderlich');
    }
    const profiles = await this._load();
    profiles[task] = { provider: profile.provider, model: profile.model };
    await this._save(profiles);
  }

  /**
   * Liest ein Profil für eine Aufgabe.
   * @param {string} task - Aufgaben-Name.
   * @returns {object|null} Profil oder null, wenn nicht konfiguriert.
   */
  async getProfile(task) {
    const profiles = await this._load();
    return profiles[task] || null;
  }

  /** Listet alle Aufgaben mit ihren Profilen. */
  async listProfiles() {
    return this._load();
  }
}

module.exports = { ModelProfiles };
