'use strict';

/**
 * Unit-Tests für das Capability-Modell (AP-11.6).
 * Default DENY, nicht erlaubte Capability blockiert.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { checkCapability, KNOWN_CAPABILITIES } = require('../runtime/sandbox/capabilities.js');

test('erlaubte Capability ist ok', () => {
  const manifest = { permissions: ['save', 'load'] };
  assert.strictEqual(checkCapability(manifest, 'save').ok, true);
  assert.strictEqual(checkCapability(manifest, 'load').ok, true);
});

test('nicht erlaubte Capability wird blockiert (Default DENY)', () => {
  const manifest = { permissions: ['save'] };
  const result = checkCapability(manifest, 'network');
  assert.strictEqual(result.ok, false);
  assert.match(result.reason, /nicht erlaubt/);
});

test('Manifest ohne permissions erlaubt nichts (Default DENY)', () => {
  const manifest = {};
  assert.strictEqual(checkCapability(manifest, 'save').ok, false);
  assert.strictEqual(checkCapability(manifest, 'network').ok, false);
});

test('unbekannte Capability wird blockiert', () => {
  const manifest = { permissions: ['save'] };
  const result = checkCapability(manifest, 'hack');
  assert.strictEqual(result.ok, false);
  assert.match(result.reason, /Unbekannte Capability/);
});

test('KNOWN_CAPABILITIES enthält die bekannten Capabilities', () => {
  assert.ok(KNOWN_CAPABILITIES.includes('save'));
  assert.ok(KNOWN_CAPABILITIES.includes('network'));
});
