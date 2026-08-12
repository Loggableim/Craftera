'use strict';

/**
 * Craftera Command: DeleteEntity (AP-5.3).
 *
 * Entfernt eine Entity aus dem GameProject und ist invertierbar
 * (undo fügt sie wieder ein).
 *
 * Command-Format:
 *   { "command": "DeleteEntity", "entityId": "ent_1" }
 */

/**
 * Führt den DeleteEntity-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { entity, undo } — undo fügt die Entity wieder ein.
 */
function executeDeleteEntity(project, command) {
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('DeleteEntity: Projekt benötigt ein entities-Array');
  }

  const entityId = command.entityId;
  const idx = project.entities.findIndex((e) => e.entityId === entityId);
  if (idx === -1) {
    throw new Error(`DeleteEntity: Entity "${entityId}" nicht gefunden`);
  }

  const [entity] = project.entities.splice(idx, 1);

  function undo() {
    project.entities.splice(idx, 0, entity);
  }

  return { entity, undo };
}

module.exports = { executeDeleteEntity };
