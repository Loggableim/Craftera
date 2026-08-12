'use strict';

/**
 * Integrationstests für Visibility (AP-10.10).
 * Sichtbarkeit steuerbar, private nicht in Discover.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { LocalExperienceRegistry } = require('../platform/registry/localExperienceRegistry.js');
const { ExperienceRepository } = require('../platform/experiences/experienceRepository.js');
const { createExperience } = require('../engine/experience.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

/** Registry mit drei Experiences unterschiedlicher Sichtbarkeit. */
async function makeRegistry() {
  const dir = await makeTempDataDir();
  const expRepo = new ExperienceRepository(dir);
  const registry = new LocalExperienceRegistry(dir);

  const exp1 = createExperience({ name: 'Public' });
  const exp2 = createExperience({ name: 'Unlisted' });
  const exp3 = createExperience({ name: 'Private' });
  await expRepo.save(exp1);
  await expRepo.save(exp2);
  await expRepo.save(exp3);

  await registry.setVisibility(exp1.experienceId, 'PUBLIC');
  await registry.setVisibility(exp2.experienceId, 'UNLISTED');
  await registry.setVisibility(exp3.experienceId, 'PRIVATE');

  return { registry, exp1, exp2, exp3 };
}

test('setVisibility setzt die Sichtbarkeit', async () => {
  const { registry, exp1 } = await makeRegistry();
  const result = await registry.setVisibility(exp1.experienceId, 'PUBLIC');
  assert.strictEqual(result.visibility, 'PUBLIC');
});

test('setVisibility wirft bei ungültiger Sichtbarkeit', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await assert.rejects(() => registry.setVisibility('exp_1', 'NOPE'), /Ungültige Sichtbarkeit/);
});

test('listPublic schließt PRIVATE aus (private nicht in Discover)', async () => {
  const { registry, exp1, exp2, exp3 } = await makeRegistry();
  const publicList = await registry.listPublic();
  const ids = publicList.map((e) => e.experienceId);
  assert.ok(ids.includes(exp1.experienceId), 'PUBLIC enthalten');
  assert.ok(ids.includes(exp2.experienceId), 'UNLISTED enthalten');
  assert.ok(!ids.includes(exp3.experienceId), 'PRIVATE NICHT enthalten');
});
