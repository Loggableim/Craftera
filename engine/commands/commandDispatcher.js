'use strict';

/**
 * Craftera Command-Dispatch (AP-5.1).
 *
 * `executeCommand` führt strukturierte Commands über eine Handler-Registry aus.
 * Jeder Command ist ein Objekt mit `command`-Feld (z.B. "CreateEntity").
 * Handler werden über `registerCommand` registriert.
 *
 * Beispiel:
 *   { "command": "SetProperty", "entityId": "ent_1", "property": "speed", "value": 300 }
 */

// Registry: command-Name → Handler-Funktion (project, payload) => result.
const handlers = new Map();

/**
 * Registriert einen Command-Handler.
 * @param {string} name - Command-Name (z.B. "CreateEntity").
 * @param {Function} handler - (project, payload) => result.
 */
function registerCommand(name, handler) {
  if (typeof handler !== 'function') {
    throw new Error(`registerCommand: Handler für "${name}" muss eine Funktion sein`);
  }
  handlers.set(name, handler);
}

/**
 * Führt einen Command aus.
 * @param {object} project - GameProject-Objekt (wird vom Handler mutiert).
 * @param {object} command - Command-Objekt mit `command`-Feld.
 * @returns {*} Ergebnis des Handlers.
 * @throws {Error} Bei unbekanntem Command oder fehlendem command-Feld.
 */
function executeCommand(project, command) {
  if (!command || typeof command !== 'object') {
    throw new Error('executeCommand: Command muss ein Objekt sein');
  }
  const name = command.command;
  if (!name) {
    throw new Error('executeCommand: Command hat kein "command"-Feld');
  }
  const handler = handlers.get(name);
  if (!handler) {
    throw new Error(`executeCommand: Unbekannter Command "${name}"`);
  }
  return handler(project, command);
}

module.exports = { executeCommand, registerCommand };
