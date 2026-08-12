'use strict';

/**
 * Unit-Tests für den Runtime-Compatibility-Check (AP-9.6).
 * Inkompatibel → Fehler.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { compareVersions, checkCompatibility } = require('../platform/package/runtimeCompatibility.js');

test('compareVersions vergleicht semantische Versionen', () => {
  assert.strictEqual(compareVersions('1.0.0', '1.0.0'), 0);
  assert.strictEqual(compareVersions('1.0.0', '1.1.0'), -1);
  assert.strictEqual(compareVersions('2.0.0', '1.9.9'), 1);
  assert.strictEqual(compareVersions('1.0', '1.0.0'), 0);
});

test('checkCompatibility: kompatibel ist ok', () => {
  const manifest = { minimumRuntimeVersion: '1.0.0', targetRuntimeVersion: '2.0.0' };
  const result = checkCompatibility(manifest, '1.5.0');
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.errors, []);
});

test('checkCompatibility: Runtime älter als minimum → Fehler', () => {
  const manifest = { minimumRuntimeVersion: '2.0.0' };
  const result = checkCompatibility(manifest, '1.5.0');
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors[0].includes('minimumRuntimeVersion'));
});

test('checkCompatibility: Runtime neuer als target → Fehler', () => {
  const manifest = { targetRuntimeVersion: '1.0.0' };
  const result = checkCompatibility(manifest, '2.0.0');
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors[0].includes('targetRuntimeVersion'));
});
