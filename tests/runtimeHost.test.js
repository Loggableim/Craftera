'use strict';

/**
 * Integrationstests für den Runtime Host (AP-11.3).
 * Host lädt Manifest + Projekt + Save.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { prepare } = require('../runtime/host/runtimeHost.js');
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
  return { dir, experienceId: experience.experienceId };
}

test('prepare liefert Manifest + Projekt + Save', async () => {
  const { dir, experienceId } = await makeInstalled();
  // Save anlegen.
  await fs.mkdir(path.join(dir, 'userdata', experienceId), { recursive: true });
  await fs.writeFile(path.join(dir, 'userdata', experienceId, 'save.json'), JSON.stringify({ score: 100 }));

  const data = await prepare(dir, experienceId);
  assert.strictEqual(data.manifest.experienceId, experienceId);
  assert.strictEqual(data.project.name, 'Space Runner');
  assert.deepStrictEqual(data.save, { score: 100 });
});

test('prepare liefert save=null, wenn kein Save existiert', async () => {
  const { dir, experienceId } = await makeInstalled();
  const data = await prepare(dir, experienceId);
  assert.strictEqual(data.save, null);
});

test('prepare wirft, wenn Experience nicht installiert ist', async () => {
  const dir = await makeTempDataDir();
  await assert.rejects(() => prepare(dir, 'exp_nope'), /nicht installiert/);
});
