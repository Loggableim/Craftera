'use strict';

/**
 * Craftera Task-Repository (AP-12.9).
 *
 * Persistiert Tasks einer Experience unter `<dataDir>/tasks/<experienceId>/tasks.json`.
 * Bietet list/create/update. Der Status eines Tasks ist echter, persistierter
 * Zustand — die Kanban-Anzeige (AP-12.9) liest genau diese Daten.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { createTask } = require('../../engine/task.js');

class TaskRepository {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
  }

  /** Pfad zur Task-Datei einer Experience. */
  _filePath(experienceId) {
    return path.join(this.dataDir, 'tasks', experienceId, 'tasks.json');
  }

  /** Lädt alle Tasks einer Experience. */
  async list(experienceId) {
    try {
      const raw = await fs.readFile(this._filePath(experienceId), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  /** Speichert alle Tasks einer Experience. */
  async _save(experienceId, tasks) {
    const filePath = this._filePath(experienceId);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(tasks, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
  }

  /** Erstellt einen Task für eine Experience. */
  async create(experienceId, input) {
    const tasks = await this.list(experienceId);
    const task = createTask(input);
    tasks.push(task);
    await this._save(experienceId, tasks);
    return task;
  }

  /** Aktualisiert den Status eines Tasks. */
  async setStatus(experienceId, taskId, status) {
    const tasks = await this.list(experienceId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} nicht gefunden`);
    task.status = status;
    await this._save(experienceId, tasks);
    return task;
  }
}

module.exports = { TaskRepository };
