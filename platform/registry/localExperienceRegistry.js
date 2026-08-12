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

const { ExperienceRepository } = require('../experiences/experienceRepository.js');
const { VersionRepository } = require('../experiences/versionRepository.js');
const { createVersion } = require('../../engine/version.js');
const { loadProject } = require('../../engine/serialization.js');
const { buildPackage } = require('../package/packageBuilder.js');

class LocalExperienceRegistry {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.filePath = path.join(dataDir, 'registry.json');
    this.experienceRepo = new ExperienceRepository(dataDir);
    this.versionRepo = new VersionRepository(dataDir);
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
    const experience = await this.experienceRepo.get(experienceId);
    if (!experience) {
      throw new Error(`publish: Experience "${experienceId}" nicht gefunden`);
    }

    // Projekt laden.
    const project = await loadProject(path.join(this.dataDir, 'projects', experienceId));
    if (!project) {
      throw new Error(`publish: Kein Projekt für Experience "${experienceId}"`);
    }

    // Package bauen.
    const packageDir = path.join(this.dataDir, 'packages', experienceId);
    await buildPackage(project, packageDir);

    // Version registrieren.
    const existingVersions = await this.versionRepo.list(experienceId);
    const version = createVersion({
      experienceId,
      versionNumber: existingVersions.length + 1,
    });
    version.status = 'PUBLISHED';
    await this.versionRepo.save(version);

    // Experience als published markieren.
    experience.status = 'published';
    await this.experienceRepo.save(experience);

    // Registry-Eintrag aktualisieren.
    const registry = await this._load();
    const entry = registry.experiences.find((e) => e.experienceId === experienceId);
    if (entry) {
      entry.status = 'published';
      entry.versionId = version.versionId;
    } else {
      registry.experiences.push({
        experienceId,
        name: experience.name,
        status: 'published',
        versionId: version.versionId,
      });
    }
    await this._save(registry);

    return { experienceId, status: 'published', versionId: version.versionId };
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

  /** Setzt die Sichtbarkeit einer Experience. (AP-10.10) */
  async setVisibility(experienceId, visibility) {
    const valid = ['PRIVATE', 'UNLISTED', 'PUBLIC'];
    const v = String(visibility || '').toUpperCase();
    if (!valid.includes(v)) {
      throw new Error(`setVisibility: Ungültige Sichtbarkeit "${visibility}"`);
    }

    const experience = await this.experienceRepo.get(experienceId);
    if (!experience) {
      throw new Error(`setVisibility: Experience "${experienceId}" nicht gefunden`);
    }
    experience.visibility = v;
    await this.experienceRepo.save(experience);

    const registry = await this._load();
    const entry = registry.experiences.find((e) => e.experienceId === experienceId);
    if (entry) {
      entry.visibility = v;
    } else {
      registry.experiences.push({
        experienceId,
        name: experience.name,
        visibility: v,
      });
    }
    await this._save(registry);

    return { experienceId, visibility: v };
  }

  /** Liefert nur öffentlich sichtbare Experiences (keine PRIVATE). (AP-10.10) */
  async listPublic() {
    const registry = await this._load();
    return registry.experiences.filter((e) => e.visibility !== 'PRIVATE');
  }

  /** Kopiert Package in installierten Bereich. (AP-10.5) */
  async install(experienceId) {
    const sourceDir = path.join(this.dataDir, 'packages', experienceId);
    const destDir = path.join(this.dataDir, 'installed', experienceId);

    // Prüfen, ob ein Package existiert.
    let entries;
    try {
      entries = await fs.readdir(sourceDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`install: Kein Package für Experience "${experienceId}"`);
      }
      throw err;
    }
    if (entries.length === 0) {
      throw new Error(`install: Kein Package für Experience "${experienceId}"`);
    }

    // Package-Inhalt (package_<projectId>/) in installierten Bereich kopieren.
    const packageSub = path.join(sourceDir, entries[0]);
    await fs.rm(destDir, { recursive: true, force: true });
    await fs.mkdir(destDir, { recursive: true });
    await copyDir(packageSub, destDir);

    // Registry-Eintrag als installed markieren.
    const registry = await this._load();
    const entry = registry.experiences.find((e) => e.experienceId === experienceId);
    if (entry) {
      entry.installed = true;
    }
    await this._save(registry);

    return { experienceId, installed: true };
  }

  /** Installiert neue Version. (AP-10.6) */
  async update(experienceId) {
    // Neue Version publizieren (erhöht versionNumber, baut neues Package).
    const published = await this.publish(experienceId);
    // Installierten Bereich mit dem neuen Package ersetzen.
    await this.install(experienceId);
    return { experienceId, status: 'updated', versionId: published.versionId };
  }

  /** Entfernt Experience. (AP-10.7) */
  async remove(experienceId) {
    // Installierten Bereich entfernen.
    await fs.rm(path.join(this.dataDir, 'installed', experienceId), { recursive: true, force: true });
    // Package entfernen.
    await fs.rm(path.join(this.dataDir, 'packages', experienceId), { recursive: true, force: true });

    // Registry-Eintrag entfernen.
    const registry = await this._load();
    registry.experiences = registry.experiences.filter((e) => e.experienceId !== experienceId);
    await this._save(registry);

    return { experienceId, removed: true };
  }

  /** Startet installierte Experience. (AP-10.8) */
  /**
   * Startet die installierte Experience über die Runtime (AP-10.8).
   * Lädt das installierte Projekt, baut es mit dem ProjectBuilder in ein
   * Godot-Projekt und startet Godot headless real.
   * @param {string} experienceId - ID der Experience.
   * @returns {Promise<object>} { outputDir, mainScene, pid }
   */
  async launch(experienceId) {
    const installedDir = path.join(this.dataDir, 'installed', experienceId);
    const project = await loadProject(path.join(installedDir, 'game'));
    if (!project) {
      throw new Error(`launch: Experience "${experienceId}" ist nicht installiert oder hat kein Projekt`);
    }

    const { ProjectBuilder } = require('../../runtime/godot/projectBuilder.js');
    const { RuntimeSession } = require('../../runtime/godot/runtimeSession.js');

    const buildDir = path.join(this.dataDir, 'builds', experienceId);
    const builder = new ProjectBuilder({ outputDir: buildDir });
    const built = await builder.build(project);

    // Kurzlebige Session starten und stoppen (Verifikation: Godot startet).
    const session = new RuntimeSession({ dataDir: this.dataDir, experienceId, buildDir });
    const started = await session.start();
    await session.stop();
    return {
      outputDir: built.outputDir,
      mainScene: built.mainScene,
      pid: started.pid,
    };
  }
}

module.exports = { LocalExperienceRegistry };

/** Kopiert ein Verzeichnis rekursiv. */
async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
