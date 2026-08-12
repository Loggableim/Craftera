'use strict';

/**
 * Craftera Command: CreateEntity (AP-5.2).
 *
 * Erzeugt eine Entity im GameProject und ist invertierbar (undo entfernt sie).
 *
 * Command-Format:
 *   { "command": "CreateEntity", "sceneId": "scene_1", "name": "Player", "parentId": "" }
 */

const { createEntity } = require('../entity.js');

/**
 * Führt den CreateEntity-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { entity, undo } — undo entfernt die Entity wieder.
 */
function executeCreateEntity(project, command) {
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('CreateEntity: Projekt benötigt ein entities-Array');
  }

  const entity = createEntity({
    sceneId: command.sceneId,
    parentId: command.parentId,
    name: command.name,
    transform: command.transform,
  });

  project.entities.push(entity);

  function undo() {
    const idx = project.entities.indexOf(entity);
    if (idx !== -1) project.entities.splice(idx, 1);
  }

  return { entity, undo };
}

module.exports = { executeCreateEntity };
