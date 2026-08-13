'use strict';

/**
 * Craftera Architektur-Modell (AP-12.3).
 *
 * Beschreibt die technische Architektur eines Spiels auf Basis eines GDD.
 * Die Architektur zerlegt das Spiel in Szenen, Entities, Components und
 * Behaviors — die Bausteine, die der Planner (AP-12.4) in Tasks übersetzt.
 *
 * Felder:
 *   architectureId – eindeutige ID
 *   experienceId   – zugehörige Experience (optional)
 *   title          – Spieltitel (aus GDD)
 *   scenes         – Liste von Szenen { name, description }
 *   entities       – Liste von Entities { name, scene, description }
 *   components     – Liste von Components { name, type, description }
 *   behaviors      – Liste von Behaviors { name, type, description }
 *   createdAt      – Zeitstempel
 */

const { createId } = require('./ids.js');

/**
 * Erzeugt ein neues Architektur-Objekt.
 * @param {object} input - { experienceId?, title?, scenes?, entities?, components?, behaviors? }
 * @returns {object} Architektur-Objekt.
 */
function createArchitecture(input = {}) {
  return {
    architectureId: createId('arch'),
    experienceId: String(input.experienceId || ''),
    title: String(input.title || ''),
    scenes: Array.isArray(input.scenes) ? input.scenes : [],
    entities: Array.isArray(input.entities) ? input.entities : [],
    components: Array.isArray(input.components) ? input.components : [],
    behaviors: Array.isArray(input.behaviors) ? input.behaviors : [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Serialisiert eine Architektur zu einem JSON-String.
 * @param {object} architecture - Architektur-Objekt.
 * @returns {string} JSON-String.
 */
function serializeArchitecture(architecture) {
  return JSON.stringify(architecture, null, 2);
}

module.exports = { createArchitecture, serializeArchitecture };
