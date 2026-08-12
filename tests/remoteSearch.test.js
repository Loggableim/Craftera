'use strict';

/**
 * Integrationstests für Search (remote) (AP-15.8).
 * Suche remote nach Name und Tag.
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
const { LocalExperienceRegistry } = require('../platform/registry/localExperienceRegistry.js');

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
  const registry = new LocalExperienceRegistry(dataDir);
  await registry.publish(exp.experienceId);
  return exp.experienceId;
}

test('Search (remote): Suche nach Name', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    await publishExperience(dataDir, 'Puzzle Quest', ['puzzle']);

    const found = await remote.search('space');
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].name, 'Space Runner');
  } finally {
    server.close();
  }
});

test('Search (remote): Suche nach Tag', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    await publishExperience(dataDir, 'Racing Game', ['action']);

    const found = await remote.search('action');
    assert.strictEqual(found.length, 2);
  } finally {
    server.close();
  }
});

test('Search (remote): Suche ist case-insensitiv', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    const found = await remote.search('SPACE');
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].name, 'Space Runner');
  } finally {
    server.close();
  }
});

test('Search (remote): keine Treffer bei leerer Suche', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    await publishExperience(dataDir, 'Space Runner', ['action']);
    const found = await remote.search('gibtsnicht');
    assert.strictEqual(found.length, 0);
  } finally {
    server.close();
  }
});
