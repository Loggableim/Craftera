'use strict';

/**
 * Unit-Tests für den DeleteEntity-Command (AP-5.3).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeDeleteEntity } = require('../engine/commands/deleteEntityCommand.js');
const { createProject } = require('../engine/project.js');
const { createEntity } = require('../engine/entity.js');

test('DeleteEntity entfernt eine Entity aus dem Projekt', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);

  const { entity: removed } = executeDeleteEntity(project, { entityId: entity.entityId });
  assert.strictEqual(removed, entity);
  assert.strictEqual(project.entities.length, 0);
});

test('DeleteEntity ist invertierbar (undo fügt die Entity wieder ein)', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);

  const { undo } = executeDeleteEntity(project, { entityId: entity.entityId });
  assert.strictEqual(project.entities.length, 0);
  undo();
  assert.strictEqual(project.entities.length, 1);
  assert.strictEqual(project.entities[0], entity);
});

test('DeleteEntity wirft bei nicht gefundener Entity', () => {
  const project = createProject({});
  assert.throws(() => executeDeleteEntity(project, { entityId: 'ent_nope' }), /nicht gefunden/);
});

test('DeleteEntity wirft ohne entities-Array', () => {
  assert.throws(() => executeDeleteEntity({}, { entityId: 'ent_1' }), /entities-Array/);
});
