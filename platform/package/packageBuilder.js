'use strict';

/**
 * Craftera Package Builder (AP-9.2).
 *
 * Erzeugt aus einem GameProject ein Package-Verzeichnis mit der verbindlichen
 * Struktur (AP-9.1): `game/`, `assets/`, `runtime/`, `metadata/`,
 * `manifest.json`, `integrity.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { PACKAGE_STRUCTURE } = require('./packageStructure.js');

// Pfade, die nie ins Package dürfen (Nicht-Laufzeitdaten, AP-9.8).
const EXCLUDED_PATTERNS = [
  '.git', '.gitignore', 'node_modules', '.data', 'credentials.json',
  'modelProfiles.json', '*.log', 'logs', 'ai-memory', 'memory',
];

/**
 * Prüft, ob ein relativer Pfad ausgeschlossen werden muss.
 * @param {string} relPath - Relativer Pfad.
 * @returns {boolean} true, wenn ausgeschlossen.
 */
function isExcluded(relPath) {
  const parts = relPath.split(/[\\/]/);
  return EXCLUDED_PATTERNS.some((pattern) => {
    if (pattern.includes('*')) {
      const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return parts.some((p) => re.test(p));
    }
    return parts.includes(pattern);
  });
}

/**
 * Erzeugt ein Package aus einem GameProject.
 * @param {object} project - GameProject-Objekt.
 * @param {string} outputDir - Wurzelverzeichnis, in das das Package geschrieben wird.
 * @param {object} opts - { sourceDir? } optionales Quellverzeichnis zum Kopieren von Laufzeitdaten.
 * @returns {Promise<string>} Pfad zum Package-Verzeichnis.
 */
async function buildPackage(project, outputDir, opts = {}) {
  if (!project || !project.projectId) {
    throw new Error('buildPackage: Projekt mit projectId ist erforderlich');
  }

  const packageDir = path.join(outputDir, `package_${project.projectId}`);
  await fs.mkdir(packageDir, { recursive: true });

  // Verzeichnisse anlegen.
  for (const dir of PACKAGE_STRUCTURE.directories) {
    await fs.mkdir(path.join(packageDir, dir), { recursive: true });
  }

  // Game-Daten: Projekt als game/game.project.json.
  await fs.writeFile(
    path.join(packageDir, 'game', 'game.project.json'),
    JSON.stringify(project, null, 2),
    'utf8'
  );

  // Manifest (minimal, AP-9.3 füllt es aus).
  const manifest = {
    formatVersion: project.formatVersion || 1,
    experienceId: project.experienceId || '',
    projectId: project.projectId,
    name: project.name,
  };
  await fs.writeFile(
    path.join(packageDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // integrity.json (minimal, AP-9.4 füllt Hashes ein).
  await fs.writeFile(
    path.join(packageDir, 'integrity.json'),
    JSON.stringify({ hashes: {} }, null, 2),
    'utf8'
  );

  // Laufzeitdaten aus sourceDir kopieren (Nicht-Laufzeitdaten ausschließen, AP-9.8).
  if (opts.sourceDir) {
    await copyRuntimeFiles(opts.sourceDir, packageDir);
  }

  return packageDir;
}

/**
 * Kopiert Laufzeitdateien aus sourceDir nach packageDir und schließt
 * Nicht-Laufzeitdaten aus (AI-Memory, Logs, Keys, Git-History).
 * @param {string} sourceDir - Quellverzeichnis.
 * @param {string} packageDir - Package-Wurzel.
 */
async function copyRuntimeFiles(sourceDir, packageDir) {
  async function walk(dir, relBase) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
      if (isExcluded(relPath)) continue;
      const src = path.join(dir, entry.name);
      const dest = path.join(packageDir, 'runtime', relPath);
      if (entry.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        await walk(src, relPath);
      } else {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
      }
    }
  }
  await walk(sourceDir, '');
}

module.exports = { buildPackage, isExcluded, EXCLUDED_PATTERNS };
