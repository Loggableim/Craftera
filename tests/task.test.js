'use strict';

/**
 * Unit-Tests für das Task-Modell (AP-12.5).
 * Task mit allen Feldern, Validierung von Agent/Priorität.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createTask, AGENTS, PRIORITIES, TASK_STATUSES } = require('../engine/task.js');

test('createTask erzeugt einen Task mit allen Feldern', () => {
  const task = createTask({
    title: 'Create Player Controller',
    description: 'Erstellt den Player Controller',
    agent: 'gameplay',
    priority: 'high',
    dependencies: ['task_1'],
    inputs: ['gdd_1'],
    outputs: ['script_player_controller'],
    ownedResources: ['entity_player', 'script_player_controller'],
    acceptanceCriteria: ['Player kann sich bewegen'],
    tests: ['movement.test'],
  });
  assert.ok(task.id.startsWith('task_'));
  assert.strictEqual(task.title, 'Create Player Controller');
  assert.strictEqual(task.agent, 'gameplay');
  assert.strictEqual(task.priority, 'high');
  assert.deepStrictEqual(task.dependencies, ['task_1']);
  assert.deepStrictEqual(task.ownedResources, ['entity_player', 'script_player_controller']);
  assert.deepStrictEqual(task.acceptanceCriteria, ['Player kann sich bewegen']);
  assert.deepStrictEqual(task.tests, ['movement.test']);
  assert.strictEqual(task.status, 'BACKLOG');
});

test('createTask setzt Defaults für optionale Felder', () => {
  const task = createTask({ title: 'X', agent: 'code' });
  assert.strictEqual(task.priority, 'medium');
  assert.deepStrictEqual(task.dependencies, []);
  assert.deepStrictEqual(task.ownedResources, []);
  assert.deepStrictEqual(task.acceptanceCriteria, []);
  assert.strictEqual(task.status, 'BACKLOG');
});

test('createTask wirft bei unbekanntem Agent', () => {
  assert.throws(() => createTask({ title: 'X', agent: 'nope' }), /unbekannter Agent/);
});

test('createTask wirft bei unbekannter Priorität', () => {
  assert.throws(() => createTask({ title: 'X', agent: 'code', priority: 'urgent' }), /unbekannte Priorität/);
});

test('AGENTS/PRIORITIES/TASK_STATUSES sind definiert', () => {
  assert.ok(AGENTS.includes('gameplay'));
  assert.ok(AGENTS.includes('test'));
  assert.ok(PRIORITIES.includes('critical'));
  assert.ok(TASK_STATUSES.includes('DONE'));
});
