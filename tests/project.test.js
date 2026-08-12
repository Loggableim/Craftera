'use strict';

/**
 * Unit-Tests für das GameProject-Modell (AP-4.1).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createProject, FORMAT_VERSION } = require('../engine/project.js');

test('createProject erzeugt Objekt mit allen Kernfeldern', () => {
  const p = createProject({ experienceId: 'exp_abc', name: 'Space Runner' });
  assert.match(p.projectId, /^proj_[a-z0-9]+$/);
  assert.strictEqual(p.experienceId, 'exp_abc');
  assert.strictEqual(p.name, 'Space Runner');
  assert.strictEqual(p.formatVersion, FORMAT_VERSION);
  assert.deepStrictEqual(p.scenes, []);
  assert.deepStrictEqual(p.entities, []);
  assert.deepStrictEqual(p.components, []);
  assert.deepStrictEqual(p.assets, []);
});

test('createProject erzeugt eindeutige projectId', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(createProject({}).projectId);
  }
  assert.strictEqual(ids.size, 1000);
});

test('FORMAT_VERSION ist 1', () => {
  assert.strictEqual(FORMAT_VERSION, 1);
});
