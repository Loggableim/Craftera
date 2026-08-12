'use strict';

/**
 * Unit-Tests für den SceneCompiler (AP-7.4).
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
const {
  SceneCompiler,
  compileScene,
  compileSceneToFile,
  godotEscape,
  nodeNameFor,
} = require('../runtime/godot/sceneCompiler.js');

function makeScene() {
  const project = createProject({ name: 'Space Runner' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 10, y: 20, scale: 2, rotation: 45 } });
  addComponent(player, { type: 'sprite', props: { color: '#ff0000' } });
  project.entities.push(player);
  return { project, scene, player };
}

test('godotEscape escaped Anführungszeichen und Backslashes', () => {
  assert.strictEqual(godotEscape('a"b\\c'), 'a\\"b\\\\c');
});

test('nodeNameFor erzeugt gültigen Node-Namen', () => {
  assert.strictEqual(nodeNameFor({ name: 'Player' }), 'Player');
  assert.strictEqual(nodeNameFor({ name: 'Player One' }), 'Player_One');
  assert.strictEqual(nodeNameFor({}), 'Entity');
});

test('compileScene erzeugt gültige PackedScene mit Node pro Entity', () => {
  const { project, scene, player } = makeScene();
  const content = compileScene(scene, project);
  assert.match(content, /\[gd_scene load_steps=2 format=3\]/);
  assert.match(content, /\[node name="Player" type="Node2D" parent="\."\]/);
  assert.match(content, /position = Vector2\(10, 20\)/);
  assert.match(content, /rotation = 45/);
  assert.match(content, /scale = Vector2\(2, 2\)/);
  assert.ok(player.components.length === 1);
});

test('compileScene ignoriert Entities anderer Szenen', () => {
  const project = createProject({ name: 'Multi' });
  const sceneA = createScene({ name: 'A' });
  const sceneB = createScene({ name: 'B' });
  project.scenes.push(sceneA, sceneB);
  project.entities.push(createEntity({ sceneId: sceneA.sceneId, name: 'InA' }));
  project.entities.push(createEntity({ sceneId: sceneB.sceneId, name: 'InB' }));

  const contentA = compileScene(sceneA, project);
  assert.match(contentA, /name="InA"/);
  assert.ok(!contentA.includes('InB'));
});

test('compileScene wirft ohne sceneId', () => {
  const project = createProject({});
  assert.throws(() => compileScene({}, project), /sceneId/);
});

test('compileSceneToFile schreibt .tscn-Datei', () => {
  const { project, scene } = makeScene();
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-scene-'));
  const outFile = path.join(outDir, 'scene.tscn');
  const result = compileSceneToFile(scene, project, outFile);
  assert.strictEqual(result, path.resolve(outFile));
  assert.ok(fs.existsSync(outFile));
  const content = fs.readFileSync(outFile, 'utf8');
  assert.match(content, /\[gd_scene load_steps=2 format=3\]/);
});

test('SceneCompiler.compileScene ist verfügbar', () => {
  assert.strictEqual(typeof SceneCompiler.compileScene, 'function');
  assert.strictEqual(typeof SceneCompiler.compileSceneToFile, 'function');
});
