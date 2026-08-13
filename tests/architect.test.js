'use strict';

/**
 * Unit-Tests für den Architect (AP-12.3).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { Architect, SCENES_PROMPT, ENTITIES_PROMPT, COMPONENTS_PROMPT } = require('../ai/agents/architect.js');
const { createGDD } = require('../engine/gdd.js');

/**
 * Mock-Provider, der pro Aufruf (Reihenfolge) eine strukturierte Antwort liefert.
 * Aufruf 1 → scenes, Aufruf 2 → entities, Aufruf 3 → components.
 */
function mockProvider(scenes, entities, components) {
  const calls = [scenes, entities, components];
  let i = 0;
  return {
    async generateStructured() {
      const result = calls[Math.min(i, calls.length - 1)];
      i += 1;
      return result;
    },
  };
}

test('SCENES_PROMPT/ENTITIES_PROMPT/COMPONENTS_PROMPT sind definiert', () => {
  assert.match(SCENES_PROMPT, /"scenes"/);
  assert.match(ENTITIES_PROMPT, /"entities"/);
  assert.match(COMPONENTS_PROMPT, /"components"/);
});

test('architect erzeugt Scenes, Entities und Components', async () => {
  const provider = mockProvider(
    { scenes: [{ name: 'Main', description: 'Hauptszene' }] },
    { entities: [{ name: 'Player', scene: 'Main', transform: { x: 10, y: 20 } }] },
    { components: [{ entity: 'Player', type: 'sprite', props: { color: '#ff0000' } }] }
  );
  const architect = new Architect({ provider });
  const gdd = createGDD({ title: 'Space Runner' });

  const result = await architect.architect(gdd);
  assert.ok(result.scenes.length >= 1);
  assert.ok(result.entities.length >= 1);
  assert.strictEqual(result.scenes[0].name, 'Main');
  assert.strictEqual(result.entities[0].name, 'Player');
  assert.strictEqual(result.entities[0].components.length, 1);
  assert.strictEqual(result.entities[0].components[0].type, 'sprite');
});

test('architect erzeugt Fallback-Scene, wenn AI keine liefert', async () => {
  const provider = mockProvider(
    { scenes: [] },
    { entities: [{ name: 'Player', scene: 'Main' }] },
    { components: [] }
  );
  const architect = new Architect({ provider });
  const gdd = createGDD({ title: 'Game' });

  const result = await architect.architect(gdd);
  assert.strictEqual(result.scenes.length, 1);
  assert.strictEqual(result.scenes[0].name, 'Main');
});

test('architect erzeugt Fallback-Entity, wenn AI keine liefert', async () => {
  const provider = mockProvider(
    { scenes: [{ name: 'Main' }] },
    { entities: [] },
    { components: [] }
  );
  const architect = new Architect({ provider });
  const gdd = createGDD({ title: 'Game' });

  const result = await architect.architect(gdd);
  assert.strictEqual(result.entities.length, 1);
  assert.strictEqual(result.entities[0].name, 'Player');
});

test('architect wirft ohne gdd mit title', async () => {
  const architect = new Architect({ provider: mockProvider({}, {}, {}) });
  await assert.rejects(() => architect.architect({}), /"gdd" mit title ist erforderlich/);
});
