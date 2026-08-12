'use strict';
// Verifikation AP-7.10: Play-Modi pause/stop/restart über den Server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { createExperience } = require('../engine/experience.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { saveProject } = require('../engine/serialization.js');

const PORT = 3996;
const dataDir = process.env.CRAFTERA_DATA_DIR
  ? path.resolve(process.env.CRAFTERA_DATA_DIR)
  : fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'craftera-modes-'));

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
  const exp = createExperience({ name: 'Modes Verify' });
  const expRes = await request('POST', '/api/experiences', exp);
  const experienceId = expRes.data.experienceId;
  console.log('CREATE_EXP', expRes.status, experienceId);

  const project = createProject({ experienceId, name: 'Modes Verify' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);
  const projectDir = path.join(dataDir, 'projects', experienceId);
  fs.mkdirSync(projectDir, { recursive: true });
  await saveProject(projectDir, project);
  console.log('PROJECT_SAVED');

  // Play starten (persistente Session).
  const playRes = await request('POST', `/api/experiences/${experienceId}/play`);
  console.log('PLAY', playRes.status, JSON.stringify(playRes.data));
  if (playRes.status !== 200 || !playRes.data.pid) {
    console.log('VERIFY_FAIL (play)');
    process.exit(1);
  }

  // Pause.
  const pauseRes = await request('POST', `/api/experiences/${experienceId}/play/pause`);
  console.log('PAUSE', pauseRes.status, JSON.stringify(pauseRes.data));
  if (pauseRes.status !== 200 || pauseRes.data.state !== 'paused') {
    console.log('VERIFY_FAIL (pause)');
    process.exit(1);
  }

  // Stop.
  const stopRes = await request('POST', `/api/experiences/${experienceId}/play/stop`);
  console.log('STOP', stopRes.status, JSON.stringify(stopRes.data));
  if (stopRes.status !== 200 || stopRes.data.state !== 'stopped') {
    console.log('VERIFY_FAIL (stop)');
    process.exit(1);
  }

  // Restart.
  const restartRes = await request('POST', `/api/experiences/${experienceId}/play/restart`);
  console.log('RESTART', restartRes.status, JSON.stringify(restartRes.data));
  if (restartRes.status !== 200 || !restartRes.data.pid) {
    console.log('VERIFY_FAIL (restart)');
    process.exit(1);
  }

  // Aufräumen: Stop.
  await request('POST', `/api/experiences/${experienceId}/play/stop`);
  console.log('VERIFY_OK');
})();
