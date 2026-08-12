'use strict';

/**
 * Craftera GameProject-Modell (AP-4.1).
 *
 * `createProject` erzeugt ein GameProject — die Source of Truth des Editors.
 * Enthält `formatVersion`, `scenes`, `entities`, `components`, `assets`
 * sowie weitere Projekt-Metadaten.
 */

const { createId } = require('./ids.js');

// Aktuelle Format-Version des GameProject.
const FORMAT_VERSION = 1;

/**
 * Erzeugt ein neues GameProject.
 * @param {object} input - { experienceId?, name? }
 * @returns {object} GameProject-Objekt.
 */
function createProject(input = {}) {
  const experienceId = String(input.experienceId || '');

  return {
    projectId: createId('proj'),
    experienceId,
    name: String(input.name || ''),
    formatVersion: FORMAT_VERSION,
    scenes: [],
    entities: [],
    components: [],
    assets: [],
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createProject, FORMAT_VERSION };
