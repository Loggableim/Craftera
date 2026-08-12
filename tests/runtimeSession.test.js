'use strict';

/**
 * Unit-Tests für die RuntimeSession (AP-7.10).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { saveProject } = require('../engine/serialization.js');
const { RuntimeSession, godotBinary } = require('../runtime/godot/runtimeSession.js');

function makeDataDir() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-session-'));
  const projectDir = path.join(dataDir, 'projects', 'exp_1');
  fs.mkdirSync(projectDir, { recursive: true });
  return { dataDir, projectDir };
}

async function seedProject(projectDir) {
  const project = createProject({ experienceId: 'exp_1', name: 'Session Test' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);
  await saveProject(projectDir, project);
  return { project, scene };
}

test('godotBinary liefert einen Pfad (nicht leer)', () => {
  assert.strictEqual(typeof godotBinary(), 'string');
  assert.ok(godotBinary().length > 0);
});

test('RuntimeSession start/stop steuert Godot real', async () => {
  const { dataDir, projectDir } = makeDataDir();
  await seedProject(projectDir);

  const session = new RuntimeSession({ dataDir, experienceId: 'exp_1', timeoutMs: 30000 });
  assert.strictEqual(session.status().state, 'stopped');

  const started = await session.start();
  assert.strictEqual(session.status().state, 'playing');
  assert.ok(started.pid > 0);
  assert.ok(started.mainScene.startsWith('scenes/'));

  const stopped = await session.stop();
  assert.strictEqual(stopped.state, 'stopped');
  assert.strictEqual(session.status().state, 'stopped');
});

test('RuntimeSession restart startet neu', async () => {
  const { dataDir, projectDir } = makeDataDir();
  await seedProject(projectDir);

  const session = new RuntimeSession({ dataDir, experienceId: 'exp_1', timeoutMs: 30000 });
  await session.start();
  const firstPid = session.status().pid;
  const restarted = await session.restart();
  assert.strictEqual(session.status().state, 'playing');
  assert.ok(restarted.pid > 0);
  assert.notStrictEqual(restarted.pid, firstPid);
  await session.stop();
});

test('RuntimeSession pause setzt Zustand paused', async () => {
  const { dataDir, projectDir } = makeDataDir();
  await seedProject(projectDir);

  const session = new RuntimeSession({ dataDir, experienceId: 'exp_1', timeoutMs: 30000 });
  await session.start();
  const paused = await session.pause();
  assert.strictEqual(paused.state, 'paused');
  assert.strictEqual(session.status().state, 'paused');
  await session.stop();
});

test('RuntimeSession pause wirft, wenn nicht playing', async () => {
  const { dataDir } = makeDataDir();
  const session = new RuntimeSession({ dataDir, experienceId: 'exp_1' });
  await assert.rejects(() => session.pause(), /Pause nur im Zustand "playing"/);
});

test('RuntimeSession start wirft, wenn kein Projekt', async () => {
  const { dataDir } = makeDataDir();
  const session = new RuntimeSession({ dataDir, experienceId: 'exp_missing' });
  await assert.rejects(() => session.start(), /kein Projekt/);
});
