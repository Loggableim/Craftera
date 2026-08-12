'use strict';

/**
 * Integrationstests für list() (AP-10.3).
 * Alle Experiences, Liste korrekt.
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

test('list liefert alle registrierten Experiences', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await registry._save({ experiences: [
    { experienceId: 'exp_1', name: 'Space Runner', status: 'published' },
    { experienceId: 'exp_2', name: 'Puzzle', status: 'published' },
  ] });

  const list = await registry.list();
  assert.strictEqual(list.length, 2);
  assert.deepStrictEqual(list.map((e) => e.experienceId).sort(), ['exp_1', 'exp_2']);
});

test('list liefert leere Liste bei leerer Registry', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  assert.deepStrictEqual(await registry.list(), []);
});
