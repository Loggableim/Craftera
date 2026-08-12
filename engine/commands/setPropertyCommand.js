'use strict';

/**
 * Craftera Command: SetProperty (AP-5.6).
 *
 * Setzt eine Property auf einer Component einer Entity und ist invertierbar
 * (undo stellt den vorherigen Wert wieder her).
 *
 * Command-Format (Master Prompt §38):
 *   { "command": "SetProperty", "entityId": "ent_1", "componentId": "comp_1", "property": "speed", "value": 300 }
 */

/** Findet eine Entity im Projekt anhand ihrer ID. */
function findEntity(project, entityId) {
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('SetProperty: Projekt benötigt ein entities-Array');
  }
  const entity = project.entities.find((e) => e.entityId === entityId);
  if (!entity) {
    throw new Error(`SetProperty: Entity "${entityId}" nicht gefunden`);
  }
  return entity;
}

/**
 * Führt den SetProperty-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { previous, value, undo }.
 */
function executeSetProperty(project, command) {
  const entity = findEntity(project, command.entityId);
  const component = entity.components.find((c) => c.componentId === command.componentId);
  if (!component) {
    throw new Error(`SetProperty: Component "${command.componentId}" nicht gefunden`);
  }
  const property = command.property;
  if (property === undefined) {
    throw new Error('SetProperty: "property" ist erforderlich');
  }

  const previous = component.props[property];
  component.props[property] = command.value;

  function undo() {
    if (previous === undefined) {
      delete component.props[property];
    } else {
      component.props[property] = previous;
    }
  }

  return { previous, value: command.value, undo };
}

module.exports = { executeSetProperty };
