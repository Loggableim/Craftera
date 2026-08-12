'use strict';

/**
 * Integrationstests für List Experiences (remote) (AP-15.6).
 * Liste kommt vom Server, mehrere Experiences, Suche.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { RemoteRegistryServer } = require('../platform/registry/remote/remoteRegistryServer.js');
const { RemoteExperienceRegistry } = require('../platform/registry/remote/remoteExperienceRegistry.js');
const { ExperienceRepository } = require('../platform/experiences/experienceRepository.js');
const { createExperience } = require('../engine/experience.js');
const { createProject } = require('../engine/project.js');
const { saveProject } = require('../engine/serialization.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

/** Publiziert eine Experience auf dem Server. */
async function publishExperience(dataDir, name, tags) {
  const expRepo = new ExperienceRepository(dataDir);
  const exp = createExperience({ name, tags });
  await expRepo.save(exp);
  const project = createProject({ experienceId: exp.experienceId, name });
  await saveProject(path.join(dataDir, 'projects', exp.experienceId), project);
  const registry = new (require('../platform/registry/localExperienceRegistry.js').LocalExperienceRegistry)(dataDir);
  await registry.publish(exp.experienceId);
  return exp.experienceId;
}

test('List Experiences (remote): Liste kommt vom Server', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    await publishExperience(dataDir, 'Puzzle Quest', ['puzzle']);

    const list = await remote.list();
    assert.strictEqual(list.length, 2);
    const names = list.map((e) => e.name);
    assert.ok(names.includes('Space Runner'));
    assert.ok(names.includes('Puzzle Quest'));
  } finally {
    server.close();
  }
});

test('List Experiences (remote): Suche filtert vom Server', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    await publishExperience(dataDir, 'Puzzle Quest', ['puzzle']);

    const found = await remote.search('puzzle');
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].name, 'Puzzle Quest');
  } finally {
    server.close();
  }
});

test('List Experiences (remote): leere Liste, wenn nichts publiziert', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    assert.deepStrictEqual(await remote.list(), []);
  } finally {
    server.close();
  }
});
