'use strict';
// Verifikation AP-7.9: Server-Endpoint POST /api/experiences/:id/play
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { createExperience } = require('../engine/experience.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { saveProject } = require('../engine/serialization.js');

const PORT = 3997;
// Dasselbe Datenverzeichnis wie der Server (aus der Umgebung).
const dataDir = process.env.CRAFTERA_DATA_DIR
  ? path.resolve(process.env.CRAFTERA_DATA_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-play-verify-'));

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ host: '127.0.0.1', port: PORT, path: url, method, headers: { 'Content-Type': 'application/json' } }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(text); } catch { parsed = text; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  // Experience anlegen.
  const exp = createExperience({ name: 'Play Verify' });
  const expRes = await request('POST', '/api/experiences', exp);
  console.log('CREATE_EXP', expRes.status, expRes.data && expRes.data.experienceId);

  const experienceId = expRes.data.experienceId;

  // Projekt speichern.
  const project = createProject({ experienceId, name: 'Play Verify' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);
  const projectDir = path.join(dataDir, 'projects', experienceId);
  fs.mkdirSync(projectDir, { recursive: true });
  await saveProject(projectDir, project);
  console.log('PROJECT_SAVED');

  // Play-Endpoint aufrufen.
  const playRes = await request('POST', `/api/experiences/${experienceId}/play`);
  console.log('PLAY', playRes.status, JSON.stringify(playRes.data));
  if (playRes.status === 200 && playRes.data.exitCode === 0) {
    console.log('VERIFY_OK');
  } else {
    console.log('VERIFY_FAIL');
    process.exit(1);
  }
})();
