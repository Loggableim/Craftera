'use strict';

/**
 * Integrationstests für publish (AP-10.2).
 * Baut Package, registriert Version, markiert published.
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

test('publish baut Package, registriert Version und markiert published', async () => {
  const dir = await makeTempDataDir();

  // Experience anlegen.
  const expRepo = new ExperienceRepository(dir);
  const experience = createExperience({ name: 'Space Runner' });
  await expRepo.save(experience);

  // Projekt speichern.
  const project = createProject({ experienceId: experience.experienceId, name: 'Space Runner' });
  await saveProject(path.join(dir, 'projects', experience.experienceId), project);

  // Publizieren.
  const registry = new LocalExperienceRegistry(dir);
  const result = await registry.publish(experience.experienceId);
  assert.strictEqual(result.status, 'published');

  // Experience ist published.
  const published = await expRepo.get(experience.experienceId);
  assert.strictEqual(published.status, 'published');

  // Version registriert.
  const verRepo = new VersionRepository(dir);
  const versions = await verRepo.list(experience.experienceId);
  assert.strictEqual(versions.length, 1);
  assert.strictEqual(versions[0].status, 'PUBLISHED');

  // Package existiert (buildPackage erzeugt package_<projectId>/).
  const packagesDir = path.join(dir, 'packages', experience.experienceId);
  const entries = await fs.readdir(packagesDir);
  const packageSub = path.join(packagesDir, entries[0]);
  const manifestExists = await fs.stat(path.join(packageSub, 'manifest.json')).then(() => true);
  assert.strictEqual(manifestExists, true);

  // Registry-Eintrag.
  const registryData = JSON.parse(await fs.readFile(path.join(dir, 'registry.json'), 'utf8'));
  assert.strictEqual(registryData.experiences[0].status, 'published');
});

test('publish wirft, wenn Experience nicht existiert', async () => {
  const dir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dir);
  await assert.rejects(() => registry.publish('exp_nope'), /nicht gefunden/);
});
