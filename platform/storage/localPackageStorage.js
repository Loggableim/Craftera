'use strict';

/**
 * Craftera LocalPackageStorage (AP-15.9).
 *
 * Dateisystem-Implementierung des PackageStorage-Interface.
 * Speichert Package-Archive unter `<dataDir>/uploads/<packageId>.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { PackageStorage } = require('./packageStorage.js');

class LocalPackageStorage extends PackageStorage {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    super();
    this.uploadDir = path.join(dataDir, 'uploads');
  }

  /** Pfad zur Archiv-Datei eines Packages. */
  _filePath(packageId) {
    return path.join(this.uploadDir, `${packageId}.json`);
  }

  /** Speichert ein Package-Archiv. */
  async put(packageId, archive) {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = this._filePath(packageId);
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(archive, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
    return { packageId, uploaded: true };
  }

  /** Lädt ein Package-Archiv. */
  async get(packageId) {
    try {
      const raw = await fs.readFile(this._filePath(packageId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /** Prüft, ob ein Package existiert. */
  async exists(packageId) {
    const archive = await this.get(packageId);
    return archive !== null;
  }
}

module.exports = { LocalPackageStorage };
