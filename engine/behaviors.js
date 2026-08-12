'use strict';

/**
 * Craftera Behaviors (AP-6.17, Master Prompt §36).
 *
 * Vorgefertigte, konfigurierbare Behaviors statt nur Code:
 *   - Follow: bewegt eine Entity auf ein Ziel zu.
 *   - Patrol: bewegt eine Entity zwischen Wegpunkten hin und her.
 *   - Collect: sammelt ein Item ein (entfernt es).
 *
 * `createBehavior` erzeugt ein Behavior; `runBehavior` führt einen
 * Simulationsschritt aus.
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt ein Behavior.
 * @param {object} input - { type, config }
 *   type: 'follow' | 'patrol' | 'collect'
 * @returns {object} Behavior-Objekt.
 */
function createBehavior(input = {}) {
  const type = String(input.type || '').trim();
  if (!['follow', 'patrol', 'collect'].includes(type)) {
    throw new Error(`createBehavior: Unbekannter Typ "${type}"`);
  }
  return {
    behaviorId: createId('comp'),
    type,
    config: { ...(input.config || {}) },
  };
}

/** Bewegt eine Entity um speed in Richtung (dx, dy). */
function stepTowards(entity, targetX, targetY, speed) {
  const t = entity.transform;
  const dx = targetX - t.x;
  const dy = targetY - t.y;
  const dist = Math.hypot(dx, dy);
  if (dist < speed) {
    t.x = targetX;
    t.y = targetY;
    return true;
  }
  t.x += (dx / dist) * speed;
  t.y += (dy / dist) * speed;
  return false;
}

/**
 * Führt einen Simulationsschritt eines Behaviors aus.
 * @param {object} behavior - Behavior-Objekt.
 * @param {object} entity - Entity-Objekt (mit transform).
 * @param {object} ctx - Kontext { target?, waypoints?, items? }.
 * @returns {object} Ergebnis { moved, collected? }.
 */
function runBehavior(behavior, entity, ctx = {}) {
  if (!entity || !entity.transform) {
    throw new Error('runBehavior: Entity benötigt ein transform-Objekt');
  }
  const speed = behavior.config.speed || 5;
  const result = { moved: false };

  if (behavior.type === 'follow') {
    const target = ctx.target;
    if (!target || !target.transform) return result;
    const reached = stepTowards(entity, target.transform.x, target.transform.y, speed);
    result.moved = true;
    result.reached = reached;
  } else if (behavior.type === 'patrol') {
    const waypoints = ctx.waypoints || [];
    if (!waypoints.length) return result;
    const index = behavior.config.index || 0;
    const wp = waypoints[index % waypoints.length];
    const reached = stepTowards(entity, wp.x, wp.y, speed);
    result.moved = true;
    if (reached) {
      behavior.config.index = (index + 1) % waypoints.length;
    }
  } else if (behavior.type === 'collect') {
    const items = ctx.items || [];
    const idx = items.findIndex((item) => item.entityId === behavior.config.itemId);
    if (idx === -1) return result;
    const item = items[idx];
    const reached = stepTowards(entity, item.transform.x, item.transform.y, speed);
    result.moved = true;
    if (reached) {
      items.splice(idx, 1);
      result.collected = item;
    }
  }

  return result;
}

module.exports = { createBehavior, runBehavior };
