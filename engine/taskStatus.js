'use strict';

/**
 * Craftera Task-Graph-Status (AP-12.6).
 *
 * Definiert gültige Status-Übergänge eines Tasks (Master Prompt §45).
 * Hauptkette: BACKLOG → READY → IN_PROGRESS → REVIEW → TESTING → DONE.
 * Zusätzlich: BLOCKED und FAILED als Sonderzustände.
 *
 * `transitionTask` prüft, ob ein Übergang erlaubt ist, und wirft sonst.
 */

const { TASK_STATUSES } = require('./task.js');

// Erlaubte Übergänge: von → Menge erlaubter Zielstatus.
const TRANSITIONS = {
  BACKLOG: ['READY', 'BLOCKED', 'FAILED'],
  READY: ['IN_PROGRESS', 'BLOCKED', 'FAILED'],
  IN_PROGRESS: ['REVIEW', 'BLOCKED', 'FAILED'],
  REVIEW: ['TESTING', 'IN_PROGRESS', 'BLOCKED', 'FAILED'],
  TESTING: ['DONE', 'IN_PROGRESS', 'BLOCKED', 'FAILED'],
  BLOCKED: ['READY', 'FAILED'],
  FAILED: ['READY', 'IN_PROGRESS'],
  DONE: [],
};

/**
 * Prüft, ob ein Status-Übergang erlaubt ist.
 * @param {string} from - Aktueller Status.
 * @param {string} to - Zielstatus.
 * @returns {boolean} true, wenn der Übergang erlaubt ist.
 */
function canTransition(from, to) {
  if (!TASK_STATUSES.includes(from)) return false;
  if (!TASK_STATUSES.includes(to)) return false;
  return TRANSITIONS[from].includes(to);
}

/**
 * Führt einen Status-Übergang auf einem Task aus.
 * @param {object} task - Task-Objekt (mit `status`).
 * @param {string} to - Zielstatus.
 * @returns {object} Task mit aktualisiertem Status.
 * @throws {Error} Wenn der Übergang nicht erlaubt ist.
 */
function transitionTask(task, to) {
  const from = task.status;
  if (!canTransition(from, to)) {
    throw new Error(`Ungültiger Status-Übergang: ${from} → ${to}`);
  }
  task.status = to;
  return task;
}

module.exports = { transitionTask, canTransition, TRANSITIONS };
