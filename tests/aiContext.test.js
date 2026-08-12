'use strict';

/**
 * Unit-Tests für den AI Context (AP-8.10).
 * Kontext enthält Scene, Entities, Components und Selection.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { buildAiContext } = require('../ai/context/aiContext.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');

test('buildAiContext enthält Scenes, Entities, Components', () => {
  const project = createProject({ name: 'Space Runner' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const entity = createEntity({ sceneId: scene.sceneId, name: 'Player' });
  addComponent(entity, { type: 'Sprite', props: { color: 'red' } });
  project.entities.push(entity);

  const ctx = buildAiContext(project);
  assert.strictEqual(ctx.project.name, 'Space Runner');
  assert.strictEqual(ctx.scenes.length, 1);
  assert.strictEqual(ctx.scenes[0].name, 'Main');
  assert.strictEqual(ctx.entities.length, 1);
  assert.strictEqual(ctx.entities[0].components[0].type, 'Sprite');
});

test('buildAiContext enthält die Selection', () => {
  const project = createProject({});
  const e1 = createEntity({ name: 'Player' });
  const e2 = createEntity({ name: 'Enemy' });
  project.entities.push(e1, e2);

  const ctx = buildAiContext(project, { selectedEntityIds: [e1.entityId] });
  assert.strictEqual(ctx.selection.length, 1);
  assert.strictEqual(ctx.selection[0].name, 'Player');
});

test('buildAiContext mit leerer Selection liefert leeres Array', () => {
  const project = createProject({});
  project.entities.push(createEntity({ name: 'Player' }));
  const ctx = buildAiContext(project);
  assert.deepStrictEqual(ctx.selection, []);
});

test('buildAiContext wirft ohne entities-Array', () => {
  assert.throws(() => buildAiContext({}), /entities-Array/);
});
