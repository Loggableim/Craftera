'use strict';

/**
 * Craftera Commands: MoveEntity / ScaleEntity (AP-5.4).
 *
 * Ändern den Transform einer Entity und sind invertierbar (undo stellt
 * den vorherigen Wert wieder her).
 *
 * Command-Formate:
 *   { "command": "MoveEntity", "entityId": "ent_1", "x": 10, "y": 20 }
 *   { "command": "ScaleEntity", "entityId": "ent_1", "scale": 2 }
 */

const { setTransform } = require('../transform.js');

/** Findet eine Entity im Projekt anhand ihrer ID. */
function findEntity(project, entityId) {
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('Command: Projekt benötigt ein entities-Array');
  }
  const entity = project.entities.find((e) => e.entityId === entityId);
  if (!entity) {
    throw new Error(`Command: Entity "${entityId}" nicht gefunden`);
  }
  return entity;
}

/**
 * Führt den MoveEntity-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { transform, undo }.
 */
function executeMoveEntity(project, command) {
  const entity = findEntity(project, command.entityId);
  const before = { ...entity.transform };
  setTransform(entity, { x: command.x, y: command.y });
  function undo() {
    setTransform(entity, before);
  }
  return { transform: entity.transform, undo };
}

/**
 * Führt den ScaleEntity-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { transform, undo }.
 */
function executeScaleEntity(project, command) {
  const entity = findEntity(project, command.entityId);
  const before = { ...entity.transform };
  setTransform(entity, { scale: command.scale });
  function undo() {
    setTransform(entity, before);
  }
  return { transform: entity.transform, undo };
}

module.exports = { executeMoveEntity, executeScaleEntity };
