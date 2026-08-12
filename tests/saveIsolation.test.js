'use strict';

/**
 * Integrationstests für die Save-Isolation (AP-11.5).
 * Saves pro Experience getrennt, kein Cross-Access.
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

test('Saves liegen getrennt pro Experience (kein Cross-Access)', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);

  await api.saveData('exp_1', { score: 100 });
  await api.saveData('exp_2', { score: 999 });

  // Jede Experience lädt nur ihren eigenen Save.
  assert.deepStrictEqual(await api.loadData('exp_1'), { score: 100 });
  assert.deepStrictEqual(await api.loadData('exp_2'), { score: 999 });
});

test('Saves liegen unter userdata/<experience-id>/', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  await api.saveData('exp_1', { score: 100 });

  const savePath = path.join(dir, 'userdata', 'exp_1', 'save.json');
  const onDisk = JSON.parse(await fs.readFile(savePath, 'utf8'));
  assert.deepStrictEqual(onDisk, { score: 100 });
});

test('Eine Experience kann den Save einer anderen nicht lesen', async () => {
  const dir = await makeTempDataDir();
  const api = new PlatformApi(dir);
  await api.saveData('exp_1', { secret: 'nur-fuer-exp1' });

  // exp_2 hat keinen eigenen Save → null (kein Cross-Access zu exp_1).
  assert.strictEqual(await api.loadData('exp_2'), null);
});
