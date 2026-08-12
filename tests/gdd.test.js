'use strict';

/**
 * Unit-Tests für das GDD-Modell (AP-12.1).
 * GDD erzeugt, serialisierbar, als Markdown exportierbar.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  createGDD, serializeGDD, gddToMarkdown, GDD_FILENAME, GDD_MD_FILENAME,
} = require('../engine/gdd.js');

test('createGDD erzeugt ein GDD mit allen Feldern', () => {
  const gdd = createGDD({
    experienceId: 'exp_1',
    title: 'Space Runner',
    genre: 'Action',
    summary: 'Ein Weltraum-Spiel',
    coreLoop: 'Fliege, sammle, weiche aus',
    features: ['Boost', 'Highscore'],
    controls: 'Pfeiltasten',
  });
  assert.ok(gdd.gddId.startsWith('gdd_'));
  assert.strictEqual(gdd.experienceId, 'exp_1');
  assert.strictEqual(gdd.title, 'Space Runner');
  assert.strictEqual(gdd.genre, 'Action');
  assert.strictEqual(gdd.summary, 'Ein Weltraum-Spiel');
  assert.strictEqual(gdd.coreLoop, 'Fliege, sammle, weiche aus');
  assert.deepStrictEqual(gdd.features, ['Boost', 'Highscore']);
  assert.strictEqual(gdd.controls, 'Pfeiltasten');
  assert.ok(gdd.createdAt);
});

test('createGDD mit leerem Input erzeugt Defaults', () => {
  const gdd = createGDD();
  assert.strictEqual(gdd.title, '');
  assert.strictEqual(gdd.genre, '');
  assert.deepStrictEqual(gdd.features, []);
});

test('serializeGDD erzeugt gültiges JSON', () => {
  const gdd = createGDD({ title: 'Test' });
  const json = serializeGDD(gdd);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.title, 'Test');
  assert.strictEqual(parsed.gddId, gdd.gddId);
});

test('gddToMarkdown enthält Titel, Genre und Features', () => {
  const gdd = createGDD({
    title: 'Space Runner',
    genre: 'Action',
    summary: 'Ein Weltraum-Spiel',
    features: ['Boost', 'Highscore'],
  });
  const md = gddToMarkdown(gdd);
  assert.match(md, /# Space Runner/);
  assert.match(md, /\*\*Genre:\*\* Action/);
  assert.match(md, /Ein Weltraum-Spiel/);
  assert.match(md, /- Boost/);
  assert.match(md, /- Highscore/);
});

test('Dateinamen sind korrekt', () => {
  assert.strictEqual(GDD_FILENAME, 'GDD.json');
  assert.strictEqual(GDD_MD_FILENAME, 'GDD.md');
});
