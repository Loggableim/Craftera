'use strict';

/**
 * Unit-Tests für den Manifest-Generator (AP-9.3).
 * Manifest enthält alle Pflichtfelder.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { generateManifest } = require('../platform/package/manifestGenerator.js');
const { PACKAGE_FORMAT_VERSION } = require('../platform/package/packageFormatVersion.js');
const { FORMAT_VERSION } = require('../engine/project.js');

test('generateManifest enthält packageFormatVersion getrennt von formatVersion', () => {
  const manifest = generateManifest({ experienceId: 'exp_1', formatVersion: 99 });
  assert.strictEqual(manifest.packageFormatVersion, PACKAGE_FORMAT_VERSION);
  assert.strictEqual(manifest.formatVersion, 99);
  // packageFormatVersion kommt aus einem eigenen Modul, getrennt von formatVersion.
  assert.strictEqual(typeof PACKAGE_FORMAT_VERSION, 'number');
  assert.strictEqual(typeof FORMAT_VERSION, 'number');
});

test('generateManifest erzeugt Manifest mit allen Pflichtfeldern', () => {
  const manifest = generateManifest({
    experienceId: 'exp_1',
    versionId: 'ver_1',
    runtimeVersion: '0.1.0',
    entryScene: 'scene_1',
    permissions: ['save'],
    contentHash: 'abc123',
  });
  assert.strictEqual(manifest.formatVersion, 1);
  assert.strictEqual(manifest.experienceId, 'exp_1');
  assert.strictEqual(manifest.versionId, 'ver_1');
  assert.strictEqual(manifest.runtimeVersion, '0.1.0');
  assert.strictEqual(manifest.entryScene, 'scene_1');
  assert.deepStrictEqual(manifest.permissions, ['save']);
  assert.strictEqual(manifest.contentHash, 'abc123');
});

test('generateManifest setzt Defaults für optionale Felder', () => {
  const manifest = generateManifest({ experienceId: 'exp_1' });
  assert.strictEqual(manifest.versionId, '');
  assert.strictEqual(manifest.runtimeVersion, '');
  assert.strictEqual(manifest.entryScene, '');
  assert.deepStrictEqual(manifest.permissions, []);
  assert.strictEqual(manifest.contentHash, '');
});

test('generateManifest wirft ohne experienceId', () => {
  assert.throws(() => generateManifest({}), /experienceId/);
});
