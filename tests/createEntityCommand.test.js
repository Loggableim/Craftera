'use strict';

/**
 * Unit-Tests für den CreateEntity-Command (AP-5.2).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeCreateEntity } = require('../engine/commands/createEntityCommand.js');
const { createProject } = require('../engine/project.js');

test('CreateEntity erzeugt eine Entity im Projekt', () => {
  const project = createProject({});
  const { entity } = executeCreateEntity(project, { sceneId: 'scene_1', name: 'Player' });
  assert.match(entity.entityId, /^ent_[a-z0-9]+$/);
  assert.strictEqual(entity.name, 'Player');
  assert.strictEqual(entity.sceneId, 'scene_1');
  assert.strictEqual(project.entities.length, 1);
  assert.strictEqual(project.entities[0], entity);
});

test('CreateEntity ist invertierbar (undo entfernt die Entity)', () => {
  const project = createProject({});
  const { entity, undo } = executeCreateEntity(project, { name: 'Player' });
  assert.strictEqual(project.entities.length, 1);
  undo();
  assert.strictEqual(project.entities.length, 0);
  assert.ok(!project.entities.includes(entity));
});

test('CreateEntity wirft ohne entities-Array', () => {
  assert.throws(() => executeCreateEntity({}, { name: 'X' }), /entities-Array/);
});
