'use strict';

/**
 * Unit-Tests für AddComponent/RemoveComponent-Commands (AP-5.5).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeAddComponent, executeRemoveComponent } = require('../engine/commands/componentCommands.js');
const { createProject } = require('../engine/project.js');
const { createEntity } = require('../engine/entity.js');

test('AddComponent fügt Component hinzu und ist invertierbar', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);

  const { component, undo } = executeAddComponent(project, { entityId: entity.entityId, type: 'Sprite', props: { color: 'red' } });
  assert.strictEqual(entity.components.length, 1);
  assert.strictEqual(component.type, 'Sprite');
  undo();
  assert.strictEqual(entity.components.length, 0);
});

test('RemoveComponent entfernt Component und ist invertierbar', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  const { component } = executeAddComponent(project, { entityId: entity.entityId, type: 'Sprite' });

  const { undo } = executeRemoveComponent(project, { entityId: entity.entityId, componentId: component.componentId });
  assert.strictEqual(entity.components.length, 0);
  undo();
  assert.strictEqual(entity.components.length, 1);
  assert.strictEqual(entity.components[0], component);
});

test('RemoveComponent wirft bei nicht gefundener Component', () => {
  const project = createProject({});
  const entity = createEntity({ name: 'Player' });
  project.entities.push(entity);
  assert.throws(
    () => executeRemoveComponent(project, { entityId: entity.entityId, componentId: 'comp_nope' }),
    /nicht gefunden/,
  );
});
