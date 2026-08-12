'use strict';

/**
 * Unit-Tests für den Play-Service (AP-7.9).
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
const { play, godotBinary } = require('../runtime/godot/playService.js');

function makeDataDir() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-play-'));
  const projectDir = path.join(dataDir, 'projects', 'exp_1');
  fs.mkdirSync(projectDir, { recursive: true });
  return { dataDir, projectDir };
}

test('godotBinary liefert einen Pfad (nicht leer)', () => {
  const bin = godotBinary();
  assert.strictEqual(typeof bin, 'string');
  assert.ok(bin.length > 0);
});

test('play wirft, wenn die Experience kein Projekt hat', async () => {
  const { dataDir } = makeDataDir();
  await assert.rejects(() => play(dataDir, 'exp_missing'), /kein Projekt/);
});

test('play baut das Projekt und startet Godot real (Exit 0)', async () => {
  const { dataDir, projectDir } = makeDataDir();

  const project = createProject({ experienceId: 'exp_1', name: 'Play Test' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);
  await saveProject(projectDir, project);

  const result = await play(dataDir, 'exp_1', { timeoutMs: 30000 });
  assert.strictEqual(result.exitCode, 0);
  assert.ok(result.outputDir.includes('exp_1'));
  assert.ok(result.mainScene.startsWith('scenes/'));
  assert.ok(fs.existsSync(path.join(result.outputDir, 'project.godot')));
  assert.ok(fs.existsSync(path.join(result.outputDir, 'scenes', `${scene.sceneId}.tscn`)));
});
