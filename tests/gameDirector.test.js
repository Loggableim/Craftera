'use strict';

/**
 * Unit-Tests für den Game Director (AP-12.2).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { GameDirector, SYSTEM_PROMPT } = require('../ai/agents/gameDirector.js');

/** Mock-Provider, der ein vorgegebenes JSON liefert. */
function mockProvider(structuredResult) {
  return {
    async generateStructured() {
      return structuredResult;
    },
  };
}

test('SYSTEM_PROMPT gibt die GDD-Struktur vor', () => {
  assert.match(SYSTEM_PROMPT, /"title"/);
  assert.match(SYSTEM_PROMPT, /"genre"/);
  assert.match(SYSTEM_PROMPT, /"coreLoop"/);
  assert.match(SYSTEM_PROMPT, /"features"/);
});

test('direct erzeugt ein GDD aus der strukturierten Antwort', async () => {
  const provider = mockProvider({
    title: 'Space Runner',
    genre: 'Arcade',
    summary: 'Ein schnelles Arcade-Spiel.',
    coreLoop: 'Renne, weiche Hindernissen aus, sammle Punkte.',
    features: ['Sprint', 'Power-Ups', 'Highscore'],
    controls: 'Pfeiltasten zum Steuern',
  });
  const director = new GameDirector({ provider });
  const gdd = await director.direct('Ein Weltraum-Rennspiel');

  assert.match(gdd.gddId, /^gdd_[a-z0-9]+$/);
  assert.strictEqual(gdd.title, 'Space Runner');
  assert.strictEqual(gdd.genre, 'Arcade');
  assert.strictEqual(gdd.coreLoop, 'Renne, weiche Hindernissen aus, sammle Punkte.');
  assert.deepStrictEqual(gdd.features, ['Sprint', 'Power-Ups', 'Highscore']);
  assert.strictEqual(gdd.controls, 'Pfeiltasten zum Steuern');
});

test('direct übernimmt experienceId', async () => {
  const provider = mockProvider({ title: 'X', genre: 'Y' });
  const director = new GameDirector({ provider });
  const gdd = await director.direct('Idee', { experienceId: 'exp_1' });
  assert.strictEqual(gdd.experienceId, 'exp_1');
});

test('direct wirft ohne prompt', async () => {
  const director = new GameDirector({ provider: mockProvider({}) });
  await assert.rejects(() => director.direct(''), /"prompt" ist erforderlich/);
});

test('direct setzt Defaults, wenn Felder fehlen', async () => {
  const provider = mockProvider({ title: 'Nur Titel' });
  const director = new GameDirector({ provider });
  const gdd = await director.direct('Idee');
  assert.strictEqual(gdd.title, 'Nur Titel');
  assert.strictEqual(gdd.genre, '');
  assert.deepStrictEqual(gdd.features, []);
});
