'use strict';

/**
 * Unit-Tests für den ResourceCompiler (AP-7.5).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createProject } = require('../engine/project.js');
const {
  ResourceCompiler,
  compileAsset,
  compileAssets,
  buildImportFile,
  importClassFor,
  safeFileName,
} = require('../runtime/godot/resourceCompiler.js');

// 1x1 transparentes PNG als base64 (echte PNG-Magic-Bytes 89 50 4E 47, 70 Bytes).
const RED_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

test('safeFileName erzeugt sicheren Dateinamen', () => {
  assert.strictEqual(safeFileName('player.png'), 'player.png');
  assert.strictEqual(safeFileName('Player One'), 'Player_One');
  assert.strictEqual(safeFileName(''), 'asset');
});

test('importClassFor mappt Asset-Typen auf Godot-Import-Klassen', () => {
  assert.strictEqual(importClassFor('image'), 'Image');
  assert.strictEqual(importClassFor('audio'), 'AudioStreamWAV');
  assert.strictEqual(importClassFor('font'), 'FontFile');
  assert.strictEqual(importClassFor('text'), 'Text');
  assert.strictEqual(importClassFor('unbekannt'), 'Resource');
});

test('buildImportFile erzeugt .import-Inhalt', () => {
  const content = buildImportFile({ assetId: 'asset_abc', type: 'image', name: 'player.png' });
  assert.match(content, /importer="Image"/);
  assert.match(content, /source_file="res:\/\/assets\/player.png"/);
});

test('compileAsset schreibt Datei und .import-Datei', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-asset-'));
  const asset = { assetId: 'asset_1', type: 'image', name: 'player.png', data: RED_PNG_B64 };
  const rel = compileAsset(asset, outDir);
  assert.strictEqual(rel, 'assets/player.png');
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'player.png')));
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'player.png.import')));
  // PNG-Magic-Bytes prüfen.
  const buf = fs.readFileSync(path.join(outDir, 'assets', 'player.png'));
  assert.strictEqual(buf[0], 0x89);
  assert.strictEqual(buf[1], 0x50);
  assert.strictEqual(buf.length, 68);
});

test('compileAsset wirft ohne Daten', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-asset-'));
  assert.throws(() => compileAsset({ assetId: 'asset_1', name: 'x.png' }, outDir), /base64-Daten/);
});

test('compileAssets kompiliert alle Assets eines Projekts', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-assets-'));
  const project = createProject({ name: 'Game' });
  project.assets.push(
    { assetId: 'asset_1', type: 'image', name: 'player.png', data: RED_PNG_B64 },
    { assetId: 'asset_2', type: 'image', name: 'bg.png', data: RED_PNG_B64 }
  );
  const rels = compileAssets(project, outDir);
  assert.deepStrictEqual(rels, ['assets/player.png', 'assets/bg.png']);
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'player.png')));
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'bg.png')));
});

test('compileAssets wirft ohne assets-Array', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-assets-'));
  assert.throws(() => compileAssets({}, outDir), /assets-Array/);
});

test('ResourceCompiler-Interface ist verfügbar', () => {
  assert.strictEqual(typeof ResourceCompiler.compileAsset, 'function');
  assert.strictEqual(typeof ResourceCompiler.compileAssets, 'function');
});
