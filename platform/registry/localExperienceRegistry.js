'use strict';

/**
 * Craftera LocalExperienceRegistry (AP-10.1).
 *
 * Verwaltet lokal installierte/publizierte Experiences. Persistenz unter
 * `<dataDir>/registry.json`. Die Methoden bilden das Interface, das die
 * Folge-APs (AP-10.2 … AP-10.8) füllen.
 *
 * Interface:
 *   publish(experienceId)  — baut Package, registriert Version, markiert published
 *   list()                 — alle Experiences
 *   search(query)          — Suche nach Name/Tag
 *   install(experienceId)  — kopiert Package in installierten Bereich
 *   update(experienceId)   — installiert neue Version
 *   remove(experienceId)   — entfernt Experience
 *   launch(experienceId)   — startet installierte Experience
 */

const fs = require('node:fs/promises');
const path = require('node:path');

class LocalExperienceRegistry {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.filePath = path.join(dataDir, 'registry.json');
  }

  /** Lädt die Registry aus der Datei. */
  async _load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return { experiences: [] };
      throw err;
    }
  }

  /** Speichert die Registry in die Datei. */
  async _save(registry) {
    await fs.mkdir(this.dataDir, { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(registry, null, 2), 'utf8');
    await fs.rename(tmpPath, this.filePath);
  }

  /** Baut Package, registriert Version, markiert published. (AP-10.2) */
  async publish(experienceId) {
    throw new Error('LocalExperienceRegistry.publish ist nicht implementiert (AP-10.2)');
  }

  /** Liefert alle Experiences. (AP-10.3) */
  async list() {
    const registry = await this._load();
    return registry.experiences;
  }

  /** Sucht nach Name/Tag. (AP-10.4) */
  async search(query) {
    const registry = await this._load();
    const q = String(query || '').toLowerCase();
    if (!q) return registry.experiences;
    return registry.experiences.filter((exp) => {
      const nameMatch = String(exp.name || '').toLowerCase().includes(q);
      const tagMatch = (exp.tags || []).some((tag) => String(tag).toLowerCase().includes(q));
      return nameMatch || tagMatch;
    });
  }

  /** Kopiert Package in installierten Bereich. (AP-10.5) */
  async install(experienceId) {
    throw new Error('LocalExperienceRegistry.install ist nicht implementiert (AP-10.5)');
  }

  /** Installiert neue Version. (AP-10.6) */
  async update(experienceId) {
    throw new Error('LocalExperienceRegistry.update ist nicht implementiert (AP-10.6)');
  }

  /** Entfernt Experience. (AP-10.7) */
  async remove(experienceId) {
    throw new Error('LocalExperienceRegistry.remove ist nicht implementiert (AP-10.7)');
  }

  /** Startet installierte Experience. (AP-10.8) */
  async launch(experienceId) {
    throw new Error('LocalExperienceRegistry.launch ist nicht implementiert (AP-10.8)');
  }
}

module.exports = { LocalExperienceRegistry };
