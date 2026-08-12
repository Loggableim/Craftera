'use strict';

/**
 * Integrationstests für den Credential Store (AP-8.7).
 * Keys lokal, nie in Git/Projects.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { CredentialStore } = require('../platform/credentials/credentialStore.js');

/** Erzeugt ein temporäres Datenverzeichnis pro Test. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('set/get: Key wird gespeichert und wieder gelesen', async () => {
  const dir = await makeTempDataDir();
  const store = new CredentialStore(dir);
  await store.set('OPENAI_API_KEY', 'sk-secret-123');
  assert.strictEqual(await store.get('OPENAI_API_KEY'), 'sk-secret-123');
});

test('get für nicht vorhandenen Key liefert null', async () => {
  const dir = await makeTempDataDir();
  const store = new CredentialStore(dir);
  assert.strictEqual(await store.get('NOPE'), null);
});

test('list liefert nur Key-Namen, keine Werte', async () => {
  const dir = await makeTempDataDir();
  const store = new CredentialStore(dir);
  await store.set('A', 'value-a');
  await store.set('B', 'value-b');
  const names = await store.list();
  assert.deepStrictEqual(names.sort(), ['A', 'B']);
});

test('Key liegt unter .data/ (gitignored), nicht in Projekt-Dateien', async () => {
  const dir = await makeTempDataDir();
  const store = new CredentialStore(dir);
  await store.set('OPENAI_API_KEY', 'sk-secret-123');

  // Credentials liegen in credentials.json im dataDir.
  const credFile = path.join(dir, 'credentials.json');
  const onDisk = JSON.parse(await fs.readFile(credFile, 'utf8'));
  assert.strictEqual(onDisk.OPENAI_API_KEY, 'sk-secret-123');

  // Es gibt keine Projekt-Datei, die den Key enthält.
  const projectFile = path.join(dir, 'game.project.json');
  let projectExists = true;
  try { await fs.access(projectFile); } catch { projectExists = false; }
  assert.strictEqual(projectExists, false, 'Key darf nicht in Projekt-Datei landen');
});
