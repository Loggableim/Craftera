'use strict';

/**
 * Craftera AI Command Tools (AP-8.9).
 *
 * Stellt der AI strukturierte Command-Tools bereit, mit denen sie das
 * GameProject über die Command-API (AP-5.10) verändern kann.
 * Ein AI-Antwort-Objekt kann eine Liste von Commands enthalten; `applyAiCommands`
 * führt sie aus und liefert ein Ergebnis.
 */

const { executeJsonCommand, registerAllCommands } = require('../../engine/commands/commandApi.js');

// Commands einmalig registrieren.
registerAllCommands();

/**
 * Führt eine Liste von AI-Commands auf dem Projekt aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object[]} commands - Liste von JSON-Command-Objekten.
 * @returns {object} { applied, results, errors }.
 */
function applyAiCommands(project, commands) {
  if (!Array.isArray(commands)) {
    throw new Error('applyAiCommands: "commands" muss ein Array sein');
  }
  const results = [];
  const errors = [];
  let applied = 0;

  commands.forEach((command) => {
    try {
      const result = executeJsonCommand(project, command);
      results.push({ command: command.command, ok: true, result });
      applied += 1;
    } catch (err) {
      errors.push({ command: command.command, error: err.message });
    }
  });

  return { applied, results, errors };
}

/**
 * Verarbeitet eine AI-Antwort, die Commands enthält.
 * @param {object} project - GameProject-Objekt.
 * @param {object} aiResponse - AI-Antwort { commands: [...] }.
 * @returns {object} Ergebnis von applyAiCommands.
 */
function handleAiResponse(project, aiResponse) {
  const commands = (aiResponse && Array.isArray(aiResponse.commands)) ? aiResponse.commands : [];
  return applyAiCommands(project, commands);
}

module.exports = { applyAiCommands, handleAiResponse };
