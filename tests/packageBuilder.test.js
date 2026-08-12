'use strict';

/**
 * Integrationstests für den Package Builder (AP-9.2).
 * Package erzeugbar, Package existiert mit korrekter Struktur.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { buildPackage } = require('../platform/package/packageBuilder.js');
const { validateStructure } = require('../platform/package/packageStructure.js');
const { createProject } = require('../engine/project.js');

/** Erzeugt ein temporäres Verzeichnis. */
async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('buildPackage erzeugt ein Package mit gültiger Struktur', async () => {
  const out = await makeTempDir();
  const project = createProject({ name: 'Space Runner' });
  const packageDir = await buildPackage(project, out);

  const result = await validateStructure(packageDir);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.missingDirs.length, 0);
  assert.strictEqual(result.missingFiles.length, 0);
});

test('buildPackage schreibt game.project.json und manifest.json', async () => {
  const out = await makeTempDir();
  const project = createProject({ name: 'Space Runner' });
  const packageDir = await buildPackage(project, out);

  const game = JSON.parse(await fs.readFile(path.join(packageDir, 'game', 'game.project.json'), 'utf8'));
  assert.strictEqual(game.projectId, project.projectId);

  const manifest = JSON.parse(await fs.readFile(path.join(packageDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.projectId, project.projectId);
  assert.strictEqual(manifest.name, 'Space Runner');
});

test('buildPackage wirft ohne Projekt', async () => {
  const out = await makeTempDir();
  await assert.rejects(() => buildPackage(null, out), /Projekt mit projectId/);
});
