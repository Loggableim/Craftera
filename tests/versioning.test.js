'use strict';

/**
 * Unit-Tests für die Format-Versionierung (AP-4.7).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  assertSupportedVersion, migrateProject, MIGRATIONS,
} = require('../engine/serialization.js');
const { FORMAT_VERSION } = require('../engine/project.js');

test('assertSupportedVersion akzeptiert aktuelle Version', () => {
  assert.doesNotThrow(() => assertSupportedVersion({ formatVersion: FORMAT_VERSION }));
});

test('assertSupportedVersion wirft bei fehlender formatVersion', () => {
  assert.throws(() => assertSupportedVersion({}), /keine formatVersion/);
});

test('assertSupportedVersion wirft bei neuerer Version', () => {
  assert.throws(
    () => assertSupportedVersion({ formatVersion: FORMAT_VERSION + 1 }),
    /neuer als unterstützt/,
  );
});

test('assertSupportedVersion wirft bei unbekannter (zu alter) Version', () => {
  assert.throws(() => assertSupportedVersion({ formatVersion: 0 }), /unbekannt/);
});

test('migrateProject lässt aktuelle Version unverändert', () => {
  const project = { formatVersion: FORMAT_VERSION, name: 'X' };
  const result = migrateProject(project);
  assert.strictEqual(result, project);
});

test('migrateProject wirft, wenn keine Migration definiert ist', () => {
  assert.throws(
    () => migrateProject({ formatVersion: FORMAT_VERSION - 1 }),
    /Keine Migration/,
  );
});

test('MIGRATIONS ist ein Objekt', () => {
  assert.strictEqual(typeof MIGRATIONS, 'object');
});
