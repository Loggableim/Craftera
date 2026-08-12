'use strict';

/**
 * Integrationstests für das Task-Repository (AP-12.9).
 * Tasks pro Experience persistiert, Status setzen.
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { TaskRepository } = require('../platform/tasks/taskRepository.js');

/** Erzeugt ein temporäres Datenverzeichnis. */
async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-test-'));
}

test('create/list: Task wird persistiert und geladen', async () => {
  const dir = await makeTempDataDir();
  const repo = new TaskRepository(dir);
  const task = await repo.create('exp_1', { title: 'Create Player Controller', agent: 'gameplay' });
  assert.ok(task.id.startsWith('task_'));
  assert.strictEqual(task.status, 'BACKLOG');

  const tasks = await repo.list('exp_1');
  assert.strictEqual(tasks.length, 1);
  assert.strictEqual(tasks[0].title, 'Create Player Controller');
});

test('list ohne Tasks liefert leeres Array', async () => {
  const dir = await makeTempDataDir();
  const repo = new TaskRepository(dir);
  assert.deepStrictEqual(await repo.list('exp_1'), []);
});

test('setStatus aktualisiert den echten Status', async () => {
  const dir = await makeTempDataDir();
  const repo = new TaskRepository(dir);
  const task = await repo.create('exp_1', { title: 'X', agent: 'code' });
  const updated = await repo.setStatus('exp_1', task.id, 'IN_PROGRESS');
  assert.strictEqual(updated.status, 'IN_PROGRESS');

  // Status ist persistiert.
  const tasks = await repo.list('exp_1');
  assert.strictEqual(tasks[0].status, 'IN_PROGRESS');
});

test('setStatus wirft bei unbekanntem Task', async () => {
  const dir = await makeTempDataDir();
  const repo = new TaskRepository(dir);
  await assert.rejects(() => repo.setStatus('exp_1', 'task_nope', 'DONE'), /nicht gefunden/);
});

test('Tasks sind pro Experience getrennt', async () => {
  const dir = await makeTempDataDir();
  const repo = new TaskRepository(dir);
  await repo.create('exp_1', { title: 'A', agent: 'code' });
  await repo.create('exp_2', { title: 'B', agent: 'ui' });
  assert.strictEqual((await repo.list('exp_1')).length, 1);
  assert.strictEqual((await repo.list('exp_2')).length, 1);
});
