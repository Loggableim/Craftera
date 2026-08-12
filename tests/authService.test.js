'use strict';

/**
 * Unit-Tests für den Auth-Service (AP-15.2).
 * Accounts, Login/Logout, Session-Validierung.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { AuthService } = require('../platform/auth/authService.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('register + login + validate + logout', async () => {
  const dir = await makeTempDataDir();
  const auth = new AuthService(dir);

  const registered = await auth.register({ username: 'alice', password: 'geheim123' });
  assert.strictEqual(registered.username, 'alice');
  assert.ok(registered.id);

  const { token, user } = await auth.login({ username: 'alice', password: 'geheim123' });
  assert.ok(token);
  assert.strictEqual(user.username, 'alice');

  const session = await auth.validate(token);
  assert.strictEqual(session.username, 'alice');

  await auth.logout(token);
  assert.strictEqual(await auth.validate(token), null);
});

test('register wirft bei doppeltem Benutzernamen', async () => {
  const dir = await makeTempDataDir();
  const auth = new AuthService(dir);
  await auth.register({ username: 'alice', password: 'x' });
  await assert.rejects(() => auth.register({ username: 'alice', password: 'y' }), /bereits vergeben/);
});

test('login wirft bei falschem Passwort', async () => {
  const dir = await makeTempDataDir();
  const auth = new AuthService(dir);
  await auth.register({ username: 'alice', password: 'richtig' });
  await assert.rejects(() => auth.login({ username: 'alice', password: 'falsch' }), /Ungültiger Benutzername oder Passwort/);
});

test('Passwort wird nicht im Klartext gespeichert', async () => {
  const dir = await makeTempDataDir();
  const auth = new AuthService(dir);
  await auth.register({ username: 'alice', password: 'supergeheim' });
  const raw = await fs.readFile(path.join(dir, 'auth', 'accounts.json'), 'utf8');
  assert.ok(!raw.includes('supergeheim'));
  assert.ok(raw.includes('passwordHash'));
});

test('validate liefert null für ungültiges Token', async () => {
  const dir = await makeTempDataDir();
  const auth = new AuthService(dir);
  assert.strictEqual(await auth.validate('ungueltig'), null);
  assert.strictEqual(await auth.validate(''), null);
});
