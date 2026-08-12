'use strict';

/**
 * Craftera Commands: AddComponent / RemoveComponent (AP-5.5).
 *
 * Fügen eine Component zu einer Entity hinzu bzw. entfernen sie, jeweils
 * invertierbar (undo stellt den vorherigen Zustand wieder her).
 *
 * Command-Formate:
 *   { "command": "AddComponent", "entityId": "ent_1", "type": "Sprite", "props": { "color": "red" } }
 *   { "command": "RemoveComponent", "entityId": "ent_1", "componentId": "comp_1" }
 */

const { addComponent } = require('../component.js');

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
 * Führt den AddComponent-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { component, undo }.
 */
function executeAddComponent(project, command) {
  const entity = findEntity(project, command.entityId);
  const component = addComponent(entity, { type: command.type, props: command.props });
  function undo() {
    const idx = entity.components.indexOf(component);
    if (idx !== -1) entity.components.splice(idx, 1);
  }
  return { component, undo };
}

/**
 * Führt den RemoveComponent-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { component, undo }.
 */
function executeRemoveComponent(project, command) {
  const entity = findEntity(project, command.entityId);
  const idx = entity.components.findIndex((c) => c.componentId === command.componentId);
  if (idx === -1) {
    throw new Error(`RemoveComponent: Component "${command.componentId}" nicht gefunden`);
  }
  const [component] = entity.components.splice(idx, 1);
  function undo() {
    entity.components.splice(idx, 0, component);
  }
  return { component, undo };
}

module.exports = { executeAddComponent, executeRemoveComponent };
