'use strict';

/**
 * Integrationstests für remove (AP-10.7).
 * Experience entfernt.
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
const { createProject } = require('../engine/project.js');
const { saveProject } = require('../engine/serialization.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

/** Publiziert und installiert eine Experience. */
async function makeInstalled() {
  const dir = await makeTempDataDir();
  const expRepo = new ExperienceRepository(dir);
  const experience = createExperience({ name: 'Space Runner' });
  await expRepo.save(experience);
  const project = createProject({ experienceId: experience.experienceId, name: 'Space Runner' });
  await saveProject(path.join(dir, 'projects', experience.experienceId), project);
  const registry = new LocalExperienceRegistry(dir);
  await registry.publish(experience.experienceId);
  await registry.install(experience.experienceId);
  return { dir, registry, experienceId: experience.experienceId };
}

test('remove entfernt installierten Bereich, Package und Registry-Eintrag', async () => {
  const { dir, registry, experienceId } = await makeInstalled();

  const result = await registry.remove(experienceId);
  assert.strictEqual(result.removed, true);

  // Installierter Bereich weg.
  const installedExists = await fs.stat(path.join(dir, 'installed', experienceId)).then(() => true).catch(() => false);
  assert.strictEqual(installedExists, false);

  // Package weg.
  const packageExists = await fs.stat(path.join(dir, 'packages', experienceId)).then(() => true).catch(() => false);
  assert.strictEqual(packageExists, false);

  // Registry-Eintrag weg.
  const registryData = JSON.parse(await fs.readFile(path.join(dir, 'registry.json'), 'utf8'));
  assert.strictEqual(registryData.experiences.length, 0);
});

test('remove ist idempotent (kein Fehler bei nicht vorhandener Experience)', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  const result = await registry.remove('exp_nope');
  assert.strictEqual(result.removed, true);
});
