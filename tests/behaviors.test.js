'use strict';

/**
 * Unit-Tests für Behaviors (AP-6.17).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createBehavior, runBehavior } = require('../engine/behaviors.js');

test('createBehavior erzeugt Behavior mit Typ und Config', () => {
  const b = createBehavior({ type: 'follow', config: { speed: 10 } });
  assert.match(b.behaviorId, /^comp_[a-z0-9]+$/);
  assert.strictEqual(b.type, 'follow');
  assert.strictEqual(b.config.speed, 10);
});

test('createBehavior wirft bei unbekanntem Typ', () => {
  assert.throws(() => createBehavior({ type: 'nope' }), /Unbekannter Typ/);
});

test('Follow bewegt Entity auf Ziel zu', () => {
  const b = createBehavior({ type: 'follow', config: { speed: 10 } });
  const entity = { entityId: 'ent_1', transform: { x: 0, y: 0, scale: 1, rotation: 0 } };
  const target = { entityId: 'ent_2', transform: { x: 100, y: 0, scale: 1, rotation: 0 } };
  const result = runBehavior(b, entity, { target });
  assert.strictEqual(result.moved, true);
  assert.ok(entity.transform.x > 0, 'Entity bewegt sich Richtung Ziel');
});

test('Patrol bewegt Entity zwischen Wegpunkten', () => {
  const b = createBehavior({ type: 'patrol', config: { speed: 10 } });
  const entity = { entityId: 'ent_1', transform: { x: 0, y: 0, scale: 1, rotation: 0 } };
  const waypoints = [{ x: 50, y: 0 }, { x: 0, y: 50 }];
  const result = runBehavior(b, entity, { waypoints });
  assert.strictEqual(result.moved, true);
  assert.ok(entity.transform.x > 0 || entity.transform.y > 0);
});

test('Collect sammelt Item ein, wenn erreicht', () => {
  const b = createBehavior({ type: 'collect', config: { speed: 100, itemId: 'ent_coin' } });
  const entity = { entityId: 'ent_1', transform: { x: 0, y: 0, scale: 1, rotation: 0 } };
  const items = [{ entityId: 'ent_coin', transform: { x: 10, y: 0, scale: 1, rotation: 0 } }];
  const result = runBehavior(b, entity, { items });
  assert.strictEqual(result.collected.entityId, 'ent_coin');
  assert.strictEqual(items.length, 0);
});
