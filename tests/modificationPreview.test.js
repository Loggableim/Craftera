'use strict';

/**
 * Unit-Tests für die AI Modification Preview (AP-8.11).
 * Preview zeigt Diff; apply/reject funktionieren.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createPreview, diffProjects } = require('../ai/preview/modificationPreview.js');

test('diffProjects zeigt Änderungen zwischen aktuell und vorgeschlagen', () => {
  const current = { name: 'A', entities: [] };
  const proposed = { name: 'B', entities: [] };
  const changes = diffProjects(current, proposed);
  assert.strictEqual(changes.length, 1);
  assert.strictEqual(changes[0].path, 'name');
  assert.strictEqual(changes[0].before, 'A');
  assert.strictEqual(changes[0].after, 'B');
});

test('createPreview liefert Diff und apply übernimmt die Änderung', () => {
  const current = { name: 'A', entities: [] };
  const proposed = { name: 'B', entities: [{ entityId: 'ent_1' }] };
  const preview = createPreview(current, proposed);
  assert.ok(preview.diff.length >= 1, 'Diff enthält Änderungen');
  preview.apply();
  assert.strictEqual(current.name, 'B');
  assert.strictEqual(current.entities.length, 1);
});

test('reject lässt das Projekt unverändert', () => {
  const current = { name: 'A', entities: [] };
  const proposed = { name: 'B', entities: [{ entityId: 'ent_1' }] };
  const preview = createPreview(current, proposed);
  const result = preview.reject();
  assert.strictEqual(result, false);
  assert.strictEqual(current.name, 'A');
  assert.strictEqual(current.entities.length, 0);
});

test('diffProjects ist leer bei identischen Projekten', () => {
  const current = { name: 'A', entities: [] };
  const proposed = { name: 'A', entities: [] };
  assert.deepStrictEqual(diffProjects(current, proposed), []);
});
