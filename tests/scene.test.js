'use strict';

/**
 * Unit-Tests für das Scene-Modell (AP-4.2).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createScene } = require('../engine/scene.js');

test('createScene erzeugt Objekt mit allen Kernfeldern', () => {
  const s = createScene({ name: 'Main', rootEntityId: 'ent_root' });
  assert.match(s.sceneId, /^scene_[a-z0-9]+$/);
  assert.strictEqual(s.name, 'Main');
  assert.strictEqual(s.rootEntityId, 'ent_root');
});

test('createScene setzt Defaults, wenn nicht angegeben', () => {
  const s = createScene({});
  assert.strictEqual(s.name, '');
  assert.strictEqual(s.rootEntityId, '');
});

test('createScene erzeugt eindeutige sceneId', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(createScene({}).sceneId);
  }
  assert.strictEqual(ids.size, 1000);
});
