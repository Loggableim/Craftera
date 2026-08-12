'use strict';

/**
 * Craftera Credential Store (AP-8.7).
 *
 * Speichert API-Keys lokal und sicher — niemals in Git oder in Projekt-Dateien.
 * Keys liegen unter `<dataDir>/credentials.json` (`.data/` ist gitignored).
 *
 * API:
 *   set(key, value)  — speichert einen Key
 *   get(key)         — liest einen Key (oder null)
 *   list()           — listet alle Key-Namen (ohne Werte)
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class CredentialStore {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.filePath = path.join(dataDir, 'credentials.json');
  }

  /** Lädt alle Credentials aus der Datei. */
  async _load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
  }

  /** Speichert alle Credentials in die Datei. */
  async _save(credentials) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(credentials, null, 2), 'utf8');
    await fs.rename(tmpPath, this.filePath);
  }

  /** Speichert einen Key. */
  async set(key, value) {
    const credentials = await this._load();
    credentials[key] = String(value);
    await this._save(credentials);
  }

  /** Liest einen Key (oder null). */
  async get(key) {
    const credentials = await this._load();
    return credentials[key] !== undefined ? credentials[key] : null;
  }

  /** Listet alle Key-Namen (ohne Werte). */
  async list() {
    const credentials = await this._load();
    return Object.keys(credentials);
  }
}

module.exports = { CredentialStore };
