'use strict';

/**
 * Unit-Tests für Content-Hashing (AP-9.4).
 * Hash reproduzierbar, gleicher Input → gleicher Hash.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { hashString, hashFile } = require('../platform/package/contentHash.js');

test('hashString: gleicher Input → gleicher Hash', () => {
  const h1 = hashString('hello');
  const h2 = hashString('hello');
  assert.strictEqual(h1, h2);
  assert.match(h1, /^[a-f0-9]{64}$/);
});

test('hashString: verschiedener Input → verschiedener Hash', () => {
  assert.notStrictEqual(hashString('hello'), hashString('world'));
});

test('hashFile: gleiche Datei → gleicher Hash', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
  const file = path.join(dir, 'a.txt');
  await fs.writeFile(file, 'content');
  const h1 = await hashFile(file);
  const h2 = await hashFile(file);
  assert.strictEqual(h1, h2);
  assert.match(h1, /^[a-f0-9]{64}$/);
});
