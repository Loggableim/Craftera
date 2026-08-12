'use strict';

/**
 * Integrationstests für den Play-Flow (AP-11.2).
 * Ablauf real: Check → Install/Update → Verify → Prepare; Start blockiert
 * ohne Runtime.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { playFlow } = require('../platform/player/playFlow.js');
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

test('playFlow führt Schritte bis Prepare aus und blockiert bei Start', async () => {
  const { dir, experienceId } = await makeInstalled();
  await assert.rejects(
    () => playFlow(dir, experienceId),
    /Start benötigt die Runtime/
  );
});

test('playFlow installiert automatisch, wenn nicht installiert', async () => {
  const dir = await makeTempDataDir();
  const expRepo = new ExperienceRepository(dir);
  const experience = createExperience({ name: 'Space Runner' });
  await expRepo.save(experience);
  const project = createProject({ experienceId: experience.experienceId, name: 'Space Runner' });
  await saveProject(path.join(dir, 'projects', experience.experienceId), project);
  const registry = new LocalExperienceRegistry(dir);
  await registry.publish(experience.experienceId);
  // NICHT installieren — playFlow soll es tun.

  await assert.rejects(
    () => playFlow(dir, experience.experienceId),
    /Start benötigt die Runtime/
  );
  // Nach playFlow ist die Experience installiert.
  const installedDir = path.join(dir, 'installed', experience.experienceId);
  const manifestExists = await fs.stat(path.join(installedDir, 'manifest.json')).then(() => true);
  assert.strictEqual(manifestExists, true);
});

test('playFlow wirft, wenn Experience nicht existiert', async () => {
  const dir = await makeTempDataDir();
  await assert.rejects(() => playFlow(dir, 'exp_nope'), /nicht gefunden/);
});
