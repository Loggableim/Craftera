'use strict';

/**
 * Unit-Tests für Creator Identity (AP-15.3).
 * Creator-Profil erstellen/laden, Handle-Generierung.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { CreatorProfileService } = require('../platform/creators/creatorProfileService.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('upsert erstellt ein Creator-Profil mit Handle', async () => {
  const dir = await makeTempDataDir();
  const service = new CreatorProfileService(dir);
  const profile = await service.upsert({ userId: 'u1', displayName: 'Alice Maker', bio: 'Spiele-Entwicklerin' });
  assert.strictEqual(profile.userId, 'u1');
  assert.strictEqual(profile.handle, 'alice-maker');
  assert.strictEqual(profile.displayName, 'Alice Maker');
  assert.strictEqual(profile.bio, 'Spiele-Entwicklerin');
  assert.ok(profile.createdAt);
});

test('get lädt das Profil zurück', async () => {
  const dir = await makeTempDataDir();
  const service = new CreatorProfileService(dir);
  await service.upsert({ userId: 'u1', displayName: 'Alice Maker' });
  const loaded = await service.get('u1');
  assert.strictEqual(loaded.handle, 'alice-maker');
  assert.strictEqual(loaded.displayName, 'Alice Maker');
});

test('get liefert null für unbekannten User', async () => {
  const dir = await makeTempDataDir();
  const service = new CreatorProfileService(dir);
  assert.strictEqual(await service.get('unbekannt'), null);
});

test('upsert wirft ohne userId oder displayName', async () => {
  const dir = await makeTempDataDir();
  const service = new CreatorProfileService(dir);
  await assert.rejects(() => service.upsert({ displayName: 'X' }), /userId/);
  await assert.rejects(() => service.upsert({ userId: 'u1' }), /displayName/);
});
