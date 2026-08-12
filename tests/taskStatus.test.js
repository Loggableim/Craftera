'use strict';

/**
 * Unit-Tests für den Task-Graph-Status (AP-12.6).
 * Status-Übergänge: BACKLOG→READY→IN_PROGRESS→REVIEW→TESTING→DONE.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createTask } = require('../engine/task.js');
const { transitionTask, canTransition } = require('../engine/taskStatus.js');

test('Hauptkette BACKLOG→READY→IN_PROGRESS→REVIEW→TESTING→DONE', () => {
  const task = createTask({ title: 'X', agent: 'code' });
  transitionTask(task, 'READY');
  transitionTask(task, 'IN_PROGRESS');
  transitionTask(task, 'REVIEW');
  transitionTask(task, 'TESTING');
  transitionTask(task, 'DONE');
  assert.strictEqual(task.status, 'DONE');
});

test('ungültiger Übergang wirft Fehler', () => {
  const task = createTask({ title: 'X', agent: 'code' });
  // BACKLOG → DONE ist nicht erlaubt (muss durch die Kette).
  assert.throws(() => transitionTask(task, 'DONE'), /Ungültiger Status-Übergang/);
  assert.strictEqual(task.status, 'BACKLOG');
});

test('canTransition prüft erlaubte und unerlaubte Übergänge', () => {
  assert.strictEqual(canTransition('BACKLOG', 'READY'), true);
  assert.strictEqual(canTransition('BACKLOG', 'DONE'), false);
  assert.strictEqual(canTransition('TESTING', 'DONE'), true);
  assert.strictEqual(canTransition('DONE', 'IN_PROGRESS'), false);
});

test('BLOCKED und FAILED sind erlaubte Sonderzustände', () => {
  const task = createTask({ title: 'X', agent: 'code' });
  transitionTask(task, 'BLOCKED');
  transitionTask(task, 'READY');
  transitionTask(task, 'FAILED');
  transitionTask(task, 'IN_PROGRESS');
  assert.strictEqual(task.status, 'IN_PROGRESS');
});

test('unbekannter Status ist nicht erlaubt', () => {
  assert.strictEqual(canTransition('BACKLOG', 'NOPE'), false);
  assert.strictEqual(canTransition('NOPE', 'READY'), false);
});
