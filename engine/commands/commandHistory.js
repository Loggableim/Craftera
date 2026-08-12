'use strict';

/**
 * Craftera CommandHistory (AP-5.8).
 *
 * Führt Commands aus und verwaltet Undo/Redo-Stacks. Jeder Command liefert
 * eine `undo`-Funktion (und optional eine `redo`-Funktion). Die History
 * ruft diese beim Undo/Redo auf.
 *
 * API:
 *   history.execute(command)  — führt aus, legt auf Undo-Stack
 *   history.undo()           — macht den letzten Command rückgängig
 *   history.redo()           — stellt den zuletzt rückgängig gemachten wieder her
 *   history.canUndo()/canRedo()
 */

class CommandHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Führt einen Command aus und legt ihn auf den Undo-Stack.
   * @param {object} command - Command mit `execute`- und `undo`-Funktion.
   * @returns {*} Ergebnis von command.execute().
   */
  execute(command) {
    if (!command || typeof command.execute !== 'function' || typeof command.undo !== 'function') {
      throw new Error('CommandHistory: Command benötigt execute- und undo-Funktion');
    }
    const result = command.execute();
    this.undoStack.push(command);
    // Neuer Command invalidiert den Redo-Stack.
    this.redoStack = [];
    return result;
  }

  /** Macht den letzten Command rückgängig. */
  undo() {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /** Stellt den zuletzt rückgängig gemachten Command wieder her. */
  redo() {
    const command = this.redoStack.pop();
    if (!command) return false;
    if (typeof command.redo === 'function') {
      command.redo();
    } else {
      command.execute();
    }
    this.undoStack.push(command);
    return true;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}

module.exports = { CommandHistory };
