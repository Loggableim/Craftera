'use strict';

/**
 * Integrationstests für die Remote-Registry (AP-15.1).
 * Startet einen echten HTTP-Server und testet den Client dagegen.
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

/** Startet einen Remote-Registry-Server auf einem freien Port. */
async function startServer(dataDir) {
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  return { server, port };
}

test('Remote-Registry: publish, list, search, visibility, install, remove', async () => {
  const dataDir = await makeTempDataDir();
  const { server, port } = await startServer(dataDir);
  const base = `http://127.0.0.1:${port}`;
  const remote = new RemoteExperienceRegistry(base);

  try {
    // Experience anlegen (direkt über das Repository, da der Server nur publiziert).
    const expRepo = new ExperienceRepository(dataDir);
    const exp = createExperience({ name: 'Space Runner', tags: ['action'] });
    await expRepo.save(exp);
    // Projekt anlegen (nötig für publish).
    const project = createProject({ experienceId: exp.experienceId, name: 'Space Runner' });
    await saveProject(path.join(dataDir, 'projects', exp.experienceId), project);

    // publish
    const pub = await remote.publish(exp.experienceId);
    assert.strictEqual(pub.status, 'published');

    // list (public)
    const list = await remote.list();
    assert.ok(list.some((e) => e.experienceId === exp.experienceId));

    // search
    const found = await remote.search('space');
    assert.ok(found.some((e) => e.experienceId === exp.experienceId));

    // visibility
    const vis = await remote.setVisibility(exp.experienceId, 'PUBLIC');
    assert.strictEqual(vis.visibility, 'PUBLIC');

    // install
    const inst = await remote.install(exp.experienceId);
    assert.strictEqual(inst.installed, true);

    // remove
    const removed = await remote.remove(exp.experienceId);
    assert.strictEqual(removed.removed, true);
    const after = await remote.list();
    assert.ok(!after.some((e) => e.experienceId === exp.experienceId));
  } finally {
    server.close();
  }
});

test('Remote-Registry: launch wirft (Runtime fehlt)', async () => {
  const dataDir = await makeTempDataDir();
  const { server, port } = await startServer(dataDir);
  const remote = new RemoteExperienceRegistry(`http://127.0.0.1:${port}`);
  try {
    await assert.rejects(() => remote.launch('exp_1'), /Runtime nicht verfügbar/);
  } finally {
    server.close();
  }
});
