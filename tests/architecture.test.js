'use strict';

/**
 * Unit-Tests für das Architektur-Modell (AP-12.3).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createArchitecture, serializeArchitecture } = require('../engine/architecture.js');

test('createArchitecture erzeugt Objekt mit allen Kernfeldern', () => {
  const arch = createArchitecture({ experienceId: 'exp_1', title: 'Space Runner' });
  assert.match(arch.architectureId, /^arch_[a-z0-9]+$/);
  assert.strictEqual(arch.experienceId, 'exp_1');
  assert.strictEqual(arch.title, 'Space Runner');
  assert.deepStrictEqual(arch.scenes, []);
  assert.deepStrictEqual(arch.entities, []);
  assert.deepStrictEqual(arch.components, []);
  assert.deepStrictEqual(arch.behaviors, []);
});

test('createArchitecture übernimmt Listen', () => {
  const arch = createArchitecture({
    title: 'Game',
    scenes: [{ name: 'Main' }],
    entities: [{ name: 'Player' }],
    components: [{ name: 'Sprite' }],
    behaviors: [{ name: 'Patrol' }],
  });
  assert.strictEqual(arch.scenes.length, 1);
  assert.strictEqual(arch.entities.length, 1);
  assert.strictEqual(arch.components.length, 1);
  assert.strictEqual(arch.behaviors.length, 1);
});

test('serializeArchitecture erzeugt gültiges JSON', () => {
  const arch = createArchitecture({ title: 'Game' });
  const json = serializeArchitecture(arch);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.title, 'Game');
});
