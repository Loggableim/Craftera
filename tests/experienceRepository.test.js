'use strict';

/**
 * Integrationstests für das ExperienceRepository (AP-2.4).
 * Speichern + Laden in einem temporären Verzeichnis.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { ExperienceRepository } = require('../platform/experiences/experienceRepository.js');
const { createExperience } = require('../engine/experience.js');

/** Erzeugt ein temporäres Datenverzeichnis pro Test. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('save + get: Experience wird gespeichert und wieder geladen', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new ExperienceRepository(dataDir);

  const exp = createExperience({ name: 'Wizard Survivors', tags: ['roguelite'] });
  await repo.save(exp);

  const loaded = await repo.get(exp.experienceId);
  assert.ok(loaded, 'Experience muss geladen werden');
  assert.strictEqual(loaded.experienceId, exp.experienceId);
  assert.strictEqual(loaded.name, 'Wizard Survivors');
  assert.deepStrictEqual(loaded.tags, ['roguelite']);
});

test('get für nicht vorhandene Experience liefert null', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new ExperienceRepository(dataDir);
  const result = await repo.get('exp_nonexistent');
  assert.strictEqual(result, null);
});

test('list: mehrere Experiences werden gelistet', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new ExperienceRepository(dataDir);

  await repo.save(createExperience({ name: 'A' }));
  await repo.save(createExperience({ name: 'B' }));
  await repo.save(createExperience({ name: 'C' }));

  const list = await repo.list();
  assert.strictEqual(list.length, 3);
  const names = list.map((e) => e.name).sort();
  assert.deepStrictEqual(names, ['A', 'B', 'C']);
});

test('save: update überschreibt bestehende Experience', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new ExperienceRepository(dataDir);

  const exp = createExperience({ name: 'Alt' });
  await repo.save(exp);

  exp.name = 'Neu';
  await repo.save(exp);

  const loaded = await repo.get(exp.experienceId);
  assert.strictEqual(loaded.name, 'Neu');
});

test('save wirft ohne experienceId', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new ExperienceRepository(dataDir);
  await assert.rejects(() => repo.save({ name: 'X' }), /experienceId/);
});
