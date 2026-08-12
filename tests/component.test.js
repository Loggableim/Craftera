'use strict';

/**
 * Unit-Tests für das Component-Modell (AP-4.4).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { addComponent } = require('../engine/component.js');
const { createEntity } = require('../engine/entity.js');

test('addComponent fügt Component mit allen Kernfeldern hinzu', () => {
  const entity = createEntity({});
  const comp = addComponent(entity, { type: 'Sprite', props: { color: 'red' } });
  assert.match(comp.componentId, /^comp_[a-z0-9]+$/);
  assert.strictEqual(comp.type, 'Sprite');
  assert.deepStrictEqual(comp.props, { color: 'red' });
  assert.strictEqual(entity.components.length, 1);
  assert.strictEqual(entity.components[0], comp);
});

test('addComponent setzt props auf leer, wenn nicht angegeben', () => {
  const entity = createEntity({});
  const comp = addComponent(entity, { type: 'Transform' });
  assert.deepStrictEqual(comp.props, {});
});

test('addComponent wirft ohne type', () => {
  const entity = createEntity({});
  assert.throws(() => addComponent(entity, {}), /type.*erforderlich/);
});

test('addComponent wirft ohne Entity mit components-Array', () => {
  assert.throws(() => addComponent({}, { type: 'X' }), /components-Array/);
});

test('addComponent erzeugt eindeutige componentId', () => {
  const entity = createEntity({});
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(addComponent(entity, { type: 'X' }).componentId);
  }
  assert.strictEqual(ids.size, 1000);
});
