'use strict';

/**
 * Unit-Tests für die LocalExperienceRegistry (AP-10.1).
 * Interface vorhanden; list/search funktionieren bereits.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { LocalExperienceRegistry } = require('../platform/registry/localExperienceRegistry.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('list liefert leere Liste bei leerer Registry', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  assert.deepStrictEqual(await registry.list(), []);
});

test('search filtert nach Name', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await registry._save({ experiences: [
    { experienceId: 'exp_1', name: 'Space Runner', tags: ['action'] },
    { experienceId: 'exp_2', name: 'Puzzle', tags: ['puzzle'] },
  ] });
  const results = await registry.search('space');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Space Runner');
});

test('search filtert nach Tag', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await registry._save({ experiences: [
    { experienceId: 'exp_1', name: 'Space Runner', tags: ['action'] },
    { experienceId: 'exp_2', name: 'Puzzle', tags: ['puzzle'] },
  ] });
  const results = await registry.search('puzzle');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Puzzle');
});

test('noch nicht implementierte Methoden werfen "nicht implementiert"', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await assert.rejects(() => registry.install('exp_1'), /nicht implementiert/);
  await assert.rejects(() => registry.update('exp_1'), /nicht implementiert/);
  await assert.rejects(() => registry.remove('exp_1'), /nicht implementiert/);
  await assert.rejects(() => registry.launch('exp_1'), /nicht implementiert/);
});
