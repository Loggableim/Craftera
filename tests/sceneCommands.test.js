'use strict';

/**
 * Unit-Tests für CreateScene/DeleteScene-Commands (AP-5.7).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { executeCreateScene, executeDeleteScene } = require('../engine/commands/sceneCommands.js');
const { createProject } = require('../engine/project.js');

test('CreateScene erzeugt eine Scene und ist invertierbar', () => {
  const project = createProject({});
  const { scene, undo } = executeCreateScene(project, { name: 'Main' });
  assert.match(scene.sceneId, /^scene_[a-z0-9]+$/);
  assert.strictEqual(scene.name, 'Main');
  assert.strictEqual(project.scenes.length, 1);
  undo();
  assert.strictEqual(project.scenes.length, 0);
});

test('DeleteScene entfernt eine Scene und ist invertierbar', () => {
  const project = createProject({});
  const { scene } = executeCreateScene(project, { name: 'Main' });
  const { undo } = executeDeleteScene(project, { sceneId: scene.sceneId });
  assert.strictEqual(project.scenes.length, 0);
  undo();
  assert.strictEqual(project.scenes.length, 1);
  assert.strictEqual(project.scenes[0], scene);
});

test('DeleteScene wirft bei nicht gefundener Scene', () => {
  const project = createProject({});
  assert.throws(() => executeDeleteScene(project, { sceneId: 'scene_nope' }), /nicht gefunden/);
});
