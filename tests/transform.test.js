'use strict';

/**
 * Unit-Tests für das Transform-Modell (AP-4.5).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { setTransform } = require('../engine/transform.js');
const { createEntity } = require('../engine/entity.js');

test('setTransform setzt alle Werte', () => {
  const entity = createEntity({});
  setTransform(entity, { x: 10, y: 20, scale: 2, rotation: 45 });
  assert.deepStrictEqual(entity.transform, { x: 10, y: 20, scale: 2, rotation: 45 });
});

test('setTransform lässt nicht angegebene Werte unverändert', () => {
  const entity = createEntity({ transform: { x: 1, y: 2, scale: 3, rotation: 4 } });
  setTransform(entity, { x: 100 });
  assert.deepStrictEqual(entity.transform, { x: 100, y: 2, scale: 3, rotation: 4 });
});

test('setTransform konvertiert Werte zu Zahlen', () => {
  const entity = createEntity({});
  setTransform(entity, { x: '5', scale: '1.5' });
  assert.strictEqual(entity.transform.x, 5);
  assert.strictEqual(entity.transform.scale, 1.5);
});

test('setTransform wirft ohne transform-Objekt', () => {
  assert.throws(() => setTransform({}, { x: 1 }), /transform-Objekt/);
});
