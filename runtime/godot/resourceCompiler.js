'use strict';

/**
 * Craftera ResourceCompiler (AP-7.5).
 *
 * Importiert Assets eines GameProject (engine/project.js) als Godot-Resources
 * in ein Godot-Projekt. Ein Asset hat die Form:
 *   { assetId, type, name, data }   // data = base64-kodierter Inhalt
 *   type = Kategorie: 'image' | 'audio' | 'font' | 'text' | ...
 *
 * Der Compiler schreibt jedes Asset als Datei unter `assets/` im Zielprojekt
 * und erzeugt eine passende `.import`-Datei (Godot-Import-Metadaten).
 * Verifikation (DoD): "Godot zeigt Assets" — Godot importiert die Dateien
 * headless (erzeugt `.import`-Dateien) ohne Fehler.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Erzeugt einen sicheren Dateinamen aus einem Asset-Namen.
 */
function safeFileName(name) {
  const base = String(name || 'asset').replace(/[^A-Za-z0-9._-]/g, '_');
  return base || 'asset';
}

/**
 * Mappt eine Asset-Kategorie auf die Godot-Import-Klasse.
 * @param {string} type - 'image' | 'audio' | 'font' | 'text' | ...
 * @returns {string} Godot-Import-Klasse.
 */
function importClassFor(type) {
  const map = {
    image: 'Image',
    audio: 'AudioStreamWAV',
    font: 'FontFile',
    text: 'Text',
  };
  return map[String(type || '')] || 'Resource';
}

/**
 * Erzeugt den Inhalt einer Godot-`.import`-Datei.
 * @param {object} asset - { assetId, type, name }.
 * @returns {string}
 */
function buildImportFile(asset) {
  const importer = importClassFor(asset.type);
  const source = `res://assets/${safeFileName(asset.name)}`;
  return `[remap]

importer="${importer}"
type="Resource"
uid="uid://${String(asset.assetId || 'asset').replace(/[^a-zA-Z0-9]/g, '')}"

[deps]

source_file="${source}"
dest_files=["res://.godot/imported/${safeFileName(asset.name)}-${String(asset.assetId || 'asset').replace(/[^a-zA-Z0-9]/g, '')}.ctex"]

[params]
`;
}

/**
 * Kompiliert ein einzelnes Asset: schreibt die Datei und die `.import`-Datei.
 * @param {object} asset - { assetId, type, name, data }.
 * @param {string} outDir - Zielverzeichnis (z.B. <projekt>).
 * @returns {string} Relativer Pfad (z.B. "assets/player.png").
 */
function compileAsset(asset, outDir) {
  if (!asset || typeof asset.data !== 'string') {
    throw new Error('ResourceCompiler.compileAsset: Asset benötigt base64-Daten');
  }
  if (!asset.assetId) {
    throw new Error('ResourceCompiler.compileAsset: Asset benötigt eine assetId');
  }

  const fileName = safeFileName(asset.name);
  const absPath = path.join(outDir, 'assets', fileName);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, Buffer.from(asset.data, 'base64'));
  fs.writeFileSync(`${absPath}.import`, buildImportFile(asset), 'utf8');
  return `assets/${fileName}`;
}

/**
 * Kompiliert alle Assets eines GameProject.
 * @param {object} project - GameProject mit `assets`-Array.
 * @param {string} outDir - Zielverzeichnis.
 * @returns {string[]} Relative Asset-Pfade.
 */
function compileAssets(project, outDir) {
  if (!project || !Array.isArray(project.assets)) {
    throw new Error('ResourceCompiler.compileAssets: GameProject benötigt ein assets-Array');
  }
  const compiled = [];
  for (const asset of project.assets) {
    compiled.push(compileAsset(asset, outDir));
  }
  return compiled;
}

/**
 * ResourceCompiler — importiert GameProject-Assets als Godot-Resources.
 */
class ResourceCompiler {
  /**
   * @param {object} options - { outputDir }
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), '.godot-build');
  }

  /**
   * Kompiliert alle Assets des Projekts in das Zielprojekt.
   * @param {object} project - GameProject.
   * @returns {Promise<string[]>} Relative Asset-Pfade.
   */
  async compile(project) {
    return compileAssets(project, this.outputDir);
  }
}

// Statische Zugriffe (kompatibel mit Tests).
ResourceCompiler.compileAsset = compileAsset;
ResourceCompiler.compileAssets = compileAssets;

module.exports = {
  ResourceCompiler,
  compileAsset,
  compileAssets,
  buildImportFile,
  importClassFor,
  safeFileName,
};
