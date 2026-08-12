'use strict';

/**
 * Integrationstests für Package-Download (AP-15.5).
 * Download eines hochgeladenen Packages über HTTP, Rückbau.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { RemoteRegistryServer } = require('../platform/registry/remote/remoteRegistryServer.js');
const { uploadPackage, downloadPackage, writeArchiveRecursive } = require('../platform/package/packageUpload.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

/** Legt ein Package-Verzeichnis mit Testdateien an und lädt es hoch. */
async function uploadFixture(server, port) {
  const pkgDir = await makeTempDataDir();
  await fs.mkdir(path.join(pkgDir, 'game'), { recursive: true });
  await fs.writeFile(path.join(pkgDir, 'game', 'game.project.json'), JSON.stringify({ name: 'Space Runner' }));
  await fs.writeFile(path.join(pkgDir, 'manifest.json'), JSON.stringify({ name: 'Space Runner' }));
  const base = `http://127.0.0.1:${port}`;
  const result = await uploadPackage(base, pkgDir);
  return { base, packageId: result.packageId };
}

test('Package-Download: lädt ein hochgeladenes Package', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);

  try {
    const { base, packageId } = await uploadFixture(server, port);
    const downloaded = await downloadPackage(base, packageId);
    assert.strictEqual(downloaded.packageId, packageId);
    assert.ok(downloaded.files.some((f) => f.path === 'manifest.json'));
  } finally {
    server.close();
  }
});

test('Package-Download: Datei wird real geladen (Rückbau)', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);

  try {
    const { base, packageId } = await uploadFixture(server, port);
    const downloaded = await downloadPackage(base, packageId);
    const outDir = await makeTempDataDir();
    await writeArchiveRecursive(downloaded, outDir);
    const manifest = JSON.parse(await fs.readFile(path.join(outDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.name, 'Space Runner');
  } finally {
    server.close();
  }
});

test('Package-Download: wirft bei unbekanntem Package', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);

  try {
    await assert.rejects(
      () => downloadPackage(`http://127.0.0.1:${port}`, 'pkg-gibtsnicht'),
      /Package nicht gefunden/
    );
  } finally {
    server.close();
  }
});
