'use strict';
// Verifikation AP-7.11: Test as Published über den Server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { createExperience } = require('../engine/experience.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { saveProject } = require('../engine/serialization.js');

const PORT = 3995;
const dataDir = process.env.CRAFTERA_DATA_DIR
  ? path.resolve(process.env.CRAFTERA_DATA_DIR)
  : fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'craftera-published-'));

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
  const exp = createExperience({ name: 'Published Verify' });
  const expRes = await request('POST', '/api/experiences', exp);
  const experienceId = expRes.data.experienceId;
  console.log('CREATE_EXP', expRes.status, experienceId);

  const project = createProject({ experienceId, name: 'Published Verify' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);
  const projectDir = path.join(dataDir, 'projects', experienceId);
  fs.mkdirSync(projectDir, { recursive: true });
  await saveProject(projectDir, project);
  console.log('PROJECT_SAVED');

  const res = await request('POST', `/api/experiences/${experienceId}/test-published`);
  console.log('TEST_PUBLISHED', res.status, JSON.stringify(res.data));
  if (res.status === 200 && res.data.exitCode === 0 && res.data.packageDir) {
    console.log('VERIFY_OK');
  } else {
    console.log('VERIFY_FAIL');
    process.exit(1);
  }
})();
