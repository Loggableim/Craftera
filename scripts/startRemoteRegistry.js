'use strict';
// Startet einen Remote-Registry-Server auf Port 3998 mit Testdaten.
const { RemoteRegistryServer } = require('./platform/registry/remote/remoteRegistryServer.js');
const { ExperienceRepository } = require('./platform/experiences/experienceRepository.js');
const { createExperience } = require('./engine/experience.js');
const { createProject } = require('./engine/project.js');
const { saveProject } = require('./engine/serialization.js');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'craftera-remote-'));
  const expRepo = new ExperienceRepository(dir);
  const exp = createExperience({ name: 'Space Runner', tags: ['action'] });
  await expRepo.save(exp);
  const project = createProject({ experienceId: exp.experienceId, name: 'Space Runner' });
  await saveProject(path.join(dir, 'projects', exp.experienceId), project);
  const server = new RemoteRegistryServer(dir);
  const port = await server.listen(3998);
  console.log(`[remote-registry] läuft auf http://127.0.0.1:${port}`);
  console.log(`[remote-registry] Experience-ID: ${exp.experienceId}`);
  console.log(`[remote-registry] Datenverzeichnis: ${dir}`);
})();
