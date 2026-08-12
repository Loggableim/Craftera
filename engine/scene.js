'use strict';

/**
 * Craftera Scene-Modell (AP-4.2).
 *
 * `createScene` erzeugt eine Scene mit stabiler `sceneId` (AP-2.1),
 * `name` und `rootEntityId`.
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt eine neue Scene.
 * @param {object} input - { name?, rootEntityId? }
 * @returns {object} Scene-Objekt.
 */
function createScene(input = {}) {
  return {
    sceneId: createId('scene'),
    name: String(input.name || ''),
    rootEntityId: String(input.rootEntityId || ''),
  };
}

module.exports = { createScene };
