'use strict';

/**
 * Craftera ID-Generator (AP-2.1).
 *
 * Erzeugt stabile, typ-präfixierte IDs wie `exp_…`, `ver_…`, `proj_…`.
 * Kollisionsfreiheit wird über kryptographisch zufällige Bytes
 * (crypto.randomBytes) erreicht — kein sequenzieller Zähler, keine
 * Zeitstempel-Kollisionen.
 *
 * Format: `<type>_<22 Zeichen Base36>` (128 Bit Zufall).
 */

const crypto = require('node:crypto');

// Erlaubte Typ-Präfixe. Neue Typen hier ergänzen.
const VALID_TYPES = new Set([
  'exp', // Experience
  'ver', // ExperienceVersion
  'proj', // GameProject
  'scene', // Scene
  'ent', // Entity
  'comp', // Component
  'asset', // Asset
  'cmd', // Command
  'gdd', // Game Design Document
  'task', // Task (AI Game Factory)
]);

/**
 * Erzeugt eine neue ID mit dem angegebenen Typ-Präfix.
 * @param {string} type - Einer der erlaubten Typen (z.B. 'exp', 'ver').
 * @returns {string} ID im Format `<type>_<base36>`.
 * @throws {Error} Wenn der Typ nicht erlaubt ist.
 */
function createId(type) {
  if (!VALID_TYPES.has(type)) {
    throw new Error(`Unbekannter ID-Typ: "${type}". Erlaubt: ${[...VALID_TYPES].join(', ')}`);
  }
  // 16 zufällige Bytes = 128 Bit Entropie, als Base36-Zeichenkette kodiert.
  const random = crypto.randomBytes(16).toString('hex');
  const base36 = BigInt('0x' + random).toString(36);
  return `${type}_${base36}`;
}

module.exports = { createId, VALID_TYPES };
