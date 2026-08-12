'use strict';

/**
 * Integrationstests für das VersionRepository (AP-2.5).
 * Versionen pro Experience in einem temporären Verzeichnis.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { VersionRepository } = require('../platform/experiences/versionRepository.js');
const { createVersion } = require('../engine/version.js');

/** Erzeugt ein temporäres Datenverzeichnis pro Test. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('save + get: Version wird gespeichert und wieder geladen', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new VersionRepository(dataDir);

  const v = createVersion({ experienceId: 'exp_abc', versionNumber: 1 });
  await repo.save(v);

  const loaded = await repo.get('exp_abc', v.versionId);
  assert.ok(loaded, 'Version muss geladen werden');
  assert.strictEqual(loaded.versionId, v.versionId);
  assert.strictEqual(loaded.experienceId, 'exp_abc');
  assert.strictEqual(loaded.versionNumber, 1);
});

test('get für nicht vorhandene Version liefert null', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new VersionRepository(dataDir);
  const result = await repo.get('exp_abc', 'ver_nonexistent');
  assert.strictEqual(result, null);
});

test('list: Versionen pro Experience werden gelistet', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new VersionRepository(dataDir);

  await repo.save(createVersion({ experienceId: 'exp_abc', versionNumber: 1 }));
  await repo.save(createVersion({ experienceId: 'exp_abc', versionNumber: 2 }));
  await repo.save(createVersion({ experienceId: 'exp_other', versionNumber: 1 }));

  const abc = await repo.list('exp_abc');
  const other = await repo.list('exp_other');

  assert.strictEqual(abc.length, 2);
  assert.strictEqual(other.length, 1);
  const numbers = abc.map((v) => v.versionNumber).sort();
  assert.deepStrictEqual(numbers, [1, 2]);
});

test('list für Experience ohne Versionen liefert leeres Array', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new VersionRepository(dataDir);
  const result = await repo.list('exp_empty');
  assert.deepStrictEqual(result, []);
});

test('save wirft ohne versionId oder experienceId', async () => {
  const dataDir = await makeTempDataDir();
  const repo = new VersionRepository(dataDir);
  await assert.rejects(() => repo.save({ versionNumber: 1 }), /versionId/);
  await assert.rejects(() => repo.save({ versionId: 'ver_x' }), /experienceId/);
});
