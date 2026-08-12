'use strict';

/**
 * Unit-Tests für den SetProperty-Command (AP-5.6).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeSetProperty } = require('../engine/commands/setPropertyCommand.js');
const { createProject } = require('../engine/project.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');

test('SetProperty setzt eine Property und ist invertierbar', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  const comp = addComponent(entity, { type: 'Movement', props: { speed: 100 } });

  const { value, undo } = executeSetProperty(project, {
    entityId: entity.entityId, componentId: comp.componentId, property: 'speed', value: 300,
  });
  assert.strictEqual(value, 300);
  assert.strictEqual(comp.props.speed, 300);
  undo();
  assert.strictEqual(comp.props.speed, 100);
});

test('SetProperty fügt neue Property hinzu und undo entfernt sie', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  const comp = addComponent(entity, { type: 'Movement' });

  const { undo } = executeSetProperty(project, {
    entityId: entity.entityId, componentId: comp.componentId, property: 'jump', value: 5,
  });
  assert.strictEqual(comp.props.jump, 5);
  undo();
  assert.ok(!('jump' in comp.props));
});

test('SetProperty wirft bei nicht gefundener Entity', () => {
  const project = createProject({});
  assert.throws(
    () => executeSetProperty(project, { entityId: 'ent_nope', componentId: 'comp_1', property: 'x', value: 1 }),
    /nicht gefunden/,
  );
});

test('SetProperty wirft bei nicht gefundener Component', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  assert.throws(
    () => executeSetProperty(project, { entityId: entity.entityId, componentId: 'comp_nope', property: 'x', value: 1 }),
    /Component.*nicht gefunden/,
  );
});

test('SetProperty wirft ohne property', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  const comp = addComponent(entity, { type: 'Movement' });
  assert.throws(
    () => executeSetProperty(project, { entityId: entity.entityId, componentId: comp.componentId, value: 1 }),
    /property.*erforderlich/,
  );
});
