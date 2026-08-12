'use strict';

/**
 * Unit-Tests für das ExperienceVersion-Modell (AP-2.3).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createVersion, VERSION_STATUS } = require('../engine/version.js');

test('createVersion erzeugt Objekt mit allen Kernfeldern', () => {
  const v = createVersion({ experienceId: 'exp_abc', versionNumber: 2, packageHash: 'sha256:xyz' });
  assert.match(v.versionId, /^ver_[a-z0-9]+$/);
  assert.strictEqual(v.experienceId, 'exp_abc');
  assert.strictEqual(v.versionNumber, 2);
  assert.strictEqual(v.status, 'DRAFT');
  assert.strictEqual(v.packageHash, 'sha256:xyz');
});

test('createVersion setzt versionNumber auf 1, wenn nicht angegeben', () => {
  const v = createVersion({ experienceId: 'exp_abc' });
  assert.strictEqual(v.versionNumber, 1);
});

test('createVersion setzt packageHash auf leer, wenn nicht angegeben', () => {
  const v = createVersion({ experienceId: 'exp_abc' });
  assert.strictEqual(v.packageHash, '');
});

test('createVersion wirft ohne experienceId', () => {
  assert.throws(() => createVersion({}), /experienceId.*erforderlich/);
});

test('createVersion erzeugt eindeutige versionId', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(createVersion({ experienceId: 'exp_abc' }).versionId);
  }
  assert.strictEqual(ids.size, 1000);
});

test('VERSION_STATUS enthält erwartete Werte', () => {
  assert.deepStrictEqual(VERSION_STATUS, [
    'DRAFT', 'VALIDATING', 'READY', 'PUBLISHED', 'DEPRECATED', 'REJECTED', 'BROKEN',
  ]);
});
