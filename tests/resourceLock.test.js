'use strict';

/**
 * Unit-Tests für Resource Ownership + Locks (AP-12.8).
 * Lock verhindert Konflikt bei parallelem Zugriff.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { ResourceLockManager } = require('../runtime/orchestrator/resourceLock.js');

test('acquire sperrt Ressourcen für einen Owner', () => {
  const locks = new ResourceLockManager();
  assert.strictEqual(locks.acquire('task_1', ['entity_player', 'script_player']), true);
  assert.strictEqual(locks.ownerOf('entity_player'), 'task_1');
  assert.strictEqual(locks.lockCount, 2);
});

test('Lock verhindert Konflikt: zweiter Owner wird abgelehnt', () => {
  const locks = new ResourceLockManager();
  assert.strictEqual(locks.acquire('task_1', ['entity_player']), true);
  // task_2 will dieselbe Ressource → abgelehnt.
  assert.strictEqual(locks.acquire('task_2', ['entity_player']), false);
  assert.strictEqual(locks.ownerOf('entity_player'), 'task_1');
});

test('acquire ist atomar: Teil-Konflikt lehnt gesamten Acquire ab', () => {
  const locks = new ResourceLockManager();
  locks.acquire('task_1', ['entity_player']);
  // task_2 will entity_player (belegt) + scene_level (frei) → gesamter Acquire abgelehnt.
  assert.strictEqual(locks.acquire('task_2', ['entity_player', 'scene_level']), false);
  assert.strictEqual(locks.ownerOf('scene_level'), null); // nicht teilweise gesperrt
});

test('release gibt Ressourcen frei', () => {
  const locks = new ResourceLockManager();
  locks.acquire('task_1', ['entity_player']);
  locks.release('task_1', ['entity_player']);
  assert.strictEqual(locks.ownerOf('entity_player'), null);
  assert.strictEqual(locks.lockCount, 0);
});

test('gleicher Owner kann dieselbe Ressource erneut sperren', () => {
  const locks = new ResourceLockManager();
  locks.acquire('task_1', ['entity_player']);
  assert.strictEqual(locks.acquire('task_1', ['entity_player']), true);
});

test('acquire wirft ohne owner', () => {
  const locks = new ResourceLockManager();
  assert.throws(() => locks.acquire('', ['x']), /owner/);
});
