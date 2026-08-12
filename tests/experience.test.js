'use strict';

/**
 * Unit-Tests für das Experience-Modell (AP-2.2).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createExperience, EXPERIENCE_STATUS, slugify } = require('../engine/experience.js');

test('createExperience erzeugt Objekt mit allen Kernfeldern', () => {
  const exp = createExperience({ name: 'Wizard Survivors', tags: ['roguelite', '2d'] });
  assert.match(exp.experienceId, /^exp_[a-z0-9]+$/);
  assert.strictEqual(exp.name, 'Wizard Survivors');
  assert.strictEqual(exp.slug, 'wizard-survivors');
  assert.strictEqual(exp.status, 'draft');
  assert.deepStrictEqual(exp.tags, ['roguelite', '2d']);
});

test('createExperience erzeugt Slug aus Name, wenn keiner angegeben', () => {
  const exp = createExperience({ name: 'Space Runner' });
  assert.strictEqual(exp.slug, 'space-runner');
});

test('createExperience übernimmt expliziten Slug', () => {
  const exp = createExperience({ name: 'Wizard Survivors', slug: 'wiz' });
  assert.strictEqual(exp.slug, 'wiz');
});

test('createExperience wirft ohne Name', () => {
  assert.throws(() => createExperience({}), /name.*erforderlich/);
});

test('createExperience erzeugt eindeutige experienceId', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(createExperience({ name: 'X' }).experienceId);
  }
  assert.strictEqual(ids.size, 1000);
});

test('EXPERIENCE_STATUS enthält erwartete Werte', () => {
  assert.deepStrictEqual(EXPERIENCE_STATUS, ['draft', 'published', 'archived']);
});

test('slugify erzeugt URL-freundlichen Slug', () => {
  assert.strictEqual(slugify('  Space  Runner!  '), 'space-runner');
});
