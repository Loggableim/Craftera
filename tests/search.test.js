'use strict';

/**
 * Integrationstests für search() (AP-10.4).
 * Suche nach Name/Tag, Suche filtert.
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

/** Registry mit Testdaten. */
async function makeRegistry() {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await registry._save({ experiences: [
    { experienceId: 'exp_1', name: 'Space Runner', tags: ['action', 'sci-fi'] },
    { experienceId: 'exp_2', name: 'Puzzle Quest', tags: ['puzzle'] },
    { experienceId: 'exp_3', name: 'Runner', tags: ['action'] },
  ] });
  return registry;
}

test('search filtert nach Name (case-insensitive)', async () => {
  const registry = await makeRegistry();
  const results = await registry.search('space');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Space Runner');
});

test('search filtert nach Tag', async () => {
  const registry = await makeRegistry();
  const results = await registry.search('puzzle');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Puzzle Quest');
});

test('search liefert mehrere Treffer bei gemeinsamem Tag', async () => {
  const registry = await makeRegistry();
  const results = await registry.search('action');
  assert.strictEqual(results.length, 2);
});

test('search mit leerer Query liefert alle Experiences', async () => {
  const registry = await makeRegistry();
  const results = await registry.search('');
  assert.strictEqual(results.length, 3);
});

test('search ohne Treffer liefert leere Liste', async () => {
  const registry = await makeRegistry();
  const results = await registry.search('gibtsnicht');
  assert.deepStrictEqual(results, []);
});
