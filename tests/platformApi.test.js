'use strict';

/**
 * Integrationstests für die Platform API (AP-11.4).
 * getCurrentUser, saveData, loadData.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { PlatformApi } = require('../runtime/platform_api/platformApi.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('getCurrentUser liefert einen Benutzer', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  const user = await api.getCurrentUser();
  assert.ok(user.id);
  assert.ok(user.name);
});

test('saveData/loadData: Save wird gespeichert und wieder geladen', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  await api.saveData('exp_1', { score: 100, level: 3 });
  const loaded = await api.loadData('exp_1');
  assert.deepStrictEqual(loaded, { score: 100, level: 3 });
});

test('loadData liefert null, wenn kein Save existiert', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  assert.strictEqual(await api.loadData('exp_1'), null);
});

test('saveData/loadData wirft ohne experienceId', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  await assert.rejects(() => api.saveData('', { x: 1 }), /experienceId/);
  await assert.rejects(() => api.loadData(''), /experienceId/);
});
