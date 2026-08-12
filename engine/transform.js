'use strict';

/**
 * Craftera Transform-Modell (AP-4.5).
 *
 * `setTransform` setzt die Transform-Werte (x/y/scale/rotation) einer Entity.
 * Nicht angegebene Werte bleiben unverändert.
 */

/**
 * Setzt die Transform-Werte einer Entity.
 * @param {object} entity - Entity-Objekt mit `transform`.
 * @param {object} values - { x?, y?, scale?, rotation? }
 * @returns {object} Der aktualisierte Transform.
 */
function setTransform(entity, values = {}) {
  if (!entity || !entity.transform) {
    throw new Error('setTransform: Entity benötigt ein transform-Objekt');
  }

  const t = entity.transform;
  if (values.x !== undefined) t.x = Number(values.x);
  if (values.y !== undefined) t.y = Number(values.y);
  if (values.scale !== undefined) t.scale = Number(values.scale);
  if (values.rotation !== undefined) t.rotation = Number(values.rotation);
  return t;
}

module.exports = { setTransform };
