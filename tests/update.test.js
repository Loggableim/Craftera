'use strict';

/**
 * Integrationstests für update (AP-10.6).
 * Neue Version installiert, Update wirkt.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { LocalExperienceRegistry } = require('../platform/registry/localExperienceRegistry.js');
const { ExperienceRepository } = require('../platform/experiences/experienceRepository.js');
const { VersionRepository } = require('../platform/experiences/versionRepository.js');
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

test('update publiziert eine neue Version und installiert sie', async () => {
  const { dir, registry, experienceId } = await makeInstalled();

  // Vor Update: 1 Version.
  const verRepo = new VersionRepository(dir);
  assert.strictEqual((await verRepo.list(experienceId)).length, 1);

  const result = await registry.update(experienceId);
  assert.strictEqual(result.status, 'updated');

  // Nach Update: 2 Versionen.
  const versions = await verRepo.list(experienceId);
  assert.strictEqual(versions.length, 2);
  assert.strictEqual(versions[1].versionNumber, 2);

  // Installierter Bereich enthält weiterhin ein gültiges Package.
  const installedDir = path.join(dir, 'installed', experienceId);
  const manifestExists = await fs.stat(path.join(installedDir, 'manifest.json')).then(() => true);
  assert.strictEqual(manifestExists, true);
});

test('update wirft, wenn Experience nicht existiert', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await assert.rejects(() => registry.update('exp_nope'), /nicht gefunden/);
});
