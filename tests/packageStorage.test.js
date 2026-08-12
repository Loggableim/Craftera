'use strict';

/**
 * Unit-Tests für Package Storage (AP-15.9).
 * Abstrakte Schnittstelle + lokale Dateisystem-Implementierung.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { PackageStorage } = require('../platform/storage/packageStorage.js');
const { LocalPackageStorage } = require('../platform/storage/localPackageStorage.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('PackageStorage ist abstrakt (put wirft)', async () => {
  const storage = new PackageStorage();
  await assert.rejects(() => storage.put('p1', {}), /nicht implementiert/);
});

test('LocalPackageStorage: put/get/exists', async () => {
  const dir = await makeTempDataDir();
  const storage = new LocalPackageStorage(dir);
  const archive = { packageId: 'pkg_1', files: [{ path: 'manifest.json', content: 'e30=' }] };

  const result = await storage.put('pkg_1', archive);
  assert.strictEqual(result.uploaded, true);
  assert.strictEqual(await storage.exists('pkg_1'), true);

  const loaded = await storage.get('pkg_1');
  assert.strictEqual(loaded.packageId, 'pkg_1');
  assert.strictEqual(loaded.files[0].path, 'manifest.json');
});

test('LocalPackageStorage: get/exists für unbekanntes Package', async () => {
  const dir = await makeTempDataDir();
  const storage = new LocalPackageStorage(dir);
  assert.strictEqual(await storage.get('pkg_nope'), null);
  assert.strictEqual(await storage.exists('pkg_nope'), false);
});

test('Server nutzt die Storage-Schnittstelle', async () => {
  const { RemoteRegistryServer } = require('../platform/registry/remote/remoteRegistryServer.js');
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  try {
    // Server hat eine packageStorage-Instanz mit put/get.
    assert.ok(server.packageStorage);
    const archive = { packageId: 'pkg_x', files: [] };
    await server.packageStorage.put('pkg_x', archive);
    assert.deepStrictEqual(await server.packageStorage.get('pkg_x'), archive);
  } finally {
    server.close();
  }
});
