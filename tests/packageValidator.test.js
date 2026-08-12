'use strict';

/**
 * Integrationstests für die Package-Validierung (AP-9.5).
 * Fehlende Datei → Fehler.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { validatePackage } = require('../platform/package/packageValidator.js');
const { PACKAGE_STRUCTURE } = require('../platform/package/packageStructure.js');

/** Erzeugt ein temporäres Package mit gültiger Struktur. */
async function makeValidPackage() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
  for (const d of PACKAGE_STRUCTURE.directories) await fs.mkdir(path.join(dir, d));
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify({ assets: [] }));
  await fs.writeFile(path.join(dir, 'integrity.json'), JSON.stringify({ hashes: {} }));
  return dir;
}

test('validatePackage: vollständiges Package ist ok', async () => {
  const dir = await makeValidPackage();
  const result = await validatePackage(dir);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.errors, []);
});

test('validatePackage: fehlende Pflicht-Datei → Fehler', async () => {
  const dir = await makeValidPackage();
  await fs.rm(path.join(dir, 'integrity.json'));
  const result = await validatePackage(dir);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('integrity.json')));
});

test('validatePackage: fehlendes Asset → Fehler', async () => {
  const dir = await makeValidPackage();
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify({ assets: ['player.png'] }));
  const result = await validatePackage(dir);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('player.png')));
});
