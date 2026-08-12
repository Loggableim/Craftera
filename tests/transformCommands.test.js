'use strict';

/**
 * Unit-Tests für MoveEntity/ScaleEntity-Commands (AP-5.4).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeMoveEntity, executeScaleEntity } = require('../engine/commands/transformCommands.js');
const { createProject } = require('../engine/project.js');
const { createEntity } = require('../engine/entity.js');

test('MoveEntity ändert x/y und ist invertierbar', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);

  const { transform, undo } = executeMoveEntity(project, { entityId: entity.entityId, x: 10, y: 20 });
  assert.strictEqual(transform.x, 10);
  assert.strictEqual(transform.y, 20);
  undo();
  assert.strictEqual(entity.transform.x, 0);
  assert.strictEqual(entity.transform.y, 0);
});

test('ScaleEntity ändert scale und ist invertierbar', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);

  const { transform, undo } = executeScaleEntity(project, { entityId: entity.entityId, scale: 2 });
  assert.strictEqual(transform.scale, 2);
  undo();
  assert.strictEqual(entity.transform.scale, 1);
});

test('MoveEntity/ScaleEntity wirft bei nicht gefundener Entity', () => {
  const project = createProject({});
  assert.throws(() => executeMoveEntity(project, { entityId: 'ent_nope', x: 1 }), /nicht gefunden/);
  assert.throws(() => executeScaleEntity(project, { entityId: 'ent_nope', scale: 2 }), /nicht gefunden/);
});
