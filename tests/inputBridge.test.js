'use strict';

/**
 * Unit-Tests für die InputBridge (AP-7.7).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createProject } = require('../engine/project.js');
const {
  InputBridge,
  compileInput,
  buildInputSection,
  buildProjectGodotWithInput,
  actionNameFor,
  keycodeFor,
} = require('../runtime/godot/inputBridge.js');

test('actionNameFor erzeugt gültigen Action-Namen', () => {
  assert.strictEqual(actionNameFor('move_left'), 'move_left');
  assert.strictEqual(actionNameFor('move left'), 'move_left');
  assert.strictEqual(actionNameFor(''), 'action');
});

test('keycodeFor mappt Keys auf Godot-Keycodes', () => {
  assert.strictEqual(keycodeFor('A'), 65);
  assert.strictEqual(keycodeFor('Space'), 32);
  assert.strictEqual(keycodeFor('Left'), 4194319);
  assert.strictEqual(keycodeFor('Unbekannt'), 0);
});

test('buildInputSection erzeugt InputMap-Einträge', () => {
  const section = buildInputSection([
    { name: 'move_left', keys: ['A', 'Left'] },
    { name: 'jump', keys: ['Space'] },
  ]);
  assert.match(section, /input\/move_left=/);
  assert.match(section, /input\/jump=/);
  assert.match(section, /"deadzone": 0.5/);
  assert.match(section, /physical_keycode":65/);
  assert.match(section, /physical_keycode":4194319/);
  assert.match(section, /physical_keycode":32/);
});

test('buildProjectGodotWithInput enthält [input]-Sektion', () => {
  const project = createProject({ name: 'Game' });
  project.inputActions = [{ name: 'move_left', keys: ['A'] }];
  const content = buildProjectGodotWithInput(project, 'scenes/main.tscn');
  assert.match(content, /\[input\]/);
  assert.match(content, /input\/move_left=/);
  assert.match(content, /run\/main_scene="res:\/\/scenes\/main.tscn"/);
});

test('compileInput schreibt project.godot mit InputMap', () => {
  const project = createProject({ name: 'Game' });
  project.inputActions = [{ name: 'jump', keys: ['Space'] }];
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-input-'));
  const result = compileInput(project, outDir, 'scenes/main.tscn');
  assert.strictEqual(result, path.resolve(path.join(outDir, 'project.godot')));
  assert.ok(fs.existsSync(path.join(outDir, 'project.godot')));
  const content = fs.readFileSync(path.join(outDir, 'project.godot'), 'utf8');
  assert.match(content, /input\/jump=/);
});

test('compileInput wirft ohne inputActions-Array', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'craftera-input-'));
  assert.throws(() => compileInput({}, outDir, 'scenes/main.tscn'), /inputActions-Array/);
});

test('InputBridge-Interface ist verfügbar', () => {
  assert.strictEqual(typeof InputBridge.compileInput, 'function');
});
