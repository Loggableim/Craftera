'use strict';

/**
 * Craftera Command-API für AI (AP-5.10).
 *
 * Registriert alle strukturierten Commands im Dispatcher und stellt
 * `executeJsonCommand` bereit, das ein JSON-Command-Objekt (Master Prompt
 * §38-Format) ausführt. Damit können Mensch und AI dieselbe Command-API
 * nutzen.
 *
 * Beispiel:
 *   { "command": "CreateEntity", "sceneId": "scene_1", "name": "Player" }
 */

const { executeCommand, registerCommand } = require('./commandDispatcher.js');
const { executeCreateEntity } = require('./createEntityCommand.js');
const { executeDeleteEntity } = require('./deleteEntityCommand.js');
const { executeMoveEntity, executeScaleEntity } = require('./transformCommands.js');
const { executeAddComponent, executeRemoveComponent } = require('./componentCommands.js');
const { executeSetProperty } = require('./setPropertyCommand.js');
const { executeCreateScene, executeDeleteScene } = require('./sceneCommands.js');

// Registriert alle Commands im Dispatcher.
function registerAllCommands() {
  registerCommand('CreateEntity', executeCreateEntity);
  registerCommand('DeleteEntity', executeDeleteEntity);
  registerCommand('MoveEntity', executeMoveEntity);
  registerCommand('ScaleEntity', executeScaleEntity);
  registerCommand('AddComponent', executeAddComponent);
  registerCommand('RemoveComponent', executeRemoveComponent);
  registerCommand('SetProperty', executeSetProperty);
  registerCommand('CreateScene', executeCreateScene);
  registerCommand('DeleteScene', executeDeleteScene);
}

/**
 * Führt ein JSON-Command-Objekt aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object|string} jsonCommand - Command-Objekt oder JSON-String.
 * @returns {*} Ergebnis des Command-Handlers.
 */
function executeJsonCommand(project, jsonCommand) {
  let command = jsonCommand;
  if (typeof jsonCommand === 'string') {
    command = JSON.parse(jsonCommand);
  }
  return executeCommand(project, command);
}

module.exports = { executeJsonCommand, registerAllCommands };
