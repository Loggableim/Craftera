'use strict';

/**
 * Unit-Tests für den Command-Dispatch (AP-5.1).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeCommand, registerCommand } = require('../engine/commands/commandDispatcher.js');

test('executeCommand führt registrierten Handler aus', () => {
  registerCommand('TestCommand', (project, payload) => {
    project.executed = payload.value;
    return project.executed;
  });
  const project = {};
  const result = executeCommand(project, { command: 'TestCommand', value: 42 });
  assert.strictEqual(result, 42);
  assert.strictEqual(project.executed, 42);
});

test('executeCommand wirft bei unbekanntem Command', () => {
  assert.throws(() => executeCommand({}, { command: 'Nope' }), /Unbekannter Command/);
});

test('executeCommand wirft ohne command-Feld', () => {
  assert.throws(() => executeCommand({}, {}), /command.*Feld/);
});

test('executeCommand wirft bei Nicht-Objekt', () => {
  assert.throws(() => executeCommand({}, null), /Command muss ein Objekt sein/);
});

test('registerCommand wirft bei Nicht-Funktion', () => {
  assert.throws(() => registerCommand('X', 'nope'), /muss eine Funktion sein/);
});
