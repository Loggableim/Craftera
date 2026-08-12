'use strict';

/**
 * Integrationstests für die Serialisierung (AP-4.6).
 * Roundtrip: save → load → identisch.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  serializeProject, deserializeProject, saveProject, loadProject, PROJECT_FILENAME,
} = require('../engine/serialization.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { setTransform } = require('../engine/transform.js');

/** Erzeugt ein temporäres Verzeichnis pro Test. */
async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

/** Baut ein GameProject mit Daten auf. */
function buildProject() {
  const project = createProject({ experienceId: 'exp_abc', name: 'Space Runner' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const entity = createEntity({ sceneId: scene.sceneId, name: 'Player' });
  setTransform(entity, { x: 10, y: 20, scale: 2, rotation: 45 });
  addComponent(entity, { type: 'Sprite', props: { color: 'red' } });
  project.entities.push(entity);
  return project;
}

test('serializeProject/deserializeProject: Roundtrip ist identisch', () => {
  const project = buildProject();
  const json = serializeProject(project);
  const loaded = deserializeProject(json);
  assert.deepStrictEqual(loaded, project);
});

test('saveProject/loadProject: Roundtrip ist identisch', async () => {
  const dir = await makeTempDir();
  const project = buildProject();
  await saveProject(dir, project);
  const loaded = await loadProject(dir);
  assert.deepStrictEqual(loaded, project);
});

test('saveProject schreibt game.project.json', async () => {
  const dir = await makeTempDir();
  const project = buildProject();
  await saveProject(dir, project);
  const filePath = path.join(dir, PROJECT_FILENAME);
  const onDisk = JSON.parse(await fs.readFile(filePath, 'utf8'));
  assert.deepStrictEqual(onDisk, project);
});

test('loadProject liefert null, wenn keine Datei existiert', async () => {
  const dir = await makeTempDir();
  const result = await loadProject(dir);
  assert.strictEqual(result, null);
});
