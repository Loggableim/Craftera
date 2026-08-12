'use strict';

/**
 * Craftera Component-Modell (AP-4.4).
 *
 * `addComponent` fügt einer Entity eine Component hinzu. Eine Component
 * hat eine stabile `componentId` (AP-2.1), einen `type` und Props.
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt eine neue Component und hängt sie an die Entity an.
 * @param {object} entity - Entity-Objekt mit `components`-Array.
 * @param {object} input - { type, props? }
 * @returns {object} Die erzeugte Component.
 */
function addComponent(entity, input = {}) {
  if (!entity || !Array.isArray(entity.components)) {
    throw new Error('addComponent: Entity benötigt ein components-Array');
  }
  const type = String(input.type || '').trim();
  if (!type) {
    throw new Error('addComponent: "type" ist erforderlich');
  }

  const component = {
    componentId: createId('comp'),
    type,
    props: { ...(input.props || {}) },
  };
  entity.components.push(component);
  return component;
}

module.exports = { addComponent };
