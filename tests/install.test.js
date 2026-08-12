'use strict';

/**
 * Integrationstests für install (AP-10.5).
 * Kopiert Package in installierten Bereich.
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

/** Publiziert eine Experience und liefert Registry + experienceId. */
async function makePublished() {
  const dir = await makeTempDataDir();
  const expRepo = new ExperienceRepository(dir);
  const experience = createExperience({ name: 'Space Runner' });
  await expRepo.save(experience);
  const project = createProject({ experienceId: experience.experienceId, name: 'Space Runner' });
  await saveProject(path.join(dir, 'projects', experience.experienceId), project);
  const registry = new LocalExperienceRegistry(dir);
  await registry.publish(experience.experienceId);
  return { dir, registry, experienceId: experience.experienceId };
}

test('install kopiert Package in installierten Bereich', async () => {
  const { dir, registry, experienceId } = await makePublished();
  const result = await registry.install(experienceId);
  assert.strictEqual(result.installed, true);

  const installedDir = path.join(dir, 'installed', experienceId);
  const manifestExists = await fs.stat(path.join(installedDir, 'manifest.json')).then(() => true);
  assert.strictEqual(manifestExists, true);
  const gameExists = await fs.stat(path.join(installedDir, 'game', 'game.project.json')).then(() => true);
  assert.strictEqual(gameExists, true);
});

test('install markiert Experience als installed in der Registry', async () => {
  const { dir, registry, experienceId } = await makePublished();
  await registry.install(experienceId);
  const registryData = JSON.parse(await fs.readFile(path.join(dir, 'registry.json'), 'utf8'));
  assert.strictEqual(registryData.experiences[0].installed, true);
});

test('install wirft, wenn kein Package existiert', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await assert.rejects(() => registry.install('exp_nope'), /Kein Package/);
});
