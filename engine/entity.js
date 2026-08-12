'use strict';

/**
 * Craftera Entity-Modell (AP-4.3).
 *
 * `createEntity` erzeugt eine Entity mit stabiler `entityId` (AP-2.1),
 * `sceneId`, `parentId`, `transform` und `components`.
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt eine neue Entity.
 * @param {object} input - { sceneId?, parentId?, name?, transform? }
 * @returns {object} Entity-Objekt.
 */
function createEntity(input = {}) {
  return {
    entityId: createId('ent'),
    sceneId: String(input.sceneId || ''),
    parentId: String(input.parentId || ''),
    name: String(input.name || ''),
    transform: {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      ...(input.transform || {}),
    },
    components: [],
  };
}

module.exports = { createEntity };
