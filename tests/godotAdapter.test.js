'use strict';

/**
 * Unit-Tests für den GodotAdapter (AP-7.3).
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
  GodotAdapter,
  buildProjectGodot,
  buildSceneTscn,
  buildRootGd,
  godotEscape,
} = require('../runtime/godot/godotAdapter.js');

function makeProject() {
  const project = createProject({ experienceId: 'exp_1', name: 'Space Runner' });
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

test('buildProjectGodot erzeugt project.godot mit Name und Main-Scene', () => {
  const content = buildProjectGodot({ name: 'Space Runner' }, 'scenes/scene_1.tscn');
  assert.match(content, /config\/name="Space Runner"/);
  assert.match(content, /run\/main_scene="res:\/\/scenes\/scene_1.tscn"/);
  assert.match(content, /config_version=5/);
});

test('buildSceneTscn erzeugt einen Node pro Entity mit Position', () => {
  const { project, scene, player } = makeProject();
  const content = buildSceneTscn(scene, project);
  assert.match(content, /\[gd_scene load_steps=2 format=3\]/);
  assert.match(content, /\[node name="Player" type="Node2D" parent="\."\]/);
  assert.match(content, /position = Vector2\(10, 20\)/);
  assert.match(content, /rotation = 45/);
  assert.match(content, /scale = Vector2\(2, 2\)/);
  assert.ok(player.components.length === 1);
});

test('buildRootGd erzeugt gültiges GDScript', () => {
  const content = buildRootGd();
  assert.match(content, /extends Node2D/);
  assert.match(content, /func _ready\(\) -> void:/);
});

test('GodotAdapter.build erzeugt Projekt-Dateien auf der Platte', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-godot-'));
  const adapter = new GodotAdapter({ outputDir: outDir });
  const { project } = makeProject();

  const result = await adapter.build(project);
  assert.strictEqual(result, outDir);
  assert.ok(fs.existsSync(path.join(outDir, 'project.godot')));
  assert.ok(fs.existsSync(path.join(outDir, 'scripts', 'root.gd')));
  assert.ok(fs.existsSync(path.join(outDir, 'scenes', `${project.scenes[0].sceneId}.tscn`)));

  const projectGodot = fs.readFileSync(path.join(outDir, 'project.godot'), 'utf8');
  assert.match(projectGodot, /config\/name="Space Runner"/);
});

test('GodotAdapter.build ohne Szenen erzeugt Fallback-Scene', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-godot-'));
  const adapter = new GodotAdapter({ outputDir: outDir });
  const project = createProject({ name: 'Empty' });

  await adapter.build(project);
  assert.ok(fs.existsSync(path.join(outDir, 'scenes', 'empty.tscn')));
  const projectGodot = fs.readFileSync(path.join(outDir, 'project.godot'), 'utf8');
  assert.match(projectGodot, /run\/main_scene="res:\/\/scenes\/empty.tscn"/);
});

test('GodotAdapter.build wirft ohne scenes-Array', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-godot-'));
  const adapter = new GodotAdapter({ outputDir: outDir });
  await assert.rejects(() => adapter.build({}), /scenes-Array/);
});
