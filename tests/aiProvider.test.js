'use strict';

/**
 * Unit-Tests für das AIProvider-Interface (AP-8.1).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { AIProvider } = require('../ai/providers/aiProvider.js');

test('AIProvider ist nicht direkt instanziierbar', () => {
  assert.throws(() => new AIProvider(), /abstrakt/);
});

test('Unterklasse erbt die abstrakten Methoden (werfen "nicht implementiert")', async () => {
  class ConcreteProvider extends AIProvider {}
  const provider = new ConcreteProvider();
  await assert.rejects(() => provider.generate({}), /nicht implementiert/);
  await assert.rejects(() => provider.stream({}), /nicht implementiert/);
  await assert.rejects(() => provider.generateStructured({}), /nicht implementiert/);
  await assert.rejects(() => provider.toolCall({}), /nicht implementiert/);
  await assert.rejects(() => provider.vision({}), /nicht implementiert/);
  await assert.rejects(() => provider.embeddings({}), /nicht implementiert/);
  assert.throws(() => provider.capabilities(), /nicht implementiert/);
});
