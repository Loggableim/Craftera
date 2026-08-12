'use strict';

/**
 * Craftera Event-System (AP-6.16, Master Prompt §37).
 *
 * WHEN→THEN-Modell: Ein Event hat einen Trigger (WHEN) und Aktionen (THEN).
 * `triggerEvent` führt die Aktionen aus, wenn der Trigger zutrifft.
 *
 * Beispiel:
 *   WHEN Player touches Coin
 *   → Add Score 1
 *   → Destroy Coin
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt ein Event.
 * @param {object} input - { name, when, actions }
 *   when: { type, subject } (z.B. { type: 'touches', subject: 'Coin' })
 *   actions: [{ type, target, value }] (z.B. { type: 'addScore', value: 1 })
 * @returns {object} Event-Objekt.
 */
function createEvent(input = {}) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('createEvent: "name" ist erforderlich');
  if (!input.when || !input.when.type) throw new Error('createEvent: "when.type" ist erforderlich');

  return {
    eventId: createId('cmd'),
    name,
    when: {
      type: input.when.type,
      subject: String(input.when.subject || ''),
    },
    actions: Array.isArray(input.actions) ? input.actions : [],
  };
}

/**
 * Prüft, ob ein Trigger auf ein Signal zutrifft.
 * @param {object} event - Event-Objekt.
 * @param {object} signal - { type, subject }.
 * @returns {boolean} true, wenn der Trigger zutrifft.
 */
function matchesTrigger(event, signal) {
  if (event.when.type !== signal.type) return false;
  if (event.when.subject && event.when.subject !== signal.subject) return false;
  return true;
}

/**
 * Löst ein Event aus: führt die Aktionen aus, wenn der Trigger zutrifft.
 * @param {object} event - Event-Objekt.
 * @param {object} signal - { type, subject }.
 * @returns {object[]} Ausgeführte Aktionen (leer, wenn Trigger nicht zutrifft).
 */
function triggerEvent(event, signal) {
  if (!matchesTrigger(event, signal)) return [];
  const executed = [];
  event.actions.forEach((action) => {
    executed.push({ ...action, executed: true });
  });
  return executed;
}

module.exports = { createEvent, matchesTrigger, triggerEvent };
