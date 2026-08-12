'use strict';

/**
 * Integrationstests für Package-Upload/Download (AP-15.4, AP-15.5).
 * Upload eines Package-Verzeichnisses über HTTP, Download und Rückbau.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { RemoteRegistryServer } = require('../platform/registry/remote/remoteRegistryServer.js');
const { packPackage, uploadPackage, writeArchiveRecursive } = require('../platform/package/packageUpload.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('Package-Upload: Datei wird hochgeladen und gespeichert', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const base = `http://127.0.0.1:${port}`;

  try {
    // Package-Verzeichnis anlegen.
    const pkgDir = await makeTempDataDir();
    await fs.mkdir(path.join(pkgDir, 'game'), { recursive: true });
    await fs.writeFile(path.join(pkgDir, 'game', 'game.project.json'), JSON.stringify({ name: 'X' }));
    await fs.writeFile(path.join(pkgDir, 'manifest.json'), JSON.stringify({ name: 'X' }));

    const result = await uploadPackage(base, pkgDir);
    assert.strictEqual(result.uploaded, true);
    assert.ok(result.packageId);

    // Server-seitig gespeichert.
    const saved = await fs.readFile(path.join(dataDir, 'uploads', `${result.packageId}.json`), 'utf8');
    const archive = JSON.parse(saved);
    assert.ok(archive.files.some((f) => f.path === 'manifest.json'));
  } finally {
    server.close();
  }
});

test('Package-Roundtrip: Upload → Download → Rückbau identisch', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const base = `http://127.0.0.1:${port}`;

  try {
    const pkgDir = await makeTempDataDir();
    await fs.mkdir(path.join(pkgDir, 'game'), { recursive: true });
    await fs.writeFile(path.join(pkgDir, 'game', 'game.project.json'), JSON.stringify({ name: 'Space Runner' }));
    await fs.writeFile(path.join(pkgDir, 'manifest.json'), JSON.stringify({ name: 'Space Runner' }));

    const archive = await packPackage(pkgDir);
    const result = await uploadPackage(base, pkgDir);

    // Download.
    const res = await fetch(`${base}/api/packages/${result.packageId}`);
    const downloaded = await res.json();
    assert.strictEqual(res.status, 200);

    // Rückbau in neues Verzeichnis.
    const outDir = await makeTempDataDir();
    await writeArchiveRecursive(downloaded, outDir);
    const manifest = JSON.parse(await fs.readFile(path.join(outDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.name, 'Space Runner');
    const game = JSON.parse(await fs.readFile(path.join(outDir, 'game', 'game.project.json'), 'utf8'));
    assert.strictEqual(game.name, 'Space Runner');
  } finally {
    server.close();
  }
});

test('Upload wirft bei ungültigem Archiv', async () => {
  const dataDir = await makeTempDataDir();
  const server = new RemoteRegistryServer(dataDir);
  const port = await server.listen(0);
  const base = `http://127.0.0.1:${port}`;

  try {
    const res = await fetch(`${base}/api/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
    assert.strictEqual(res.status, 400);
  } finally {
    server.close();
  }
});
