'use strict';

/**
 * Unit-Tests für den ID-Generator (AP-2.1).
 * Läuft mit Node's eingebautem Test-Runner: `node --test tests/`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createId, VALID_TYPES } = require('../engine/ids.js');

test('createId erzeugt IDs mit korrektem Typ-Präfix', () => {
  assert.match(createId('exp'), /^exp_[a-z0-9]+$/);
  assert.match(createId('ver'), /^ver_[a-z0-9]+$/);
  assert.match(createId('proj'), /^proj_[a-z0-9]+$/);
});

test('createId erzeugt eindeutige IDs (Kollisionsfreiheit)', () => {
  const seen = new Set();
  const count = 10000;
  for (let i = 0; i < count; i++) {
    seen.add(createId('exp'));
  }
  assert.strictEqual(seen.size, count, 'Alle IDs müssen eindeutig sein');
});

test('createId wirft bei unbekanntem Typ', () => {
  assert.throws(() => createId('unknown'), /Unbekannter ID-Typ/);
});

test('VALID_TYPES enthält die erwarteten Typen', () => {
  for (const t of ['exp', 'ver', 'proj', 'scene', 'ent', 'comp', 'asset', 'cmd']) {
    assert.ok(VALID_TYPES.has(t), `Typ "${t}" muss erlaubt sein`);
  }
});
