'use strict';

/**
 * Integrationstests für Model Profiles (AP-8.8).
 * Profile konfigurierbar, Settings speichert Profile.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { ModelProfiles } = require('../ai/providers/modelProfiles.js');

/** Erzeugt ein temporäres Datenverzeichnis pro Test. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('setProfile/getProfile: Profil wird gespeichert und wieder gelesen', async () => {
  const dir = await makeTempDataDir();
  const profiles = new ModelProfiles(dir);
  await profiles.setProfile('chat', { provider: 'openai', model: 'gpt-4o' });
  const p = await profiles.getProfile('chat');
  assert.deepStrictEqual(p, { provider: 'openai', model: 'gpt-4o' });
});

test('getProfile für nicht konfigurierte Aufgabe liefert null', async () => {
  const dir = await makeTempDataDir();
  const profiles = new ModelProfiles(dir);
  assert.strictEqual(await profiles.getProfile('nope'), null);
});

test('listProfiles liefert alle Aufgaben-Profile', async () => {
  const dir = await makeTempDataDir();
  const profiles = new ModelProfiles(dir);
  await profiles.setProfile('chat', { provider: 'openai', model: 'gpt-4o' });
  await profiles.setProfile('codegen', { provider: 'anthropic', model: 'claude-3-5-sonnet' });
  const all = await profiles.listProfiles();
  assert.deepStrictEqual(Object.keys(all).sort(), ['chat', 'codegen']);
});

test('setProfile wirft ohne task/provider/model', async () => {
  const dir = await makeTempDataDir();
  const profiles = new ModelProfiles(dir);
  await assert.rejects(() => profiles.setProfile('', { provider: 'x', model: 'y' }), /task/);
  await assert.rejects(() => profiles.setProfile('chat', { provider: '', model: 'y' }), /provider/);
  await assert.rejects(() => profiles.setProfile('chat', { provider: 'x', model: '' }), /model/);
});

test('Profile werden in modelProfiles.json persistiert', async () => {
  const dir = await makeTempDataDir();
  const profiles = new ModelProfiles(dir);
  await profiles.setProfile('chat', { provider: 'openai', model: 'gpt-4o' });
  const onDisk = JSON.parse(await fs.readFile(path.join(dir, 'modelProfiles.json'), 'utf8'));
  assert.deepStrictEqual(onDisk.chat, { provider: 'openai', model: 'gpt-4o' });
});
