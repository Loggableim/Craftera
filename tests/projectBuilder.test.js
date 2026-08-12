'use strict';

/**
 * Unit-Tests für den ProjectBuilder (AP-7.8).
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
const { ProjectBuilder } = require('../runtime/godot/projectBuilder.js');

function makeFullProject() {
  const project = createProject({ name: 'Space Runner' });
  project.inputActions = [{ name: 'move_left', keys: ['A', 'Left'] }];

  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);

  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 10, y: 20 } });
  addComponent(player, { type: 'sprite', props: { color: '#ff0000' } });
  project.entities.push(player);

  // Asset (base64-PNG).
  project.assets.push({
    assetId: 'asset_1',
    type: 'image',
    name: 'player.png',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  });

  return project;
}

test('ProjectBuilder.build erzeugt lauffähiges Projekt', async () => {
  const project = makeFullProject();
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-build-'));
  const builder = new ProjectBuilder({ outputDir: outDir });

  const result = await builder.build(project);
  assert.strictEqual(result.outputDir, outDir);
  assert.ok(result.mainScene.startsWith('scenes/'));
  assert.strictEqual(result.scenes.length, 1);
  assert.strictEqual(result.assets.length, 1);
  assert.ok(result.scripts.includes('scripts/sprite.gd'));

  // Dateien existieren.
  assert.ok(fs.existsSync(path.join(outDir, 'project.godot')));
  assert.ok(fs.existsSync(path.join(outDir, 'scenes', `${project.scenes[0].sceneId}.tscn`)));
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'player.png')));
  assert.ok(fs.existsSync(path.join(outDir, 'scripts', 'sprite.gd')));

  // project.godot enthält InputMap + Main-Scene.
  const projectGodot = fs.readFileSync(path.join(outDir, 'project.godot'), 'utf8');
  assert.match(projectGodot, /input\/move_left=/);
  assert.match(projectGodot, new RegExp(`run/main_scene="res://${result.mainScene}"`));
});

test('ProjectBuilder.build ohne Szenen erzeugt Fallback-Scene', async () => {
  const project = createProject({ name: 'Empty' });
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-build-'));
  const builder = new ProjectBuilder({ outputDir: outDir });

  const result = await builder.build(project);
  assert.strictEqual(result.mainScene, 'scenes/empty.tscn');
  assert.ok(fs.existsSync(path.join(outDir, 'scenes', 'empty.tscn')));
  const projectGodot = fs.readFileSync(path.join(outDir, 'project.godot'), 'utf8');
  assert.match(projectGodot, /run\/main_scene="res:\/\/scenes\/empty.tscn"/);
});

test('ProjectBuilder.build wirft ohne scenes-Array', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-build-'));
  const builder = new ProjectBuilder({ outputDir: outDir });
  await assert.rejects(() => builder.build({}), /scenes-Array/);
});
