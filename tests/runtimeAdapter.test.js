'use strict';

/**
 * Unit-Tests für das RuntimeAdapter-Interface (AP-7.2).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { RuntimeAdapter } = require('../runtime/host/runtimeAdapter.js');

test('RuntimeAdapter ist nicht direkt instanziierbar', () => {
  assert.throws(() => new RuntimeAdapter(), /abstrakt/);
});

test('Unterklasse erbt die abstrakten Methoden (werfen "nicht implementiert")', async () => {
  class ConcreteAdapter extends RuntimeAdapter {}
  const adapter = new ConcreteAdapter();
  await assert.rejects(() => adapter.build({}), /nicht implementiert/);
  await assert.rejects(() => adapter.play('scene_1'), /nicht implementiert/);
  await assert.rejects(() => adapter.pause(), /nicht implementiert/);
  await assert.rejects(() => adapter.stop(), /nicht implementiert/);
});
