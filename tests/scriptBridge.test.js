'use strict';

/**
 * Unit-Tests für die ScriptBridge (AP-7.6).
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
  ScriptBridge,
  compileComponent,
  compileComponents,
  buildScript,
  classNameFor,
  gdLiteral,
} = require('../runtime/godot/scriptBridge.js');

test('classNameFor erzeugt gültigen Klassennamen', () => {
  assert.strictEqual(classNameFor('sprite'), 'sprite');
  assert.strictEqual(classNameFor('player-controller'), 'player_controller');
  assert.strictEqual(classNameFor(''), 'component');
});

test('gdLiteral formatiert Werte als GDScript-Literale', () => {
  assert.strictEqual(gdLiteral(5), '5');
  assert.strictEqual(gdLiteral(true), 'true');
  assert.strictEqual(gdLiteral('abc'), '"abc"');
  assert.strictEqual(gdLiteral([1, 2]), '[1, 2]');
  assert.strictEqual(gdLiteral({ x: 1 }), '{ "x": 1 }');
  assert.strictEqual(gdLiteral(null), 'null');
});

test('buildScript erzeugt GDScript mit class_name und Props', () => {
  const script = buildScript({
    componentId: 'comp_1',
    type: 'sprite',
    props: { color: '#ff0000', speed: 5 },
  });
  assert.match(script, /extends Node2D/);
  assert.match(script, /class_name sprite/);
  assert.match(script, /var color = "#ff0000"/);
  assert.match(script, /var speed = 5/);
  assert.match(script, /func _ready\(\) -> void:/);
});

test('buildScript wirft ohne type', () => {
  assert.throws(() => buildScript({}), /"type"/);
});

test('compileComponent schreibt .gd-Datei', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-script-'));
  const rel = compileComponent({ componentId: 'comp_1', type: 'sprite', props: { color: '#ff0000' } }, outDir);
  assert.strictEqual(rel, 'scripts/sprite.gd');
  assert.ok(fs.existsSync(path.join(outDir, 'scripts', 'sprite.gd')));
  const content = fs.readFileSync(path.join(outDir, 'scripts', 'sprite.gd'), 'utf8');
  assert.match(content, /class_name sprite/);
});

test('compileComponents übersetzt alle Components eines Projekts', () => {
  const project = createProject({ name: 'Game' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player' });
  addComponent(player, { type: 'sprite', props: { color: '#ff0000' } });
  addComponent(player, { type: 'player-controller', props: { speed: 5 } });
  project.entities.push(player);

  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-script-'));
  const rels = compileComponents(project, outDir);
  assert.deepStrictEqual(rels.sort(), ['scripts/player_controller.gd', 'scripts/sprite.gd']);
  assert.ok(fs.existsSync(path.join(outDir, 'scripts', 'sprite.gd')));
  assert.ok(fs.existsSync(path.join(outDir, 'scripts', 'player_controller.gd')));
});

test('compileComponents wirft ohne entities-Array', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-script-'));
  assert.throws(() => compileComponents({}, outDir), /entities-Array/);
});

test('ScriptBridge-Interface ist verfügbar', () => {
  assert.strictEqual(typeof ScriptBridge.compileComponent, 'function');
  assert.strictEqual(typeof ScriptBridge.compileComponents, 'function');
});
