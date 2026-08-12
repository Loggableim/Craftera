'use strict';

/**
 * Unit-Tests für die Command-API (AP-5.10).
 * Commands als JSON serialisierbar → execute.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeJsonCommand, registerAllCommands } = require('../engine/commands/commandApi.js');
const { createProject } = require('../engine/project.js');

// Commands einmalig registrieren.
registerAllCommands();

test('JSON-Command-Objekt: CreateEntity erzeugt Entity', () => {
  const project = createProject({});
  const result = executeJsonCommand(project, { command: 'CreateEntity', name: 'Player' });
  assert.match(result.entity.entityId, /^ent_[a-z0-9]+$/);
  assert.strictEqual(project.entities.length, 1);
});

test('JSON-String: CreateEntity erzeugt Entity', () => {
  const project = createProject({});
  const json = JSON.stringify({ command: 'CreateEntity', name: 'Enemy' });
  const result = executeJsonCommand(project, json);
  assert.strictEqual(result.entity.name, 'Enemy');
  assert.strictEqual(project.entities.length, 1);
});

test('JSON-String: SetProperty setzt Property', () => {
  const project = createProject({});
  const { entity } = executeJsonCommand(project, { command: 'CreateEntity', name: 'Player' });
  const { component } = executeJsonCommand(project, { command: 'AddComponent', entityId: entity.entityId, type: 'Movement', props: { speed: 100 } });
  const json = JSON.stringify({ command: 'SetProperty', entityId: entity.entityId, componentId: component.componentId, property: 'speed', value: 300 });
  executeJsonCommand(project, json);
  assert.strictEqual(component.props.speed, 300);
});

test('Unbekannter Command wirft', () => {
  const project = createProject({});
  assert.throws(() => executeJsonCommand(project, { command: 'Nope' }), /Unbekannter Command/);
});

test('Ungültiges JSON wirft', () => {
  const project = createProject({});
  assert.throws(() => executeJsonCommand(project, '{ungültig'), SyntaxError);
});
