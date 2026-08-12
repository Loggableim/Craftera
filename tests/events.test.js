'use strict';

/**
 * Unit-Tests für das Event-System (AP-6.16).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { createEvent, matchesTrigger, triggerEvent } = require('../engine/events.js');

test('createEvent erzeugt Event mit WHEN und THEN', () => {
  const event = createEvent({
    name: 'Coin Pickup',
    when: { type: 'touches', subject: 'Coin' },
    actions: [{ type: 'addScore', value: 1 }, { type: 'destroy', target: 'Coin' }],
  });
  assert.match(event.eventId, /^cmd_[a-z0-9]+$/);
  assert.strictEqual(event.name, 'Coin Pickup');
  assert.strictEqual(event.when.type, 'touches');
  assert.strictEqual(event.actions.length, 2);
});

test('matchesTrigger trifft zu bei passendem Signal', () => {
  const event = createEvent({ name: 'E', when: { type: 'touches', subject: 'Coin' }, actions: [] });
  assert.strictEqual(matchesTrigger(event, { type: 'touches', subject: 'Coin' }), true);
  assert.strictEqual(matchesTrigger(event, { type: 'touches', subject: 'Enemy' }), false);
  assert.strictEqual(matchesTrigger(event, { type: 'spawn', subject: 'Coin' }), false);
});

test('triggerEvent führt Aktionen aus, wenn Trigger zutrifft', () => {
  const event = createEvent({
    name: 'Coin Pickup',
    when: { type: 'touches', subject: 'Coin' },
    actions: [{ type: 'addScore', value: 1 }],
  });
  const executed = triggerEvent(event, { type: 'touches', subject: 'Coin' });
  assert.strictEqual(executed.length, 1);
  assert.strictEqual(executed[0].type, 'addScore');
  assert.strictEqual(executed[0].executed, true);
});

test('triggerEvent führt keine Aktionen aus, wenn Trigger nicht zutrifft', () => {
  const event = createEvent({
    name: 'Coin Pickup',
    when: { type: 'touches', subject: 'Coin' },
    actions: [{ type: 'addScore', value: 1 }],
  });
  const executed = triggerEvent(event, { type: 'spawn', subject: 'Coin' });
  assert.deepStrictEqual(executed, []);
});

test('createEvent wirft ohne name oder when.type', () => {
  assert.throws(() => createEvent({}), /name.*erforderlich/);
  assert.throws(() => createEvent({ name: 'E' }), /when.type.*erforderlich/);
});
