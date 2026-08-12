'use strict';

/**
 * Craftera Creator Identity (AP-15.3).
 *
 * Ein Creator-Profil verknüpft einen Auth-Account (AP-15.2) mit einer
 * öffentlichen Identität: handle, displayName, bio, avatar, createdAt.
 *
 * Persistenz unter `<dataDir>/creators/<userId>.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class CreatorProfileService {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.creatorsDir = path.join(dataDir, 'creators');
  }

  /** Pfad zum Profil eines Users. */
  _filePath(userId) {
    return path.join(this.creatorsDir, `${userId}.json`);
  }

  /** Erzeugt einen URL-freundlichen Handle aus einem Namen. */
  _slugify(name) {
    return String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Erstellt oder aktualisiert ein Creator-Profil.
   * @param {object} input - { userId, displayName, bio?, avatar? }.
   * @returns {Promise<object>} Creator-Profil.
   */
  async upsert({ userId, displayName, bio = '', avatar = '' }) {
    if (!userId) throw new Error('upsert: userId ist erforderlich');
    if (!displayName) throw new Error('upsert: displayName ist erforderlich');

    const profile = {
      userId,
      handle: this._slugify(displayName),
      displayName,
      bio: String(bio),
      avatar: String(avatar),
      createdAt: new Date().toISOString(),
    };

    await fs.mkdir(this.creatorsDir, { recursive: true });
    const filePath = this._filePath(userId);
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(profile, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
    return profile;
  }

  /**
   * Lädt ein Creator-Profil.
   * @param {string} userId - User-ID.
   * @returns {Promise<object|null>} Profil oder null.
   */
  async get(userId) {
    try {
      const raw = await fs.readFile(this._filePath(userId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }
}

module.exports = { CreatorProfileService };
