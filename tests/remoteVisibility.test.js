'use strict';

/**
 * Integrationstests für Public/Private (remote) (AP-15.7).
 * Sichtbarkeit remote setzen, PRIVATE aus öffentlicher Liste ausgeschlossen.
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

/** Publiziert eine Experience auf dem Server und liefert ihre ID. */
async function publishExperience(dataDir, name) {
  const expRepo = new ExperienceRepository(dataDir);
  const exp = createExperience({ name });
  await expRepo.save(exp);
  const project = createProject({ experienceId: exp.experienceId, name });
  await saveProject(path.join(dataDir, 'projects', exp.experienceId), project);
  const registry = new LocalExperienceRegistry(dataDir);
  await registry.publish(exp.experienceId);
  return exp.experienceId;
}

test('Public/Private (remote): PRIVATE wird aus öffentlicher Liste ausgeschlossen', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    const publicId = await publishExperience(dataDir, 'Space Runner');
    const privateId = await publishExperience(dataDir, 'Secret Game');

    // Beide sind initial public (sichtbar).
    assert.strictEqual((await remote.list()).length, 2);

    // Secret Game auf PRIVATE setzen.
    const vis = await remote.setVisibility(privateId, 'PRIVATE');
    assert.strictEqual(vis.visibility, 'PRIVATE');

    // Öffentliche Liste enthält nur noch Space Runner.
    const list = await remote.list();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].experienceId, publicId);
  } finally {
    server.close();
  }
});

test('Public/Private (remote): auf PUBLIC zurücksetzen macht wieder sichtbar', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    const id = await publishExperience(dataDir, 'Space Runner');
    await remote.setVisibility(id, 'PRIVATE');
    assert.strictEqual((await remote.list()).length, 0);

    await remote.setVisibility(id, 'PUBLIC');
    assert.strictEqual((await remote.list()).length, 1);
  } finally {
    server.close();
  }
});

test('Public/Private (remote): ungültige Sichtbarkeit wirft', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);

  try {
    const id = await publishExperience(dataDir, 'Space Runner');
    await assert.rejects(() => remote.setVisibility(id, 'NOPE'), /Ungültige Sichtbarkeit/);
  } finally {
    server.close();
  }
});
