'use strict';

/**
 * Unit-Tests für die CommandHistory (AP-5.8).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { CommandHistory } = require('../engine/commands/commandHistory.js');

/** Baut einen einfachen Command, der einen Zähler ändert. */
function makeCommand(counter, delta) {
  return {
    execute() { counter.value += delta; return counter.value; },
    undo() { counter.value -= delta; },
    redo() { counter.value += delta; },
  };
}

test('undo×3 → redo×3 stellt den Zustand wieder her', () => {
  const history = new CommandHistory();
  const counter = { value: 0 };

  history.execute(makeCommand(counter, 1));
  history.execute(makeCommand(counter, 2));
  history.execute(makeCommand(counter, 3));
  assert.strictEqual(counter.value, 6);

  // undo×3
  assert.strictEqual(history.undo(), true);
  assert.strictEqual(history.undo(), true);
  assert.strictEqual(history.undo(), true);
  assert.strictEqual(counter.value, 0);
  assert.strictEqual(history.canUndo(), false);

  // redo×3
  assert.strictEqual(history.redo(), true);
  assert.strictEqual(history.redo(), true);
  assert.strictEqual(history.redo(), true);
  assert.strictEqual(counter.value, 6);
  assert.strictEqual(history.canRedo(), false);
});

test('undo/redo auf leerer History liefern false', () => {
  const history = new CommandHistory();
  assert.strictEqual(history.undo(), false);
  assert.strictEqual(history.redo(), false);
  assert.strictEqual(history.canUndo(), false);
  assert.strictEqual(history.canRedo(), false);
});

test('neuer Command nach undo invalidiert den Redo-Stack', () => {
  const history = new CommandHistory();
  const counter = { value: 0 };
  history.execute(makeCommand(counter, 1));
  history.execute(makeCommand(counter, 2));
  history.undo();
  assert.strictEqual(history.canRedo(), true);
  history.execute(makeCommand(counter, 10));
  assert.strictEqual(history.canRedo(), false);
});

test('execute wirft bei Command ohne execute/undo', () => {
  const history = new CommandHistory();
  assert.throws(() => history.execute({}), /execute- und undo-Funktion/);
});
