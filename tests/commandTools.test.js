'use strict';

/**
 * Unit-Tests für die AI Command Tools (AP-8.9).
 * AI führt Commands aus und ändert das Projekt.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { applyAiCommands, handleAiResponse } = require('../ai/tools/commandTools.js');
const { createProject } = require('../engine/project.js');

test('applyAiCommands führt Commands aus und ändert das Projekt', () => {
  const project = createProject({});
  const result = applyAiCommands(project, [
    { command: 'CreateEntity', name: 'Player' },
    { command: 'CreateEntity', name: 'Enemy' },
  ]);
  assert.strictEqual(result.applied, 2);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(project.entities.length, 2);
});

test('applyAiCommands sammelt Fehler bei ungültigen Commands', () => {
  const project = createProject({});
  const result = applyAiCommands(project, [
    { command: 'CreateEntity', name: 'Player' },
    { command: 'Unbekannt', name: 'X' },
  ]);
  assert.strictEqual(result.applied, 1);
  assert.strictEqual(result.errors.length, 1);
  assert.match(result.errors[0].error, /Unbekannter Command/);
});

test('handleAiResponse verarbeitet AI-Antwort mit Commands', () => {
  const project = createProject({});
  const result = handleAiResponse(project, { commands: [{ command: 'CreateEntity', name: 'Player' }] });
  assert.strictEqual(result.applied, 1);
  assert.strictEqual(project.entities.length, 1);
});

test('handleAiResponse mit leerer Antwort ändert nichts', () => {
  const project = createProject({});
  const result = handleAiResponse(project, {});
  assert.strictEqual(result.applied, 0);
  assert.strictEqual(project.entities.length, 0);
});

test('applyAiCommands wirft ohne Array', () => {
  assert.throws(() => applyAiCommands(createProject({}), 'nope'), /muss ein Array sein/);
});
