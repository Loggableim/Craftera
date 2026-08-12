'use strict';

/**
 * Unit-Tests für das Entity-Modell (AP-4.3).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createEntity } = require('../engine/entity.js');

test('createEntity erzeugt Objekt mit allen Kernfeldern', () => {
  const e = createEntity({ sceneId: 'scene_1', parentId: 'ent_p', name: 'Player' });
  assert.match(e.entityId, /^ent_[a-z0-9]+$/);
  assert.strictEqual(e.sceneId, 'scene_1');
  assert.strictEqual(e.parentId, 'ent_p');
  assert.strictEqual(e.name, 'Player');
  assert.deepStrictEqual(e.transform, { x: 0, y: 0, scale: 1, rotation: 0 });
  assert.deepStrictEqual(e.components, []);
});

test('createEntity übernimmt expliziten Transform', () => {
  const e = createEntity({ transform: { x: 10, y: 20, scale: 2, rotation: 45 } });
  assert.deepStrictEqual(e.transform, { x: 10, y: 20, scale: 2, rotation: 45 });
});

test('createEntity setzt Defaults, wenn nicht angegeben', () => {
  const e = createEntity({});
  assert.strictEqual(e.sceneId, '');
  assert.strictEqual(e.parentId, '');
  assert.strictEqual(e.name, '');
});

test('createEntity erzeugt eindeutige entityId', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(createEntity({}).entityId);
  }
  assert.strictEqual(ids.size, 1000);
});
