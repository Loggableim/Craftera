'use strict';

/**
 * Craftera Commands: CreateScene / DeleteScene (AP-5.7).
 *
 * Erzeugen bzw. entfernen eine Scene im GameProject, jeweils invertierbar
 * (undo stellt den vorherigen Zustand wieder her).
 *
 * Command-Formate:
 *   { "command": "CreateScene", "name": "Main" }
 *   { "command": "DeleteScene", "sceneId": "scene_1" }
 */

const { createScene } = require('../scene.js');

/**
 * Führt den CreateScene-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { scene, undo }.
 */
function executeCreateScene(project, command) {
  if (!project || !Array.isArray(project.scenes)) {
    throw new Error('CreateScene: Projekt benötigt ein scenes-Array');
  }
  const scene = createScene({ name: command.name });
  project.scenes.push(scene);
  function undo() {
    const idx = project.scenes.indexOf(scene);
    if (idx !== -1) project.scenes.splice(idx, 1);
  }
  return { scene, undo };
}

/**
 * Führt den DeleteScene-Command aus.
 * @param {object} project - GameProject-Objekt.
 * @param {object} command - Command-Objekt.
 * @returns {object} { scene, undo }.
 */
function executeDeleteScene(project, command) {
  if (!project || !Array.isArray(project.scenes)) {
    throw new Error('DeleteScene: Projekt benötigt ein scenes-Array');
  }
  const idx = project.scenes.findIndex((s) => s.sceneId === command.sceneId);
  if (idx === -1) {
    throw new Error(`DeleteScene: Scene "${command.sceneId}" nicht gefunden`);
  }
  const [scene] = project.scenes.splice(idx, 1);
  function undo() {
    project.scenes.splice(idx, 0, scene);
  }
  return { scene, undo };
}

module.exports = { executeCreateScene, executeDeleteScene };
