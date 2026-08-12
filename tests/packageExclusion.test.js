'use strict';

/**
 * Integrationstests für den Ausschluss von Nicht-Laufzeitdaten (AP-9.8).
 * Keys nicht im Package.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { buildPackage, isExcluded } = require('../platform/package/packageBuilder.js');
const { createProject } = require('../engine/project.js');

/** Erzeugt ein temporäres Verzeichnis. */
async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('isExcluded erkennt Nicht-Laufzeitdaten', () => {
  assert.strictEqual(isExcluded('.git/config'), true);
  assert.strictEqual(isExcluded('credentials.json'), true);
  assert.strictEqual(isExcluded('logs/app.log'), true);
  assert.strictEqual(isExcluded('ai-memory/state.json'), true);
  assert.strictEqual(isExcluded('runtime.js'), false);
});

test('buildPackage schließt Keys und Nicht-Laufzeitdaten aus dem Package aus', async () => {
  const out = await makeTempDir();
  const src = await makeTempDir();

  // Quellverzeichnis mit Laufzeitdatei + Nicht-Laufzeitdaten.
  await fs.writeFile(path.join(src, 'runtime.js'), 'console.log(1)');
  await fs.writeFile(path.join(src, 'credentials.json'), '{"OPENAI_API_KEY":"sk-secret"}');
  await fs.mkdir(path.join(src, 'logs'));
  await fs.writeFile(path.join(src, 'logs', 'app.log'), 'log');
  await fs.mkdir(path.join(src, '.git'));
  await fs.writeFile(path.join(src, '.git', 'config'), 'git');

  const project = createProject({ name: 'Space Runner' });
  const packageDir = await buildPackage(project, out, { sourceDir: src });

  // Laufzeitdatei kopiert.
  const runtimeJs = path.join(packageDir, 'runtime', 'runtime.js');
  assert.strictEqual(await fs.stat(runtimeJs).then(() => true), true);

  // Keys/Nicht-Laufzeitdaten NICHT im Package.
  const credentialsInPackage = path.join(packageDir, 'runtime', 'credentials.json');
  assert.strictEqual(await fs.stat(credentialsInPackage).then(() => true).catch(() => false), false);
  const logInPackage = path.join(packageDir, 'runtime', 'logs', 'app.log');
  assert.strictEqual(await fs.stat(logInPackage).then(() => true).catch(() => false), false);
  const gitInPackage = path.join(packageDir, 'runtime', '.git', 'config');
  assert.strictEqual(await fs.stat(gitInPackage).then(() => true).catch(() => false), false);
});
