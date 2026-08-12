'use strict';

/**
 * Integrationstests für die Package-Struktur (AP-9.1).
 * Struktur festgelegt und validierbar.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { PACKAGE_STRUCTURE, validateStructure } = require('../platform/package/packageStructure.js');

/** Erzeugt ein temporäres Verzeichnis. */
async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('PACKAGE_STRUCTURE definiert Verzeichnisse und Pflicht-Dateien', () => {
  assert.deepStrictEqual(PACKAGE_STRUCTURE.directories, ['game', 'assets', 'runtime', 'metadata']);
  assert.deepStrictEqual(PACKAGE_STRUCTURE.requiredFiles, ['manifest.json', 'integrity.json']);
});

test('validateStructure: vollständige Struktur ist ok', async () => {
  const dir = await makeTempDir();
  for (const d of PACKAGE_STRUCTURE.directories) await fs.mkdir(path.join(dir, d));
  for (const f of PACKAGE_STRUCTURE.requiredFiles) await fs.writeFile(path.join(dir, f), '{}');
  const result = await validateStructure(dir);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.missingDirs, []);
  assert.deepStrictEqual(result.missingFiles, []);
});

test('validateStructure: fehlende Verzeichnisse/Dateien werden gemeldet', async () => {
  const dir = await makeTempDir();
  const result = await validateStructure(dir);
  assert.strictEqual(result.ok, false);
  assert.deepStrictEqual(result.missingDirs, ['game', 'assets', 'runtime', 'metadata']);
  assert.deepStrictEqual(result.missingFiles, ['manifest.json', 'integrity.json']);
});
